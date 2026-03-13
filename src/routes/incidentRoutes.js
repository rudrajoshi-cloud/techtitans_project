import express from 'express';
import { reportIncident } from '../controllers/incidentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/reportIncident', protect, reportIncident);

export default router;
