import React, { useState } from 'react';
import { History, LayoutDashboard, CarFront,Car } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RequestForm from '../../components/employee/RequestForm';


const EmployeeNewBooking = () => {
  const { user } = useAuth();


  return (
    <>
      {/* Module Title Context Header Row */}
      <div className="flex flex-col pb-4 border-b border-gray-200">
        <h1 className="text-ntc-dark font-black text-2xl tracking-tight flex items-center gap-3">
          <CarFront className="text-ntc-blue" size={28} />
          Request a Vehicle
        </h1>
        <p className="text-ntc-muted text-xs font-medium mt-1">
          Provide travel itineraries, schedules, and allocation motives to submit a formal line-haul request.
        </p>
      </div>

      {/* Form Containment Node Wrapper */}
      <div className="bg-white p-6 md:p-8 rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gray-100 mt-6">
        <RequestForm />
      </div>
    </>
  );
};


export default  EmployeeNewBooking;
