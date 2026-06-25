import React from 'react';
import { ClipboardList } from 'lucide-react';
import PendingBookingCard from './PendingBookingCard';

const PendingBookingsSection = ({ bookings, onRefresh }) => {
  // Explicit filter to only handle matching pending records
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  if (pendingBookings.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-400 font-medium text-sm">
         No pending booking requests require immediate manager action.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black tracking-tight text-ntc-dark flex items-center gap-2">
          <ClipboardList className="text-amber-500" size={22} />
          Pending Actions ({pendingBookings.length})
        </h2>
      </div>
      
      {/* Responsive layout distribution grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingBookings.map((booking) => (
          <PendingBookingCard 
            key={booking.id} 
            booking={booking} 
            onUpdateSuccess={onRefresh} 
          />
        ))}
      </div>
    </div>
  );
};

export default PendingBookingsSection;
