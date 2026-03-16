import React, { useState } from 'react';
import api from '../services/api';

const IncidentReporting = () => {
  const [incidentType, setIncidentType] = useState('harassment');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleReport = async (e) => {
    e.preventDefault();
    if (!lat || !lng) return;

    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      await api.post('/reportIncident', {
        category: incidentType,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        description: 'Reported via Dashboard Quick-Form'
      });
      setSuccess(true);
      setLat('');
      setLng('');
      setIncidentType('harassment');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to report incident.');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
      },
      () => {
        setError('Unable to retrieve your location');
      }
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl flex flex-col border border-gray-100 h-full overflow-hidden transition-all duration-300">
      <div className="p-6 md:p-8 flex-grow">
        <div className="flex flex-col mb-8">
           <div className="flex items-center justify-between mb-2">
               <h3 className="text-2xl font-bold text-gray-900">Report Incident</h3>
               <div className="p-2 bg-red-50 rounded-lg">
                 <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
               </div>
           </div>
           <p className="text-sm text-gray-500">Log a safety concern to help protect the community.</p>
        </div>

        <form onSubmit={handleReport} className="space-y-6">
          
          <div>
             <label className="block text-sm font-semibold text-gray-700 mb-2">What Happened?</label>
             <div className="relative">
                 <select 
                   className="appearance-none w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium transition-all"
                   value={incidentType}
                   onChange={(e) => setIncidentType(e.target.value)}
                 >
                   <option value="Harassment reported">Harassment</option>
                   <option value="Suspicious activity">Suspicious Activity</option>
                   <option value="Poor lighting">Poor Lighting/Unsafe Area</option>
                   <option value="Unsafe area">Assault / High Danger</option>
                   <option value="Safe zone">Mark as Safe Zone</option>
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                   <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                 </div>
             </div>
          </div>

          <div>
             <div className="flex justify-between items-center mb-2">
               <label className="block text-sm font-semibold text-gray-700">Location Coordinates</label>
               <button 
                 type="button" 
                 onClick={getUserLocation} 
                 className="flex items-center text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
               >
                 <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 Auto-Locate Me
               </button>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-sm font-bold">LAT</span>
                   </div>
                   <input
                     type="number"
                     step="any"
                     required
                     placeholder="0.000000"
                     className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm transition-all"
                     value={lat}
                     onChange={(e) => setLat(e.target.value)}
                   />
               </div>
               <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-sm font-bold">LNG</span>
                   </div>
                   <input
                     type="number"
                     step="any"
                     required
                     placeholder="0.000000"
                     className="w-full pl-11 pr-3 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm transition-all"
                     value={lng}
                     onChange={(e) => setLng(e.target.value)}
                   />
               </div>
             </div>
          </div>

          <button
            type="submit"
            disabled={loading || !lat || !lng}
            className={`w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-md text-base font-bold text-white transition-all duration-200 ${
              loading || !lat || !lng ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mt-8`}
          >
            {loading ? (
                 <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Submitting...
                 </span>
            ) : 'Submit Report Anonymously'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start">
            <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-green-50 text-green-800 rounded-xl border border-green-200 flex items-start">
              <svg className="w-6 h-6 mr-2 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              <div>
                  <p className="font-bold text-sm">Incident Recorded</p>
                  <p className="text-sm mt-1 text-green-700">Thank you. This data has been piped to our AI network to warn future travelers traversing this perimeter.</p>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentReporting;
