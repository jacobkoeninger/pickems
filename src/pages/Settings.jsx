import { useState } from 'react';
import { useAuth } from 'wasp/client/auth';
import { useQuery } from 'wasp/client/operations';
import { getUserContests, getUserPickemChoices, getUserContestPoints, getUserContestCorrectPicks, getUserContestIncorrectPicks } from 'wasp/client/operations';

const Settings = () => {
  const { data: user } = useAuth();
  const { data: contests } = useQuery(getUserContests);
  const { data: userChoices } = useQuery(getUserPickemChoices);
  const [username, setUsername] = useState(user?.identities.username?.id || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Add update user functionality once backend support is added
    console.log('Update user:', { username });
  };

  if (!user || !contests || !userChoices) return 'Loading...';

  const totalContests = contests.length;
  const totalPicks = userChoices.length;

  return (
    <div className="bg-stone-100">
      <h1 className="text-2xl font-serif mb-4">Settings</h1>

      <div className="p-4 bg-white border border-stone-300 rounded">
        <h2 className="text-xl font-serif mb-4">Account Settings</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-stone-700 text-sm font-serif mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-stone-300 rounded w-full py-2 px-3 text-stone-700 focus:outline-none focus:border-stone-500"
              placeholder="Username"
            />
          </div>

          <button
            type="submit"
            className="bg-stone-800 hover:bg-stone-700 text-stone-100 font-serif py-2 px-4 rounded transition-colors"
          >
            Update Settings
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-stone-300">
          <h3 className="text-lg font-serif mb-2">Account Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-stone-600 font-serif">Total Points: {user.points}</p>
              <p className="text-stone-600 font-serif">Total Contests: {totalContests}</p>
            </div>
            <div>
              <p className="text-stone-600 font-serif">Total Picks Made: {totalPicks}</p>
              <p className="text-stone-600 font-serif">Average Points Per Contest: {totalContests > 0 ? (user.points / totalContests).toFixed(2) : 0}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-stone-300">
          <h3 className="text-lg font-serif mb-2">Your Contests</h3>
          <div className="space-y-4">
            {contests.map(contest => (
              <div key={contest.id} className="p-4 border border-stone-200 rounded">
                <h4 className="font-serif text-lg mb-2">{contest.name}</h4>
                {contest.description && (
                  <p className="text-stone-600 mb-2">{contest.description}</p>
                )}
                <div className="text-sm text-stone-500">
                  <p>Total Pickems: {contest.pickems.length}</p>
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
