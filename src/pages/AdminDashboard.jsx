import React, { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getOpenPickems, updatePickemChoiceOwner, getPickemChoices, getCategories, getContests } from 'wasp/client/operations';
import { LoadingState, ErrorState } from '../components/common';
import {
  ContestCreationForm,
  BulkUploadForm,
  PickemCloseDialog,
  ContestList
} from '../components/admin';
import { PickemList } from '../components/admin/pickem';

const AdminDashboard = () => {
  const [selectedContest, setSelectedContest] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateContest, setShowCreateContest] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [confirmClose, setConfirmClose] = useState(null);
  const [editingChoice, setEditingChoice] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  
  const { data: pickems, isLoading: pickemsLoading, error: pickemsError } = useQuery(getOpenPickems);
  const { data: pickemChoices } = useQuery(getPickemChoices);
  const { data: categories } = useQuery(getCategories);
  const { data: contests, isLoading: contestsLoading, error: contestsError } = useQuery(getContests);
  const updatePickemChoiceOwnerFn = useAction(updatePickemChoiceOwner);

  if (contestsLoading || pickemsLoading) return <LoadingState />;
  if (contestsError) return <ErrorState error={contestsError} />;
  if (pickemsError) return <ErrorState error={pickemsError} />;

  const handleUpdateOwner = async (choiceId, newOwnerId) => {
    try {
      await updatePickemChoiceOwnerFn({ choiceId, newOwnerId });
      setEditingChoice(null);
    } catch (error) {
      console.error('Failed to update owner:', error);
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

      <div className="grid grid-cols-4 gap-6">
        <ContestList
          contests={contests}
          selectedContest={selectedContest}
          onContestSelect={setSelectedContest}
          onCreateClick={() => setShowCreateContest(true)}
        />

        {selectedContest && (
          <PickemList
            pickemsByCategory={pickemsByCategory}
            collapsedCategories={collapsedCategories}
            onToggleCategory={toggleCategory}
            onClosePickem={(pickemId) => setConfirmClose({ pickemId })}
            onEditChoice={setEditingChoice}
            onCreateClick={() => setShowCreateForm(true)}
            onBulkUploadClick={() => setShowBulkUpload(true)}
          />
        )}
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
