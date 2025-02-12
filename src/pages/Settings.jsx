import { useState } from 'react';
import { useAuth } from 'wasp/client/auth';
import { useQuery, useAction } from 'wasp/client/operations';
import { getUserContests, getUserPickemChoices, getUserContestPoints, getUserContestCorrectPicks, getUserContestIncorrectPicks, updateUser } from 'wasp/client/operations';

const Settings = () => {
  const { data: user } = useAuth();
  const { data: contests } = useQuery(getUserContests);
  const { data: userChoices } = useQuery(getUserPickemChoices);
  const updateUserFn = useAction(updateUser);

  const [username, setUsername] = useState(user?.username || '');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await updateUserFn({ username, nickname });
      setSuccess('PROFILE_UPDATED_SUCCESSFULLY');
    } catch (err) {
      setError(err.message || 'UPDATE_FAILED');
    }
  };

  if (!user || !contests || !userChoices) return 'LOADING...';

  const totalContests = contests.length;
  const totalPicks = userChoices.length;

  return (
    <div className="bg-black text-green-500 min-h-screen p-6">
      <h1 className="text-2xl font-mono mb-4 glitch-text">[CONFIG_PANEL]</h1>

      <div className="border border-green-500 rounded bg-black p-6 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
        <h2 className="text-xl font-mono mb-4 text-green-400">&gt; USER_SETTINGS</h2>
        
        {error && (
          <div className="mb-4 p-3 border border-red-500 rounded text-red-500 font-mono">
            [ERROR]: {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 border border-green-500 rounded text-green-500 font-mono">
            [SUCCESS]: {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-green-400 text-sm font-mono mb-2">
              &gt; HANDLE
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full py-2 px-3 bg-black border border-green-500 rounded text-green-500 font-mono focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              placeholder="ENTER_USERNAME"
            />
          </div>

          <div>
            <label className="block text-green-400 text-sm font-mono mb-2">
              &gt; NICKNAME
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full py-2 px-3 bg-black border border-green-500 rounded text-green-500 font-mono focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              placeholder="ENTER_NICKNAME"
            />
            <p className="mt-1 text-xs text-green-400 font-mono opacity-75">
              * Optional. This will be your display name in pickems.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 font-mono text-green-500 hover:text-black border border-green-500 hover:bg-green-500 rounded transition-all duration-200"
          >
            EXECUTE_UPDATE
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-green-500">
          <h3 className="text-lg font-mono mb-2 text-green-400">&gt; SYSTEM_METRICS</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-green-500 font-mono">POINTS: {user.points}</p>
              <p className="text-green-500 font-mono">CONTESTS: {totalContests}</p>
            </div>
            <div>
              <p className="text-green-500 font-mono">PICKS: {totalPicks}</p>
              <p className="text-green-500 font-mono">AVG_PTS: {totalContests > 0 ? (user.points / totalContests).toFixed(2) : 0}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-green-500">
          <h3 className="text-lg font-mono mb-2 text-green-400">&gt; CONTEST_LOG</h3>
          <div className="space-y-4">
            {contests.map(contest => (
              <div key={contest.id} className="p-4 border border-green-500 rounded hover:shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-shadow">
                <h4 className="font-mono text-lg mb-2">[{contest.name}]</h4>
                {contest.description && (
                  <p className="text-green-400 mb-2 font-mono">&gt; {contest.description}</p>
                )}
                <div className="text-sm text-green-500 font-mono">
                  <p>TOTAL_PICKEMS: {contest.pickems.length}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
