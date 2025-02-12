import React from 'react';

interface EmptyStateProps {
  message?: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = '[NO_DATA]', 
  className = '' 
}) => {
  return (
    <div className={`text-green-500 font-mono ${className}`}>
      {message}
    </div>
  );
};

export default EmptyState; 