import React from 'react';

interface ErrorStateProps {
  error?: Error | string | unknown;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  className = '' 
}) => {
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'string' 
      ? error 
      : '[ERROR]';
  
  return (
    <div className={`text-red-500 font-mono ${className}`}>
      [ERROR]: {errorMessage}
    </div>
  );
};

export default ErrorState; 