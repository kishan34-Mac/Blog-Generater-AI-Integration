const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

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

const app = express();
app.use(express.json());

const allowedOrigins = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN
        .split(',')
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean)
    : [];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        const normalizedOrigin = origin.replace(/\/+$/, "");
        if (allowedOrigins.length === 0 || allowedOrigins.includes(normalizedOrigin)) {
            return callback(null, true);
        }

        console.warn('Blocked CORS origin:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

const start = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || process.env.DATABASE_URL;
        const jwtSecret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || process.env.SECRET || process.env.AUTH_SECRET;

        console.log('Backend starting', {
            PORT: process.env.PORT || '4000',
            HAS_MONGODB_URI: !!process.env.MONGODB_URI,
            HAS_MONGO_URI: !!process.env.MONGO_URI,
            HAS_MONGO_URL: !!process.env.MONGO_URL,
            HAS_DATABASE_URL: !!process.env.DATABASE_URL,
            HAS_JWT_SECRET: !!process.env.JWT_SECRET,
            HAS_JWT_SECRET_KEY: !!process.env.JWT_SECRET_KEY,
            HAS_SECRET: !!process.env.SECRET,
            HAS_AUTH_SECRET: !!process.env.AUTH_SECRET,
            FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'not-set',
        });

        if (!mongoUri) {
            throw new Error('Missing MongoDB URI. Set one of: MONGODB_URI, MONGO_URI, MONGO_URL, DATABASE_URL');
        }
        if (!jwtSecret) {
            throw new Error('Missing JWT secret. Set one of: JWT_SECRET, JWT_SECRET_KEY, SECRET, AUTH_SECRET');
        }

        await mongoose.connect(mongoUri, { dbName: 'blog-generator' });
        console.log('Connected to MongoDB Atlas');

        const port = parseInt(process.env.PORT, 10) || 4000;
        app.listen(port, () => console.log(`Server listening on port ${port}`));
    } catch (err) {
        const knownKeys = Object.keys(process.env).filter((key) =>
            ['MONGODB_URI', 'MONGO_URI', 'MONGO_URL', 'DATABASE_URL', 'JWT_SECRET', 'JWT_SECRET_KEY', 'SECRET', 'AUTH_SECRET'].includes(key),
        );
        console.error('Failed to start server', err);
        if (err && err.name === 'MongooseServerSelectionError') {
            console.error('MongoDB Atlas connection failed. Check your cluster IP access list / whitelist and make sure Render can connect. For testing, allow 0.0.0.0/0 in Atlas network access.');
        }
        console.error('Available env keys:', knownKeys);
        process.exit(1);
    }
};

start();
