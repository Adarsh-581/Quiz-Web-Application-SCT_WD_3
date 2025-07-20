require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./mongoose');
const authRoutes = require('./auth');
const passport = require('./passport');
const session = require('express-session');
const userRoutes = require('./user');
const quizRoutes = require('./quiz');
const adminRoutes = require('./admin');
const leaderboardRoutes = require('./leaderboard');

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration - allow both development ports
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL
].filter(Boolean);

// Middleware
app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET || 'quizsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // Set to true if using HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

// Health check route
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: { message: 'Something went wrong!' }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed CORS origins:', allowedOrigins);
}); 