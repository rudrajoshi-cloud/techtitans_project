import mongoose from 'mongoose';

const safetyReportSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  latitude: { 
    type: Number, 
    required: true 
  },
  longitude: { 
    type: Number, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['Harassment reported', 'Poor lighting', 'Unsafe area', 'Suspicious activity', 'Safe zone'],
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

export default mongoose.model('SafetyReport', safetyReportSchema);
