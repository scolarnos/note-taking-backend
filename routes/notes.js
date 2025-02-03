import { Router } from 'express';
import pkg from 'jsonwebtoken';
import Note from '../models/Note.js';

const { verify } = pkg;
const router = Router();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Expect "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    try {
        const decoded = verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

// Create Note
router.post('/', verifyToken, async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Content is required.' });
    }

    try {
        const newNote = new Note({
            userId: req.userId,
            content,
        });
        await newNote.save();

        res.status(201).json(newNote);
    } catch (err) {
        res.status(500).json({ message: 'Error creating note.', error: err.message });
    }
});

// Get All Notes
router.get('/', verifyToken, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.userId }); // FIXED
        res.status(200).json(notes);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching notes.', error: err.message });
    }
});

// Update Note
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Content is required.' });
    }

    try {
        const updatedNote = await Note.findByIdAndUpdate( // FIXED
            id,
            { content },
            { new: true }
        );

        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found.' });
        }

        res.status(200).json(updatedNote);
    } catch (err) {
        res.status(500).json({ message: 'Error updating note.', error: err.message });
    }
});

// Delete Note
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedNote = await Note.findByIdAndDelete(id); // FIXED

        if (!deletedNote) {
            return res.status(404).json({ message: 'Note not found.' });
        }

        res.status(200).json({ message: 'Note deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting note.', error: err.message });
    }
});

export default router;
