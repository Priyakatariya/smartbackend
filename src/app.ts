// express-backend/src/app.ts
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import userRoutes from './routes/user';
import wasteListingRoutes from './routes/wasteListing';
import authRoutes from './routes/auth'; // Auth routes import kiya

const app = express();

connectDB();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/api/users', userRoutes);
app.use('/api/listings', wasteListingRoutes);
app.use('/api/auth', authRoutes); // Auth routes use kiya

app.get('/', (req, res) => {
  res.send('Express Backend for Smart Waste Swaraj is Running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));