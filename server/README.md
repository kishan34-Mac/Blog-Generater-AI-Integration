# Blog Generator - Backend (MongoDB + Express)

This server provides authentication and blog CRUD functionality using MongoDB Atlas and JWT.

Prereqs

- Node 18+
- MongoDB Atlas cluster and connection string

Setup

1. Copy `.env.example` to `.env` and fill `MONGODB_URI` and `JWT_SECRET`.
2. Install dependencies:

```bash
cd server
npm install
```

3. Run the server in dev mode (with nodemon):

```bash
npm run dev
```

Environment variables

- MONGODB_URI: MongoDB Atlas URI (replace <username>, <password>, and <dbname>)
- JWT_SECRET: A secret string used to sign JWT tokens
- PORT: Optional server port (default 4000)
- FRONTEND_ORIGIN: Allowed origin for CORS (default http://localhost:5173)

Alternate variable names supported:

- `MONGODB_URI`, `MONGO_URI`, `MONGO_URL`, or `DATABASE_URL` will also be accepted for MongoDB
- `JWT_SECRET`, `JWT_SECRET_KEY`, `SECRET`, or `AUTH_SECRET` will also be accepted for JWT signing

Render deployment notes

If deploying to Render, use the `server` directory as the root for the service. Make sure these variables are configured in the Render dashboard:

- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_ORIGIN` = your frontend live URL
- `PORT` = `4000`

Missing any of these values will cause the backend to exit with status `1` on startup.

API endpoints

- POST /api/auth/signup => { email, password, fullName }
- POST /api/auth/login => { email, password }
- GET /api/auth/me => requires Authorization: Bearer <token>
- GET /api/blogs => list authenticated user's blogs
- POST /api/blogs => create blog (authenticated)
- GET /api/blogs/:id => get blog by id (authenticated)
- DELETE /api/blogs/:id => delete blog by id (authenticated)
