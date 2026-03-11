import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck, Github, MessageSquare, Menu } from 'lucide-react';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-200/50 h-20 flex items-center">
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="bg-primary-600 p-1.5 rounded-lg shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight uppercase">CitizenCare</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
           <Link to="/" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-600 transition-colors">Infrastructure</Link>
           <Link to="/" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-600 transition-colors">Community</Link>
           <Link to="/" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-600 transition-colors">Analytics</Link>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : user.role === 'OFFICER' ? '/officer' : '/citizen')}
                 className="text-xs font-black uppercase tracking-widest text-primary-600 hover:underline px-2"
               >
                 Command Terminal
               </button>
               <div className="h-4 w-[1px] bg-slate-200"></div>
               <button
                 onClick={handleLogout}
                 className="flex items-center gap-2 text-slate-400 hover:text-rose-600 transition-all font-bold text-xs uppercase tracking-widest group"
               >
                 <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                 Exit
               </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors px-4 py-2">Account Login</Link>
              <Link to="/register" className="btn-primary text-[11px] font-black uppercase tracking-widest px-6 py-2.5 shadow-xl shadow-primary-500/10">Establish ID</Link>
            </div>
          )}
          
          <button className="md:hidden text-slate-600">
             <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
