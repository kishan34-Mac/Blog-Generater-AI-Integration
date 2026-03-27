const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

const start = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        const jwtSecret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || process.env.SECRET;

        if (!mongoUri) throw new Error('MONGODB_URI or MONGO_URI is not set');
        if (!jwtSecret) throw new Error('JWT_SECRET, JWT_SECRET_KEY, or SECRET is not set');

        await mongoose.connect(mongoUri, { dbName: 'blog-generator' });
        console.log('Connected to MongoDB Atlas');

        const port = process.env.PORT || 4000;
        app.listen(port, () => console.log(`Server listening on port ${port}`));
    } catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
};

start();
