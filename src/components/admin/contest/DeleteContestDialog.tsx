import React from 'react';
import { useAction } from 'wasp/client/operations';
import { deleteContest } from 'wasp/client/operations';
import { Button } from '../../common';
import { Contest } from '../../../types';

interface DeleteContestDialogProps {
  contest: Contest;
  onClose: () => void;
}

const DeleteContestDialog: React.FC<DeleteContestDialogProps> = ({ contest, onClose }) => {
  const deleteContestFn = useAction(deleteContest);

  const handleConfirm = async () => {
    try {
      await deleteContestFn({ contestId: contest.id });
      onClose();
    } catch (error) {
      console.error('Failed to delete contest:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border-2 border-red-500 p-6 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.3)] max-w-md w-full">
        <h3 className="text-xl font-mono mb-2 text-red-400">&gt; CONFIRM_DELETE_CONTEST</h3>
        <p className="font-mono text-red-300 mb-2">{contest.name}</p>
        <p className="font-mono mb-6 text-sm text-red-400/70">
          This will permanently delete the contest and all its associated pickems. This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <Button
            onClick={onClose}
            variant="primary"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleConfirm}
            variant="danger"
          >
            DELETE
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteContestDialog; 