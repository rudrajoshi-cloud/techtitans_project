import Route from '../models/Route.js';
import Incident from '../models/Incident.js';
import https from 'https';
import http from 'http';

// Helper function to make GET requests safely with browser mocking
const makeGetRequest = (url) => {
    return new Promise((resolve, reject) => {
        const reqModule = url.startsWith('https') ? https : http;
        reqModule.get(url, { 
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            } 
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) {
                    return reject(new Error(`API rejected request with status ${res.statusCode}: ${data.substring(0, 100)}`));
                }
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    reject(new Error(`Failed to parse JSON response. Data length: ${data.length}, Preview: ${data.substring(0, 100)}`));
                }
            });
        }).on('error', err => reject(err));
    });
};

// Helper function to make POST requests to AI service
const makePostRequest = (url, postData) => {
    return new Promise((resolve, reject) => {
        const reqModule = url.startsWith('https') ? https : http;
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        const req = reqModule.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    reject(new Error('Invalid response from AI server'));
                }
            });
        });
        req.on('error', err => reject(err));
        req.write(postData);
        req.end();
    });
};

export const predictRoute = async (req, res) => {
  try {
    const { source, destination } = req.body;
    
    // 1. Geocode source and destination into real coordinates using free OpenStreetMap API
    const geoSrcData = await makeGetRequest(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(source)}&countrycodes=in`);
    if (!geoSrcData || !geoSrcData.length) return res.status(404).json({ error: `Source location '${source}' could not be found in India.` });
    
    let srcCoords = { 
        lat: parseFloat(geoSrcData[0].lat), 
        lng: parseFloat(geoSrcData[0].lon), 
        name: geoSrcData[0].display_name 
    };

    const geoDstData = await makeGetRequest(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&countrycodes=in`);
    if (!geoDstData || !geoDstData.length) return res.status(404).json({ error: `Destination location '${destination}' could not be found in India.` });
    
    let dstCoords = { 
        lat: parseFloat(geoDstData[0].lat), 
        lng: parseFloat(geoDstData[0].lon), 
        name: geoDstData[0].display_name 
    };

    // 2. Get real physical routing between coordinates using OSRM
    let pathCoords = [];
    try {
        const osrmData = await makeGetRequest(`https://router.project-osrm.org/route/v1/driving/${srcCoords.lng},${srcCoords.lat};${dstCoords.lng},${dstCoords.lat}?overview=full&geometries=geojson`);
        if (osrmData.routes && osrmData.routes.length > 0 && osrmData.routes[0].geometry) {
            // OSRM returns coordinates as [longitude, latitude]
            pathCoords = osrmData.routes[0].geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
        }
    } catch (osrmErr) {
        console.warn("OSRM routing failed, falling back to straight line path.");
    }

    if (pathCoords.length === 0) {
        // Fallback to a straight line linking source and destination so the mapping UI never breaks
        pathCoords = [
            { lat: srcCoords.lat, lng: srcCoords.lng },
            { lat: dstCoords.lat, lng: dstCoords.lng }
        ];
    }

    // 3. Ask the Python AI Service to evaluate the true physical route
    let safestRoute = {
        source: srcCoords.name,
        destination: dstCoords.name,
        path_coordinates: pathCoords
    };
    let highestScore = 80; // Fallback score
    let aiAnalysis = null;

    try {
        const postData = JSON.stringify({
            time_of_day_hour: new Date().getHours(),
            coordinates: pathCoords
        });
        
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000/predict_safety';
        const aiData = await makePostRequest(aiServiceUrl, postData);
        if(aiData && aiData.overall_safety_score) {
            highestScore = aiData.overall_safety_score;
            aiAnalysis = aiData;
        }

    } catch(e) {
        console.error("Failed to reach Python AI Microservice:", e.message);
    }

    // 4. Return the exact mapped route and AI data to React 
    res.json({ 
        route: safestRoute, 
        safety_score: highestScore,
        ai_analysis: aiAnalysis 
    });

  } catch (error) {
    console.error("Route Prediction Error Breakdown:", error);
    res.status(500).json({ error: error.message || 'Internal server error while processing the route.' });
  }
};
