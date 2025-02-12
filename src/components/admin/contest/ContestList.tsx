import React, { useState } from 'react';
import { useAction } from 'wasp/client/operations';
import { deleteContest } from 'wasp/client/operations';
import { Button } from '../../common';
import ContestCard from './ContestCard';
import DeleteContestDialog from './DeleteContestDialog';
import { Contest } from '../../../types';

interface ContestListProps {
  contests: Contest[] | undefined;
  selectedContest: Contest | null;
  onContestSelect: (contest: Contest) => void;
  onCreateClick: () => void;
}

const ContestList: React.FC<ContestListProps> = ({ 
  contests, 
  selectedContest, 
  onContestSelect, 
  onCreateClick 
}) => {
  const [contestToDelete, setContestToDelete] = useState<Contest | null>(null);
  const deleteContestFn = useAction(deleteContest);

  return (
    <>
      <div className="col-span-1 bg-black border border-green-500/30 rounded-lg p-6 h-fit sticky top-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-mono text-green-400">&gt; CONTESTS</h2>
          <Button
            onClick={onCreateClick}
            variant="primary"
            className="px-4 py-1 text-sm"
          >
            NEW
          </Button>
        </div>
        <div className="space-y-3">
          {contests?.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              isSelected={selectedContest?.id === contest.id}
              onClick={() => onContestSelect(contest)}
              onDelete={() => setContestToDelete(contest)}
            />
          ))}
        </div>
      </div>

      {contestToDelete && (
        <DeleteContestDialog
          contest={contestToDelete}
          onClose={() => setContestToDelete(null)}
        />
      )}
    </>
  );
};

export default ContestList; 