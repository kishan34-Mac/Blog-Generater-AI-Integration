# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/261125cb-d975-41a1-9f4c-47fd3cc0caa3

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/261125cb-d975-41a1-9f4c-47fd3cc0caa3) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Backend server (MongoDB / Express)

This project now includes a small Express backend for authentication and blog CRUD that uses MongoDB Atlas.

Setup steps:

1. Go into the `server` directory:

```bash
cd server
```

2. Create a `.env` file from the example and set your `MONGODB_URI` and `JWT_SECRET`:

```bash
cp .env.example .env
# edit .env and fill in the values
```

3. Install and run the server in development:

```bash
npm install
npm run dev
```

4. Add this line to the frontend `.env` file in the project root (or set it in your environment):

```
VITE_API_BASE="http://localhost:4000"
```

This backend exposes the following endpoints:

- POST `/api/auth/signup` - create a new user
- POST `/api/auth/login` - authenticate and receive a JWT
- GET `/api/auth/me` - returns the current user for a valid token
- GET `/api/blogs` - returns a user's blogs (protected)
- POST `/api/blogs` - create a blog (protected)
- GET `/api/blogs/:id` - get a specific blog (protected)
- DELETE `/api/blogs/:id` - delete a blog (protected)

If you want to use MongoDB Atlas in production, ensure you keep your `MONGODB_URI` and `JWT_SECRET` secure and configure CORS to match your real frontend host.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/261125cb-d975-41a1-9f4c-47fd3cc0caa3) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
