import express from 'express';
import { reportSafetyIncident, getHeatmapData } from '../controllers/incidentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/reportIncident', protect, reportSafetyIncident); // Kept the same path for frontend compatibility
router.get('/reports/heatmap', getHeatmapData); // Public read-only heatmap dataset

export default router;
