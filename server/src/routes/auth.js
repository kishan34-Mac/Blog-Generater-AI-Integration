const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const signToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email, fullName: user.fullName }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

router.post('/signup', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;
        if (!email || !password || !fullName) return res.status(400).json({ error: 'Missing fields' });

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already in use' });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash, fullName });
        const token = signToken(user);
        res.json({ token, user: { id: user._id, email: user.email, fullName: user.fullName } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(400).json({ error: 'Invalid credentials' });

        const token = signToken(user);
        res.json({ token, user: { id: user._id, email: user.email, fullName: user.fullName } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/me', async (req, res) => {
    try {
        const auth = req.header('Authorization');
        if (!auth) return res.status(401).json({ error: 'No authorization header' });

        const parts = auth.split(' ');
        if (parts.length !== 2) return res.status(401).json({ error: 'Invalid authorization header' });

        const token = parts[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-passwordHash');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Unauthorized' });
    }
});

module.exports = router;
