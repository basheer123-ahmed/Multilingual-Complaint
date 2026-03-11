import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';

const DashboardLayout = ({ user, setUser }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        user={user} 
        setUser={setUser} 
      />

      <motion.main
        initial={false}
        animate={{ marginLeft: isCollapsed ? 88 : 280 }}
        className="flex-1 relative min-h-screen transition-all duration-500"
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-3 bg-white fixed top-6 z-[60] rounded-2xl shadow-xl border border-slate-100 hover:bg-slate-50 transition-all active:scale-95 text-slate-500"
          style={{ 
            left: isCollapsed ? '108px' : '300px',
            transition: 'left 0.5s ease-in-out'
          }}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>

        <div className="max-w-[1500px] mx-auto p-10 pt-24 h-full">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
