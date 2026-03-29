const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
});

const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');
const generateRoutes = require('./routes/generate');

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIXED CORS (IMPORTANT)
const allowedOrigin = (
    process.env.FRONTEND_ORIGIN ||
    "https://blog-generater-ai-integration.vercel.app"
)
    .trim()
    .replace(/\/+$|\s+$/g, "");

app.use(cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/generate', generateRoutes);

// ✅ Start Server
const start = async () => {
    try {
        const mongoUri =
            process.env.MONGODB_URI ||
            process.env.MONGO_URI ||
            process.env.MONGO_URL ||
            process.env.DATABASE_URL;

        const jwtSecret =
            process.env.JWT_SECRET ||
            process.env.JWT_SECRET_KEY ||
            process.env.SECRET ||
            process.env.AUTH_SECRET;

        console.log('Backend starting', {
            PORT: process.env.PORT || '4000',
            FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'not-set',
        });

        if (!mongoUri) {
            throw new Error('Missing MongoDB URI');
        }

        if (!jwtSecret) {
            throw new Error('Missing JWT secret');
        }

        await mongoose.connect(mongoUri, { dbName: 'blog-generator' });
        console.log('✅ Connected to MongoDB');

        const port = process.env.PORT || 4000;
        app.listen(port, () =>
            console.log(`🚀 Server running on port ${port}`)
        );
    } catch (err) {
        console.error('❌ Failed to start server', err);
        process.exit(1);
    }
};

start();