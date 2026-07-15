import React from 'react';
import { Car } from 'lucide-react';

const EmptyVehicleState = () => {
  return (
    <div className="text-center p-12 space-y-3">
      <Car size={64} className="text-ntc-muted mx-auto opacity-30" />
      <h3 className="text-lg font-bold text-ntc-dark">No Vehicle Assigned</h3>
      <p className="text-ntc-muted text-sm max-w-sm mx-auto">
        Your driver profile does not currently have an active line-haul vehicle assigned by operations control.
      </p>
    </div>
  );
};

export default EmptyVehicleState;
