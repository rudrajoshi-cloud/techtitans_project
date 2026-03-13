import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RoutePrediction from '../components/RoutePrediction';
import IncidentReporting from '../components/IncidentReporting';
import LocationSearch from '../components/LocationSearch';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sosStatus, setSosStatus] = useState({ loading: false, message: '', error: false });

  useEffect(() => {
    // Fetch user profile on mount
    // Assuming backend will have a GET /api/profile or we get it from token payload.
    // For now we will mock a fetch since the backend README didn't strictly list a GET /profile route
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSOS = () => {
    setSosStatus({ loading: true, message: '', error: false });

    // Request Live Location from Browser
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => dispatchRealSOS(position.coords.latitude, position.coords.longitude),
            async (error) => {
                console.warn("Geolocation denied or failed.", error);
                // Dispatch anyway without location
                dispatchRealSOS(null, null);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    } else {
        dispatchRealSOS(null, null);
    }
  };

  const dispatchRealSOS = async (lat, lng) => {
    try {
      const payload = { user_id: 'USER_CURRENT' };
      if (lat && lng) {
          payload.latitude = lat;
          payload.longitude = lng;
      }

      const response = await api.post('/sos', payload);
      setSosStatus({ 
        loading: false, 
        message: response.data?.message || 'SOS Alert Sent Successfully to emergency contacts and authorities!', 
        error: false 
      });
    } catch (err) {
      setSosStatus({ 
        loading: false, 
        message: err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to send SOS. Check network.', 
        error: true 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Hero Section */}
      <div className="bg-indigo-700 pb-32">
        <header className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">SafeRoute Dashboard</h1>
              <p className="mt-1 text-sm text-indigo-200">Welcome back, {profile?.name || 'User'}! Navigate securely.</p>
            </div>
          </div>
        </header>
      </div>

      <main className="-mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main SOS Trigger Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100">
          <div className="px-6 py-8 sm:p-10 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Emergency Assistance</h2>
            <p className="text-gray-500 mb-8 max-w-2xl mx-auto">Press the SOS button below to instantly alert your emergency contacts and share your live GPS location.</p>
            
            <button
              onClick={handleSOS}
              disabled={sosStatus.loading}
              className={`relative inline-flex items-center justify-center w-64 h-64 rounded-full shadow-2xl transition-all duration-300 focus:outline-none focus:ring-8 focus:ring-red-200 ${
                sosStatus.loading 
                ? 'bg-red-400 cursor-not-allowed scale-95' 
                : 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 hover:scale-105 active:scale-95'
              }`}
            >
              {/* Pulse effect */}
              {!sosStatus.loading && (
                <div className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-20"></div>
              )}
              <div className="flex flex-col items-center z-10">
                <svg className="w-16 h-16 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span className="text-4xl font-black text-white tracking-widest uppercase">{sosStatus.loading ? '...' : 'SOS'}</span>
              </div>
            </button>

            {sosStatus.message && (
              <div className={`mt-10 p-6 rounded-2xl max-w-3xl mx-auto ${sosStatus.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-center justify-center mb-4">
                  {sosStatus.error ? (
                    <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ) : (
                    <svg className="w-8 h-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  )}
                  <p className={`text-xl font-bold ${sosStatus.error ? 'text-red-700' : 'text-green-700'}`}>{sosStatus.message}</p>
                </div>
                
                {!sosStatus.error && (
                  <div className="mt-6 border-t border-green-200/50 pt-6">
                    <h3 className="text-sm font-bold tracking-widest text-green-800 uppercase mb-4">Quick Dial Authorities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <a href="tel:112" className="flex items-center justify-center px-4 py-4 bg-white border-2 border-blue-500 text-blue-700 font-bold rounded-xl shadow-sm hover:bg-blue-50 transition transform hover:-translate-y-1">
                        <span className="text-2xl mr-2">🚓</span> Police (112)
                      </a>
                      <a href="tel:108" className="flex items-center justify-center px-4 py-4 bg-white border-2 border-red-500 text-red-700 font-bold rounded-xl shadow-sm hover:bg-red-50 transition transform hover:-translate-y-1">
                        <span className="text-2xl mr-2">🚑</span> Ambulance (108)
                      </a>
                      <a href="tel:1091" className="flex items-center justify-center px-4 py-4 bg-white border-2 border-pink-500 text-pink-700 font-bold rounded-xl shadow-sm hover:bg-pink-50 transition transform hover:-translate-y-1">
                        <span className="text-2xl mr-2">🛡️</span> Women (1091)
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Emergency Contacts Footer Banner */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center">
                   <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                   <span className="text-sm font-medium text-gray-700">Active Contacts:</span>
                </div>
                {profile?.emergency_contacts && profile.emergency_contacts.length > 0 ? (
                  <div className="mt-2 sm:mt-0 flex gap-3">
                    {profile.emergency_contacts.map((contact, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-800 shadow-sm">
                        {contact.name} ({contact.phone})
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 italic mt-2 sm:mt-0">No contacts synced.</span>
                )}
             </div>
          </div>
        </div>

        {/* Dashboard Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
           <RoutePrediction />
           <IncidentReporting />
        </div>
        
        {/* Full Width Components */}
        <LocationSearch />
      </main>
    </div>
  );
};

export default Dashboard;
