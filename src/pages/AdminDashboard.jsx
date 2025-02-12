import React, { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getOpenPickems, closePickem, createPickem, getPickemChoices, getCategories, getContests, bulkCreatePickems, updatePickemChoiceOwner, createContest } from 'wasp/client/operations';

const AdminDashboard = () => {
  const [selectedContest, setSelectedContest] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateContest, setShowCreateContest] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkUploadText, setBulkUploadText] = useState('');
  const [confirmClose, setConfirmClose] = useState(null);
  const [editingChoice, setEditingChoice] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  const { data: pickems, isLoading: pickemsLoading, error: pickemsError } = useQuery(getOpenPickems);
  const { data: pickemChoices } = useQuery(getPickemChoices);
  const { data: categories } = useQuery(getCategories);
  const { data: contests, isLoading: contestsLoading, error: contestsError } = useQuery(getContests);
  const closePickemFn = useAction(closePickem);
  const updatePickemChoiceOwnerFn = useAction(updatePickemChoiceOwner);
  const bulkCreatePickemsFn = useAction(bulkCreatePickems);
  const createContestFn = useAction(createContest);

  if (contestsLoading || pickemsLoading) return <div className="text-green-500 font-mono">[LOADING...]</div>;
  if (contestsError) return <div className="text-red-500 font-mono">[ERROR]: {contestsError}</div>;
  if (pickemsError) return <div className="text-red-500 font-mono">[ERROR]: {pickemsError}</div>;

  const handleCreateContest = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const description = formData.get('description');
    const deadline = formData.get('deadline');

    try {
      await createContestFn({ name, description, deadline });
      setShowCreateContest(false);
      e.target.reset();
    } catch (error) {
      console.error('Failed to create contest:', error);
    }
  };

  const handleClosePickem = (pickemId, correctChoiceId) => {
    setConfirmClose({ pickemId, correctChoiceId });
  };

  const confirmClosePickem = () => {
    if (confirmClose) {
      closePickemFn({ pickemId: confirmClose.pickemId, correctChoiceId: confirmClose.correctChoiceId });
      setConfirmClose(null);
    }
  };

  const handleUpdateOwner = async (choiceId, newOwnerId) => {
    try {
      await updatePickemChoiceOwnerFn({ choiceId, newOwnerId });
      setEditingChoice(null);
    } catch (error) {
      console.error('Failed to update owner:', error);
    }
  };

  const handleBulkUpload = async (jsonStr) => {
    try {
      if (!selectedContest) {
        throw new Error('No contest selected');
      }
      const pickems = JSON.parse(jsonStr);
      const pickemsWithContest = pickems.map(pickem => ({
        ...pickem,
        contestId: selectedContest.id
      }));
      await bulkCreatePickemsFn(pickemsWithContest);
      setShowBulkUpload(false);
      setBulkUploadText('');
    } catch (error) {
      console.error('Failed to bulk upload pickems:', error);
    }
  };

  const toggleCategory = (category) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  const filteredPickems = pickems?.filter(pickem => pickem.contestId === selectedContest?.id);

  // Group pickems by category
  const pickemsByCategory = {};
  filteredPickems?.forEach(pickem => {
    if (!pickemsByCategory[pickem.category]) {
      pickemsByCategory[pickem.category] = [];
    }
    pickemsByCategory[pickem.category].push(pickem);
  });

  return (
    <div className="bg-black text-green-500 min-h-screen p-6">
      <h1 className="text-2xl font-mono mb-4 glitch-text">[ADMIN_CONSOLE]</h1>

      {/* Create Contest Modal */}
      {showCreateContest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black border-2 border-green-500 p-6 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] max-w-md w-full">
            <h3 className="text-xl font-mono mb-4 text-green-400">&gt; CREATE_NEW_CONTEST</h3>
            <form onSubmit={handleCreateContest} className="space-y-4">
              <div>
                <label className="block text-green-400 text-sm font-mono mb-2">&gt; NAME</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full py-2 px-3 bg-black border border-green-500 rounded text-green-500 font-mono focus:outline-none focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-green-400 text-sm font-mono mb-2">&gt; DESCRIPTION</label>
                <textarea
                  name="description"
                  className="w-full py-2 px-3 bg-black border border-green-500 rounded text-green-500 font-mono focus:outline-none focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-green-400 text-sm font-mono mb-2">&gt; DEADLINE</label>
                <input
                  type="datetime-local"
                  name="deadline"
                  required
                  className="w-full py-2 px-3 bg-black border border-green-500 rounded text-green-500 font-mono focus:outline-none focus:border-green-400"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateContest(false)}
                  className="px-4 py-2 font-mono text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-black"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-mono text-green-500 border border-green-500 rounded hover:bg-green-500 hover:text-black"
                >
                  CREATE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmClose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black border-2 border-green-500 p-6 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] max-w-md w-full">
            <h3 className="text-xl font-mono mb-4 text-green-400">&gt; CONFIRM_CLOSE_PICKEM</h3>
            <p className="font-mono mb-6">Are you sure you want to close this pickem? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setConfirmClose(null)}
                className="px-4 py-2 font-mono text-green-500 border border-green-500 rounded hover:bg-red-500 hover:text-black hover:border-red-500 transition-all duration-200"
              >
                CANCEL
              </button>
              <button
                onClick={confirmClosePickem}
                className="px-4 py-2 font-mono text-green-500 border border-green-500 rounded hover:bg-green-500 hover:text-black transition-all duration-200"
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black border-2 border-green-500 p-6 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] max-w-2xl w-full">
            <h3 className="text-xl font-mono mb-4 text-green-400">&gt; BULK_UPLOAD_PICKEMS</h3>
            <textarea 
              className="w-full h-96 p-4 bg-black text-green-500 border border-green-500 rounded font-mono focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              placeholder="Paste JSON here..."
              value={bulkUploadText}
              onChange={(e) => setBulkUploadText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleBulkUpload(bulkUploadText);
                }
              }}
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setShowBulkUpload(false)}
                className="px-4 py-2 font-mono text-green-500 border border-green-500 rounded hover:bg-red-500 hover:text-black hover:border-red-500 transition-all duration-200"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleBulkUpload(bulkUploadText)}
                className="px-4 py-2 font-mono text-green-500 border border-green-500 rounded hover:bg-green-500 hover:text-black transition-all duration-200"
              >
                UPLOAD
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        {/* Contest Sidebar */}
        <div className="col-span-1 bg-black border border-green-500 rounded p-4 h-fit sticky top-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-mono text-green-400">&gt; CONTESTS</h2>
            <button
              onClick={() => setShowCreateContest(true)}
              className="px-3 py-1 font-mono text-green-500 border border-green-500 rounded hover:bg-green-500 hover:text-black text-sm"
            >
              NEW
            </button>
          </div>
          <div className="space-y-2">
            {contests?.map((contest) => (
              <div 
                key={contest.id}
                onClick={() => setSelectedContest(contest)}
                className={`p-3 border rounded cursor-pointer transition-all duration-200 ${
                  selectedContest?.id === contest.id 
                    ? 'bg-green-500 text-black border-green-500' 
                    : contest.isActive 
                      ? 'border-green-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                      : 'border-red-500 opacity-50'
                }`}
              >
                <h3 className="font-mono text-sm">&gt; {contest.name}</h3>
                <div className="text-xs opacity-75 mt-1 flex justify-between">
                  <span>{new Date(contest.deadline).toLocaleDateString()}</span>
                  <span>{contest.isActive ? '[ACTIVE]' : '[INACTIVE]'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-3">
          {selectedContest ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center sticky top-6 bg-black py-4 z-10">
                <h2 className="text-xl font-mono text-green-400">&gt; {selectedContest.name}</h2>
                <div className="space-x-4">
                  <button
                    onClick={() => setShowBulkUpload(true)}
                    className="px-4 py-2 font-mono text-green-500 hover:text-black border border-green-500 hover:bg-green-500 rounded transition-all duration-200"
                  >
                    BULK_UPLOAD
                  </button>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-4 py-2 font-mono text-green-500 hover:text-black border border-green-500 hover:bg-green-500 rounded transition-all duration-200"
                  >
                    {showCreateForm ? 'CANCEL_CREATE' : 'CREATE_NEW_PICKEM'}
                  </button>
                </div>
              </div>

              {showCreateForm && (
                <CreatePickemForm 
                  existingCategories={categories?.map(c => c.name) || []} 
                  contestId={selectedContest.id}
                />
              )}

              {Object.entries(pickemsByCategory).map(([category, categoryPickems]) => (
                <div key={category} className="mb-8">
                  <div 
                    className="flex items-center justify-between cursor-pointer bg-black border border-green-500 p-4 rounded-lg mb-4 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                    onClick={() => toggleCategory(category)}
                  >
                    <h3 className="text-xl font-mono text-green-400">&gt; {category}</h3>
                    <div className="flex items-center space-x-4">
                      <span className="font-mono text-xs text-green-400">
                        SORT: {categories?.find(c => c.name === category)?.sortOrder || 0}
                      </span>
                      <span className="font-mono text-green-500">
                        [{categoryPickems.length}] {collapsedCategories.has(category) ? '+' : '-'}
                      </span>
                    </div>
                  </div>
                  
                  {!collapsedCategories.has(category) && (
                    <div className="grid grid-cols-2 gap-4">
                      {categoryPickems.map((pickem) => (
                        <div key={pickem.id} className={`bg-black border rounded p-4 shadow-[0_0_15px_rgba(34,197,94,0.3)] ${
                          pickem.status === 'CLOSED' ? 'border-yellow-500' : 
                          pickem.status === 'CANCELLED' ? 'border-red-500' : 
                          'border-green-500'
                        }`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-mono text-green-400">&gt; PICKEM #{pickem.id}</h3>
                              <span className={`text-xs font-mono ${
                                pickem.status === 'CLOSED' ? 'text-yellow-500' : 
                                pickem.status === 'CANCELLED' ? 'text-red-500' : 
                                'text-green-500'
                              }`}>
                                [{pickem.status}]
                              </span>
                            </div>
                            <div className="text-xs opacity-75">
                              <div>Created: {new Date(pickem.createdAt).toLocaleDateString()}</div>
                              <div>Updated: {new Date(pickem.updatedAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {pickem.choices.map((choice) => (
                              <div key={choice.id} className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleClosePickem(pickem.id, choice.id)}
                                  disabled={pickem.status !== 'OPEN'}
                                  className={`flex-grow p-3 text-left font-mono border rounded transition-all duration-200 ${
                                    pickem.status === 'OPEN' 
                                      ? 'text-green-500 border-green-500 hover:bg-green-500 hover:text-black'
                                      : 'text-gray-500 border-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  <div>{choice.text}</div>
                                  {choice.description && (
                                    <div className="text-xs opacity-75 mt-1">{choice.description}</div>
                                  )}
                                  {choice.owner && (
                                    <div className="text-xs mt-1 opacity-75">
                                      [Owner: {choice.owner.nickname || choice.owner.username}]
                                    </div>
                                  )}
                                </button>
                                {pickem.status === 'OPEN' && (
                                  <button
                                    onClick={() => setEditingChoice(choice.id)}
                                    className="p-2 font-mono text-green-500 border border-green-500 rounded hover:bg-green-500 hover:text-black"
                                  >
                                    EDIT
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="font-mono text-green-500 opacity-80">&gt; SELECT_A_CONTEST</p>
            </div>
          )}
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
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default AdminDashboard;
