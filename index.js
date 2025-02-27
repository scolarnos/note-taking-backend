import { config } from 'dotenv';
import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';

// Load environment variables
config();

// Debugging log
console.log('MONGO_URI:', process.env.MONGO_URI); // Should print the URI
console.log('JWT_SECRET:', process.env.JWT_SECRET); // Should print your secret
console.log('PORT:', process.env.PORT); // Should print 5000

const app = express();

// Middleware
app.use(json());
app.use(cors({
    origin: ["http://localhost:5173"], // Only allow your local frontend for now
    credentials: true, // Allows cookies and authorization headers
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Connect to MongoDB
connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});