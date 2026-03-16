import express from 'express';
import { handleChat } from '../controllers/chatController.js';

const router = express.Router();

// The chat assistant is now public so it works immediately
router.post('/chat', handleChat);

export default router;
