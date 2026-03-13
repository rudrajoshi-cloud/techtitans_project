import express from 'express';
import { submitRating, getRouteRatings } from '../controllers/routeRatingController.js';

const router = express.Router();

router.post('/route/rating', submitRating);
router.get('/route/rating', getRouteRatings);

export default router;
