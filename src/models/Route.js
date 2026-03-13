import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  route_id: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  path_coordinates: [{ lat: Number, lng: Number }],
  safety_score: { type: Number, min: 0, max: 100 }
}, { timestamps: true });

export default mongoose.model('Route', routeSchema);
