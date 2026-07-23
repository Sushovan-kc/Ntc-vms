import React from 'react';
import { useBranches } from '../../context/BranchContext';
import { Building2, Layers } from 'lucide-react';

const BranchTable = () => {
  // Consume branches collection state arrays from global state
  const { branches, isLoading } = useBranches();

  // 1. Loading Skeleton Layout State Handler Canvas
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-[0_10px_30px_rgba(0,56,147,0.04)] border border-slate-100 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-slate-100 rounded"></div>
          <div className="h-10 bg-slate-100 rounded"></div>
          <div className="h-10 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-[0_10px_30px_rgba(0,56,147,0.04)] border border-slate-100 overflow-hidden font-sans">
      {/* Table Module Header View Wrapper Panel */}
      <div className="px-6 py-4 bg-ntc-gray border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-ntc-light-blue text-ntc-blue rounded-lg">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-ntc-dark-text leading-tight">Branches Table</h3>
            <p className="text-xs text-ntc-muted font-medium mt-0.5">Active relational database tracking indices</p>
          </div>
        </div>
        {/* Dynamic Branch Count Badge Indicator */}
        <span className="bg-ntc-light-blue text-ntc-blue text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <Layers size={12} /> {branches?.length || 0} Total
        </span>
      </div>

      {/* Primary Table Output Canvas Markup Frame Context */}
      {/* 
        👉 CRUCIAL CHANGE: 
        Added max-h-[400px] (adjust height as needed), overflow-y-auto, and relative.
      */}
      <div className="overflow-x-auto overflow-y-auto max-h-[400px] w-full relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {/* 
                👉 CRUCIAL CHANGE: 
                Added "sticky top-0 z-10 bg-slate-50" to lock headers in place during scrolling.
              */}
              <th className="sticky top-0 z-10 bg-slate-50 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-ntc-muted w-1/3">
                Branch ID
              </th>
              <th className="sticky top-0 z-10 bg-slate-50 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-ntc-muted">
                Branch Location Name
              </th>
              <th className="sticky top-0 z-10 bg-slate-50 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-ntc-muted w-1/4">
                Location
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium">
            {branches && branches.length > 0 ? (
              branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-slate-50/80 transition-colors group" >
                  {/* Branch Numeric Tracking ID Field Indicator Column */}
                  <td className="px-6 py-4 text-ntc-blue font-mono font-bold tracking-tight">
                    #{branch.id}
                  </td>
                  {/* Branch Readable Dynamic Label Description Column */}
                  <td className="px-6 py-4 text-ntc-dark-text group-hover:text-ntc-blue transition-colors">
                    {branch.name}
                  </td>
                  <td className="px-6 py-4 text-ntc-dark-text group-hover:text-ntc-blue transition-colors">
                    {branch.location}
                  </td>
                </tr>
              ))
            ) : (
              /* Empty Array Structural State Display View Box Markup Fallback */
              /* 👉 FIXED: Updated colSpan to 3 to match the 3-column table structure */
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-ntc-muted text-sm font-medium">
                  <div className="max-w-xs mx-auto flex flex-col items-center gap-1">
                    <p className="font-bold text-ntc-dark-text">No Branches Available</p>
                    <p className="text-xs">The database context yielded an empty response collection array layer.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BranchTable;
