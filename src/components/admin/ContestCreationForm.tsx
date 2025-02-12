import React from 'react';
import { useAction } from 'wasp/client/operations';
import { createContest } from 'wasp/client/operations';
import { Button } from '../common';

interface ContestCreationFormProps {
  onClose: () => void;
}

interface ContestFormData {
  name: string;
  description?: string;
  deadline: string;
}

const ContestCreationForm: React.FC<ContestCreationFormProps> = ({ onClose }) => {
  const createContestFn = useAction(createContest);

  const handleCreateContest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: ContestFormData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      deadline: formData.get('deadline') as string
    };

    try {
      await createContestFn(data);
      onClose();
      e.currentTarget.reset();
    } catch (error) {
      console.error('Failed to create contest:', error);
    }
  };

  return (
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
            <Button
              onClick={onClose}
              variant="danger"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              CREATE
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContestCreationForm; 