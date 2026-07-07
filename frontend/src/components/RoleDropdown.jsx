import React from 'react';

const RoleDropdown = ({ value, onChange, error, excludeRoles = [] }) => {
  const roles = [
    {
      id: 'Employee',
      name: 'Employee',
      description: 'Standard staff access',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'Driver',
      name: 'Driver',
      description: 'Vehicle operation access',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      )
    },
    {
      id: 'Admin',
      name: 'Branch Admin',
      description: 'Regional station manager',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    }
  ];

  const handleCardClick = (roleId) => {
    onChange({
      target: {
        name: 'requested_role',
        value: roleId
      }
    });
  };

  const visibleRoles = roles.filter(r => !excludeRoles.includes(r.id));

  return (
    <div className="mb-4">
      {/* 🟢 FIXED: Adjusted text sizing and weights to match original design framework */}
      <label className="block text-sm font-semibold text-ntc-dark-text mb-2">
        Requested Role *
      </label>
      
      {/* 🟢 FIXED: Converted Bootstrap grid systems to highly robust 3-column Tailwind CSS grids */}
      <div className="grid grid-cols-3 gap-4">
        {visibleRoles.map((role) => {
          const isSelected = value === role.id;
          return (
            <div 
              key={role.id}
              onClick={() => handleCardClick(role.id)}
              // 🟢 FIXED: Restored original selection active frames using inline border rings and shadow offsets
              className={`flex flex-wrap gap-2 items-center justify-center p-3 text-center h-full rounded-lg border-2 shadow-sm cursor-pointer select-none transition-all duration-200 ease-in-out
                ${isSelected 
                  ? 'border-ntc-blue bg-ntc-light-blue/40 text-ntc-blue' 
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-500'
                }`}
            >
              <div className={`mb-2 transition-colors duration-200 ${isSelected ? 'text-[#003893]' : 'text-gray-400'}`}>
                {role.icon}
              </div>
              
              <h6 className="font-bold mb-1 text-[#212529] text-sm whitespace-nowrap tracking-tight">
                {role.name}
              </h6>
              
              <p className="text-gray-500 text-[0.72rem] leading-[1.2] mb-0 max-w-full">
                {role.description}
              </p>
            </div>
          );
        })}
      </div>
      
      {/* 🟢 FIXED: Converted error message string layout to use the custom danger color parameter */}
      {error && (
        <div className="text-[#dc3545] text-xs mt-1.5 font-medium">
          {error}
        </div>
      )}
    </div>
  );
};

export default RoleDropdown;
