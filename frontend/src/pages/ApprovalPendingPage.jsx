import React, { useState } from 'react';
import { Clock, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ApprovalPending = ({ onCheckStatus }) => {
  const { user, logout } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = async () => {
    setChecking(true);
    if (onCheckStatus) {
      await onCheckStatus();
    }
    // Artificial delay to give the user immediate visual feedback
    setTimeout(() => setChecking(false), 800);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-ntc-blue-hover font-sans antialiased">
      
      {/* Central Glassmorphic Containment Card */}
      <div className="w-full max-w-md p-8 bg-ntc-blue/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center space-y-6">
        
        {/* Animated Clock Accent Sphere */}
        <div className="inline-flex p-4 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse">
          <Clock size={40} strokeWidth={2.5} />
        </div>

        {/* Messaging Box Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Approval Pending
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed px-2">
            Hello <span className="text-amber-400 font-bold">@{user?.username || 'user'}</span>. Your request to join as <span className="text-white font-bold">{user?.role || 'Staff'}</span> is currently awaiting branch administrator approval.
          </p>
        </div>

        {/* Action Controls Matrix Row */}
        <div className="space-y-3 pt-2">
          
          {/* Check Status Interactive CTA Button */}
          {/* <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-opacity-50 text-gray-900 font-bold text-sm py-3 px-4 rounded-xl transition-all duration-200 shadow-lg cursor-pointer transform active:scale-[0.99]"
          >
            <RefreshCw size={16} className={`shrink-0 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Validating Registry...' : 'Check Status'}</span>
          </button> */}

          {/* Secure Session Clear LogOut Action Button */}
          <button
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-sm py-3 px-4 rounded-xl transition-all duration-200 border border-white/5 cursor-pointer"
          >
            <LogOut size={16} className="shrink-0" />
            <span>Log Out</span>
          </button>

        </div>

      </div>
    </div>
  );
};

export default ApprovalPending;
