const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// ✅ Fix IPv6 / SRV DNS lookup issues in Node 17+ on Render/Cloud environments
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}
try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
    console.warn('Could not override DNS servers:', e.message);
}

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');
const generateRoutes = require('./routes/generate');

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIXED CORS (IMPORTANT)
const normalizeOrigin = (value) => {
    if (!value || typeof value !== 'string') return null;
    let origin = value.trim().replace(/\/+$/, '');
    if (!origin.match(/^https?:\/\//i)) {
        origin = `https://${origin}`;
    }
    return origin;
};

const rawFrontendOrigin = process.env.FRONTEND_ORIGIN || 'https://blog-generater-ai-integration.vercel.app';
const allowedOrigin = normalizeOrigin(rawFrontendOrigin);
const allowedOrigins = [allowedOrigin].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
}));

// ✅ Routes
const handleHealthCheck = (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.status(200).json({
        status: 'ok',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatusMap[dbState] || 'unknown',
    });
};

app.get('/health', handleHealthCheck);
app.get('/api/health', handleHealthCheck);

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/generate', generateRoutes);

// ✅ Helper to connect to MongoDB with Retries
const connectWithRetry = async (mongoUri, retries = 5, delayMs = 4000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Connecting to MongoDB (attempt ${attempt}/${retries})...`);
            await mongoose.connect(mongoUri, {
                dbName: 'blog-generator',
                serverSelectionTimeoutMS: 5000,
            });
            console.log('✅ Connected to MongoDB successfully');
            return true;
        } catch (err) {
            console.error(`❌ MongoDB connection attempt ${attempt} failed:`, err.message);
            if (attempt < retries) {
                console.log(`Retrying in ${delayMs / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            } else {
                console.error('❌ All MongoDB connection retries exhausted.');
            }
        }
    }
    return false;
};

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

        const port = process.env.PORT || 4000;

        console.log('Backend starting', {
            PORT: port,
            FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'not-set',
        });

        if (!mongoUri) {
            console.error('❌ Missing MONGODB_URI environment variable');
        }

        if (!jwtSecret) {
            console.error('❌ Missing JWT_SECRET environment variable');
        }

        // Bind port immediately so Render health checks pass
        app.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);

            // Connect to MongoDB with retries
            if (mongoUri) {
                connectWithRetry(mongoUri);
            }

            // ✅ 5-Minute Health API Ping Schedule (Keep-Alive & Monitoring)
            const FIVE_MINUTES_MS = 5 * 60 * 1000;
            const healthPing = async () => {
                const baseUrl = process.env.BACKEND_URL || `http://localhost:${port}`;
                const healthUrl = `${baseUrl.replace(/\/+$/, '')}/api/health`;
                try {
                    const response = await fetch(healthUrl);
                    const data = await response.json();
                    console.log(`[Health Check Ping] ${new Date().toISOString()} - Status ${response.status}:`, data);
                } catch (err) {
                    console.warn(`[Health Check Ping Warning] ${new Date().toISOString()} - Ping error:`, err.message);
                }
            };

            // Run periodic ping every 5 minutes
            setInterval(healthPing, FIVE_MINUTES_MS);
        });
    } catch (err) {
        console.error('❌ Failed to start server', err);
    }
};

start();