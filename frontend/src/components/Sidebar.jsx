import React from 'react';
import { LayoutDashboard, LogOut,Car,MapPin} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom'; // 🟢 Added useLocation hook for active route checking

const Sidebar = ({ isSidebarOpen, isMobileOpen, setIsMobileOpen, sidebarcomp }) => {
  const { logout } = useAuth(); 
  const location = useLocation(); // 🟢 Read current active browser route location path

  const handleLogoutAction = () => {
    try {
      logout(); 
      setIsMobileOpen(false); 
      window.location.href = '/'; 
    } catch (err) {
      console.error("Session termination interception error:", err);
    }
  };

  return (
    <>
      {/* Mobile Dynamic Sidebar Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Navigation Control Column */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col bg-ntc-blue text-white transition-all duration-300 overflow-y-auto
        md:relative
        ${isSidebarOpen ? 'w-[250px]' : 'md:w-0 md:overflow-hidden'}
        ${isMobileOpen ? 'translate-x-0 w-[250px]' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Corporate Identity Header */}
        <div className="h-[60px] flex items-center justify-between px-5 border-b border-white/10 font-bold text-lg tracking-wide whitespace-nowrap">
          <span>NTC ENTERPRISE</span>
        </div>

        {/* 🟢 FIXED MINIMAL CHANGE: Moved navigation block container OUTSIDE of the map loop structure */}
        <nav className="py-5 flex-1 space-y-1">
          {sidebarcomp && sidebarcomp.map((item, index) => {
            // Check if link matches route
            const isActive = location.pathname === item.path;

            return (
              <Link 
                key={index} 
                to={item.path} 
                className={`flex items-center px-5 py-3 whitespace-nowrap transition-all duration-200 border-l-4 ${
                  isActive 
                    ? 'bg-white/10 text-white border-white' 
                    : 'text-white/80 border-transparent hover:bg-white/5 hover:text-white hover:border-white/50'
                }`}
              >
                {item.icon && <item.icon className="mr-[15px] w-5 h-5 shrink-0" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Control Trigger Anchor */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogoutAction} 
            className="w-full flex items-center px-4 py-2.5 text-sm font-semibold rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 cursor-pointer text-left"
          >
            <LogOut className="mr-3 w-4 h-4" /> 
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
