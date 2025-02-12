import React from 'react';
import { useAction } from 'wasp/client/operations';
import { closePickem } from 'wasp/client/operations';
import { Button } from '../common';

interface PickemCloseDialogProps {
  onClose: () => void;
  pickemId: string;
  correctChoiceId: string;
}

const PickemCloseDialog: React.FC<PickemCloseDialogProps> = ({ onClose, pickemId, correctChoiceId }) => {
  const closePickemFn = useAction(closePickem);

  const handleConfirm = async () => {
    try {
      await closePickemFn({ pickemId, correctChoiceId });
      onClose();
    } catch (error) {
      console.error('Failed to close pickem:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border-2 border-green-500 p-6 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] max-w-md w-full">
        <h3 className="text-xl font-mono mb-4 text-green-400">&gt; CONFIRM_CLOSE_PICKEM</h3>
        <p className="font-mono mb-6">Are you sure you want to close this pickem? This action cannot be undone.</p>
        <div className="flex justify-end space-x-4">
          <Button
            onClick={onClose}
            variant="danger"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleConfirm}
            variant="primary"
          >
            CONFIRM
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PickemCloseDialog; 