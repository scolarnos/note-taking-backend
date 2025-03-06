import { config } from 'dotenv';
import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';

// Load environment variables
config();

// Debugging log
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT);

const app = express();

// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',                          // Local development
  'https://note-taking-nqjg2e5ce-scolarnos-projects.vercel.app' // Deployed frontend
];

// Middleware
app.use(json());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman) or if origin is in allowedOrigins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization,User-ID',
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Connect to MongoDB
connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});