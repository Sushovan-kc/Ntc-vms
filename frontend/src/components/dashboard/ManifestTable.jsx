import React from 'react';
import { ClipboardList } from 'lucide-react';

const ManifestTable = ({ dispatches }) => {
  return (
    <div className="bg-white p-5 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col mt-6">
      <div className="mb-4 pb-2 border-b border-gray-100">
        <h3 className="text-lg font-black text-ntc-dark flex items-center gap-2">
          <ClipboardList className="text-ntc-blue" size={22} />
          Assigned Logistics Manifest Logs
        </h3>
        <p className="text-ntc-muted text-xs font-medium mt-0.5">Real-time status tracking grid updates matching active line-haul dispatch operations pipelines.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-ntc-gray border-b-2 border-gray-200">
              <th className="text-ntc-muted font-bold text-xs uppercase tracking-wider px-4 py-3">Dispatch Node Identifier</th>
              <th className="text-ntc-muted font-bold text-xs uppercase tracking-wider px-4 py-3">Bound Destination Target</th>
              <th className="text-ntc-muted font-bold text-xs uppercase tracking-wider px-4 py-3">Assigned Route Fleet Unit</th>
              <th className="text-ntc-muted font-bold text-xs uppercase tracking-wider px-4 py-3">Operational Status Check</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dispatches.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-ntc-muted text-sm font-medium">
                  No historical logistics dispatches logged for this driver account context node.
                </td>
              </tr>
            ) : (
              dispatches.map((dispatch) => (
                <tr key={dispatch.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3.5 align-middle text-sm font-bold text-ntc-dark">
                    DISPATCH-#{dispatch.id}
                  </td>
                  <td className="px-4 py-3.5 align-middle text-sm text-ntc-dark font-medium">
                    {dispatch.booking_purpose || 'N/A'}
                  </td>
                  <td className="px-4 py-3.5 align-middle text-sm text-ntc-blue font-mono font-bold">
                    {dispatch.vehicle_license_plate || 'Unassigned Line Unit'}
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <span className={`inline-block px-3 py-1 rounded-[20px] text-xs font-bold border ${
                      dispatch.driver_status === 'COMPLETED' 
                        ? 'bg-emerald-50 text-ntc-success border-emerald-200' 
                        : dispatch.driver_status === 'ON TRIP'
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-ntc-light-blue text-ntc-blue border-blue-200'
                    }`}>
                      {dispatch.driver_status || 'PENDING DISPATCH'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManifestTable;
