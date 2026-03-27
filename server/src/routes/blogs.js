const express = require('express');
const Blog = require('../models/Blog');
const jwt = require('jsonwebtoken');

const router = express.Router();

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || process.env.SECRET || process.env.AUTH_SECRET;
    if (!secret) {
        throw new Error('Missing JWT secret. Set JWT_SECRET, JWT_SECRET_KEY, SECRET, or AUTH_SECRET.');
    }
    return secret;
};

const authMiddleware = (req, res, next) => {
    const auth = req.header('Authorization');
    if (!auth) return res.status(401).json({ error: 'No authorization header' });
    const parts = auth.split(' ');
    if (parts.length !== 2) return res.status(401).json({ error: 'Invalid authorization header' });
    const token = parts[1];
    try {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

router.get('/', authMiddleware, async (req, res) => {
    try {
        const blogs = await Blog.find({ userId: req.user.id }).sort({ created_at: -1 });
        res.json({ blogs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        if (!blog) return res.status(404).json({ error: 'Not found' });
        if (String(blog.userId) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
        res.json({ blog });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { topic, tone, word_count, title, meta_description, content, keywords } = req.body;
        const blog = await Blog.create({
            userId: req.user.id,
            topic,
            tone,
            word_count,
            title,
            meta_description,
            content,
            keywords,
        });
        res.json({ blog });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating blog' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        if (!blog) return res.status(404).json({ error: 'Not found' });
        if (String(blog.userId) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
        await blog.remove();
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting blog' });
    }
});

module.exports = router;
