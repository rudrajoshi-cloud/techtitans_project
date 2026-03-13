import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const RoutePrediction = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [routeResult, setRouteResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ratings State
  const [communityRating, setCommunityRating] = useState({ average_rating: 0, total_ratings: 0 });
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const routingLine = useRef(null);
  const markers = useRef([]);

  // Setup the map when coordinates are available
  useEffect(() => {
    if (routeResult && routeResult.route?.path_coordinates?.length > 0) {
      if (!mapInstance.current) {
        mapInstance.current = window.L.map(mapContainerRef.current);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance.current);
      }

      // Clear previous layers
      if (routingLine.current) {
        mapInstance.current.removeLayer(routingLine.current);
      }
      markers.current.forEach(m => mapInstance.current.removeLayer(m));
      markers.current = [];

      // Extract points
      const pathList = routeResult.route.path_coordinates;
      const latlngs = pathList.map(coord => [coord.lat, coord.lng]);

      // Draw polyline
      let color = '#22c55e'; // green 
      if (routeResult.safety_score < 70) color = '#eab308'; // yellow
      if (routeResult.safety_score < 40) color = '#ef4444'; // red

      routingLine.current = window.L.polyline(latlngs, { color, weight: 6, opacity: 0.8 }).addTo(mapInstance.current);

      // Add markers for Start and End
      const startMarker = window.L.marker(latlngs[0]).addTo(mapInstance.current).bindPopup('Origin');
      const endMarker = window.L.marker(latlngs[latlngs.length - 1]).addTo(mapInstance.current).bindPopup('Destination');
      markers.current = [startMarker, endMarker];

      // Fit map to show the whole route
      mapInstance.current.fitBounds(routingLine.current.getBounds(), { padding: [30, 30] });
    }
  }, [routeResult]);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!source || !destination) return;

    setLoading(true);
    setError(null);
    setRouteResult(null);

    try {
      const response = await api.post('/predictRoute', { source, destination });
      setRouteResult(response.data);
      
      // Fetch Community Safety Ratings for this specific route
      try {
         const ratingRes = await api.get(`/route/rating?start_location=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`);
         setCommunityRating(ratingRes.data);
         setUserRating(0);
         setRatingSubmitted(false);
      } catch (ratingErr) {
         console.warn("Could not fetch route ratings", ratingErr);
      }
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch prediction.');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (stars) => {
     setUserRating(stars);
     try {
       await api.post('/route/rating', {
           start_location: source,
           destination: destination,
           rating: stars
       });
       setRatingSubmitted(true);
       
       // Refresh ratings strictly
       const ratingRes = await api.get(`/route/rating?start_location=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`);
       setCommunityRating(ratingRes.data);
     } catch (err) {
        console.error("Failed to submit rating", err);
     }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl flex flex-col border border-gray-100 h-full overflow-hidden transition-all duration-300">
      <div className="p-6 md:p-8 flex-grow">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-2xl font-bold text-gray-900">AI Route Safety</h3>
           <div className="p-2 bg-indigo-50 rounded-lg">
             <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
           </div>
        </div>

        <form onSubmit={handlePredict} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute top-3.5 left-4">
                 <div className="w-3 h-3 rounded-full border-2 border-green-500"></div>
              </div>
              <input
                type="text"
                required
                placeholder="Where are you starting?"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-[1.125rem] -top-3 bottom-full h-8 border-l-2 border-dashed border-gray-300 pointer-events-none"></div>
              <div className="absolute top-3.5 left-4">
                 <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              </div>
              <input
                type="text"
                required
                placeholder="Where do you want to go?"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !source || !destination}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-md transition-all duration-200 flex justify-center items-center ${
              loading || !source || !destination ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            {loading ? (
                <span className="flex items-center gap-2">
                   <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Analyzing Routes...
                </span>
            ) : 'Analyze Safe Routes'}
          </button>
        </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border-l-4 border-red-500">
          {error}
        </div>
      )}

      {routeResult && (
        <div className="mt-8">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                 <div>
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-white text-emerald-600 uppercase mb-2">Safest Route Found</span>
                   <p className="font-medium text-emerald-50 mt-1 flex items-center gap-2">
                     <span className="font-bold text-white capitalize">{routeResult.route?.source || source}</span>
                     <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                     <span className="font-bold text-white capitalize">{routeResult.route?.destination || destination}</span>
                   </p>
                 </div>
                 <div className="text-center bg-white/10 rounded-xl px-6 py-3 backdrop-blur-sm border border-white/20">
                    <span className="block text-4xl font-black text-white">{routeResult.safety_score}<span className="text-xl opacity-75">%</span></span>
                    <span className="text-[10px] text-emerald-100 uppercase tracking-widest font-bold">Safety Match</span>
                 </div>
             </div>
             {/* Decorative background shape */}
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          </div>
          
          {routeResult.ai_analysis && (
             <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition">
                   <p className="text-xs text-gray-500 font-semibold tracking-wide uppercase mb-1">Avg Safety</p>
                   <p className="text-2xl font-bold text-gray-900">{routeResult.ai_analysis.average_segment_score}%</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100 shadow-sm hover:shadow-md transition">
                   <p className="text-xs text-red-600 font-semibold tracking-wide uppercase mb-1">Lowest Point</p>
                   <p className="text-2xl font-bold text-red-700">{routeResult.ai_analysis.lowest_segment_score}%</p>
                </div>
                {routeResult.ai_analysis.metrics && (
                  <>
                     <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-100 shadow-sm hover:shadow-md transition">
                        <p className="text-xs text-yellow-700 font-semibold tracking-wide uppercase mb-1">Lighting</p>
                        <p className="text-2xl font-bold text-yellow-600">{routeResult.ai_analysis.metrics.avg_lighting_score}</p>
                     </div>
                     <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100 shadow-sm hover:shadow-md transition">
                        <p className="text-xs text-blue-700 font-semibold tracking-wide uppercase mb-1">Police Dist.</p>
                        <p className="text-2xl font-bold text-blue-600">{routeResult.ai_analysis.metrics.nearest_police_avg_km}<span className="text-sm font-medium opacity-70">km</span></p>
                     </div>
                     <div className="bg-gray-900 rounded-xl p-6 text-center shadow-lg col-span-2 md:col-span-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                        <p className="text-xs text-indigo-300 font-bold tracking-widest uppercase mb-2 relative z-10">AI Night Safety Index</p>
                        <p className="text-4xl font-black text-white relative z-10">
                           {routeResult.ai_analysis.metrics.night_safety_score}
                           <span className="text-lg text-gray-400 font-medium ml-1">/10</span>
                        </p>
                     </div>
                   </>
                )}
             </div>
          )}

          {/* Community Feedback Extension */}
          {routeResult.route && (
             <div className="mt-6 border border-gray-100 rounded-2xl p-6 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                   <div className="text-center lg:text-left">
                       <h4 className="text-lg font-bold text-gray-900 mb-1">Community Consensus</h4>
                       <p className="text-sm text-gray-500 mb-3">How safe did other users feel?</p>
                       <div className="flex items-center justify-center lg:justify-start gap-4">
                           <div className="flex bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                               {[1,2,3,4,5].map(star => (
                                   <span key={star} className={`text-2xl leading-none drop-shadow-sm transition-opacity ${star <= Math.round(communityRating.average_rating) ? 'text-yellow-400 opacity-100' : 'text-gray-200 opacity-50'}`}>★</span>
                               ))}
                           </div>
                           <div>
                              <span className="block font-black text-2xl text-gray-900 leading-none">{communityRating.average_rating}</span>
                              <span className="text-xs text-gray-500 font-medium">{communityRating.total_ratings} reviews</span>
                           </div>
                       </div>
                   </div>

                   <div className="w-full lg:w-auto h-px lg:h-16 bg-gray-100"></div>

                   <div className="w-full lg:w-auto">
                       <p className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mb-3">{ratingSubmitted ? 'Thanks for Your Feedback!' : 'Rate this Route'}</p>
                       <div className="flex justify-center gap-1 select-none" onMouseLeave={() => setHoverRating(0)}>
                           {[1,2,3,4,5].map(star => (
                               <button 
                                   key={star}
                                   type="button"
                                   onClick={() => handleRatingSubmit(star)}
                                   onMouseEnter={() => setHoverRating(star)}
                                   className={`w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500
                                      ${ratingSubmitted ? 'border-gray-100 bg-gray-50 cursor-default' : 'hover:border-yellow-300 hover:bg-yellow-50 hover:shadow-sm cursor-pointer border-gray-200'}
                                   `}
                                   disabled={ratingSubmitted}
                               >
                                   <span className={`text-3xl transition-transform ${!ratingSubmitted && (star <= (hoverRating || userRating)) ? 'text-yellow-400 scale-110 drop-shadow-md' : 'text-gray-300 scale-100'}`}>★</span>
                               </button>
                           ))}
                       </div>
                   </div>
                </div>
             </div>
          )}

          {routeResult.route?.path_coordinates && routeResult.route.path_coordinates.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Live GPS Navigation</h4>
                 <span className="flex items-center text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5 animate-pulse"></span>
                    Real-time
                 </span>
              </div>
              <div className="rounded-2xl shadow-lg border-4 border-white overflow-hidden bg-gray-100 relative">
                 <div className="absolute inset-0 border border-gray-200/50 rounded-2xl pointer-events-none z-10"></div>
                 <div 
                   ref={mapContainerRef} 
                   style={{ width: '100%', height: '400px' }} 
                   className="z-0" 
                 ></div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default RoutePrediction;
