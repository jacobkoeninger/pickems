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

  if (contestsLoading || pickemsLoading) return <div className="text-green-500 font-mono">[LOADING...]</div>;
  if (contestsError) return <div className="text-red-500 font-mono">[ERROR]: {contestsError}</div>;
  if (pickemsError) return <div className="text-red-500 font-mono">[ERROR]: {pickemsError}</div>;

  const handleClosePickem = (pickemId, correctChoiceId) => {
    closePickemFn({ pickemId, correctChoiceId });
  };

  const filteredPickems = pickems?.filter(pickem => pickem.contestId === selectedContest?.id);

  return (
    <div className="bg-black text-green-500 min-h-screen p-6">
      <h1 className="text-2xl font-mono mb-4 glitch-text">[ADMIN_CONSOLE]</h1>
      
      {selectedContest ? (
        <>
          <button
            onClick={() => setSelectedContest(null)}
            className="mb-4 px-4 py-2 font-mono text-green-500 hover:text-black border border-green-500 hover:bg-green-500 rounded transition-all duration-200 ease-in-out hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
          >
            &lt; RETURN_TO_CONTESTS
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
        <div className="mb-8 p-6 bg-black border border-green-500 rounded shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <h2 className="text-xl font-mono mb-4 text-green-400">&gt; AVAILABLE_CONTESTS</h2>
          <div className="grid grid-cols-1 gap-4">
            {contests?.map((contest) => (
              <div 
                key={contest.id} 
                className={`p-4 border rounded cursor-pointer transition-all duration-200 ${
                  selectedContest?.id === contest.id 
                    ? 'bg-green-500 text-black border-green-500' 
                    : 'bg-black border-green-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                }`}
                onClick={() => setSelectedContest(contest)}
              >
                <h3 className="text-lg font-mono">&gt; {contest.name}</h3>
                {contest.description && (
                  <p className="font-mono mt-2 opacity-80">{contest.description}</p>
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
    <div className="mb-8 p-6 bg-black border border-green-500 rounded shadow-[0_0_15px_rgba(34,197,94,0.3)]">
      <h2 className="text-xl font-mono mb-4 text-green-400">&gt; CREATE_NEW_PICKEM</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <CategorySelection
            category={category}
            setCategory={setCategory}
            isNewCategory={isNewCategory}
            setIsNewCategory={setIsNewCategory}
            existingCategories={existingCategories}
          />

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
          className="px-4 py-2 font-mono text-green-500 hover:text-black border border-green-500 hover:bg-green-500 rounded transition-all duration-200 ease-in-out hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
        >
          EXECUTE_CREATE
        </button>
      </form>
    </div>
  );
};

const CategorySelection = ({ category, setCategory, isNewCategory, setIsNewCategory, existingCategories }) => {
  return (
    <>
      <label className="block text-green-400 text-sm font-mono mb-2">
        &gt; CATEGORY
      </label>
      
      <div className="mb-4 font-mono">
        <label className="inline-flex items-center mr-4">
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
          className="w-full py-2 px-3 mb-4 bg-black border border-green-500 rounded text-green-500 font-mono focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
          placeholder="ENTER_NEW_CATEGORY"
          required
        />
      ) : (
        <select
          name="existingCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full py-2 px-3 mb-4 bg-black border border-green-500 rounded text-green-500 font-mono focus:outline-none focus:border-green-400 focus:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
          required
        >
          <option value="">SELECT_CATEGORY</option>
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
        <div key={pickem.id} className="p-6 bg-black border border-green-500 rounded shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          <div className="mb-4">
            <h3 className="text-lg font-mono text-green-400">&gt; PICKEM #{pickem.id}</h3>
            {pickem.category && (
              <p className="text-green-500 font-mono opacity-80">CATEGORY: {pickem.category}</p>
            )}
          </div>
          <div className="space-y-4">
            {pickem.choices.map((choice) => {
              const choiceDetails = pickemChoices?.find(pc => pc.id === choice.id);
              return (
                <div key={choice.id} className="flex items-center justify-between border-b border-green-500 pb-2">
                  <div>
                    <p className="font-mono text-green-500">{choice.text}</p>
                    {choiceDetails && (
                      <p className="text-sm text-green-400 font-mono">OWNER: {choiceDetails.owner?.username} [ID: {choiceDetails.ownerId}]</p>
                    )}
                  </div>
                  <button
                    onClick={() => onClosePickem(pickem.id, choice.id)}
                    className="px-4 py-2 font-mono text-green-500 hover:text-black border border-green-500 hover:bg-green-500 rounded transition-all duration-200 ease-in-out hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  >
                    SET_WINNER
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
