import RouteRating from '../models/RouteRating.js';

export const submitRating = async (req, res) => {
  try {
    const { start_location, destination, rating } = req.body;
    // Fallback to a generic user ID if auth isn't strictly enforced for this demo yet
    const user_id = req.user?.id || req.body.user_id || 'anonymous_user';

    if (!start_location || !destination || !rating) {
      return res.status(400).json({ error: 'Start location, destination, and rating are required.' });
    }

    const start = start_location.toLowerCase().trim();
    const dest = destination.toLowerCase().trim();

    // Upsert the rating to allow the user to change their mind but not duplicate
    const newRating = await RouteRating.findOneAndUpdate(
      { user_id, start_location: start, destination: dest },
      { rating },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Rating submitted successfully.', data: newRating });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Server error while submitting rating.' });
  }
};

export const getRouteRatings = async (req, res) => {
  try {
    const { start_location, destination } = req.query;

    if (!start_location || !destination) {
      return res.status(400).json({ error: 'Start location and destination are required.' });
    }

    const start = start_location.toLowerCase().trim();
    const dest = destination.toLowerCase().trim();

    const ratings = await RouteRating.find({ start_location: start, destination: dest });

    if (ratings.length === 0) {
      return res.status(200).json({ 
        start_location: start, 
        destination: dest, 
        total_ratings: 0, 
        average_rating: 0 
      });
    }

    const total_ratings = ratings.length;
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const average_rating = (sum / total_ratings).toFixed(1);

    res.status(200).json({
      start_location: start,
      destination: dest,
      total_ratings,
      average_rating: parseFloat(average_rating)
    });

  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Server error while fetching ratings.' });
  }
};
