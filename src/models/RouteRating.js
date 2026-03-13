import mongoose from 'mongoose';

const RouteRatingSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  start_location: {
    type: String,
    required: true,
    lowercase: true,
  },
  destination: {
    type: String,
    required: true,
    lowercase: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  }
}, { timestamps: true });

// Prevent a user from rating the same route multiple times
RouteRatingSchema.index({ user_id: 1, start_location: 1, destination: 1 }, { unique: true });

export default mongoose.model('RouteRating', RouteRatingSchema);
