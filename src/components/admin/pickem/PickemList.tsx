import React from 'react';
import { Button, EmptyState, LoadingState, ErrorState } from '../../common';
import { PickemCard } from '.';
import { Pickem } from '../../../types';

interface PickemListProps {
  pickemsByCategory: Record<string, Pickem[]>;
  collapsedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  onClosePickem: (pickemId: string) => void;
  onEditChoice: (choiceId: string) => void;
  onCreatePickem: () => void;
  onBulkUploadClick: () => void;
  isLoading?: boolean;
  error?: Error | string | unknown;
}

const PickemList: React.FC<PickemListProps> = ({
  pickemsByCategory,
  collapsedCategories,
  onToggleCategory,
  onClosePickem,
  onEditChoice,
  onCreatePickem,
  onBulkUploadClick,
  isLoading,
  error
}) => {
  if (isLoading) {
    return <LoadingState message="Loading pickems..." />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const categories = Object.keys(pickemsByCategory);
  if (categories.length === 0) {
    return (
      <div className="col-span-3 bg-black border border-green-500/30 rounded-lg p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-mono text-green-400">&gt; PICKEMS_DASHBOARD</h2>
          <div className="flex space-x-4">
            <Button
              onClick={onCreatePickem}
              variant="primary"
              className="px-6"
            >
              CREATE PICKEM
            </Button>
            <Button
              onClick={onBulkUploadClick}
              variant="primary"
              className="px-6"
            >
              BULK UPLOAD
            </Button>
          </div>
        </div>
        <EmptyState message="No pickems found. Create one to get started!" />
      </div>
    );
  }

  return (
    <div className="col-span-3 bg-black border border-green-500/30 rounded-lg p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-mono text-green-400">&gt; PICKEMS_DASHBOARD</h2>
        <div className="flex space-x-4">
          <Button
            onClick={onCreatePickem}
            variant="primary"
            className="px-6"
          >
            CREATE PICKEM
          </Button>
          <Button
            onClick={onBulkUploadClick}
            variant="primary"
            className="px-6"
          >
            BULK UPLOAD
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category} className="border border-green-500/20 rounded-lg p-6">
            <div
              className="flex items-center cursor-pointer mb-6 group"
              onClick={() => onToggleCategory(category)}
            >
              <span className={`text-xl font-mono text-green-400 transition-transform duration-200 ${
                collapsedCategories.has(category) ? '' : 'rotate-90'
              }`}>
                ▶
              </span>
              <h3 className="text-xl font-mono text-green-400 ml-3 group-hover:text-green-300">
                {category.toUpperCase()}
              </h3>
              <span className="ml-3 text-sm text-green-500/70">
                ({pickemsByCategory[category].length} pickems)
              </span>
            </div>

            {!collapsedCategories.has(category) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pl-8">
                {pickemsByCategory[category].map((pickem) => (
                  <PickemCard
                    key={pickem.id}
                    pickem={pickem}
                    onClose={onClosePickem}
                    onEditChoice={onEditChoice}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PickemList; 