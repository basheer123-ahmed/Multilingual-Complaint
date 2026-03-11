import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, Phone, CheckCircle2, ChevronDown, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CITIZEN'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('The secondary security credential doesn\'t match the first.');
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/api/auth/register', formData);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      
      if (data.role === 'CITIZEN') navigate('/citizen');
      else if (data.role === 'OFFICER') navigate('/officer');
      else if (data.role === 'ADMIN') navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'We encountered a problem during your registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 transition-all animate-in fade-in duration-700">
      <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[2.5rem] overflow-hidden shadow-3xl shadow-slate-200 border border-slate-100">
        
        {/* Left Side: Branding (Smaller proportion for register to avoid overcrowding) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col justify-between bg-slate-900 p-12 text-white relative overflow-hidden">
           <div className="absolute top-0 left-0 w-64 h-64 bg-primary-600/20 blur-[100px] -translate-y-1/2 -translate-x-1/2 rounded-full"></div>
           
           <div className="relative z-10 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-primary-600 p-1.5 rounded-lg shadow-lg">
                 <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">CitizenCare</span>
           </div>

           <div className="relative z-10 flex flex-col gap-8">
              <h2 className="text-3xl font-semibold leading-tight tracking-tight">
                Secure your <br />
                <span className="text-primary-400">Citizen Identity.</span>
              </h2>
              <div className="flex flex-col gap-4">
                 {[
                   'Automated tracking',
                   'Data protection',
                   'Community impact'
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3 text-slate-400 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-sm">{item}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="relative z-10 text-[10px] font-bold text-slate-600 tracking-widest uppercase">
              Identity Services &bull; v2.0
           </div>
        </div>

        {/* Right Side: Form (Larger proportion) */}
        <div className="lg:col-span-8 p-8 md:p-16 flex flex-col justify-center gap-12">
           <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                 <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">New Registration</h1>
                 <p className="text-slate-500 font-medium">Initialize your profile and select your primary role.</p>
              </div>
              <div className="hidden md:flex flex-col items-end">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 01 of 01</span>
                 <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="w-full h-full bg-primary-600"></div>
                 </div>
              </div>
           </div>

           {error && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }}
               className="status-badge status-error py-3 justify-start px-6 font-bold normal-case"
             >
                {error}
             </motion.div>
           )}

           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Legal Name</label>
                 <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <input
                      name="name"
                      type="text"
                      placeholder="Jane Smith"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-800"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                 </div>
              </div>

              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Contact Reference</label>
                 <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="+91 000 000 0000"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-800"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                    />
                 </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Authority</label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <input
                      name="email"
                      type="email"
                      placeholder="citizen@domain.org"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-800"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                 </div>
              </div>

              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Primary Password</label>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <input
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-800"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                 </div>
              </div>

              <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Verification</label>
                 <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium text-slate-800"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                 </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Personnel Authorization</label>
                 <div className="relative group">
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-primary-500 transition-colors" size={18} />
                    <select
                      name="role"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-700 appearance-none bg-white"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="CITIZEN">Standard Citizen Account</option>
                      <option value="OFFICER">Municipal Officer Terminal</option>
                      <option value="ADMIN">System Administrator Hub</option>
                    </select>
                 </div>
              </div>

              <div className="md:col-span-2 mt-4">
                 <button
                   type="submit"
                   disabled={loading}
                   className="w-full btn-primary py-4 font-bold text-base shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2 group"
                 >
                   {loading ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   ) : (
                     <>
                       <span>Generate Citizen ID</span>
                       <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </>
                   )}
                 </button>
              </div>
           </form>

           <div className="text-center text-sm font-medium text-slate-500 border-t border-slate-100 pt-8">
              Already a registered citizen? <Link to="/login" className="text-primary-600 font-bold hover:underline underline-offset-4">Identity Login</Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
