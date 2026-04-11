# ✨ BlogGenius AI: Intelligent Blog Generation Platform

Welcome to **BlogGenius AI**! This project is a full-stack application designed to streamline the blog creation process by leveraging AI capabilities. Users can generate blog content, manage their posts, and interact with a modern, responsive interface.

## 📖 Overview

BlogGenius AI provides a comprehensive solution for creating blog posts with the power of artificial intelligence. It features a robust backend for user authentication, blog storage, and AI integration, complemented by a sleek, component-rich frontend. Whether you're a content creator looking to accelerate your workflow or a developer exploring AI-powered applications, BlogGenius AI offers a solid foundation.

## ⭐ Features

Based on the repository structure, BlogGenius AI is equipped with the following capabilities:

*   **AI-Powered Blog Generation**: Generate compelling blog content using integrated AI services (details on specific AI provider are inferred to be configurable in the backend).
*   **User Authentication**: Secure user registration and login functionality using JWT.
*   **Blog Management**: Users can create, view, and manage their generated blog posts through a personalized dashboard.
*   **Responsive User Interface**: A modern, aesthetically pleasing, and adaptive UI built with React and Tailwind CSS, utilizing Shadcn UI components for a consistent experience across devices.
*   **Dedicated Generation Page**: A specific interface for users to input prompts and initiate AI content generation.
*   **Comprehensive Dashboard**: An intuitive dashboard for users to oversee their blogs and navigate the application.
*   **Context-based Authentication**: Global authentication context for seamless user session management across the frontend.

## 🛠️ Tech Stack

This project is built using a modern and powerful tech stack for both frontend and backend development.

### Frontend

*   **TypeScript**: Enhances code quality and developer experience with static typing.
*   **React**: A declarative, component-based JavaScript library for building user interfaces.
*   **Vite**: A fast, opinionated build tool for modern web projects.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
*   **Shadcn UI**: A collection of beautiful, re-usable UI components built with Radix UI and Tailwind CSS.
*   **Bun**: A fast all-in-one JavaScript runtime (used as package manager).

### Backend

*   **Node.js**: A JavaScript runtime for server-side execution.
*   **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
*   **MongoDB**: A NoSQL, document-oriented database for flexible data storage.
*   **Mongoose**: An ODM (Object Data Modeling) library for MongoDB and Node.js.
*   **JWT (JSON Web Tokens)**: For secure, stateless user authentication.
*   **AI Service Integration**: Connects to an external AI API for content generation (specific API provider inferred to be configurable).

### Deployment

*   **Render**: Configuration for easy deployment of both frontend and backend services.

## 📂 Project Structure

The repository is organized into distinct directories for the client-side (frontend) and server-side (backend) applications.

```
.
├── .env.example              # Example environment variables for the root (client)
├── bun.lockb                 # Bun lockfile for frontend dependencies
├── components.json           # Shadcn UI configuration
├── public/                   # Static assets for the client
├── render.yaml               # Render deployment configuration
├── server/                   # Backend application
│   ├── .env.example          # Example environment variables for the server
│   ├── package.json          # Server dependencies (npm/yarn)
│   ├── src/                  # Server source code
│   │   ├── index.js          # Server entry point
│   │   ├── models/           # Mongoose schemas for MongoDB
│   │   │   ├── Blog.js
│   │   │   └── User.js
│   │   └── routes/           # API routes for authentication, blogs, and AI generation
│   │       ├── auth.js
│   │       ├── blogs.js
│   │       └── generate.js
│   └── ...                   # Other server files
├── src/                      # Frontend application
│   ├── App.tsx               # Main React application component
│   ├── components/           # Reusable React components
│   │   └── ui/               # Shadcn UI components
│   ├── contexts/             # React Context API for global state (e.g., Auth)
│   │   └── AuthContext.tsx
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Page-level components (e.g., Dashboard, Auth)
│   │   ├── Auth.tsx
│   │   ├── BlogView.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Generate.tsx
│   │   └── Index.tsx
│   └── ...                   # Other frontend files (index.css, main.tsx, lib, etc.)
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite build configuration
```

## 🚀 Installation

Follow these steps to set up BlogGenius AI locally.

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: [Download & Install](https://nodejs.org/en/download/) (LTS version recommended)
*   **npm** (Node Package Manager) or **Yarn**: Usually comes with Node.js.
*   **Bun**: [Installation Guide](https://bun.sh/docs/installation)
*   **MongoDB**: [Installation Guide](https://docs.mongodb.com/manual/installation/) (or use a cloud service like MongoDB Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/kishan34-Mac/Blog-Generater-AI-Integration.git
cd Blog-Generater-AI-Integration
```

### 2. Backend Setup (`server` directory)

```bash
cd server
```

#### Install Dependencies

```bash
npm install # or yarn install
```

#### Environment Variables

Create a `.env` file in the `server/` directory by copying `.env.example`:

```bash
cp .env.example .env
```

Open the newly created `.env` file and configure the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string # e.g., mongodb://localhost:27017/bloggenius
JWT_SECRET=a_very_secret_key
AI_API_KEY=your_ai_service_api_key # e.g., OpenAI API Key
```

Replace `your_mongodb_connection_string`, `a_very_secret_key`, and `your_ai_service_api_key` with your actual values.

#### Start the Backend Server

```bash
npm start # or node src/index.js
```

The backend server should now be running on `http://localhost:5000` (or your specified PORT).

### 3. Frontend Setup (Root directory)

Open a new terminal window or tab and navigate back to the root of the project:

```bash
cd .. # if you are still in the server directory
```

#### Install Dependencies (using Bun)

```bash
bun install
```

#### Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Open the newly created `.env` file and configure the following variables:

```env
VITE_API_BASE_URL=http://localhost:5000 # Make sure this matches your backend server address and port
```

#### Start the Frontend Development Server

```bash
bun dev
```

The frontend application should now be running, typically on `http://localhost:5173` (or another available port).

## ▶️ Usage

1.  **Access the Application**: Open your web browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
2.  **Register/Login**: If you're a new user, sign up for an account. Otherwise, log in with your existing credentials.
3.  **Generate Blogs**: Navigate to the "Generate" page, input your topic or prompt, and let the AI create blog content for you.
4.  **Manage Blogs**: Visit your "Dashboard" to view all your generated blog posts.

## 📝 Notes

This project demonstrates a robust architecture for AI integration in web applications. The clear separation of concerns between the frontend and backend, along with modern development practices, makes it an excellent starting point for further enhancements and customizations. 
