import React from 'react';

const LoadingState = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-ntc-gray text-ntc-muted font-semibold tracking-wide">
      Querying vehicle registry data stream...
    </div>
  );
};

export default LoadingState;
