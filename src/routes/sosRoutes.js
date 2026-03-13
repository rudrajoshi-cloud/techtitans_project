import express from 'express';
import { sendSOS } from '../controllers/sosController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/sos', protect, sendSOS);

export default router;
