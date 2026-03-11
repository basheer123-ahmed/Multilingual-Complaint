import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  List, 
  Map as MapIcon, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Edit3,
  BarChart3,
  FileText,
  Building,
  Users,
  ShieldAlert,
  Flag,
  Menu,
  Zap,
  Activity,
  ShieldCheck,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isCollapsed, setIsCollapsed, user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login');
  };

  const menuItems = (() => {
    const role = user?.role;
    if (role === 'CITIZEN') {
      return [
        { label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/citizen/dashboard', tagline: 'Vitals & Stats' },
        { label: 'Grievance Initialization', icon: <PlusCircle size={20} />, path: '/citizen/submit-complaint', tagline: 'New Report' },
        { label: 'Intelligence Archive', icon: <List size={20} />, path: '/citizen/my-complaints', tagline: 'Your History' },
        { label: 'Sector Intelligence', icon: <MapIcon size={20} />, path: '/citizen/complaint-map', tagline: 'Geospatial Node' },
        { label: 'Echo Assessment', icon: <MessageSquare size={20} />, path: '/citizen/feedback', tagline: 'Operational Echo' },
        { label: 'Identity Protocol', icon: <User size={20} />, path: '/citizen/profile', tagline: 'Security Credentials' },
      ];
    }
    if (role === 'OFFICER') {
      return [
        { label: 'Field Dashboard', icon: <LayoutDashboard size={20} />, path: '/officer', tagline: 'Command Center' },
        { label: 'Task Deployment', icon: <ClipboardList size={20} />, path: '/officer/assigned', tagline: 'Active Missions' },
        { label: 'Efficiency Matrix', icon: <BarChart3 size={20} />, path: '/officer/workload', tagline: 'KPI Oversight' },
        { label: 'Identity Protocol', icon: <User size={20} />, path: '/officer/profile', tagline: 'Credentials' },
      ];
    }
    if (role === 'ADMIN') {
      return [
        { label: 'Intelligence Matrix', icon: <LayoutDashboard size={20} />, path: '/admin', tagline: 'Executive Oversight' },
        { label: 'Surveillance Ledger', icon: <ShieldAlert size={20} />, path: '/admin/complaints', tagline: 'Full Registry' },
        { label: 'Sector Intelligence', icon: <MapIcon size={20} />, path: '/admin/map', tagline: 'Regional Map' },
        { label: 'Infrastructure Hub', icon: <Building size={20} />, path: '/admin/departments', tagline: 'Branch Mgmt' },
        { label: 'Personnel Hub', icon: <Users size={20} />, path: '/admin/officers', tagline: 'Duty Roster' },
        { label: 'Identity Protocol', icon: <User size={20} />, path: '/admin/profile', tagline: 'Security Authority' },
      ];
    }
    return [];
  })();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 88 : 280 }}
      className="fixed inset-y-0 left-0 bg-[#020617] text-[#94A3B8] flex flex-col z-50 border-r border-white/5 shadow-4xl transition-all duration-500 overflow-hidden"
    >
      {/* Brand Header */}
      <div className={`h-24 flex items-center px-8 transition-all duration-500 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}>
        <div className="flex items-center gap-4 group">
          <div className="bg-primary-600 p-2.5 rounded-2xl text-white shadow-2xl shadow-primary-500/40 shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Zap size={22} className="fill-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white whitespace-nowrap uppercase leading-none">CitizenCare</span>
              <span className="text-[9px] font-black text-primary-500 uppercase tracking-[0.4em] mt-1 opacity-70">Intelligence</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                ${isActive 
                  ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                  : 'hover:bg-white/5 hover:text-white'
                }`}
            >
              {isActive && (
                 <motion.div 
                   layoutId="sidebar-active"
                   className="absolute left-0 w-1.5 h-6 bg-primary-500 rounded-r-full shadow-[0_0_12px_rgba(37,99,235,0.8)]"
                 />
              )}
              <div className={`shrink-0 transition-all duration-300 ${isActive ? 'text-primary-400 scale-110' : 'group-hover:scale-110 group-hover:text-primary-300'}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-xs font-black tracking-widest uppercase transition-colors">{item.label}</span>
                  <span className={`text-[8px] font-bold uppercase tracking-widest opacity-40 transition-opacity ${isActive ? 'opacity-80' : 'group-hover:opacity-60'}`}>{item.tagline}</span>
                </div>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-10 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap border border-white/10 z-[60] shadow-4xl pointer-events-none translate-x-4 group-hover:translate-x-0">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status Matrix */}
      {!isCollapsed && (
        <div className="px-6 py-4 flex flex-col gap-4">
           <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Activity size={12} className="text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">System Link</span>
                 </div>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </div>
              <div className="flex flex-col gap-1">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Status</span>
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Optimal</span>
                 </div>
                 <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-emerald-500"></motion.div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-6 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl">
        {!isCollapsed && (
          <div className="mb-6 px-4 py-4 bg-white/5 rounded-2xl flex items-center gap-4 border border-white/5 shadow-inner group hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center text-sm font-black shrink-0 border border-primary-500/20 group-hover:scale-105 transition-transform">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <div className="status-pulse bg-primary-500" style={{ '--pulse-color': 'rgba(59, 130, 246, 0.5)' }}></div>
                <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate">{user?.name}</span>
              </div>
              <span className="text-[8px] font-black text-primary-500 uppercase tracking-widest">{user?.role} NODE</span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-rose-500 hover:text-white hover:shadow-2xl hover:shadow-rose-500/20 transition-all group duration-300 ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} className="shrink-0 transition-transform group-hover:-translate-x-1" />
          {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Terminate Session</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
