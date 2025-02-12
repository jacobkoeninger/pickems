import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('/api/leaderboard');
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard data:', error);
      }
    };

    fetchLeaderboard();
    const intervalId = setInterval(fetchLeaderboard, 10000); // Poll every 10 seconds
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='leaderboard'>
      <h2>Leaderboard</h2>
      <ul>
        {leaderboard.map((entry) => (
          <li key={entry.userId}>
            {entry.username}: {entry.points} points
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard; 