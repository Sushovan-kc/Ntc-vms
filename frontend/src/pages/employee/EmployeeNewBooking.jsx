import React from 'react';
import RequestForm from '../../components/employee/RequestForm';


const VehicleRequest = () => {
  return (
    <div className="mx-auto w-full">
    <h1 className="flex justify-center items-center  bg-ntc-blue text-white p-4 shadow-md text-4xl font-bold font-sans">Request a Vehicle</h1>           
      
      <RequestForm />
    </div>
  );
};

export default VehicleRequest;
