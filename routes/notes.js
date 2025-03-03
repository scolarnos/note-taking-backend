import express from 'express';
import jwt from 'jsonwebtoken';
import Note from '../models/Note.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to authenticate using userId
const authenticate = async (req, res, next) => {
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(401).json({ message: 'No user ID provided' });
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.token) {
      return res.status(401).json({ message: 'Invalid user ID or token' });
    }

    // Verify the token stored in the database
    jwt.verify(user.token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all notes for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id });
    res.json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new note
router.post('/', authenticate, async (req, res) => {
  const { title, content } = req.body;

  try {
    const note = new Note({ userId: req.user._id, title, content });
    await note.save();
    res.status(201).json({ note });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a note (e.g., for pinning)
router.put('/:id', authenticate, async (req, res) => {
  const { pinned } = req.body;

  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.pinned = pinned;
    await note.save();
    res.json({ note });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a note
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;