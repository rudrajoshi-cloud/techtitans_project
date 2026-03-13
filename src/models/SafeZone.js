import mongoose from 'mongoose';

const safeZoneSchema = new mongoose.Schema({
  zone_id: { type: String, required: true, unique: true },
  location: { lat: Number, lng: Number },
  type: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('SafeZone', safeZoneSchema);
