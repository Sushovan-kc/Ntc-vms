import React from 'react';

const UniversalTable = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  columns = [], // Array of objects defining header name, object key, and optional custom render
  data = [], 
  emptyMessage = "No records found in this context node." 
}) => {
  return (
    <div className="bg-white p-5 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col mt-6">
      {/* Header section */}
      {title && (
        <div className="mb-4 pb-2 border-b border-gray-100">
          <h3 className="text-lg font-black text-ntc-dark flex items-center gap-2">
            {Icon && <Icon className="text-ntc-blue" size={22} />}
            {title}
          </h3>
          {subtitle && <p className="text-ntc-muted text-xs font-medium mt-0.5">{subtitle}</p>}
        </div>
      )}

      {/* Dynamic Table Layout */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-ntc-gray border-b-2 border-gray-200">
              {columns.map((col, idx) => (
                <th key={idx} className="text-ntc-muted font-bold text-xs uppercase tracking-wider px-4 py-3">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 1} className="text-center py-8 text-ntc-muted text-sm font-medium">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="hover:bg-gray-50/50 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-4 py-3.5 align-middle text-sm text-ntc-dark font-medium">
                      {/* If a custom render function is provided, use it. Otherwise, output raw key data */}
                      {col.render ? col.render(row[col.key], row) : (row[col.key] || 'N/A')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UniversalTable;
