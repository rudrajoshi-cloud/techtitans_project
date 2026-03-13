import express from 'express';
import { predictRoute } from '../controllers/routeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/predictRoute', protect, predictRoute);

export default router;
