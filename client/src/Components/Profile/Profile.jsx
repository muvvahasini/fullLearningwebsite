import { useEffect, useState } from 'react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import Cookies from 'js-cookie';
import './index.css';
import Header from '../Header/Header';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [savedQuizzes, setSavedQuizzes] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const jwtToken = Cookies.get('jwt_token');
    if (!jwtToken) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:7000/api/profile/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch profile: ${errorText}`);
        }

        const result = await response.json();
        setProfile(result);
        setFormData({
          name: result.name || '',
          bio: result.bio || '',
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSavedQuizzes = async () => {
      try {
        const response = await axios.get('http://localhost:7000/api/platform/save', {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
    
        const parsedQuizzes = (response.data || []).map((quiz) => ({
          ...quiz,
          questions: typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions,
        }));
    
        console.log('Parsed Quizzes:', parsedQuizzes);
        setSavedQuizzes(parsedQuizzes);
      } catch (err) {
        console.error('Error fetching saved quizzes:', err);
      }
    };
    
    fetchProfile();
    fetchSavedQuizzes();
  }, []);

  const handleEmojiClick = (emojiData) => {
    setFormData((prev) => ({
      ...prev,
      bio: prev.bio + emojiData.emoji,
    }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    try {
      const jwtToken = Cookies.get('jwt_token');

      const updatedData = {
        ...profile,
        name: formData.name,
        bio: formData.bio,
      };

      const res = await axios.put('http://localhost:7000/api/profile', updatedData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      setProfile(res.data);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleViewDetails = (quiz) => {
    // You can pass quiz data via state or use local storage
    navigate('/quiz-details', { state: { quiz } });
  };

  const handleRetakeQuiz = (quiz) => {
    navigate('/quiz/start', { state: { questions: quiz.questions, topic: quiz.title } });
  };

  if (loading) return <p className="loading">Loading...</p>;

  if (!profile) return <p className="no-profile">No profile found. Please create one.</p>;

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="profile-card">
          <img
            src={
              profile.avatar ||
              'https://tse3.mm.bing.net/th?id=OIP.Gc94mo4hbciYBDSJwWzsAAHaHa&pid=Api&P=0&h=180'
            }
            alt="Avatar"
            className="profile-avatar"
          />
          <h2>{profile.name}</h2>
          <p className="username">@{profile.name}</p>
          <p className="bio">{profile.bio || 'No bio added.'}</p>
          <button className="edit-btn" onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>

          {editMode && (
            <div className="edit-section coloring">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Username"
              />
              <textarea
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Your bio..."
              ></textarea>

              <button
                type="button"
                className="emoji-btn"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                😀 Add Emoji
              </button>

              {showEmojiPicker && (
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <EmojiPicker onEmojiClick={(emojiData) => handleEmojiClick(emojiData)} />
                </div>
              )}
              <button className="save-btn" onClick={handleUpdate}>
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="attempts-section">
          <h3 className="coloring-el">Recent Quiz Attempts</h3>
          {profile.attempts && profile.attempts.length > 0 ? (
            profile.attempts.map((attempt, idx) => (
              <div className="attempt-card" key={idx}>
                <p className="coloring"><strong>Topic:</strong> {attempt.topic}</p>
                <p className="coloring"><strong>Course:</strong> {attempt.course}</p>
                <p className="coloring"><strong>Score:</strong> {attempt.score}</p>
                <p className="date">
                  {new Date(attempt.attempted_at).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="no-attempts">No quiz attempts yet.</p>
          )}
        </div>

        <div className="attempts-section">
          <h3 className="coloring-el">Saved Quizzes</h3>
          {savedQuizzes.length > 0 ? (
            savedQuizzes.map((quiz, idx) => (
              <div className="attempt-card learning-style" key={idx}>
                <p className="coloring"><strong>Title:</strong> {quiz.title}</p>
                <p className="coloring"><strong>Questions:</strong> {quiz.questions.length}</p>
                <p className="date">Saved on: {new Date(quiz.saved_at).toLocaleString()}</p>
                <div className="quiz-btns">
                  <button className="view-btn" onClick={() => handleViewDetails(quiz)}>View Details</button>
                  <button className="retake-btn" onClick={() => handleRetakeQuiz(quiz)}>Retake Quiz</button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-attempts">No saved quizzes yet.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
