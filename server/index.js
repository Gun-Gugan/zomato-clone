import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import mealTypeRoutes from './routes/mealTypeRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import contactRouter from './routes/contact.js';

dotenv.config();
const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://zomato-clone-client.onrender.com'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api', contactRouter);
app.use('/api/meal-types', mealTypeRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Zomato Clone Backend is running successfully!");
});

// Catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port);
  })
  .catch(() => {
    process.exit(1);
  });
