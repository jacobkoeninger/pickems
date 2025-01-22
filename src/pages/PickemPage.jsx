import React, { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getOpenPickems, createUserPickemChoice, getUserPickemChoices, getContests } from 'wasp/client/operations';
import { useAuth } from 'wasp/client/auth';

const PickemPage = () => {
  const { data: user } = useAuth();
  const { data: pickems, isLoading: pickemsLoading, error: pickemsError } = useQuery(getOpenPickems);
  const { data: contests, isLoading: contestsLoading, error: contestsError } = useQuery(getContests);
  const { data: userChoices } = useQuery(getUserPickemChoices);
  const createUserPickemChoiceFn = useAction(createUserPickemChoice);
  const [selectedContest, setSelectedContest] = useState(null);
  const [currentPickemIndex, setCurrentPickemIndex] = useState(0);
  const [viewMode, setViewMode] = useState('paged');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  if (contestsLoading || pickemsLoading) return <div className="text-green-500 font-mono">[LOADING...]</div>;
  if (contestsError) return <div className="text-red-500 font-mono">[ERROR]: {contestsError}</div>;
  if (pickemsError) return <div className="text-red-500 font-mono">[ERROR]: {pickemsError}</div>;
  if (!contests?.length) return <div className="text-green-500 font-mono">[NO_CONTESTS_FOUND]</div>;

  const filteredPickems = selectedContest ? pickems?.filter(pickem => pickem.contestId === selectedContest.id) : [];

  const isContestActive = (contest) => {
    const deadline = new Date(contest.deadline);
    return deadline > new Date();
  };

  // Show contests, active predictions and leaderboard if no contest is selected
  if (!selectedContest) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div>
          <h2 className="text-xl font-mono text-green-500 mb-6 glitch-text">&gt; ACTIVE_CONTESTS:</h2>
          <div className="space-y-4">
            {contests.map(contest => {
              const active = isContestActive(contest);
              return (
                <button
                  key={contest.id}
                  onClick={() => active && setSelectedContest(contest)}
                  disabled={!active}
                  className={`w-full py-4 px-6 border rounded transition-all duration-200 
                             flex items-center justify-between group font-mono
                             ${active 
                               ? 'border-green-500 bg-black hover:bg-green-500/10 text-green-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                               : 'border-red-500 bg-black/50 text-red-500 cursor-not-allowed'
                             }`}
                >
                  <span className="flex items-center">
                    <span className="mr-2">&gt;</span>
                    {contest.name}
                  </span>
                  <div className="text-right">
                    {active ? (
                      <>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          _SELECT
                        </span>
                        <div className="text-xs mt-1">
                          DEADLINE: {new Date(contest.deadline).toLocaleDateString()}
                        </div>
                      </>
                    ) : (
                      <span className="text-xs">[EXPIRED]</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-mono text-green-500 mb-6 glitch-text">&gt; RECENT_PREDICTIONS:</h2>
          <div className="space-y-4">
            {pickems?.slice(0, 5).map(pickem => (
              <div key={pickem.id} className="border border-green-500 rounded p-4 font-mono">
                <div className="text-sm text-green-400 mb-2 flex justify-between">
                  <span>[{pickem.category || 'UNCATEGORIZED'}]</span>
                  <span>[CREATED: {new Date(pickem.createdAt).toLocaleDateString()}]</span>
                </div>
                <div className="text-green-500">
                  {pickem.choices.map(choice => (
                    <div key={choice.id} className="ml-4">
                      &gt; {choice.text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-mono text-green-500 mb-6 glitch-text">&gt; LEADERBOARD:</h2>
          <div className="border border-green-500 rounded p-4 font-mono">
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex justify-between items-center text-green-500">
                  <div className="flex items-center">
                    <span className="w-8">{i + 1}.</span>
                    <span className="text-green-400">USER_{i + 1}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-green-300">{1000 - (i * 50)} PTS</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-green-500">
              <div className="flex justify-between items-center text-green-500">
                <div className="flex items-center">
                  <span className="w-8">YOU</span>
                  <span className="text-green-400">{user.username}</span>
                </div>
                <div className="text-right">
                  <span className="text-green-300">{user.points || 0} PTS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isContestActive(selectedContest)) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setSelectedContest(null)}
          className="mb-4 px-4 py-2 font-mono text-green-500 hover:text-black border border-green-500 hover:bg-green-500 rounded transition-all duration-200"
        >
          &lt; RETURN_TO_CONTESTS
        </button>
        <div className="text-red-500 font-mono">[CONTEST_DEADLINE_PASSED]</div>
      </div>
    );
  }

  if (!filteredPickems?.length) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setSelectedContest(null)}
          className="mb-4 px-4 py-2 font-mono text-green-500 hover:text-black border border-green-500 hover:bg-green-500 rounded transition-all duration-200"
        >
          &lt; RETURN_TO_CONTESTS
        </button>
        <div className="text-green-500 font-mono">[NO_PREDICTIONS_FOUND_FOR_CONTEST]</div>
      </div>
    );
  }

  const currentPickem = filteredPickems[currentPickemIndex];
  const totalPages = Math.ceil(filteredPickems.length / itemsPerPage);
  const paginatedPickems = filteredPickems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleChoice = async (pickemChoiceId) => {
    if (!isContestActive(selectedContest)) {
      return;
    }
    await createUserPickemChoiceFn({ userId: user.id, pickemChoiceId });
    if (viewMode === 'single' && currentPickemIndex < filteredPickems.length - 1) {
      setCurrentPickemIndex(currentPickemIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentPickemIndex > 0) {
      setCurrentPickemIndex(currentPickemIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentPickemIndex < filteredPickems.length - 1) {
      setCurrentPickemIndex(currentPickemIndex + 1);
    }
  }; 

  const progress = ((currentPickemIndex + 1) / filteredPickems.length) * 100;

  const isChoiceMade = (choiceId) => {
    return userChoices?.some(uc => uc.pickemChoice.id === choiceId);
  };

  const renderPickemChoice = (pickem) => {
    return (
      <div key={pickem.id} className="bg-black border border-green-500 rounded p-6 mb-4 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
        {pickem.category && (
          <div className="text-sm text-green-400 font-mono mb-2">
            [CATEGORY]: {pickem.category}
          </div>
        )}
        
        <h2 className="text-xl font-mono text-green-500 mb-6 glitch-text">
          &gt; SELECT_PREDICTION:
        </h2>

        <div className="space-y-4">
          {pickem.choices.map((choice) => {
            const choiceMade = isChoiceMade(choice.id);
            return (
              <button
                key={choice.id}
                onClick={() => !choiceMade && handleChoice(choice.id)}
                disabled={choiceMade}
                className={`w-full py-4 px-6 border rounded transition-all duration-200
                           flex items-center justify-between group font-mono
                           ${choiceMade 
                             ? 'bg-green-900/20 border-green-500 text-green-500'
                             : 'bg-black border-green-500 hover:bg-green-500/10 text-green-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                           }`}
              >
                <span className="flex items-center">
                  {choiceMade ? (
                    <span className="mr-2">[✓]</span>
                  ) : (
                    <span className="mr-2">&gt;</span>
                  )}
                  {choice.text}
                </span>
                {!choiceMade && (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    _EXECUTE
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => {
            setSelectedContest(null);
            setCurrentPickemIndex(0);
            setCurrentPage(0);
          }}
          className="px-4 py-2 font-mono text-green-500 hover:text-black border border-green-500 hover:bg-green-500 rounded transition-all duration-200"
        >
          &lt; RETURN_TO_CONTESTS
        </button>
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode('single')}
            className={`px-4 py-2 rounded font-mono border ${
              viewMode === 'single' 
                ? 'bg-green-500 text-black border-green-500'
                : 'bg-black text-green-500 border-green-500 hover:bg-green-500/10'
            }`}
          >
            [SINGLE_MODE]
          </button>
          <button
            onClick={() => setViewMode('paged')}
            className={`px-4 py-2 rounded font-mono border ${
              viewMode === 'paged'
                ? 'bg-green-500 text-black border-green-500'
                : 'bg-black text-green-500 border-green-500 hover:bg-green-500/10'
            }`}
          >
            [PAGED_MODE]
          </button>
        </div>
      </div>

      {viewMode === 'single' ? (
        <>
          <div className="mb-4">
            <div className="w-full bg-green-900/20 rounded-full h-2.5">
              <div 
                className="bg-green-500 h-2.5 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={goToPrevious}
                disabled={currentPickemIndex === 0}
                className={`text-sm font-mono ${currentPickemIndex === 0 ? 'text-green-800 cursor-not-allowed' : 'text-green-500 hover:text-green-400'}`}
              >
                &lt;&lt; PREV
              </button>
              <p className="text-sm text-green-500 font-mono">
                [{currentPickemIndex + 1}/{filteredPickems.length}]
              </p>
              <button
                onClick={goToNext}
                disabled={currentPickemIndex === filteredPickems.length - 1}
                className={`text-sm font-mono ${currentPickemIndex === filteredPickems.length - 1 ? 'text-green-800 cursor-not-allowed' : 'text-green-500 hover:text-green-400'}`}
              >
                NEXT &gt;&gt;
              </button>
            </div>
          </div>
          {renderPickemChoice(currentPickem)}
          {currentPickemIndex === filteredPickems.length - 1 && (
            <p className="mt-6 text-center text-green-500 font-mono">
              [END_OF_PREDICTIONS_REACHED]
            </p>
          )}
        </>
      ) : (
        <>
          {paginatedPickems.map(pickem => renderPickemChoice(pickem))}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className={`text-sm font-mono ${currentPage === 0 ? 'text-green-800 cursor-not-allowed' : 'text-green-500 hover:text-green-400'}`}
            >
              &lt;&lt; PREV_PAGE
            </button>
            <p className="text-sm text-green-500 font-mono">
              PAGE_{currentPage + 1}/{totalPages}
            </p>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className={`text-sm font-mono ${currentPage === totalPages - 1 ? 'text-green-800 cursor-not-allowed' : 'text-green-500 hover:text-green-400'}`}
            >
              NEXT_PAGE &gt;&gt;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PickemPage;
