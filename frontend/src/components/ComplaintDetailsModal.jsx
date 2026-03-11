import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ShieldCheck, Send, Clock, CheckCircle2, AlertCircle, X, ArrowUpRight, ShieldAlert, Activity, Command, Zap } from 'lucide-react';

const ComplaintDetailsModal = ({ isOpen, onClose, complaint, role, user, onUpdate }) => {
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [rating, setRating] = useState(complaint?.rating || 0);
  const [feedback, setFeedback] = useState(complaint?.feedback || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (complaint) {
      setNewStatus(complaint.status);
      setRemarks('');
      setRating(complaint.rating || 0);
      setFeedback(complaint.feedback || '');
      setError('');
    }
  }, [complaint]);

  const handleUpdateStatus = async () => {
    if (!remarks.trim()) {
      setError('Operational remarks are mandatory for status transitions.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/complaints/${complaint._id}`, {
        status: newStatus,
        remarks: remarks
      }, config);
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sync status update with central command.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = async () => {
    if (rating === 0) {
      setError('Please provide an integrity rating Score.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/complaints/${complaint._id}/rate`, {
        rating,
        feedback
      }, config);
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit performance evaluation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!complaint) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xl"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-4xl flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 overflow-hidden max-h-[90vh]"
          >
            {/* Left Column: Dossier Header & Content */}
            <div className="flex-1 p-10 md:p-14 overflow-y-auto no-scrollbar flex flex-col gap-10">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-primary-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Node Dossier: {complaint.complaintId}</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Protocol Details</h2>
                  <div className="flex items-center gap-3 mt-2">
                     <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                        complaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        complaint.status === 'In Progress' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                     }`}>
                        {complaint.status}
                     </span>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{complaint.category}</span>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100 shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner group">
                <div className="flex items-center gap-2 mb-2">
                   <Activity size={14} className="text-primary-500 opacity-50" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grievance Telemetry</span>
                </div>
                <p className="text-lg text-slate-800 font-bold leading-relaxed uppercase tracking-tight group-hover:text-slate-900 transition-colors">{complaint.description}</p>
              </div>

              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-2 px-1">
                   <Clock size={16} className="text-primary-500" />
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Operational Timeline</h3>
                </div>
                <div className="flex flex-col gap-8 relative pl-6">
                  <div className="absolute left-1.5 top-0 bottom-0 w-px bg-slate-100"></div>
                  {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
                    complaint.statusHistory.map((h, i) => (
                      <div key={i} className="relative group">
                        <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-primary-500 shadow-lg group-hover:scale-125 transition-transform z-10"></div>
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{h.status}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(h.updatedAt).toLocaleString()}</span>
                           </div>
                           <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">"{h.remarks || 'NO SYSTEM REMARKS LOGGED'}"</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-10 border-2 border-dashed border-slate-50 rounded-[2rem]">
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Initializing Timeline Data...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Interaction Panel */}
            <div className="w-full md:w-[380px] bg-slate-50/50 p-10 md:p-12 overflow-y-auto no-scrollbar flex flex-col gap-8">
               {/* Controls Header */}
               <div className="flex flex-col gap-1 px-1">
                  <div className="flex items-center gap-2 text-primary-600">
                     <Command size={18} />
                     <h3 className="text-sm font-black uppercase tracking-[0.2em]">Command Console</h3>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Syncing with Central Intelligence</p>
               </div>

               {error && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-[10px] font-black text-rose-600 flex items-center gap-3">
                   <AlertCircle size={16} /> {error.toUpperCase()}
                 </motion.div>
               )}

               <AnimatePresence mode="wait">
                  {/* Officer Controls */}
                  {role === 'OFFICER' && complaint.status !== 'Resolved' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
                       <div className="flex flex-col gap-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">State Transition</label>
                          <div className="flex flex-col gap-2">
                             {['Assigned', 'In Progress', 'Resolved'].map(status => (
                                <button 
                                  key={status}
                                  onClick={() => setNewStatus(status)}
                                  className={`w-full p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left transition-all border-2
                                    ${newStatus === status ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border-white text-slate-400 hover:border-slate-200'}
                                  `}
                                >
                                   {status}
                                </button>
                             ))}
                          </div>
                       </div>
                       
                       <div className="flex flex-col gap-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Operational Log</label>
                          <textarea 
                            className="w-full p-6 bg-white border border-slate-100 rounded-[2rem] text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-primary-500/5 outline-none min-h-[120px] transition-all placeholder:text-slate-300"
                            placeholder="INITIALIZE REMARKS..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                          />
                       </div>

                       <button 
                         onClick={handleUpdateStatus}
                         disabled={submitting}
                         className="w-full bg-primary-600 text-white py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary-500/30 hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                       >
                         {submitting ? <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div> : <>Commit Change <Send size={16} /></>}
                       </button>
                    </motion.div>
                  )}

                  {/* Citizen Review Area */}
                  {role === 'CITIZEN' && (complaint.status === 'Resolved' || complaint.status === 'Closed') && !complaint.rating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
                       <div className="flex flex-col gap-5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 text-center">Satisfaction Matrix</label>
                          <div className="grid grid-cols-5 gap-2">
                             {[1, 2, 3, 4, 5].map(s => (
                                <button 
                                  key={s}
                                  onClick={() => setRating(s)}
                                  className={`aspect-square rounded-2xl text-xs font-black transition-all border-2 flex items-center justify-center
                                    ${rating >= s ? 'bg-amber-400 border-amber-400 text-white shadow-lg shadow-amber-100' : 'bg-white border-white text-slate-300'}
                                  `}
                                >
                                   {s}
                                </button>
                             ))}
                          </div>
                       </div>

                       <div className="flex flex-col gap-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Evaluation Echo</label>
                          <textarea 
                            className="w-full p-6 bg-white border border-slate-100 rounded-[2rem] text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-primary-500/5 outline-none min-h-[140px] transition-all placeholder:text-slate-300"
                            placeholder="FEEDBACK TRANSMISSION..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                          />
                       </div>

                       <button 
                         onClick={handleRate}
                         disabled={submitting}
                         className="w-full bg-slate-900 text-white py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-4xl shadow-slate-900/10 hover:bg-primary-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                       >
                         {submitting ? <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div> : <>Transmit Evaluation <Send size={16} /></>}
                       </button>
                    </motion.div>
                  )}

                  {/* Rating Display */}
                  {complaint.rating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                       <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6 items-center text-center">
                          <div className="flex flex-col gap-1">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Evaluation Integrity</span>
                             <div className="flex items-center gap-1.5 justify-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < complaint.rating ? 'bg-amber-400' : 'bg-slate-100'}`}></div>
                                ))}
                             </div>
                          </div>
                          <div className="w-full h-px bg-slate-50"></div>
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed italic">"{complaint.feedback || 'ARCHIVED WITHOUT REMARKS'}"</p>
                       </div>
                       <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 text-center flex flex-col gap-2">
                          <ShieldCheck size={28} className="text-emerald-500 mx-auto" />
                          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.3em]">Protocol Finalized</span>
                       </div>
                    </motion.div>
                  )}

                  {/* Default State / Info */}
                  {!((role === 'OFFICER' && complaint.status !== 'Resolved') || ((complaint.status === 'Resolved' || complaint.status === 'Closed') && !complaint.rating)) && !complaint.rating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 py-10">
                       <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center border border-slate-100 text-slate-200 mx-auto opacity-50">
                          <Zap size={32} />
                       </div>
                       <div className="text-center flex flex-col gap-1">
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Operational Standby</span>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">Awaiting mission state transition or citizen evaluation triggers.</p>
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ComplaintDetailsModal;
