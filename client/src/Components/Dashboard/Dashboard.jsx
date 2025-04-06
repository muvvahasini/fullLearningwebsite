import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Header from '../Header/Header';
import confetti from 'canvas-confetti';
import './Dashboard.css';

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showAppreciation, setShowAppreciation] = useState(false);
  const jwtToken = Cookies.get('jwt_token');

  useEffect(() => {
    // Show confetti if quiz was just completed
    const justCompleted = sessionStorage.getItem('justCompletedQuiz');
    console.log(justCompleted);
    if (justCompleted === null) {
      sessionStorage.removeItem('justCompletedQuiz');
      setShowAppreciation(true);
      launchConfetti();
    }

    const fetchDashboard = async () => {
      if (!jwtToken) {
        setError('Token not found');
        return;
      }

      try {
        const response = await fetch('http://localhost:7000/api/dashboard', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch dashboard data: ${errorText}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDashboard();
  }, [jwtToken]);

  const launchConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
    });
  };

  if (error) return <div className="dashboard-error">Error: {error}</div>;
  if (!data) return <div className="dashboard-loading">Loading...</div>;

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-card">
          <h1 className="dashboard-heading">Welcome, {data.name}</h1>
          <p className="paragraph-dashboard"><strong>Email:</strong> {data.email}</p>
          <p className="paragraph-dashboard"><strong>Total Score:</strong> {data.score}</p>
        </div>

        <div className="dashboard-card">
          <h2 className="dashboard-subheading">Your Quiz History</h2>
          {data.attempts.length === 0 ? (
            <p className="dashboard-no-data">No quiz attempts yet.</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="paragraph-dashboard">Topic</th>
                  <th className="paragraph-dashboard">Course</th>
                  <th className="paragraph-dashboard">Score</th>
                  <th className="paragraph-dashboard">Attempted At</th>
                </tr>
              </thead>
              <tbody>
                {data.attempts.map((attempt, index) => (
                  <tr key={index}>
                    <td className="paragraph-dashboard">{attempt.topic}</td>
                    <td className="paragraph-dashboard">{attempt.course}</td>
                    <td className="paragraph-dashboard">{attempt.score}</td>
                    <td className="paragraph-dashboard">{new Date(attempt.attempted_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {showAppreciation && (
            <div className="appreciation-box">
              🎉 Great job, {data.name}! You've just completed a quiz! Keep the momentum going! 🚀
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
