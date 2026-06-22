import React from 'react';
import { ShieldCheck } from 'lucide-react';
import ntcLogo from '../assets/ntc-logo.png';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8f9fa] font-sans text-[#212529]">
      
      {/* Left Panel - Branding */}
      {/* 🟢 EXACT MATCH: Restored deep branding identity through direct dark background configurations */}
      <div 
        className="hidden lg:flex flex-1 flex-col justify-center items-center p-10 relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, #003893 0%, #002663 100%)' }}
      >
        
        {/* Radial Background Accent layers */}
        <div 
          className="absolute inset-0 z-10 opacity-10 pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)' 
          }} 
        />
        
        {/* Content Panel Box */}
        <div className="relative z-20 max-w-125 text-center">
          <div className="mb-4 flex justify-center">
            <a 
              href="https://ntc.net.np" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="cursor-pointer"
            >
              <div className="bg-white p-3 rounded-full inline-flex items-center justify-center shadow-md w-20 h-20 overflow-hidden">
                {/* 🟢 EXACT MATCH: Fixed relative sizing multipliers to retain exact logo bounds */}
                <img 
                  src={ntcLogo}
                  alt="Nepal Telecom Logo"
                  className="w-[160%] h-[160%] max-w-none object-cover block rounded-full"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.45))' }}
                />
              </div>
            </a>
          </div>

          <a 
            href="https://ntc.net.np" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="no-underline text-inherit cursor-pointer"
          >
            <h1 className="font-bold mb-5 text-[2.5rem] leading-tight text-white">Nepal Telecom</h1>
          </a>
          
          <h2 className="text-xl mb-4 font-normal opacity-75">Vehicle Management System</h2>
          
          <p className="text-[1.1rem] opacity-90 leading-relaxed">
            Secure, reliable, and efficient fleet management platform for Nepal Telecom's enterprise operations. 
            Access your dashboard to manage drivers, vehicles, and schedules.
          </p>
          
          <div className="mt-12 flex justify-center items-center gap-2 opacity-75">
            <ShieldCheck size={20} />
            <span className="font-medium">Government-grade Secure Portal</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Content */}
      <div className="flex-1 flex justify-center items-center p-10 bg-[#f8f9fa] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
