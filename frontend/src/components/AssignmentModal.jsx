import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Building, ShieldCheck, AlertCircle } from 'lucide-react';

const AssignmentModal = ({ isOpen, onClose, complaint, user, onAssigned }) => {
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (complaint?.assignedDepartmentId) setSelectedDept(complaint.assignedDepartmentId);
      if (complaint?.assignedOfficerUserId) setSelectedOfficer(complaint.assignedOfficerUserId?._id || complaint.assignedOfficerUserId);
    }
  }, [isOpen, complaint]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [deptRes, officerRes] = await Promise.all([
        axios.get('/api/departments', config),
        axios.get('/api/admin/officers', config)
      ]);
      setDepartments(deptRes.data);
      setOfficers(officerRes.data);
    } catch (err) {
      setError('System failure while retrieving personnel records.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDept || !selectedOfficer) {
      setError('Command incomplete: Both department and personnel required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/admin/assign/${complaint._id}`, {
        departmentId: selectedDept,
        officerId: selectedOfficer
      }, config);
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Authorization error: Failed to commit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!complaint) return null;

  const filteredOfficers = officers.filter(o => {
    const deptId = o.departmentId?._id || o.departmentId;
    return !selectedDept || deptId === selectedDept;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          ></motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-3xl overflow-hidden border border-slate-100"
          >
            <div className="p-8 md:p-12 flex flex-col gap-8">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded w-max">Mission Assignment</span>
                  <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Personnel Allocation</h2>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold animate-in fade-in zoom-in duration-300">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Authority Cluster</label>
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <select
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                      value={selectedDept}
                      onChange={(e) => {
                        setSelectedDept(e.target.value);
                        setSelectedOfficer('');
                      }}
                    >
                      <option value="">Select Departmental Branch</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Designated Officer</label>
                  <div className="relative group">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                    <select
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer disabled:opacity-50"
                      value={selectedOfficer}
                      onChange={(e) => setSelectedOfficer(e.target.value)}
                      disabled={!selectedDept}
                    >
                      <option value="">Select Field Agent</option>
                      {filteredOfficers.map((off) => (
                        <option key={off._id} value={off._id}>{off.name} ({off.email})</option>
                      ))}
                    </select>
                  </div>
                  {!selectedDept && <span className="text-[10px] text-primary-500 font-bold px-1">Initialize department cluster first.</span>}
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-2">
                <button
                  onClick={handleAssign}
                  disabled={submitting || loading}
                  className="btn-primary py-4 font-bold text-base shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2 group w-full"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Commit Deployment</span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> System Validated</div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Traceable ID</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AssignmentModal;
