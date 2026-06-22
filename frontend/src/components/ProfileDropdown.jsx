import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfileDropdown({ user }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // 1. Added loading animation state
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. Created a clean handler to handle the animated exit delay
  const handleLogout = () => {
    setIsLoggingOut(true);
    
    setTimeout(() => {
      logout();
      setIsOpen(false);
      navigate('/');
    }, 800); // 800ms lets the user feel the "Signing out..." visual feedback
  };

  return (
    <div className="relative inline-block z-50 h-12 w-12 md:h-14 md:w-14" ref={dropdownRef}>
      
      {/* Trigger Button */}
      <button 
        type="button"
        disabled={isLoggingOut} // Disable avatar clicks while logging out
        onClick={() => {
          console.log("Avatar clicked! Current state:", !isOpen);
          setIsOpen(!isOpen);
        }}
        className={`bg-ntc-dark-text rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-white font-black text-lg md:text-xl shadow-md select-none shrink-0 border border-white/20 transition-opacity focus:outline-none 
          ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
      >
        {user?.first_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'E'}
      </button>

      {/* Dropdown Menu Layer */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-2 z-[9999] border border-gray-200 block text-left">
          <div className="px-4 py-2 border-b border-gray-100 mb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
            <p className="text-sm font-bold text-gray-800 truncate">{user?.first_name || user?.username || 'Employee'}</p>
          </div>
          
          <a
            href="#profile"
            className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors ${isLoggingOut ? 'pointer-events-none opacity-40' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            Your Profile
          </a>
          <a
            href="#settings"
            className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors ${isLoggingOut ? 'pointer-events-none opacity-40' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            Settings
          </a>
          
          <hr className="my-1 border-gray-100" />
          
          {/* 3. Modified Animated Sign Out Button */}
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-medium transition-all duration-200 
              ${isLoggingOut 
                ? 'bg-red-50 text-red-400 cursor-not-allowed' 
                : 'text-red-600 hover:bg-red-50 cursor-pointer'
              }`}
          >
            {isLoggingOut ? (
              <>
                {/* SVG Loading Spinner */}
                <svg className="animate-spin h-4 w-4 text-red-500" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing out...</span>
              </>
            ) : (
              <span>Sign out</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
