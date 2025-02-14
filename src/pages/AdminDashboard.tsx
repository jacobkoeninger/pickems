import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getOpenPickems, getPickemChoices, getCategories, getContests } from 'wasp/client/operations';
import { LoadingState, ErrorState } from '../components/common';
import {
  ContestCreationForm,
  BulkUploadForm,
  PickemCloseDialog,
  ContestList
} from '../components/admin';
import { PickemList } from '../components/admin/pickem';
import { Contest, Pickem } from '../types';

const AdminDashboard = () => {
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateContest, setShowCreateContest] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [confirmClose, setConfirmClose] = useState<{ pickemId: string; correctChoiceId?: string } | null>(null);
  const [editingChoice, setEditingChoice] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  
  const { data: pickems, isLoading: pickemsLoading, error: pickemsError } = useQuery(getOpenPickems);
  const { data: pickemChoices } = useQuery(getPickemChoices);
  const { data: categories } = useQuery(getCategories);
  const { data: contests, isLoading: contestsLoading, error: contestsError } = useQuery(getContests);

  if (contestsLoading || pickemsLoading) return <LoadingState />;
  if (contestsError) return <ErrorState error={contestsError} />;
  if (pickemsError) return <ErrorState error={pickemsError} />;

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  const filteredPickems = pickems?.filter((pickem: Pickem) => pickem.contestId === selectedContest?.id);

  // Group and sort pickems by category name
  const pickemsByCategory: Record<string, Pickem[]> = {};
  
  // First, group pickems by category
  filteredPickems?.forEach((pickem: Pickem) => {
    const categoryName = pickem.category?.name || 'Uncategorized';
    if (!pickemsByCategory[categoryName]) {
      pickemsByCategory[categoryName] = [];
    }
    pickemsByCategory[categoryName].push(pickem);
  });

  // Sort pickems within each category by first choice text
  Object.keys(pickemsByCategory).forEach((category: string) => {
    pickemsByCategory[category].sort((a: Pickem, b: Pickem) => {
      const textA = a.choices[0]?.text || '';
      const textB = b.choices[0]?.text || '';
      return textA.localeCompare(textB);
    });
  });

  // Sort categories by their sortOrder, then name
  const sortedCategories = Object.keys(pickemsByCategory).sort((a: string, b: string) => {
    const categoryA = filteredPickems?.find((p: Pickem) => p.category?.name === a)?.category;
    const categoryB = filteredPickems?.find((p: Pickem) => p.category?.name === b)?.category;
    
    // Compare sortOrder first (if available)
    if (categoryA?.sortOrder !== undefined && categoryB?.sortOrder !== undefined) {
      return categoryA.sortOrder - categoryB.sortOrder;
    }
    
    // If no sortOrder, items with sortOrder come first
    if (categoryA?.sortOrder !== undefined) return -1;
    if (categoryB?.sortOrder !== undefined) return 1;
    
    // Finally, sort by name
    return a.localeCompare(b);
  });

  // Create a new sorted object
  const sortedPickemsByCategory: Record<string, Pickem[]> = {};
  sortedCategories.forEach(category => {
    sortedPickemsByCategory[category] = pickemsByCategory[category];
  });

  return (
    <div className="bg-black text-green-500 min-h-screen p-6">
      <h1 className="text-2xl font-mono mb-4 glitch-text">[ADMIN_CONSOLE]</h1>

      {showCreateContest && (
        <ContestCreationForm onClose={() => setShowCreateContest(false)} />
      )}

      {confirmClose && (
        <PickemCloseDialog
          pickemId={confirmClose.pickemId}
          onClose={() => setConfirmClose(null)}
        />
      )}

      {showBulkUpload && selectedContest && (
        <BulkUploadForm
          contestId={selectedContest.id}
          onClose={() => setShowBulkUpload(false)}
        />
      )}

      <div className="grid grid-cols-4 gap-6">
        <ContestList
          contests={contests}
          selectedContest={selectedContest}
          onContestSelect={setSelectedContest}
          onCreateClick={() => setShowCreateContest(true)}
        />

        {selectedContest && (
          <PickemList
            pickemsByCategory={sortedPickemsByCategory}
            collapsedCategories={collapsedCategories}
            onToggleCategory={toggleCategory}
            onClosePickem={(pickemId) => setConfirmClose({ pickemId })}
            onEditChoice={setEditingChoice}
            onCreatePickem={() => setShowCreateForm(true)}
            onBulkUploadClick={() => setShowBulkUpload(true)}
            isLoading={pickemsLoading}
            error={pickemsError}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 