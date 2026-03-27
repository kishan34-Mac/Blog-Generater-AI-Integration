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
        if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
        if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
        await mongoose.connect(process.env.MONGODB_URI, { dbName: 'blog-generator' });
        console.log('Connected to MongoDB Atlas');

        const port = process.env.PORT || 4000;
        app.listen(port, () => console.log(`Server listening on port ${port}`));
    } catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
};

start();
