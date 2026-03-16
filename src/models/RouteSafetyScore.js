import mongoose from 'mongoose';

const routeSafetyScoreSchema = new mongoose.Schema({
  routeId: { 
    type: String, 
    required: true, 
    unique: true 
  }, // Typically a hash of start_location + destination
  start_location: { 
    type: String, 
    required: true 
  },
  destination: { 
    type: String, 
    required: true 
  },
  safetyScore: { 
    type: Number, 
    required: true 
  },
  ratingStars: { 
    type: Number, 
    required: true 
  },
  ai_analysis: {
    type: Object
  },
  last_calculated: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

export default mongoose.model('RouteSafetyScore', routeSafetyScoreSchema);
