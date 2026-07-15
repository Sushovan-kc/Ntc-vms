import React from 'react';
import { Hash, Calendar, ShieldCheck } from 'lucide-react';

const VehicleDetailsCard = ({ vehicle }) => {
    const status = vehicle.status || 'AVAILABLE';
    const statusStyles = {
        AVAILABLE: 'bg-emerald-800/20 text-emerald-200 border-emerald-500/30',
        IN_USE: 'bg-red-700/20 text-red-200 border-red-500/30',
        MAINTENANCE: 'bg-amber-700/20 text-amber-200 border-amber-500/30',
        DECOMMISSIONED: 'bg-rose-900/20 text-rose-200 border-rose-500/30',
    };
    const statusLabels = {
        AVAILABLE: 'Available',
        IN_USE: 'In Use',
        MAINTENANCE: 'Under Maintenance',
        DECOMMISSIONED: 'Decommissioned',
    };

  return (
    <div>
      {/* Accent Banner Row */}
      <div className="bg-linear-to-r from-ntc-blue to-blue-600 p-6 text-white flex justify-between items-center">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-ntc-light-blue opacity-80">
            Active Unit
          </span>
          <h2 className="text-2xl font-black mt-1">
            {vehicle.manufacturer} {vehicle.model}
          </h2>
        </div>
        <span
            className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase ${
                statusStyles[status] || statusStyles.AVAILABLE
            }`}
            >
            {statusLabels[status] || 'Available'}
            </span>
      </div>

      {/* Technical Specifications Matrix */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* License Plate Specification Item */}
        <div className="flex items-center gap-4 p-4 bg-ntc-gray rounded-xl border border-gray-100">
          <div className="p-3 rounded-lg bg-white text-ntc-blue shadow-sm">
            <Hash size={20} />
          </div>
          <div>
            <span className="text-xs text-ntc-muted font-bold block">License Identifier Plate</span>
            <span className="font-mono text-base font-black text-ntc-dark bg-white border px-2.5 py-0.5 rounded shadow-sm tracking-wider">
              {vehicle.license_plate}
            </span>
          </div>
        </div>

        {/* Model Production Year Specification Item */}
        <div className="flex items-center gap-4 p-4 bg-ntc-gray rounded-xl border border-gray-100">
          <div className="p-3 rounded-lg bg-white text-ntc-blue shadow-sm">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-xs text-ntc-muted font-bold block">Production Model Year</span>
            <span className="text-base font-bold text-ntc-dark">{vehicle.year || 'N/A'}</span>
          </div>
        </div>

        {/* Active Profile Custodian Specification Item */}
        <div className="flex items-center gap-4 p-4 bg-ntc-gray rounded-xl border border-gray-100 md:col-span-2">
          <div className="p-3 rounded-lg bg-white text-ntc-blue shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-xs text-ntc-muted font-bold block">Current Authenticated Custodian</span>
            <span className="text-sm font-bold text-ntc-dark">
              {vehicle.current_driver ? `@${vehicle.current_driver}` : 'Unverified Session User'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsCard;
