import React, { useState, useEffect } from 'react';

const LocationSearch = () => {
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterSafetyLevel, setFilterSafetyLevel] = useState('');
  const [loading, setLoading] = useState(true);

  // Helper function to assign Safety Level string based on math rules provided
  const getSafetyLevel = (score) => {
    if (score >= 85) return { label: 'Very Safe', color: 'bg-green-100 text-green-800 border-green-300' };
    if (score >= 75) return { label: 'Safe', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (score >= 65) return { label: 'Moderate Risk', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    return { label: 'Unsafe', color: 'bg-red-100 text-red-800 border-red-300' };
  };

  useEffect(() => {
    // Fetch the CSV directly from the public folder
    fetch('/india_safety_locations_500.csv')
      .then((response) => response.text())
      .then((csvText) => {
        // Simple client-side CSV parser
        const lines = csvText.split('\n');
        const headers = lines[0].replace(/"/g, '').split(',');
        
        const parsedData = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Split by comma outside of quotes (if any) or simply by comma since the dataset is clean
          // Our dataset is wrapped entirely in quotes so we strip those first
          const cleanLine = line.replace(/"/g, '');
          const values = cleanLine.split(',');
          
          if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
              row[header.trim()] = values[index].trim();
            });
            
            // Cast numericals
            row.safety_score = parseInt(row.safety_score, 10);
            
            // Add custom classification
            const levelInfo = getSafetyLevel(row.safety_score);
            row.safety_level = levelInfo.label;
            row.safety_badge = levelInfo.color;
            
            parsedData.push(row);
          }
        }
        
        // Sort alphabetically by default
        parsedData.sort((a,b) => a.place_name.localeCompare(b.place_name));
        setLocations(parsedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load CSV database:", error);
        setLoading(false);
      });
  }, []);

  // Compute distinct cities for the filter dropdown
  const uniqueCities = [...new Set(locations.map(item => item.city))].sort();

  // Filter the massive dataset based on all active parameters
  const filteredData = locations.filter((loc) => {
    const searchMatch = loc.place_name.toLowerCase().includes(searchTerm.toLowerCase());
    const cityMatch = filterCity === '' || loc.city === filterCity;
    const safetyMatch = filterSafetyLevel === '' || loc.safety_level === filterSafetyLevel;
    return searchMatch && cityMatch && safetyMatch;
  });

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Deep Analytics Database...</div>;
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden mt-8 border border-gray-100">
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gray-50 border-b border-gray-100">
        <div>
           <h3 className="text-2xl font-bold text-gray-900 mb-1">Safety Intelligence Database</h3>
           <p className="text-sm text-gray-500">Explore comprehensive environmental and security metrics for locations across India.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-72">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <input 
                type="text"
                placeholder="Search precise location..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all shadow-sm box-border focus:outline-none"
             />
          </div>
          <div className="relative">
             <select 
                onChange={(e) => setFilterCity(e.target.value)}
                className="appearance-none w-full md:w-auto pl-4 pr-10 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all focus:outline-none"
             >
                <option value="">All Cities</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
             </div>
          </div>
          <div className="relative">
             <select 
                onChange={(e) => setFilterSafetyLevel(e.target.value)}
                className="appearance-none w-full md:w-auto pl-4 pr-10 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all focus:outline-none"
             >
                <option value="">All Safety Levels</option>
                <option value="Very Safe">Very Safe (85+)</option>
                <option value="Safe">Safe (75-84)</option>
                <option value="Moderate Risk">Moderate Risk (65-74)</option>
                <option value="Unsafe">Unsafe (&lt; 65)</option>
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
             </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-white">
            <tr>
              <th scope="col" className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Location</th>
              <th scope="col" className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">City</th>
              <th scope="col" className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">AI Safety Score</th>
              <th scope="col" className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Classification</th>
              <th scope="col" className="px-8 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Core Metrics</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {filteredData.length > 0 ? (
              filteredData.map((loc) => (
                <tr key={loc.location_id} className="hover:bg-slate-50 transition-colors duration-150 group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center">
                       <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       </div>
                       <div className="ml-4">
                         <div className="font-bold text-gray-900 text-base">{loc.place_name}</div>
                         <div className="text-xs text-gray-400 font-mono mt-0.5 tracking-wide">{Number(loc.latitude).toFixed(4)}, {Number(loc.longitude).toFixed(4)}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold text-slate-700 bg-slate-100">
                      {loc.city}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-baseline">
                       <span className="text-2xl font-black text-gray-900 tracking-tight">{loc.safety_score}</span>
                       <span className="text-sm text-gray-400 font-medium ml-1">/100</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`px-4 py-1.5 inline-flex text-xs font-bold rounded-full border shadow-sm ${loc.safety_badge}`}>
                      {loc.safety_level}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center justify-center gap-6">
                        <div className="text-center group-hover:-translate-y-1 transition-transform">
                           <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Crime</span>
                           <span className="font-black text-gray-800 text-sm">{loc.crime_rate}</span>
                        </div>
                        <div className="text-center group-hover:-translate-y-1 transition-transform delay-75">
                           <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Light</span>
                           <span className="font-black text-gray-800 text-sm">{loc.lighting_score}</span>
                        </div>
                        <div className="text-center group-hover:-translate-y-1 transition-transform delay-100">
                           <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Density</span>
                           <span className="font-black text-gray-800 text-sm">{loc.population_density}</span>
                        </div>
                        <div className="text-center group-hover:-translate-y-1 transition-transform delay-150">
                           <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Police</span>
                           <span className="font-black text-gray-800 text-sm">{loc.police_distance_km}<span className="text-[10px] text-gray-500 ml-0.5 font-normal">km</span></span>
                        </div>
                     </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-300 mb-4">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No Locations Found</h3>
                  <p className="text-gray-500 text-sm">Adjust your filters to discover secure routes and places.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LocationSearch;
