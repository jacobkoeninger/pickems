import React from 'react';
import { Button } from '../../common';
import { Pickem } from '../../../types';

interface PickemCardProps {
  pickem: Pickem;
  onClose: (pickemId: string) => void;
  onEditChoice: (choiceId: string) => void;
}

const PickemCard: React.FC<PickemCardProps> = ({ pickem, onClose, onEditChoice }) => {
  return (
    <div className="bg-black border border-green-500/50 rounded-lg p-5 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 mr-4">
          <h4 className="font-mono text-lg text-green-400 leading-tight">&gt; {pickem.choices[0]?.text}</h4>
          <p className="text-sm text-green-500/70 mt-2 font-mono">
            <span className="opacity-50">[CATEGORY]:</span> {pickem.category?.name || 'Uncategorized'}
          </p>
        </div>
        <Button
          onClick={() => onClose(pickem.id)}
          variant="danger"
          className="text-sm shrink-0"
        >
          CLOSE
        </Button>
      </div>

      <div className="space-y-3">
        {pickem.choices.map((choice) => (
          <div
            key={choice.id}
            className="flex items-center justify-between p-3 border border-green-500/30 rounded-lg bg-black/50 hover:bg-green-500/5 transition-colors duration-200"
          >
            <span className="font-mono text-green-300">{choice.text}</span>
            <div className="flex items-center space-x-3">
              {choice.userId && (
                <span className="text-sm text-green-500/50 font-mono">
                  <span className="opacity-50">[OWNER]:</span> {choice.nickname || choice.userId}
                </span>
              )}
              <Button
                onClick={() => onEditChoice(choice.id)}
                variant="primary"
                className="text-sm px-3 py-1"
              >
                EDIT
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PickemCard; 