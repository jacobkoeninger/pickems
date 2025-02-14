import React, { useState, useMemo } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getOpenPickems, updatePickemChoiceOwner, getPickemChoices, getCategories, getContests, updatePickem, automateAllUserChoices } from 'wasp/client/operations';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ContestCreationForm,
  BulkUploadForm,
  PickemCloseDialog,
  ContestList
} from '../components/admin';
import { PickemList } from '../components/admin/pickem';

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

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('contests');
  const [selectedContest, setSelectedContest] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateContest, setShowCreateContest] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [confirmClose, setConfirmClose] = useState(null);
  const [editingChoice, setEditingChoice] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  
  const { data: pickems = [], isLoading: pickemsLoading } = useQuery(getOpenPickems);
  const { data: pickemChoices = [] } = useQuery(getPickemChoices);
  const { data: categories = [] } = useQuery(getCategories);
  const { data: contests = [], isLoading: contestsLoading } = useQuery(getContests);
  const updatePickemChoiceOwnerFn = useAction(updatePickemChoiceOwner);
  const updatePickemFn = useAction(updatePickem);
  const automateAllUserChoicesFn = useAction(automateAllUserChoices);

  // Memoized stats
  const stats = useMemo(() => {
    return {
      totalPickems: pickems.length,
      activeContests: contests.filter(c => c.isActive).length,
      totalChoices: pickemChoices.length,
      categoriesCount: categories.length
    };
  }, [pickems, contests, pickemChoices, categories]);

  const handleUpdateOwner = async (choiceId, newOwnerId) => {
    try {
      await updatePickemChoiceOwnerFn({ choiceId, newOwnerId });
      setEditingChoice(null);
    } catch (error) {
      console.error('Failed to update owner:', error);
    }
  };

  const handleAutomateChoices = async () => {
    try {
      const result = await automateAllUserChoicesFn({});
      alert(result.message); // You might want to use a nicer notification system
    } catch (error) {
      console.error('Failed to automate choices:', error);
      alert('Failed to automate choices: ' + error.message);
    }
  };

  if (pickemsLoading || contestsLoading) {
    return (
      <div className="min-h-screen bg-black text-green-500 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 font-mono text-xl">
            <span className="animate-pulse">[</span>
            <span>LOADING_ADMIN_CONSOLE</span>
            <span className="animate-pulse">]</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with quick stats */}
        <div className="mb-8 border border-green-500/30 rounded-lg p-4 bg-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex flex-col">
                <span className="text-xs text-green-500/50 font-mono">ACTIVE_CONTESTS</span>
                <span className="text-xl text-green-500 font-mono">{stats.activeContests}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-green-500/50 font-mono">TOTAL_PREDICTIONS</span>
                <span className="text-xl text-green-500 font-mono">{stats.totalPickems}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-green-500/50 font-mono">TOTAL_CHOICES</span>
                <span className="text-xl text-green-500 font-mono">{stats.totalChoices}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-green-500/50 font-mono">CATEGORIES</span>
                <span className="text-xl text-green-500 font-mono">{stats.categoriesCount}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAutomateChoices}
                className="px-4 py-2 font-mono text-sm border border-green-500/30 rounded-sm
                         hover:border-green-500 hover:bg-green-500/10 transition-all duration-200"
              >
                AUTOMATE_CHOICES
              </button>
              <button
                onClick={() => setShowCreateContest(true)}
                className="px-4 py-2 font-mono text-sm border border-green-500/30 rounded-sm
                         hover:border-green-500 hover:bg-green-500/10 transition-all duration-200"
              >
                + NEW_CONTEST
              </button>
              <button
                onClick={() => setShowBulkUpload(true)}
                className="px-4 py-2 font-mono text-sm border border-green-500/30 rounded-sm
                         hover:border-green-500 hover:bg-green-500/10 transition-all duration-200"
              >
                + BULK_UPLOAD
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-green-500/30">
          <div className="flex space-x-2">
            <Tab active={activeTab === 'contests'} onClick={() => setActiveTab('contests')}>
              [CONTESTS]
            </Tab>
            <Tab active={activeTab === 'predictions'} onClick={() => setActiveTab('predictions')}>
              [PREDICTIONS]
            </Tab>
            <Tab active={activeTab === 'categories'} onClick={() => setActiveTab('categories')}>
              [CATEGORIES]
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
                placeholder="SEARCH_ADMIN_CONSOLE//"
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
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
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
                {selectedContest ? (
                  <div className="space-y-6">
                    {/* Back Button */}
                    <button
                      onClick={() => setSelectedContest(null)}
                      className="px-4 py-2 font-mono text-sm border border-green-500/30 rounded-sm
                               hover:border-green-500 hover:bg-green-500/10 transition-all duration-200"
                    >
                      &lt;&lt; BACK_TO_CONTESTS
                    </button>

                    {/* Contest Details Header */}
                    <div className="border border-green-500/30 rounded-sm p-6 bg-black">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${selectedContest.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                          <span className="text-xs font-mono text-green-500/50">
                            {selectedContest.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        <div className="text-green-500/30 text-xs font-mono">
                          #{String(selectedContest.id).padStart(3, '0')}
                        </div>
                      </div>

                      <div className="mb-6 font-mono">
                        <div className="text-green-500 text-xl flex items-start">
                          <span className="mr-2">&gt;</span>
                          <span>{selectedContest.name}</span>
                        </div>
                        {selectedContest.description && (
                          <div className="mt-2 text-green-500/70">
                            {selectedContest.description}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                        <div className="space-y-2">
                          <div className="flex justify-between text-green-500/70">
                            <span>DEADLINE:</span>
                            <span>{new Date(selectedContest.deadline).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-green-500/70">
                            <span>PREDICTIONS:</span>
                            <span>{pickems.filter(p => p.contestId === selectedContest.id).length}</span>
                          </div>
                          <div className="flex justify-between text-green-500/70">
                            <span>CREATED:</span>
                            <span>{new Date(selectedContest.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-green-500/20 flex justify-end space-x-4">
                        <button
                          onClick={() => setShowBulkUpload(true)}
                          className="px-4 py-2 text-sm font-mono text-green-500/70 hover:text-green-500 
                                   hover:bg-green-500/10 rounded-sm transition-all duration-200"
                        >
                          BULK_UPLOAD &gt;
                        </button>
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="px-4 py-2 text-sm font-mono text-green-500/70 hover:text-green-500 
                                   hover:bg-green-500/10 rounded-sm transition-all duration-200"
                        >
                          ADD_PREDICTION &gt;
                        </button>
                      </div>
                    </div>

                    {/* Contest Predictions */}
                    <div className="border border-green-500/30 rounded-sm p-6 bg-black">
                      <h3 className="text-lg font-mono mb-4">&gt; CONTEST_PREDICTIONS</h3>
                      <div className="space-y-4">
                        {pickems
                          .filter(p => p.contestId === selectedContest.id)
                          .map(pickem => (
                            <div
                              key={pickem.id}
                              className="border border-green-500/30 rounded-sm p-4 hover:border-green-500 
                                       transition-all duration-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                {pickem.category && (
                                  <div className="inline-flex items-center space-x-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>
                                    <span className="text-xs font-mono text-green-500/70">
                                      {pickem.category.name}
                                    </span>
                                  </div>
                                )}
                                <span className="text-xs font-mono text-green-500/30">
                                  #{String(pickem.id).padStart(3, '0')}
                                </span>
                              </div>
                              <div className="font-mono text-green-500">
                                {pickem.title || 'UNTITLED_PREDICTION'}
                              </div>
                              <div className="mt-2 space-y-1">
                                {pickem.choices?.map((choice, index) => (
                                  <div key={choice.id} className="text-sm font-mono text-green-500/70">
                                    &gt; {choice.text}
                                    {choice.nickname && (
                                      <span className="ml-2 text-green-500/50">
                                        [{choice.nickname}]
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                    {contests.map(contest => (
                      <motion.div
                        key={contest.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="border border-green-500/30 rounded-sm p-6 bg-black hover:border-green-500 
                                 transition-all duration-200 group relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${contest.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            <span className="text-xs font-mono text-green-500/50">
                              {contest.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                          <div className="text-green-500/30 text-xs font-mono">
                            #{String(contest.id).padStart(3, '0')}
                          </div>
                        </div>

                        <div className="mb-4 font-mono">
                          <div className="text-green-500 text-lg flex items-start">
                            <span className="mr-2">&gt;</span>
                            <span>{contest.name}</span>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm font-mono">
                          <div className="flex justify-between text-green-500/70">
                            <span>PREDICTIONS:</span>
                            <span>{pickems.filter(p => p.contestId === contest.id).length}</span>
                          </div>
                          <div className="flex justify-between text-green-500/70">
                            <span>DEADLINE:</span>
                            <span>{new Date(contest.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-green-500/20 flex justify-end space-x-4">
                          <button
                            onClick={() => setSelectedContest(contest)}
                            className="px-4 py-2 text-sm font-mono text-green-500/70 hover:text-green-500 
                                     hover:bg-green-500/10 rounded-sm transition-all duration-200"
                          >
                            VIEW_DETAILS &gt;
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'predictions' && (
              <div className="space-y-6">
                {/* Predictions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                  {pickems.map(pickem => (
                    <motion.div
                      key={pickem.id}
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

                      {/* Title */}
                      <div className="mb-4 font-mono">
                        <div className="text-green-500 text-lg flex items-start">
                          <span className="mr-2">&gt;</span>
                          <span>PREDICTION_{String(pickem.id).padStart(3, '0')}</span>
                        </div>
                      </div>

                      {/* Choices */}
                      <div className="space-y-3 mb-4">
                        {pickem.choices?.map((choice, index) => (
                          <div
                            key={choice.id}
                            className="p-3 border border-green-500/30 rounded-sm bg-black/50"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start space-x-2">
                                  <span className="text-green-500/50 mt-1">&gt;</span>
                                  <span className="font-mono text-green-500/90 leading-relaxed break-words">
                                    {choice.text}
                                  </span>
                                </div>
                                {choice.nickname && (
                                  <div className="mt-2 text-xs border-t border-green-500/10 pt-2 font-mono flex items-center">
                                    <span className="text-green-500/30">&gt; AGENT:</span>
                                    <span className="ml-2 text-green-500/70">{choice.nickname}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Metadata */}
                      <div className="mt-4 pt-4 border-t border-green-500/20 flex justify-between items-center text-xs font-mono">
                        <div className="flex items-center text-green-500/40">
                          <span className="text-green-500/30">&gt; CONTEST:</span>
                          <span className="ml-2">#{String(pickem.contestId).padStart(3, '0')}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => setConfirmClose({ pickemId: pickem.id })}
                            className="px-3 py-1 text-green-500/70 hover:text-green-500 
                                     hover:bg-green-500/10 rounded-sm transition-all duration-200"
                          >
                            CLOSE &gt;
                          </button>
                          <button
                            onClick={() => setEditingChoice(pickem)}
                            className="px-3 py-1 text-green-500/70 hover:text-green-500 
                                     hover:bg-green-500/10 rounded-sm transition-all duration-200"
                          >
                            EDIT &gt;
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="border border-green-500/30 rounded-lg p-6">
                <h2 className="text-xl font-mono mb-6">&gt; CATEGORY_MANAGEMENT:</h2>
                {/* Add category management content */}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Modals */}
        {showCreateContest && (
          <ContestCreationForm onClose={() => setShowCreateContest(false)} />
        )}

        {confirmClose && (
          <PickemCloseDialog
            pickemId={confirmClose.pickemId}
            correctChoiceId={confirmClose.correctChoiceId}
            onClose={() => setConfirmClose(null)}
          />
        )}

        {showBulkUpload && selectedContest && (
          <BulkUploadForm
            contestId={selectedContest.id}
            onClose={() => setShowBulkUpload(false)}
          />
        )}

        {editingChoice && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-black border border-green-500 rounded-sm p-6 max-w-2xl w-full mx-4 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-mono text-green-500">
                  &gt; EDIT_PREDICTION #{String(editingChoice.id).padStart(3, '0')}
                </h3>
                <button
                  onClick={() => setEditingChoice(null)}
                  className="text-green-500/70 hover:text-green-500"
                >
                  [X]
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                try {
                  await updatePickemFn({
                    id: editingChoice.id,
                    title: formData.get('title'),
                    choices: editingChoice.choices.map((choice, index) => ({
                      id: choice.id,
                      text: formData.get(`choice${index}`),
                      nickname: choice.nickname
                    }))
                  });
                  setEditingChoice(null);
                } catch (error) {
                  console.error('Failed to update prediction:', error);
                }
              }} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-green-500/70 text-sm font-mono mb-2">
                    &gt; TITLE
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingChoice.title}
                    className="w-full py-2 px-3 bg-black border border-green-500/30 rounded-sm text-green-500 font-mono
                             focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    placeholder="ENTER_TITLE"
                  />
                </div>

                {/* Choices */}
                <div className="space-y-4">
                  <label className="block text-green-500/70 text-sm font-mono mb-2">
                    &gt; CHOICES
                  </label>
                  {editingChoice.choices.map((choice, index) => (
                    <div key={choice.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-green-500/50 font-mono">
                        <span>CHOICE_{index + 1}</span>
                        {choice.nickname && (
                          <span>AGENT: [{choice.nickname}]</span>
                        )}
                      </div>
                      <input
                        type="text"
                        name={`choice${index}`}
                        defaultValue={choice.text}
                        className="w-full py-2 px-3 bg-black border border-green-500/30 rounded-sm text-green-500 font-mono
                                 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 border-t border-green-500/20">
                  <button
                    type="submit"
                    className="px-4 py-2 font-mono text-sm border border-green-500/30 rounded-sm
                             hover:border-green-500 hover:bg-green-500/10 transition-all duration-200"
                  >
                    EXECUTE_UPDATE &gt;
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer Status */}
        <div className="mt-8 text-xs font-mono text-green-500/50 flex justify-between">
          <span>ADMIN_CONSOLE_VERSION: 2.0.0</span>
          <span>LAST_SYNC: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

const CreatePickemForm = ({ existingCategories, contestId }) => {
  const [category, setCategory] = useState('');
  const [isNewCategory, setIsNewCategory] = useState(false);
  const createPickemFn = useAction(createPickem);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const choices = [
      formData.get('choice1'),
      formData.get('choice2')
    ].filter(Boolean);
    const category = isNewCategory ? formData.get('newCategory') : formData.get('existingCategory');

    await createPickemFn({ choices, category, contestId });
    e.target.reset();
    setCategory('');
  };

  return (
    <div className="bg-black border border-green-500 rounded p-6">
      <h2 className="text-xl font-mono mb-4 text-green-400">&gt; CREATE_NEW_PICKEM</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CategorySelection
          category={category}
          setCategory={setCategory}
          isNewCategory={isNewCategory}
          setIsNewCategory={setIsNewCategory}
          existingCategories={existingCategories}
        />

        <div>
          <label className="block text-green-400 text-sm font-mono mb-2">
            &gt; CHOICES
          </label>
          {[1, 2].map((num) => (
            <input
              key={num}
              type="text"
              name={`choice${num}`}
              className="w-full py-2 px-3 mb-2 bg-black border border-green-500 rounded text-green-500 font-mono focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              placeholder={`CHOICE_${num}`}
              required
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 font-mono text-green-500 hover:text-black border border-green-500 hover:bg-green-500 rounded transition-all duration-200"
        >
          EXECUTE_CREATE
        </button>
      </form>
    </div>
  );
};

const CategorySelection = ({ category, setCategory, isNewCategory, setIsNewCategory, existingCategories }) => {
  return (
    <div className="space-y-3">
      <label className="block text-green-400 text-sm font-mono">
        &gt; CATEGORY
      </label>
      
      <div className="flex space-x-4 font-mono">
        <label className="inline-flex items-center">
          <input
            type="radio"
            checked={isNewCategory}
            onChange={() => setIsNewCategory(true)}
            className="form-radio text-green-500"
          />
          <span className="ml-2 text-green-500">NEW_CATEGORY</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            checked={!isNewCategory}
            onChange={() => setIsNewCategory(false)}
            className="form-radio text-green-500"
          />
          <span className="ml-2 text-green-500">EXISTING_CATEGORY</span>
        </label>
      </div>

      {isNewCategory ? (
        <input
          type="text"
          name="newCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full py-2 px-3 bg-black border border-green-500 rounded text-green-500 font-mono focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
          placeholder="ENTER_NEW_CATEGORY"
          required
        />
      ) : (
        <select
          name="existingCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full py-2 px-3 bg-black border border-green-500 rounded text-green-500 font-mono focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
          required
        >
          <option value="">SELECT_CATEGORY</option>
          {existingCategories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default AdminDashboard;
