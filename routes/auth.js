import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const existingUserByName = await User.findOne({ name });
    if (existingUserByName) {
      return res.status(400).json({ message: 'User with this name already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });

    // Generate JWT token and save it to the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.token = token;
    await user.save();

    res.status(201).json({ token, userId: user._id }); // Return token and userId to frontend
  } catch (error) {
    console.error('Signup Error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      res.status(400).json({ message: `User with this ${field} already exists` });
    } else {
      res.status(500).json({ message: 'Error creating user.', error: error.message });
    }
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate new token and update in the database
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.token = token;
    await user.save();

    res.json({ token, userId: user._id }); // Return token and userId to frontend
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Find the user with this token in the database
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, userId: decoded.id });
  } catch (error) {
    console.error('Verify Error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;