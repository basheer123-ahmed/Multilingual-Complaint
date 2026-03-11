import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      
      if (data.role === 'CITIZEN') navigate('/citizen');
      else if (data.role === 'OFFICER') navigate('/officer');
      else if (data.role === 'ADMIN') navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'The credentials provided do not match our records.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 transition-all animate-in fade-in duration-700">
      <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100">
        
        {/* Left Side: Illustration / Branding */}
        <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-12 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 blur-[80px] translate-y-1/3 -translate-x-1/4 rounded-full"></div>
           
           <div className="relative z-10 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-primary-600 p-1.5 rounded-lg shadow-lg">
                 <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">CitizenCare</span>
           </div>

           <div className="relative z-10 flex flex-col gap-6">
              <h2 className="text-4xl font-semibold leading-tight tracking-tight">
                Empowering communities,<br /> 
                <span className="text-primary-400">one report at a time.</span>
              </h2>
              <div className="flex flex-col gap-4">
                 {[
                   'Real-time resolution tracking',
                   'Direct officer engagement',
                   'Smart city analytics'
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3 text-slate-400 font-medium">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span>{item}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="relative z-10 text-xs font-medium text-slate-500 tracking-wider uppercase">
              Official Municipal Platform &copy; 2026
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center gap-10">
           <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Account Login</h1>
              <p className="text-slate-500 font-medium">Access your personalized command dashboard.</p>
           </div>

           {error && (
             <motion.div 
               initial={{ opacity: 0, x: -10 }} 
               animate={{ opacity: 1, x: 0 }}
               className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-600 text-sm font-semibold flex items-center gap-3"
             >
                <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                {error}
             </motion.div>
           )}

           <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Institutional Email</label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <input
                      type="email"
                      placeholder="name@domain.gov"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-800"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                 </div>
              </div>

              <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Credentials</label>
                    <Link to="#" className="text-[10px] font-bold text-primary-600 hover:underline tracking-widest uppercase">Recovery</Link>
                 </div>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-800"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                 </div>
              </div>

              <div className="flex items-center gap-2 px-1 mt-1">
                 <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                 <label htmlFor="remember" className="text-xs font-medium text-slate-500 cursor-pointer">Stay authenticated for 30 days</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 btn-primary py-4 font-bold text-base shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Proceed to Dashboard</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
           </form>

           <div className="text-center text-sm font-medium text-slate-500 border-t border-slate-100 pt-8">
              Don't have an account? <Link to="/register" className="text-primary-600 font-bold hover:underline underline-offset-4">Create Citizen ID</Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
