import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  incident_id: { type: String, required: true, unique: true },
  location: { lat: Number, lng: Number },
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  reported_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Incident', incidentSchema);
