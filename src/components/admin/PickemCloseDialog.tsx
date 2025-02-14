import React, { useState } from 'react';
import { useAction, useQuery } from 'wasp/client/operations';
import { closePickem, getPickemById } from 'wasp/client/operations';
import { Button } from '../common';
import { Pickem, PickemChoice } from '../../types';

interface PickemCloseDialogProps {
  onClose: () => void;
  pickemId: string;
}

const PickemCloseDialog: React.FC<PickemCloseDialogProps> = ({ onClose, pickemId }) => {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const closePickemFn = useAction(closePickem);
  const { data: pickem, isLoading, error } = useQuery(getPickemById, { pickemId });

  const handleConfirm = async () => {
    if (!selectedChoiceId) return;
    
    try {
      await closePickemFn({ pickemId, correctChoiceId: selectedChoiceId });
      onClose();
    } catch (error) {
      console.error('Failed to close pickem:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-black border-2 border-green-500 p-6 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] max-w-md w-full">
          <p className="font-mono text-green-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !pickem) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-black border-2 border-green-500 p-6 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] max-w-md w-full">
          <p className="font-mono text-red-400">Error loading pickem</p>
          <Button onClick={onClose} variant="danger" className="mt-4">CLOSE</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border-2 border-green-500 p-6 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)] max-w-md w-full">
        <h3 className="text-xl font-mono mb-4 text-green-400">&gt; SELECT_CORRECT_CHOICE</h3>
        <div className="space-y-4 mb-6">
          {pickem.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => setSelectedChoiceId(choice.id)}
              className={`w-full p-4 text-left border rounded-lg transition-all duration-200 ${
                selectedChoiceId === choice.id
                  ? 'border-green-500 bg-green-500/20 text-green-400'
                  : 'border-green-500/30 hover:border-green-500/50 text-green-300'
              }`}
            >
              <div className="font-mono">{choice.text}</div>
              {choice.nickname && (
                <div className="text-sm opacity-70 mt-1">Created by: {choice.nickname}</div>
              )}
            </button>
          ))}
        </div>
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
            disabled={!selectedChoiceId}
          >
            CONFIRM
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PickemCloseDialog; 