# Ultimate Quiz Web Application

A world-class, production-grade Quiz Web Platform with a React TypeScript frontend and Node.js Express backend. This application features complete user authentication, interactive quizzes, leaderboards, achievements, and a beautiful modern UI.

## 🚀 Features

### Frontend Features
- **Complete Authentication System** - Login, signup, profile management
- **Advanced Dashboard** - Analytics, performance tracking, progress charts
- **Comprehensive Quiz System** - Category-based quizzes with real-time interface
- **Enhanced Leaderboard** - Global and category-specific rankings
- **Professional Settings** - Theme switching, preferences, notifications
- **Social Features** - User profiles, achievements, gamification
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Dark Mode Support** - Automatic theme switching
- **Real-time Updates** - Live data synchronization
- **Professional Animations** - Smooth transitions with Framer Motion

### Backend Features
- **JWT Authentication** - Secure token-based authentication
- **User Management** - Complete user profiles with stats and achievements
- **Quiz Management** - Dynamic quiz generation and scoring
- **Leaderboard System** - Global and category rankings
- **Achievement System** - Gamification with unlockable achievements
- **Rate Limiting** - Built-in security with request limiting
- **Input Validation** - Comprehensive validation for all endpoints
- **Error Handling** - Centralized error handling with proper HTTP status codes

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests
- **Express Rate Limit** for security
- **Express Validator** for input validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd QuizWebApplication

# Install frontend dependencies
cd project
npm install

# Install backend dependencies
cd ../server
npm install
```

### 2. Environment Configuration

#### Backend Environment (.env file in server directory)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/quiz-app
# OR for MongoDB Atlas:
# MONGODB_URI=YOUR_MONGODB_URI

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=7d

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Session Secret
SESSION_SECRET=your-session-secret-key-here
```

#### Frontend Environment (.env file in project directory)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=QuizMaster
VITE_APP_VERSION=1.0.0

# Optional: Analytics and tracking
VITE_GOOGLE_ANALYTICS_ID=your_ga_id_here
```

### 3. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update the `MONGODB_URI` in your backend .env file

### 4. Start the Application

#### Terminal 1: Start Backend Server
```bash
cd server
npm start
# or for development with auto-restart:
npm run dev
```

The backend server will start on `http://localhost:5000`

#### Terminal 2: Start Frontend Development Server
```bash
cd project
npm run dev
```

The frontend application will start on `http://localhost:5173`

### 5. Access the Application

Open your browser and navigate to `http://localhost:5173`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/auth/me`
Get current user profile (requires authentication).

### User Endpoints

#### PUT `/user/profile`
Update user profile (requires authentication).

#### GET `/user/dashboard`
Get user dashboard data (requires authentication).

#### GET `/user/achievements`
Get user achievements (requires authentication).

### Quiz Endpoints

#### GET `/quiz/categories`
Get all available quiz categories.

#### GET `/quiz/category/:category`
Get quiz questions for a specific category.

#### POST `/quiz/submit`
Submit quiz answers (requires authentication).

#### GET `/quiz/history`
Get user's quiz history (requires authentication).

### Leaderboard Endpoints

#### GET `/leaderboard/global`
Get global leaderboard.

#### GET `/leaderboard/category/:category`
Get category-specific leaderboard.

#### GET `/leaderboard/rank`
Get user's current rank (requires authentication).

## 🗂 Project Structure

```
QuizWebApplication/
├── project/                 # Frontend React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Main application pages
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Application entry point
│   ├── package.json
│   └── vite.config.ts
└── server/                  # Backend Node.js application
    ├── models/              # Database models
    ├── middleware/          # Express middleware
    ├── auth.js              # Authentication routes
    ├── user.js              # User management routes
    ├── quiz.js              # Quiz management routes
    ├── leaderboard.js       # Leaderboard routes
    ├── index.js             # Server entry point
    └── package.json
```

## 🔧 Development

### Frontend Development
```bash
cd project
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd server
npm run dev          # Start with nodemon (auto-restart)
npm start            # Start production server
npm test             # Run tests
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd project
npm run build
# Deploy the dist/ folder to your hosting platform
```

### Backend Deployment (Heroku/Railway)
```bash
cd server
# Set environment variables in your hosting platform
# Deploy the server directory
```

## 🧪 Testing

### Frontend Testing
```bash
cd project
npm test             # Run tests
npm run test:coverage # Run tests with coverage
```

### Backend Testing
```bash
cd server
npm test             # Run tests
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- Input validation and sanitization
- CORS protection
- Secure session management

## 🎨 UI/UX Features

- Responsive design for all devices
- Dark/Light theme support
- Smooth animations and transitions
- Intuitive navigation
- Real-time feedback and notifications
- Progress tracking and analytics
- Gamification elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🎯 Roadmap

- [ ] Real-time multiplayer quizzes
- [ ] Advanced analytics dashboard
- [ ] Social features (friends, challenges)
- [ ] Mobile app development
- [ ] AI-powered question generation
- [ ] Integration with learning management systems

---

**Built with ❤️ using modern web technologies** 
