import React, { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getOpenPickems, closePickem, createPickem, getPickemChoices, getCategories, getContests } from 'wasp/client/operations';

const AdminDashboard = () => {
  const [selectedContest, setSelectedContest] = useState(null);
  const { data: pickems, isLoading: pickemsLoading, error: pickemsError } = useQuery(getOpenPickems);
  const { data: pickemChoices } = useQuery(getPickemChoices);
  const { data: categories } = useQuery(getCategories);
  const { data: contests, isLoading: contestsLoading, error: contestsError } = useQuery(getContests);
  const closePickemFn = useAction(closePickem);

  if (contestsLoading || pickemsLoading) return 'Loading...';
  if (contestsError) return 'Error loading contests: ' + contestsError;
  if (pickemsError) return 'Error loading pickems: ' + pickemsError;

  const handleClosePickem = (pickemId, correctChoiceId) => {
    closePickemFn({ pickemId, correctChoiceId });
  };

  const filteredPickems = pickems?.filter(pickem => pickem.contestId === selectedContest?.id);

  return (
    <div className="bg-stone-100">
      <h1 className="text-2xl font-serif mb-4">Admin Dashboard</h1>
      
      {selectedContest ? (
        <>
          <button
            onClick={() => setSelectedContest(null)}
            className="mb-4 bg-stone-800 hover:bg-stone-700 text-stone-100 font-serif py-2 px-4 rounded transition-colors"
          >
            ← Back to Contests
          </button>
          <CreatePickemForm 
            existingCategories={categories?.map(c => c.name) || []} 
            contestId={selectedContest.id}
          />
          <PickemList 
            pickems={filteredPickems} 
            pickemChoices={pickemChoices} 
            onClosePickem={handleClosePickem} 
          />
        </>
      ) : (
        <div className="mb-8 p-4 bg-white border border-stone-300 rounded">
          <h2 className="text-xl font-serif mb-4">Available Contests</h2>
          <div className="grid grid-cols-1 gap-4">
            {contests?.map((contest) => (
              <div 
                key={contest.id} 
                className={`p-4 border rounded cursor-pointer transition-colors ${
                  selectedContest?.id === contest.id 
                    ? 'bg-stone-200 border-stone-400' 
                    : 'bg-white border-stone-300 hover:bg-stone-50'
                }`}
                onClick={() => setSelectedContest(contest)}
              >
                <h3 className="text-lg font-serif">{contest.name}</h3>
                {contest.description && (
                  <p className="text-stone-600 font-serif mt-2">{contest.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
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
    <div className="mb-8 p-4 bg-white border border-stone-300 rounded">
      <h2 className="text-xl font-serif mb-4">Create New Pickem</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <CategorySelection
            category={category}
            setCategory={setCategory}
            isNewCategory={isNewCategory}
            setIsNewCategory={setIsNewCategory}
            existingCategories={existingCategories}
          />

          <label className="block text-stone-700 text-sm font-serif mb-2">
            Choices
          </label>
          {[1, 2].map((num) => (
            <input
              key={num}
              type="text"
              name={`choice${num}`}
              className="border border-stone-300 rounded w-full py-2 px-3 text-stone-700 mb-2 focus:outline-none focus:border-stone-500"
              placeholder={`Choice ${num}`}
              required
            />
          ))}
        </div>

        <button
          type="submit"
          className="bg-stone-800 hover:bg-stone-700 text-stone-100 font-serif py-2 px-4 rounded transition-colors"
        >
          Create Pickem
        </button>
      </form>
    </div>
  );
};

const CategorySelection = ({ category, setCategory, isNewCategory, setIsNewCategory, existingCategories }) => {
  return (
    <>
      <label className="block text-stone-700 text-sm font-serif mb-2">
        Category
      </label>
      
      <div className="mb-4">
        <label className="inline-flex items-center mr-4">
          <input
            type="radio"
            checked={isNewCategory}
            onChange={() => setIsNewCategory(true)}
            className="form-radio text-stone-800"
          />
          <span className="ml-2 font-serif">New Category</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            checked={!isNewCategory}
            onChange={() => setIsNewCategory(false)}
            className="form-radio text-stone-800"
          />
          <span className="ml-2 font-serif">Existing Category</span>
        </label>
      </div>

      {isNewCategory ? (
        <input
          type="text"
          name="newCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-stone-300 rounded w-full py-2 px-3 text-stone-700 mb-4 focus:outline-none focus:border-stone-500"
          placeholder="Enter new category"
          required
        />
      ) : (
        <select
          name="existingCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-stone-300 rounded w-full py-2 px-3 text-stone-700 mb-4 focus:outline-none focus:border-stone-500"
          required
        >
          <option value="">Select a category</option>
          {existingCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}
    </>
  );
};

const PickemList = ({ pickems, pickemChoices, onClosePickem }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {pickems?.map((pickem) => (
        <div key={pickem.id} className="p-4 bg-white border border-stone-300 rounded">
          <div className="mb-4">
            <h3 className="text-lg font-serif">Pickem #{pickem.id}</h3>
            {pickem.category && (
              <p className="text-stone-600 font-serif">Category: {pickem.category}</p>
            )}
          </div>
          <div className="space-y-4">
            {pickem.choices.map((choice) => {
              const choiceDetails = pickemChoices?.find(pc => pc.id === choice.id);
              return (
                <div key={choice.id} className="flex items-center justify-between border-b border-stone-300 pb-2">
                  <div>
                    <p className="font-serif">{choice.text}</p>
                    {choiceDetails && (
                      <p className="text-sm text-stone-600 font-serif">Owner: {choiceDetails.owner?.username} (ID: {choiceDetails.ownerId})</p>
                    )}
                  </div>
                  <button
                    onClick={() => onClosePickem(pickem.id, choice.id)}
                    className="bg-stone-800 hover:bg-stone-700 text-stone-100 font-serif py-2 px-4 rounded transition-colors"
                  >
                    Select as Winner
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
