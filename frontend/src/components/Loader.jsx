import React from 'react';

const Loader = ({ text = "Loading..." }) => {
  return (
    // 🟢 FIXED: Replaced Bootstrap d-flex and my-3 with Tailwind flex layouts
    <div className="flex justify-center items-center my-3">
      {/* 🟢 FIXED: Substituted .spinner-border with animate-spin utility ring */}
      <div 
        className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-ntc-blue rounded-full" 
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
      
      {/* 🟢 FIXED: Wrapped loading text labels in standard margin-start styles */}
      {text && (
        <span className="ms-3 text-ntc-blue font-medium text-sm">
          {text}
        </span>
      )}
    </div>
  );
};

export default Loader;
