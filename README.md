# SponsorHub - Sponsor Management Application

A comprehensive sponsor management application for tracking sponsorships, managing deliverables, handling attendee tickets, and maintaining sponsor relationships.

## Features

- 🔐 Secure login with password protection
- 📊 Sponsor tracking and management
- 📋 Deliverable status tracking
- 🎟️ Ticket allocation
- 📅 Calendar and task management
- 💰 Financial reporting
- 📈 Yearly analytics
- ⚙️ User settings and preferences

## Local Development

```bash
# Install dependencies
npm install

# Create .env file with your credentials
cp .env.example .env
# Edit .env with your credentials

# Start the app
npm start
```

Access at `http://localhost:3000`

## Deployment to Render (Free)

### Step 1: Push to GitHub

```bash
# Initialize git repo (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create a GitHub repository and push
git remote add origin https://github.com/yourusername/sponsor-app.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com) and sign up (free)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Fill in the form:
   - **Name**: sponsor-app
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. Add Environment Variables:
   - `ADMIN_EMAIL`: your-email@example.com
   - `ADMIN_PASSWORD_HASH`: your-bcrypt-hash
   - `SESSION_SECRET`: generate-a-random-string
   - `NODE_ENV`: production
6. Click "Create Web Service"

### Step 3: Get Your URL

Once deployed, Render will give you a URL like `sponsor-app.onrender.com`

Access your app at: `https://sponsor-app.onrender.com`

## Environment Variables

Create a `.env` file with:

```
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD_HASH=your-bcrypt-hash
SESSION_SECRET=random-secret-key
PORT=3000
NODE_ENV=development
```

**Note**: For production, use strong, unique values for SESSION_SECRET and ADMIN_PASSWORD_HASH.

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS templates, Tailwind CSS
- **Authentication**: bcryptjs, express-session
- **Charts**: Chart.js
- **Database**: In-memory (ready for Firebase/PostgreSQL integration)

## License

ISC
