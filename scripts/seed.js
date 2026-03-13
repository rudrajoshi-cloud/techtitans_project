import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Route from '../src/models/Route.js';
import SafeZone from '../src/models/SafeZone.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Route.deleteMany({});
    await SafeZone.deleteMany({});

    const routes = [
      {
        route_id: 'ROUTE_001',
        source: 'Downtown',
        destination: 'University',
        path_coordinates: [
          { lat: 28.6139, lng: 77.2090 },
          { lat: 28.6200, lng: 77.2150 }
        ],
        safety_score: 85
      },
      {
        route_id: 'ROUTE_002',
        source: 'Downtown',
        destination: 'University',
        path_coordinates: [
          { lat: 28.6139, lng: 77.2090 },
          { lat: 28.6180, lng: 77.2120 }
        ],
        safety_score: 92
      }
    ];

    const safeZones = [
      { zone_id: 'ZONE_001', location: { lat: 28.6139, lng: 77.2090 }, type: 'Police Station' },
      { zone_id: 'ZONE_002', location: { lat: 28.6200, lng: 77.2150 }, type: 'Hospital' }
    ];

    await Route.insertMany(routes);
    await SafeZone.insertMany(safeZones);

    console.log('Seed data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
