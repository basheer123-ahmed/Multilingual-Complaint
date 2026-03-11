import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Image, MapPin, Send, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Replace default leaflet icon with a custom SVG to avoid image loading issues
const customIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="color: #2563EB; transform: translate(-50%, -100%);">
           <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 15.993 4 10a8 8 0 0 1 16 0"/>
             <circle cx="12" cy="10" r="3" fill="white"/>
           </svg>
         </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

const center = { lat: 28.6139, lng: 77.2090 };

const MapViewUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const ComplaintForm = ({ user, onSuccess }) => {
  const [formData, setFormData] = useState({
    category: 'Potholes',
    description: '',
    severity: 'medium',
    latitude: center.lat,
    longitude: center.lng,
    address: ''
  });
  const [addressSearch, setAddressSearch] = useState('');
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.description.length < 20) {
      setError('Please provide at least 20 characters for the description.');
      return;
    }
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      evidenceUrls: files.map(f => `https://simulated-storage.com/${f.name}`)
    };

    try {
      await axios.post('/api/complaints', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSuccess(true);
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!addressSearch) return;
      try {
        const { data } = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}`);
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          setFormData({
            ...formData,
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            address: display_name
          });
        }
      } catch (err) {
        console.error('Search failed:', err);
      }
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setFormData({
          ...formData,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng
        });
      },
    });
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-10 lg:p-14 flex flex-col gap-12 border-none shadow-3xl shadow-slate-200/50 rounded-[3rem] bg-white/90 backdrop-blur-xl"
    >
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="status-badge status-success py-3 flex items-center justify-center gap-2 normal-case font-bold"
          >
            <CheckCircle2 size={18} />
            Complaint registered into our system.
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="status-badge status-error py-3 flex items-center justify-center gap-2 normal-case font-bold"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Form Fields */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          <div className="flex flex-col gap-2 px-1">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Grievance Intelligence</h2>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Categorize and describe the localized incident.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Service Directive</label>
              <select
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-black text-[11px] text-slate-800 uppercase tracking-widest shadow-sm appearance-none cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Potholes">Potholes Protocol</option>
                <option value="Garbage Overflow">Sanitation Feed</option>
                <option value="Water Leakage">Hydraulic Integrity</option>
                <option value="Streetlight Failure">Illumination Logistics</option>
                <option value="Public Safety">Security Oversight</option>
                <option value="Health Hazard">Biorisk Management</option>
                <option value="Fire">Thermal Intercept</option>
                <option value="Gas Leaks">Chemical Surveillance</option>
                <option value="Road Damage">Infrastructure Decay</option>
                <option value="Other">External Anomaly</option>
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Incident Parameters</label>
              <textarea
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-xs text-slate-700 min-h-[160px] resize-none leading-relaxed placeholder:text-slate-300 shadow-sm"
                placeholder="REPORT DETAILS: IDENTIFY LANDMARKS, SEVERITY IMPACTS, AND PRECISE DEPLOYMENT PARAMETERS..."
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Priority Vector</label>
              <div className="grid grid-cols-3 gap-4">
                {['low', 'medium', 'high'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, severity: level })}
                    className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all active:scale-95 shadow-sm
                      ${formData.severity === level 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-600 px-1">Evidence (Optional)</label>
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer group flex flex-col items-center justify-center gap-3
                  ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
              >
                  <div className={`flex flex-col items-center gap-2 transition-colors ${isDragging ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    <Image size={24} className={isDragging ? 'animate-bounce' : ''} />
                    <span className="text-xs font-black uppercase tracking-widest text-center">
                      {isDragging ? 'Drop Protocol Files' : 'Drag & Drop or Click to Upload'}
                    </span>
                    <span className="text-[10px] font-medium opacity-60 uppercase tracking-tighter">Support for JPEG, PNG, WEBP</span>
                  </div>
                  <input 
                    type="file" 
                    multiple 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
              </div>

              {files.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {files.map((file, idx) => (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={idx} 
                      className="relative bg-white border border-slate-200 p-2 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <Image size={14} />
                      </div>
                      <div className="flex flex-col max-w-[120px]">
                        <span className="text-[10px] font-black text-slate-900 truncate uppercase mt-0.5">{file.name}</span>
                        <span className="text-[8px] font-medium text-slate-400 uppercase tracking-tighter">{(file.size / 1024).toFixed(0)} KB</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-full transition-colors"
                      >
                         <AlertCircle size={14} className="rotate-45" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Map Picker */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          <div className="flex flex-col gap-2 px-1">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Geospatial Locality</h2>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Synchronize precise deployment coordinates.</p>
          </div>

          <div className="flex flex-col gap-5 h-full relative z-0">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="SEARCH ARCHIVE OR LOCALITY..."
                className="w-full pl-13 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-black text-[10px] text-slate-800 uppercase tracking-widest shadow-sm"
                value={addressSearch}
                onChange={(e) => setAddressSearch(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>

            <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50 relative min-h-[360px] z-10 shadow-inner">
                <MapContainer
                  center={[formData.latitude, formData.longitude]}
                  zoom={15}
                  zoomControl={false}
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    className="map-grayscale"
                  />
                  <Marker position={[formData.latitude, formData.longitude]} icon={customIcon} />
                  <MapClickHandler />
                  <MapViewUpdater center={[formData.latitude, formData.longitude]} />
                </MapContainer>
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xl shadow-2xl border border-white/50 p-5 rounded-3xl flex items-center justify-between z-[400] transition-all hover:scale-[1.02]">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <MapPin size={10} className="text-primary-500" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Hub</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 font-mono tracking-widest whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                    {formData.latitude.toFixed(6)} / {formData.longitude.toFixed(6)}
                  </span>
                </div>
                <div className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20 animate-pulse">Synced</div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 rounded-3xl hover:bg-primary-600 hover:shadow-3xl hover:shadow-primary-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group shadow-2xl shadow-slate-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Commit Grievance Protocol</span>
                  <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white group-hover:text-primary-600 transition-colors">
                    <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default ComplaintForm;

