import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/CitizenDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';
import SubmitComplaint from './pages/SubmitComplaint';
import MyComplaints from './pages/MyComplaints';
import ComplaintMap from './pages/ComplaintMap';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Basic local storage auth check (simplified for initial demo)
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
           <>
             <Navbar user={user} setUser={setUser} />
             <main className="container mx-auto px-4 pt-28 pb-12">
               <LandingPage />
             </main>
           </>
        } />
        <Route path="/login" element={
           <>
             <Navbar user={user} setUser={setUser} />
             <main className="container mx-auto px-4 pt-28 pb-12">
               <LoginPage setUser={setUser} />
             </main>
           </>
        } />
        <Route path="/register" element={
           <>
             <Navbar user={user} setUser={setUser} />
             <main className="container mx-auto px-4 pt-28 pb-12">
               <RegisterPage setUser={setUser} />
             </main>
           </>
        } />

        {/* Role-based Dashboards */}
        <Route path="/citizen" element={<PrivateRoute role="CITIZEN"><DashboardLayout user={user} setUser={setUser} /></PrivateRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CitizenDashboard user={user} />} />
          <Route path="submit-complaint" element={<SubmitComplaint user={user} />} />
          <Route path="my-complaints" element={<MyComplaints user={user} />} />
          <Route path="complaint-map" element={<ComplaintMap user={user} />} />
          <Route path="feedback" element={<Feedback user={user} />} />
          <Route path="profile" element={<Profile user={user} />} />
        </Route>

        <Route path="/officer/*" element={<PrivateRoute role="OFFICER"><DashboardLayout user={user} setUser={setUser} /></PrivateRoute>}>
          <Route path="*" element={<OfficerDashboard user={user} />} />
        </Route>

        <Route path="/admin/*" element={<PrivateRoute role="ADMIN"><DashboardLayout user={user} setUser={setUser} /></PrivateRoute>}>
          <Route path="*" element={<AdminDashboard user={user} />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;



















