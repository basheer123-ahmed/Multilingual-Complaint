import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Activity, MapPin, Users, ArrowRight, CheckCircle2, Star, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const features = [
    { icon: <Shield size={24} />, title: 'Transparent Governance', description: 'Real-time observability into the municipal resolution lifecycle with immutable audit logs.' },
    { icon: <Globe size={24} />, title: 'Geospatial Context', description: 'High-precision coordinate tagging integrated with city-wide GIS mapping systems.' },
    { icon: <Zap size={24} />, title: 'Urgency Thresholds', description: 'Automated triage and priority routing for time-critical infrastructure safety failures.' },
    { icon: <Users size={24} />, title: 'Field Collaboration', description: 'Direct secure channels between citizens and assigned district officers for clarity.' }
  ];

  return (
    <div className="flex flex-col gap-24 py-12 animate-in fade-in duration-1000">
      
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center max-w-5xl mx-auto gap-10 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-primary-50 px-4 py-1.5 rounded-full border border-primary-100 mb-2 flex items-center gap-2"
        >
          <Star size={14} className="text-primary-600 fill-primary-600" />
          <span className="text-primary-700 text-[10px] font-bold tracking-widest uppercase">Pioneer of Smart City Administration</span>
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] uppercase">
          Reimagining <br />
          <span className="text-primary-600 italic">Civil Response</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
          The unified command platform for modern communities. Report tracking, spatial intelligence, and administrative accountability in one high-performance interface.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <Link to="/register" className="btn-primary text-base px-10 py-4 shadow-2xl shadow-primary-500/20 flex items-center gap-2">
             Establish Identity <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="px-10 py-4 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">
             Officer Terminal
          </Link>
        </div>

        {/* Floating elements / Decor */}
        <div className="mt-16 w-full max-w-4xl relative">
           <div className="aspect-[16/9] bg-slate-900 rounded-[2rem] shadow-2xl border-8 border-slate-800 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white/10 rounded-full animate-ping"></div>
                    <span className="text-xs text-white font-bold tracking-widest uppercase">Encrypted Connection</span>
                 </div>
              </div>
           </div>
           
           <div className="absolute -top-10 -right-10 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl"></div>
           <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary-600/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="flex flex-col gap-16 px-4">
        <div className="flex flex-col items-center text-center gap-3">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform capabilities</span>
           <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Enterprise Infrastructure for Public Utility</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="card p-8 flex flex-col gap-6 group hover:border-primary-200 transition-all border-slate-100 shadow-sm"
            >
              <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all text-primary-600">
                {f.icon}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Proof / Numbers */}
      <section className="bg-slate-900 rounded-[3rem] p-12 md:p-24 text-white relative overflow-hidden flex flex-col items-center gap-20">
         <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-3xl"></div>
         
         <div className="flex flex-col items-center text-center gap-4 relative z-10">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Scaling City Operations</h2>
            <p className="text-slate-400 max-w-xl font-medium">Measuring impact across the regional metropolitan area through verifiable dataset analysis.</p>
         </div>

         <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 w-full max-w-6xl relative z-10">
           {[
             { val: '24k', label: 'Resolutions', detail: 'Public grievances closed' },
             { val: '4.9', label: 'Satisfaction', detail: 'Verified citizen rating' },
             { val: '<12h', label: 'Fast Response', detail: 'Average triage time' },
             { val: '100%', label: 'Transparency', detail: 'Open public auditing' }
           ].map((stat, i) => (
             <div key={i} className="flex flex-col items-center text-center gap-3">
                <span className="text-5xl font-black text-white italic">{stat.val}</span>
                <div className="flex flex-col gap-1">
                   <span className="text-primary-400 text-xs font-bold uppercase tracking-widest">{stat.label}</span>
                   <span className="text-[10px] text-slate-500 font-semibold">{stat.detail}</span>
                </div>
             </div>
           ))}
         </div>

         <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center gap-8 border-t border-white/5 pt-20">
            <h3 className="text-2xl font-semibold">Ready to improve your neighborhood?</h3>
            <Link to="/register" className="btn-primary py-4 px-12 text-lg shadow-2xl shadow-blue-500/40">Launch Citizen Dashboard</Link>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 pt-12 pb-8 flex flex-col md:flex-row justify-between items-center gap-8 px-4 text-slate-400">
         <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary-600" />
            <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">CitizenCare Terminal</span>
         </div>
         <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest">
            <Link to="#" className="hover:text-primary-600">Privacy Data</Link>
            <Link to="#" className="text-primary-600">Security Architecture</Link>
            <Link to="#" className="hover:text-primary-600">Contact Control</Link>
         </div>
         <span className="text-[10px] font-medium">&copy; 2026 Smart City Governance. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default LandingPage;
