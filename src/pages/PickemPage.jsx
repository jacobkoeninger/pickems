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
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'paged'
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  if (isLoading) return 'Loading...';
  if (error) return 'Error: ' + error;
  if (!pickems?.length) return 'No predictions available.';

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
      <div key={pickem.id} className="bg-white rounded border border-stone-300 p-6 mb-4">
        {pickem.category && (
          <div className="text-sm text-stone-600 font-serif mb-2">
            Category: {pickem.category}
          </div>
        )}
        
        <h2 className="text-xl font-serif mb-6">
          Make your prediction:
        </h2>

        <div className="space-y-4">
          {pickem.choices.map((choice) => {
            const choiceMade = isChoiceMade(choice.id);
            return (
              <button
                key={choice.id}
                onClick={() => !choiceMade && handleChoice(choice.id)}
                disabled={choiceMade}
                className={`w-full py-4 px-6 border rounded transition-colors duration-200
                           flex items-center justify-between group font-serif
                           ${choiceMade 
                             ? 'bg-stone-50 border-stone-500 text-stone-700 cursor-default'
                             : 'bg-white border-stone-300 hover:bg-stone-50 text-stone-800'
                           }`}
              >
                <span className="flex items-center">
                  {choiceMade && (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {choice.text}
                </span>
                {!choiceMade && (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    →
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
            className={`px-4 py-2 rounded font-serif ${
              viewMode === 'single' 
                ? 'bg-stone-800 text-white'
                : 'bg-white border border-stone-300 hover:bg-stone-50'
            }`}
          >
            Single View
          </button>
          <button
            onClick={() => setViewMode('paged')}
            className={`px-4 py-2 rounded font-serif ${
              viewMode === 'paged'
                ? 'bg-stone-800 text-white'
                : 'bg-white border border-stone-300 hover:bg-stone-50'
            }`}
          >
            Page View
          </button>
        </div>
      </div>

      {viewMode === 'single' ? (
        <>
          <div className="mb-4">
            <div className="w-full bg-stone-200 rounded-full h-2.5">
              <div 
                className="bg-stone-800 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={goToPrevious}
                disabled={currentPickemIndex === 0}
                className={`text-sm font-serif ${currentPickemIndex === 0 ? 'text-stone-400 cursor-not-allowed' : 'text-stone-800 hover:text-stone-600'}`}
              >
                ← Previous
              </button>
              <p className="text-sm text-stone-600 font-serif">
                Question {currentPickemIndex + 1} of {pickems.length}
              </p>
              <button
                onClick={goToNext}
                disabled={currentPickemIndex === pickems.length - 1}
                className={`text-sm font-serif ${currentPickemIndex === pickems.length - 1 ? 'text-stone-400 cursor-not-allowed' : 'text-stone-800 hover:text-stone-600'}`}
              >
                Next →
              </button>
            </div>
          </div>
          {renderPickemChoice(currentPickem)}
          {currentPickemIndex === pickems.length - 1 && (
            <p className="mt-6 text-center text-stone-600 font-serif">
              This is the last prediction!
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
              className={`text-sm font-serif ${currentPage === 0 ? 'text-stone-400 cursor-not-allowed' : 'text-stone-800 hover:text-stone-600'}`}
            >
              ← Previous Page
            </button>
            <p className="text-sm text-stone-600 font-serif">
              Page {currentPage + 1} of {totalPages}
            </p>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className={`text-sm font-serif ${currentPage === totalPages - 1 ? 'text-stone-400 cursor-not-allowed' : 'text-stone-800 hover:text-stone-600'}`}
            >
              Next Page →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PickemPage;
