import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './index.css';
import Header from '../Header/Header';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

const Quiz = () => {
  const [grade, setGrade] = useState('');
  const [course, setCourse] = useState('');
  const [topic, setTopic] = useState('');
  const [topicsData, setTopicsData] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [require, setRequire] = useState('');
  const [completion, setCompletion] = useState('');

  const [width, height] = useWindowSize();

  const handleGetTopics = async (e) => {
    e.preventDefault();
    if (!grade || !course) {
      console.log('Missing grade or course');
      return;
    }
    setLoading(true);
    const token = Cookies.get('jwt_token');
    console.log('Sending request:', { grade, course, token });

    try {
      const res = await axios.post(
        'http://localhost:7000/api/quiz/generate-topics',
        { grade, course },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Response:', res.data);
      setTopicsData(res.data.topics);
      setStep(2);
    } catch (error) {
      console.error('Error generating topics:', error.message, error);
    }
    setLoading(false);
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!topic) {
      console.log('No topic selected');
      return;
    }
    setLoading(true);
    setSubmitted(false);
    setScore(null);
    setAnswers({});
    const token = Cookies.get('jwt_token');
    console.log('Generating quiz for topic:', { grade, course, topic });

    try {
      const res = await axios.post(
        'http://localhost:7000/api/quiz/generate-topics',
        { grade, course, selectedTopic: topic }, // Send all required fields
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Quiz response:', res.data);
      setQuiz(res.data.questions);
      // Extract correct answers from the questions
      const correct = res.data.questions.map((q) => q.correctAnswer);
      setCorrectAnswers(correct);
      setStep(3);
    } catch (error) {
      console.error('Error generating quiz:', error.message, error);
    }
    setLoading(false);
  };

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmitQuiz = async (event) => {
    event.preventDefault();
    const token = Cookies.get('jwt_token');

    if (!token) {
      console.error('No JWT token found');
      return;
    }

    const answerArray = Object.values(answers);
    const correctAnswerArray = correctAnswers;

    if (answerArray.length !== quiz.length) {
      setRequire('Please attempt all the questions*');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:7000/api/quiz/submit',
        { answers: answerArray, correctAnswers: correctAnswerArray, topic, course },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Submit response:', res.data);

      if (res.data.score !== undefined) {
        setScore(res.data.score);
        setCompletion(res.data.completion || 'Well done! You’re making great progress.');
        setSubmitted(true);
      } else {
        console.error('No score received in response');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error.message, error);
    }
  };

  return (
    <>
      <Header />
      <div className="quiz-container">
        <div className="container-two-quiz">
          <h1 className="quiz-heading-main" style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
            🎯 The Quiz Platform
          </h1>
          <p style={{ textAlign: 'center' }}>Practice makes you perfect!!.</p>
          <div className="third-container-quiz">
            {step === 1 && (
              <form onSubmit={handleGetTopics} className="form-inputs">
                <label className="form-label">Enter Grade:</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., 6, 10, 12"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />

                <label className="form-label">Enter Course/Subject:</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Math, Science, History"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />

                <button
                  type="submit"
                  className="submit-button"
                  style={{ backgroundColor: '#007BFF', color: 'white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#007BFF'}
                >
                  {loading ? 'Generating Topics...' : 'Get Topics'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleGenerateQuiz} className="topic-selection">
                <label className="topic-label">Select a Topic:</label>
                <select
                  className="topic-dropdown"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  <option value="" className="dropdown-option">
                    -- Choose a Topic --
                  </option>
                  {topicsData.map((t, i) => (
                    <option key={i} value={t} className="dropdown-option">
                      {t}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="submit-button"
                  style={{ backgroundColor: '#6f42c1', color: 'white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#5a2d91'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#6f42c1'}
                >
                  {loading ? 'Generating Quiz...' : 'Generate Quiz'}
                </button>
              </form>
            )}

{step === 3 && quiz.length > 0 && !submitted && (
  <div className="quiz-content">
    <h2 className="quiz-title">{topic} Quiz</h2>
    <form className="quiz-form">
      {quiz.map((q, index) => (
        <div key={index} className="question-container">
          <p className="question-text">
            {index + 1}. {q.question}
          </p>
          {q.options.map((opt, i) => (
            <div key={i} className="option-container" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <input
                id={`${index}-${i}`}
                type="radio"
                className="radio-button"
                name={`question-${index}`}
                value={opt} // Use the option directly, no splitting needed
                checked={answers[index] === opt} // Check if the answer matches this option
                onChange={() => handleAnswerChange(index, opt)} // Store the full option text
                style={{ marginRight: '8px' }}
              />
              <label htmlFor={`${index}-${i}`} className="option-label">
                {opt}
              </label>
            </div>
          ))}
        </div>
      ))}
      <button
        type="button"
        onClick={handleSubmitQuiz}
        className="submit-button"
        style={{ backgroundColor: '#28a745', color: 'white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#1e7e34'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
      >
        Submit Quiz
      </button>
      <p className="error-message">{require}</p>
    </form>
  </div>
)}
            {submitted && (
              <>
                <Confetti width={width} height={height} numberOfPieces={400} recycle={false} />
                <div className="result-container">
                  <h2 className="result-title">✅ Your Score: {score}</h2>
                  <p className="result-message">
                    🎉 Great job completing the quiz! Keep up the awesome work!
                  </p>
                  <p className="completion-message">🧠 {completion}</p>
                  <button
                    className="submit-button"
                    style={{ backgroundColor: '#007BFF', color: 'white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#007BFF'}
                    onClick={() => {
                      setQuiz([]);
                      setScore(null);
                      setCompletion('');
                      setTopic('');
                      setCourse('');
                      setGrade('');
                      setSubmitted(false);
                      setStep(1);
                    }}
                  >
                    Take Another Quiz
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Quiz;