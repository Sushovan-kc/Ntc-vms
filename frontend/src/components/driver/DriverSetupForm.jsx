import React from 'react';
import { User } from 'lucide-react';

const DriverSetupForm = ({ setupForm, onInputChange, onFileChange, onSetupSubmit, submittingSetup }) => {
  return (
    <main className="flex-1 p-6 bg-ntc-gray flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-ntc-dark flex items-center gap-2 mb-2">
          <User className="text-ntc-blue" />
          Complete Profile Setup
        </h2>
        <p className="text-xs text-amber-600 font-semibold mb-6 bg-amber-50 p-2.5 rounded border border-amber-200">
          ⚠️ Attention: These records can only be updated once. Double check values before locking.
        </p>

        <form onSubmit={onSetupSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver License Number</label>
            <input
              type="text"
              name="license_number"
              value={setupForm.license_number}
              onChange={onInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ntc-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
            <input
              type="text"
              name="address"
              value={setupForm.address}
              onChange={onInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ntc-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload License Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-ntc-blue hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={submittingSetup}
            className="w-full bg-ntc-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
          >
            {submittingSetup ? "Verifying and Locking..." : "Submit Profile Settings"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default DriverSetupForm;
