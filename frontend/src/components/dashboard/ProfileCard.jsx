import React from 'react';
import { User, Truck } from 'lucide-react';

const ProfileCard = ({ username, driverId, driverStatus, vehicle }) => {
  const isOnTrip = driverStatus === 'ON TRIP';

  return (
    <div className="bg-white p-6 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)]">
      {/* User Section */}
      <div className="text-center mb-6">
        <div className="bg-ntc-light-blue rounded-full inline-flex p-4 mb-3 relative shadow-sm text-ntc-blue">
          <User size={48} />
          <span className={`absolute top-0 right-0 -translate-y-0.5 translate-x-0.5 p-2 border-2 border-white rounded-full w-4 h-4 ${isOnTrip ? 'bg-ntc-warning' : 'bg-ntc-success'}`} />
        </div>
        <h4 className="text-xl font-black text-ntc-dark mb-1">{username}</h4>
        <span className="text-ntc-muted font-mono bg-ntc-gray px-3 py-0.5 rounded-full border text-xs font-semibold">
          ID: #{driverId || 'UNLINKED'}
        </span>
      </div>

      {/* Status Badge */}
      <div className="flex justify-between items-center p-3 bg-ntc-gray rounded-lg mb-6 border border-gray-100">
        <span className="text-ntc-muted text-sm font-bold">Current Profile Status</span>
        <span className={`inline-block px-3 py-1 rounded-[20px] text-xs font-black shadow-sm border uppercase ${isOnTrip ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-ntc-success border-emerald-200'}`}>
          {driverStatus || 'AVAILABLE'}
        </span>
      </div>

      {/* Vehicle Block */}
      <div className="border-t border-gray-100 pt-4">
        <h6 className="font-bold text-ntc-dark text-sm mb-3 flex items-center gap-2">
          <Truck size={18} className="text-ntc-blue"/> Assigned Vehicle
        </h6>
        
        {!vehicle ? (
          <div className="bg-gray-100/70 text-center py-6 rounded-lg border border-dashed border-gray-200">
            <Truck size={32} className="text-ntc-muted mx-auto mb-2 opacity-40" />
            <p className="text-ntc-muted text-xs font-medium">No active fleet vehicle linked to profile.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-ntc-light-blue w-[80px] h-[80px] rounded-bl-full opacity-60"></div>
            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex justify-between items-center">
                <div>
                  <span className="inline-block text-[10px] font-bold bg-ntc-success text-white rounded px-1.5 py-0.5 mb-1.5 uppercase tracking-wider">Active Fleet Asset</span>
                  <br />
                  <span className="inline-block bg-ntc-dark text-white px-2.5 py-1 text-xs font-mono shadow-inner rounded-md tracking-wider">{vehicle.license_plate}</span>
                </div>
                <span className="text-ntc-blue font-black text-base">{vehicle.manufacturer} {vehicle.model || 'Unknown Model'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
