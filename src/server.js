import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
import routeRatingRoutes from './routes/routeRatingRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api', routeRoutes);
app.use('/api', incidentRoutes);
app.use('/api', sosRoutes);
app.use('/api', routeRatingRoutes);
app.use('/api', chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
