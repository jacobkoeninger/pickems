import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getOpenPickems, createUserPickemChoice, getUserPickemChoices, getContests } from 'wasp/client/operations';
import { useAuth } from 'wasp/client/auth';
import { motion, AnimatePresence } from 'framer-motion';

const Tab = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-mono text-sm transition-all duration-200 border-b-2 
                ${active 
                  ? 'text-green-500 border-green-500 bg-green-500/10' 
                  : 'text-gray-500 border-transparent hover:text-green-500 hover:border-green-500/50'}`}
  >
    {children}
  </button>
);

const PickemPage = () => {
  const { data: user } = useAuth();
  const { data: pickems = [], isLoading: pickemsLoading } = useQuery(getOpenPickems);
  const { data: contests = [] } = useQuery(getContests);
  const { data: userChoices = [] } = useQuery(getUserPickemChoices);
  const createUserPickemChoiceFn = useAction(createUserPickemChoice);

  const [activeTab, setActiveTab] = useState('contests');
  const [selectedContest, setSelectedContest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [viewMode, setViewMode] = useState('single');
  const [currentPickemIndex, setCurrentPickemIndex] = useState(0);

  // Memoized helper functions
  const isChoiceMade = useMemo(() => (choiceId) => 
    userChoices.some(uc => uc.pickemChoice.id === choiceId),
    [userChoices]
  );

  const handleChoice = async (pickemChoiceId) => {
    if (!user?.id) return;
    await createUserPickemChoiceFn({ userId: user.id, pickemChoiceId });
  };

  // Get unique categories from pickems
  const categories = useMemo(() => {
    const categoryNames = pickems
      .map(p => p.category?.name)
      .filter(Boolean);
    return Array.from(new Set(categoryNames));
  }, [pickems]);

  // Filter and sort pickems
  const filteredPickems = useMemo(() => {
    return pickems
      .filter(pickem => {
        const matchesContest = !selectedContest || pickem.contestId === selectedContest.id;
        const matchesCategory = !categoryFilter || pickem.category?.name === categoryFilter;
        const matchesSearch = !searchQuery || 
          pickem.choices.some(choice => 
            choice.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            choice.description?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        return matchesContest && matchesCategory && matchesSearch;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [pickems, selectedContest, categoryFilter, searchQuery]);

  const renderPickem = (pickem) => {
    if (!pickem) return null;
    
    return (
      <>
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-4">
          {pickem.category && (
            <div className="inline-flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse"></span>
              <span className="px-2 py-1 rounded-sm border border-green-500/30 
                          text-xs font-mono text-green-500 bg-black uppercase tracking-widest">
                {pickem.category.name}
              </span>
            </div>
          )}
          <div className="text-green-500/30 text-xs font-mono">
            #{String(pickem.id).padStart(3, '0')}
          </div>
        </div>

        {/* Title */}
        <div className="mb-6 font-mono">
          <div className="text-green-500 text-base flex items-start">
            <span className="mr-2 mt-1">&gt;</span>
            <span className="leading-snug">
              {pickem.title}
            </span>
          </div>
        </div>

        {/* Choices */}
        <div className="space-y-4 flex-1">
          {pickem.choices.map((choice, index) => {
            const choiceMade = isChoiceMade(choice.id);
            const isOwnedChoice = choice.nickname === user?.nickname;
            const userOwnsAChoice = pickem.choices.some(c => c.nickname === user?.nickname);
            const isMainChoice = index === 0;

            return (
              <button
                key={choice.id}
                onClick={() => !choiceMade && !userOwnsAChoice && handleChoice(choice.id)}
                disabled={choiceMade || (userOwnsAChoice && !isOwnedChoice)}
                className={`w-full p-5 border rounded-sm transition-all duration-200 relative group/choice
                         ${choiceMade 
                           ? 'bg-green-900/20 border-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                           : isOwnedChoice
                             ? 'bg-green-900/40 border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                             : userOwnsAChoice
                               ? 'bg-black border-gray-500/30 text-gray-500/70 cursor-not-allowed'
                               : isMainChoice
                                 ? 'bg-black border-green-500/30 hover:border-green-500 hover:bg-green-500/5 hover:shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                                 : 'bg-black/50 border-green-500/20 hover:border-green-500/30 hover:bg-green-500/5'
                         }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 text-left w-full">
                    {choice.userChoices?.[0]?.user?.avatarUrl && (
                      <img
                        src={choice.userChoices[0].user.avatarUrl}
                        alt="User avatar"
                        className="w-6 h-6 rounded-sm mt-1 border border-green-500/30 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {choiceMade && (
                          <span className="text-green-500 font-bold tracking-wider">[✓]</span>
                        )}
                        {isOwnedChoice && (
                          <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded-sm text-xs tracking-wider">[YOUR_PICK]</span>
                        )}
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-500/50 mt-1">&gt;</span>
                        <span className={`font-mono leading-relaxed break-words ${isMainChoice ? 'text-green-500' : 'text-green-500/70'}`}>
                          {choice.text}
                        </span>
                      </div>
                      {choice.description && (
                        <div className="mt-2 text-sm text-green-500/70 font-mono pl-4 break-words">
                          {choice.description}
                        </div>
                      )}
                      {choice.nickname && (
                        <div className="mt-3 text-xs border-t border-green-500/10 pt-2 font-mono flex items-center">
                          <span className="text-green-500/30">&gt; AGENT:</span>
                          <span className="ml-2 text-green-500/70">{choice.nickname}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {!choiceMade && !userOwnsAChoice && (
                    <div className="text-green-500/50 text-xs opacity-0 group-hover/choice:opacity-100 transition-opacity duration-200 absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                      <span className="mr-2">{isMainChoice ? 'EXECUTE' : 'COUNTER'}</span>
                      <span className="text-lg leading-none">&gt;</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Metadata */}
        <div className="mt-4 pt-4 border-t border-green-500/20 flex justify-between items-center text-xs font-mono">
          <div className="flex items-center text-green-500/40">
            <span className="text-green-500/30">&gt; TIMESTAMP:</span>
            <span className="ml-2">{new Date(pickem.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </>
    );
  };

  if (pickemsLoading) {
    return (
      <div className="min-h-screen bg-black text-green-500 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 font-mono text-xl">
            <span className="animate-pulse">[</span>
            <span>LOADING_SYSTEM</span>
            <span className="animate-pulse">]</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with quick stats and filters */}
        <div className="mb-8 border border-green-500/30 rounded-lg p-4 bg-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex flex-col">
                <span className="text-xs text-green-500/50 font-mono">ACTIVE_PREDICTIONS</span>
                <span className="text-xl text-green-500 font-mono">{filteredPickems.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-green-500/50 font-mono">YOUR_PICKS</span>
                <span className="text-xl text-green-500 font-mono">{userChoices.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-green-500/50 font-mono">SUCCESS_RATE</span>
                <span className="text-xl text-green-500 font-mono">
                  {userChoices.length > 0 
                    ? Math.round((userChoices.filter(c => c.isCorrect).length / userChoices.length) * 100)
                    : 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <span className="text-xs text-green-500/50 font-mono">AGENT</span>
                <span className="text-sm text-green-500 font-mono">{user?.nickname || 'ANONYMOUS'}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-green-500/50 font-mono">SCORE</span>
                <span className="text-sm text-green-500 font-mono">{user?.points || 0} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-green-500/30">
          <div className="flex space-x-2">
            <Tab active={activeTab === 'contests'} onClick={() => setActiveTab('contests')}>
              [ACTIVE_CONTESTS]
            </Tab>
            <Tab active={activeTab === 'my-picks'} onClick={() => setActiveTab('my-picks')}>
              [MY_PREDICTIONS]
            </Tab>
            <Tab active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')}>
              [LEADERBOARD]
            </Tab>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH_PREDICTIONS//"
                className="w-full bg-black border border-green-500/30 rounded px-4 py-2 font-mono text-green-500 
                         focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
              <div className="absolute right-3 top-2.5 font-mono text-green-500/50">_</div>
            </div>
          </div>
          <select
            value={categoryFilter || ''}
            onChange={(e) => setCategoryFilter(e.target.value || null)}
            className="bg-black border border-green-500/30 rounded px-4 py-2 font-mono text-green-500
                     focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          >
            <option value="">ALL_CATEGORIES</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'contests' && (
              <>
                {/* View Mode Toggle */}
                <div className="mb-6 flex justify-end">
                  <div className="inline-flex border border-green-500/30 rounded-sm bg-black/50 p-1">
                    <button
                      onClick={() => setViewMode('single')}
                      className={`px-6 py-2 rounded-sm font-mono text-sm transition-all duration-200 relative
                        ${viewMode === 'single'
                          ? 'bg-green-500/20 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)] border border-green-500/50'
                          : 'text-green-500/70 hover:text-green-500 hover:bg-green-500/10'
                        }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-green-500/50 rounded-full"></span>
                        <span>SINGLE_VIEW</span>
                      </div>
                      {viewMode === 'single' && (
                        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
                      )}
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-6 py-2 rounded-sm font-mono text-sm transition-all duration-200 relative
                        ${viewMode === 'grid'
                          ? 'bg-green-500/20 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)] border border-green-500/50'
                          : 'text-green-500/70 hover:text-green-500 hover:bg-green-500/10'
                        }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-green-500/50 rounded-full"></span>
                        <span>GRID_VIEW</span>
                      </div>
                      {viewMode === 'grid' && (
                        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
                      )}
                    </button>
                  </div>
                </div>

                {viewMode === 'single' ? (
                  <div className="max-w-3xl mx-auto">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-green-900/20 rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                          style={{ width: `${((currentPickemIndex + 1) / filteredPickems.length) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <button
                          onClick={() => currentPickemIndex > 0 && setCurrentPickemIndex(currentPickemIndex - 1)}
                          disabled={currentPickemIndex === 0}
                          className={`text-sm font-mono ${currentPickemIndex === 0 ? 'text-green-800 cursor-not-allowed' : 'text-green-500 hover:text-green-400'}`}
                        >
                          &lt;&lt; PREV
                        </button>
                        <p className="text-sm text-green-500 font-mono">
                          [{currentPickemIndex + 1}/{filteredPickems.length}]
                        </p>
                        <button
                          onClick={() => currentPickemIndex < filteredPickems.length - 1 && setCurrentPickemIndex(currentPickemIndex + 1)}
                          disabled={currentPickemIndex === filteredPickems.length - 1}
                          className={`text-sm font-mono ${currentPickemIndex === filteredPickems.length - 1 ? 'text-green-800 cursor-not-allowed' : 'text-green-500 hover:text-green-400'}`}
                        >
                          NEXT &gt;&gt;
                        </button>
                      </div>
                    </div>
                    
                    {/* Single Pickem Display */}
                    <motion.div
                      key={filteredPickems[currentPickemIndex]?.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="border border-green-500/30 rounded-sm p-6 bg-black hover:border-green-500 
                               transition-all duration-200 group relative overflow-hidden min-h-[300px] flex flex-col"
                    >
                      {renderPickem(filteredPickems[currentPickemIndex])}
                    </motion.div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                    {filteredPickems.map(pickem => (
                      <motion.div
                        key={pickem.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border border-green-500/30 rounded-sm p-6 bg-black hover:border-green-500 
                                 transition-all duration-200 group relative overflow-hidden min-h-[300px] flex flex-col"
                      >
                        {renderPickem(pickem)}
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'my-picks' && (
              <div className="space-y-6">
                {/* Stats Header */}
                <div className="border border-green-500/30 rounded-lg p-6 bg-black">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="flex flex-col">
                      <span className="text-xs text-green-500/50 font-mono">TOTAL_PREDICTIONS</span>
                      <span className="text-xl text-green-500 font-mono">{userChoices.length}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-green-500/50 font-mono">CORRECT_PICKS</span>
                      <span className="text-xl text-green-500 font-mono">
                        {userChoices.filter(c => c.isCorrect).length}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-green-500/50 font-mono">SUCCESS_RATE</span>
                      <span className="text-xl text-green-500 font-mono">
                        {userChoices.length > 0 
                          ? Math.round((userChoices.filter(c => c.isCorrect).length / userChoices.length) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Predictions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                  {userChoices.map(userChoice => {
                    const pickem = pickems.find(p => p.id === userChoice.pickemId);
                    if (!pickem) return null;

                    const selectedChoice = pickem.choices.find(c => c.id === userChoice.pickemChoiceId);
                    const otherChoice = pickem.choices.find(c => c.id !== userChoice.pickemChoiceId);
                    
                    return (
                      <motion.div
                        key={userChoice.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border border-green-500/30 rounded-sm p-6 bg-black hover:border-green-500 
                                 transition-all duration-200 group relative overflow-hidden"
                      >
                        {/* Category Badge */}
                        <div className="flex items-center justify-between mb-4">
                          {pickem.category && (
                            <div className="inline-flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse"></span>
                              <span className="px-2 py-1 rounded-sm border border-green-500/30 
                                          text-xs font-mono text-green-500 bg-black uppercase tracking-widest">
                                {pickem.category.name}
                              </span>
                            </div>
                          )}
                          <div className="text-green-500/30 text-xs font-mono">
                            #{String(pickem.id).padStart(3, '0')}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-4">
                          {pickem.correctChoiceId ? (
                            <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-sm 
                                        ${userChoice.isCorrect 
                                          ? 'border-green-500 text-green-500 bg-green-500/10' 
                                          : 'border-red-500 text-red-500 bg-red-500/10'} border`}>
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                                    style={{ backgroundColor: userChoice.isCorrect ? '#22c55e' : '#ef4444' }}></span>
                              <span className="text-xs font-mono">
                                {userChoice.isCorrect ? 'PREDICTION_CORRECT' : 'PREDICTION_INCORRECT'}
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center space-x-2 px-2 py-1 rounded-sm 
                                          border border-yellow-500 text-yellow-500 bg-yellow-500/10">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50 animate-pulse"></span>
                              <span className="text-xs font-mono">AWAITING_RESULT</span>
                            </div>
                          )}
                        </div>

                        {/* Choices */}
                        <div className="space-y-4">
                          {/* Selected Choice */}
                          <div className="p-4 border rounded-sm transition-all duration-200
                                      border-green-500 bg-green-900/20 text-green-500">
                            <div className="flex items-start space-x-3">
                              <span className="text-green-500/50 mt-1">&gt;</span>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-xs bg-green-500/10 px-2 py-0.5 rounded-sm">[YOUR_PICK]</span>
                                  {pickem.correctChoiceId === selectedChoice.id && (
                                    <span className="text-xs bg-green-500/10 px-2 py-0.5 rounded-sm">[✓]</span>
                                  )}
                                </div>
                                <span className="font-mono leading-relaxed break-words">
                                  {selectedChoice.text}
                                </span>
                                {selectedChoice.nickname && (
                                  <div className="mt-2 text-xs border-t border-green-500/10 pt-2 font-mono">
                                    <span className="text-green-500/50">AGENT: </span>
                                    <span className="text-green-500/70">{selectedChoice.nickname}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Other Choice */}
                          <div className={`p-4 border rounded-sm transition-all duration-200
                                      ${pickem.correctChoiceId === otherChoice.id
                                        ? 'border-red-500 bg-red-900/20 text-red-500'
                                        : 'border-gray-500/30 bg-black text-gray-500'}`}>
                            <div className="flex items-start space-x-3">
                              <span className="opacity-50 mt-1">&gt;</span>
                              <div className="flex-1">
                                <span className="font-mono leading-relaxed break-words">
                                  {otherChoice.text}
                                </span>
                                {otherChoice.nickname && (
                                  <div className="mt-2 text-xs border-t border-gray-500/10 pt-2 font-mono">
                                    <span className="opacity-50">AGENT: </span>
                                    <span className="opacity-70">{otherChoice.nickname}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="mt-4 pt-4 border-t border-green-500/20 flex justify-between items-center text-xs font-mono">
                          <div className="flex items-center text-green-500/40">
                            <span className="text-green-500/30">&gt; CONTEST:</span>
                            <span className="ml-2">#{String(pickem.contestId).padStart(3, '0')}</span>
                          </div>
                          <div className="text-green-500/40">
                            {new Date(userChoice.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="border border-green-500/30 rounded-lg p-6">
                <h2 className="text-xl font-mono mb-6">&gt; GLOBAL_RANKINGS:</h2>
                {/* Add content for leaderboard tab */}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Status */}
        <div className="mt-8 text-xs font-mono text-green-500/50 flex justify-between">
          <span>SYSTEM_VERSION: 2.0.0</span>
          <span>LAST_SYNC: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PickemPage; 