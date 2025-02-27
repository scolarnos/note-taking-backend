import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 
import dotenv from 'dotenv';

dotenv.config(); 

const router = Router();

// Signup route
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully. Please log in.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating user.', error: err.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, message: 'Login successful.' });
    } catch (err) {
        console.error("Login Error", err);
        res.status(500).json({ message: 'Error during login.', error: err.message });
    }
});

// Token Verification Route
router.get('/verify', (req, res) => {
    const authHeader = req.headers.authorization; // Correct header extraction
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ valid: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        res.json({ valid: true, userId: decoded.id }); // Return only user ID, not full token payload
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        res.status(401).json({ valid: false, message: "Invalid or expired token" });
    }
});


export default router;
