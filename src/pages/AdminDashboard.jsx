import React, { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getOpenPickems, closePickem, createPickem, getPickemChoices, getCategories, getContests, bulkCreatePickems, updatePickemChoiceOwner } from 'wasp/client/operations';

const AdminDashboard = () => {
  const [selectedContest, setSelectedContest] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkUploadText, setBulkUploadText] = useState('');
  const [confirmClose, setConfirmClose] = useState(null);
  const [editingChoice, setEditingChoice] = useState(null);
  const { data: pickems, isLoading: pickemsLoading, error: pickemsError } = useQuery(getOpenPickems);
  const { data: pickemChoices } = useQuery(getPickemChoices);
  const { data: categories } = useQuery(getCategories);
  const { data: contests, isLoading: contestsLoading, error: contestsError } = useQuery(getContests);
  const closePickemFn = useAction(closePickem);
  const updatePickemChoiceOwnerFn = useAction(updatePickemChoiceOwner);
  const bulkCreatePickemsFn = useAction(bulkCreatePickems);

  if (contestsLoading || pickemsLoading) return <div className="text-green-500 font-mono">[LOADING...]</div>;
  if (contestsError) return <div className="text-red-500 font-mono">[ERROR]: {contestsError}</div>;
  if (pickemsError) return <div className="text-red-500 font-mono">[ERROR]: {pickemsError}</div>;

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

  const filteredPickems = pickems?.filter(pickem => pickem.contestId === selectedContest?.id);

  return (
    <div className="bg-black text-green-500 min-h-screen p-6">
      <h1 className="text-2xl font-mono mb-4 glitch-text">[ADMIN_CONSOLE]</h1>

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
        <div className="col-span-1 bg-black border border-green-500 rounded p-4 h-fit">
          <h2 className="text-xl font-mono mb-4 text-green-400">&gt; CONTESTS</h2>
          <div className="space-y-2">
            {contests?.map((contest) => (
              <div 
                key={contest.id}
                onClick={() => setSelectedContest(contest)}
                className={`p-3 border rounded cursor-pointer transition-all duration-200 ${
                  selectedContest?.id === contest.id 
                    ? 'bg-green-500 text-black border-green-500' 
                    : 'border-green-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                }`}
              >
                <h3 className="font-mono text-sm">&gt; {contest.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-3">
          {selectedContest ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
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

              <div className="grid grid-cols-2 gap-4">
                {filteredPickems?.map((pickem) => (
                  <div key={pickem.id} className="bg-black border border-green-500 rounded p-4 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-mono text-green-400">&gt; PICKEM #{pickem.id}</h3>
                        <p className="text-sm font-mono text-green-500 opacity-80">{pickem.category}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {pickem.choices.map((choice) => (
                        <div key={choice.id} className="flex items-center space-x-2">
                          <button
                            onClick={() => handleClosePickem(pickem.id, choice.id)}
                            className="flex-grow p-3 text-left font-mono text-green-500 border border-green-500 rounded hover:bg-green-500 hover:text-black transition-all duration-200"
                          >
                            {choice.text}
                          </button>
                          {editingChoice === choice.id ? (
                            <div className="flex items-center space-x-2">
                              <input 
                                type="text"
                                placeholder="New owner ID"
                                className="p-2 bg-black border border-green-500 rounded text-green-500 font-mono"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateOwner(choice.id, e.target.value);
                                  }
                                }}
                              />
                              <button
                                onClick={() => setEditingChoice(null)}
                                className="p-2 font-mono text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-black"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingChoice(choice.id)}
                              className="p-2 font-mono text-green-500 border border-green-500 rounded hover:bg-green-500 hover:text-black"
                            >
                              EDIT_OWNER
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
