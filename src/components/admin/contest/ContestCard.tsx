import React from 'react';
import { Button } from '../../common';
import { Contest } from '../../../types';

interface ContestCardProps {
  contest: Contest;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

const ContestCard: React.FC<ContestCardProps> = ({ contest, isSelected, onClick, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div 
      onClick={onClick}
      className={`group p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-green-500 text-black border-green-500' 
          : contest.isActive 
            ? 'border-green-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]'
            : 'border-red-500 opacity-50'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-mono text-sm">&gt; {contest.name}</h3>
          <div className="text-xs opacity-75 mt-1">
            <div>{new Date(contest.deadline).toLocaleDateString()}</div>
            <div>{contest.isActive ? '[ACTIVE]' : '[INACTIVE]'}</div>
          </div>
        </div>
        <Button
          onClick={handleDelete}
          variant="danger"
          className="text-xs px-2 py-1"
        >
          DELETE
        </Button>
      </div>
    </div>
  );
};

export default ContestCard; 