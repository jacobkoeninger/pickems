import React, { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getOpenPickems, createUserPickemChoice, getUserPickemChoices } from 'wasp/client/operations';
import { useAuth } from 'wasp/client/auth';

const PickemPage = () => {
  const { data: user } = useAuth();
  const { data: pickems, isLoading, error } = useQuery(getOpenPickems);
  const { data: userChoices } = useQuery(getUserPickemChoices);
  const createUserPickemChoiceFn = useAction(createUserPickemChoice);
  const [currentPickemIndex, setCurrentPickemIndex] = useState(0);
  const [viewMode, setViewMode] = useState('single');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  if (isLoading) return <div className="text-green-500 font-mono">[LOADING...]</div>;
  if (error) return <div className="text-red-500 font-mono">[ERROR]: {error}</div>;
  if (!pickems?.length) return <div className="text-green-500 font-mono">[NO_PREDICTIONS_FOUND]</div>;

  const currentPickem = pickems[currentPickemIndex];
  const totalPages = Math.ceil(pickems.length / itemsPerPage);
  const paginatedPickems = pickems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleChoice = async (pickemChoiceId) => {
    await createUserPickemChoiceFn({ userId: user.id, pickemChoiceId });
    if (viewMode === 'single' && currentPickemIndex < pickems.length - 1) {
      setCurrentPickemIndex(currentPickemIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentPickemIndex > 0) {
      setCurrentPickemIndex(currentPickemIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentPickemIndex < pickems.length - 1) {
      setCurrentPickemIndex(currentPickemIndex + 1);
    }
  }; 

  const progress = ((currentPickemIndex + 1) / pickems.length) * 100;

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
                [{currentPickemIndex + 1}/{pickems.length}]
              </p>
              <button
                onClick={goToNext}
                disabled={currentPickemIndex === pickems.length - 1}
                className={`text-sm font-mono ${currentPickemIndex === pickems.length - 1 ? 'text-green-800 cursor-not-allowed' : 'text-green-500 hover:text-green-400'}`}
              >
                NEXT &gt;&gt;
              </button>
            </div>
          </div>
          {renderPickemChoice(currentPickem)}
          {currentPickemIndex === pickems.length - 1 && (
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
