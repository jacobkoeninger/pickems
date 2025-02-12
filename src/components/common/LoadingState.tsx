import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = '[LOADING...]', 
  className = '' 
}) => {
  return (
    <div className={`text-green-500 font-mono ${className}`}>
      {message}
    </div>
  );
};

export default LoadingState; 