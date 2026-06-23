import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ userRole, isSidebarOpen, setIsSidebarOpen, setIsMobileOpen, branchName }) => {
  return (
    <header className="h-[60px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] flex items-center justify-between px-5 z-30 flex-shrink-0">
      <div className="flex items-center">
        {/* Desktop Switcher */}
        <button 
          className="hidden md:block text-ntc-dark p-1 mr-4 cursor-pointer hover:opacity-70" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu size={24} /> 
        </button>
        
        {/* Mobile Intercept */}
        <button 
          className="block md:hidden text-ntc-dark p-1 mr-4 cursor-pointer hover:opacity-70" 
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu size={24} /> 
        </button>
      </div>

      <div className="flex items-center gap-3.75">
        <span className="bg-ntc-light-blue text-ntc-blue px-3 py-1 rounded-[20px] text-[0.85rem] font-bold tracking-wide uppercase">
          {userRole || 'Fleet Operator'}
        </span>
        <span className="bg-ntc-light-green text-ntc-green px-3 py-1 rounded-[20px] text-[0.85rem] font-bold tracking-wide uppercase">
          {branchName}
        </span>
      </div>
    </header>
  );
};

export default Header;
