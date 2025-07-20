const express = require('express');
const passport = require('passport');
const User = require('./models/User');
const { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  validateEmail, 
  validatePassword, 
  validateName,
  createRateLimit 
} = require('./middleware/authHelpers');

const router = express.Router();

// Rate limiting for auth endpoints
const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes

// Enhanced Registration with validation
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: { message: 'Name, email, and password are required' }
      });
    }

    if (!validateName(name)) {
      return res.status(400).json({ 
        success: false,
        error: { message: 'Name must be between 2-50 characters' }
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false,
        error: { message: 'Please enter a valid email address' }
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        success: false,
        error: { message: 'Password must be at least 6 characters long' }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        error: { message: 'Email already registered. Please use a different email.' }
      });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword
    });

    // Generate token
    const token = generateToken(user);

    // Return user in frontend-expected format
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      level: user.stats.level,
      xp: user.stats.xp,
      totalQuizzes: user.stats.totalQuizzes,
      averageScore: user.stats.averageScore,
      currentStreak: user.stats.streak,
      joinDate: user.createdAt,
      lastLogin: user.lastLoginAt,
      achievements: user.achievements.map(a => a.name),
      preferences: {
        theme: user.preferences.theme,
        difficulty: user.preferences.difficulty,
        notifications: user.preferences.notifications.email,
        preferredCategories: user.preferences.categories
      }
    };

    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      token, 
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false,
        error: { message: 'Email already registered' }
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false,
        error: { message: messages.join('. ') }
      });
    }

    res.status(500).json({ 
      success: false,
      error: { message: 'Registration failed. Please try again.' }
    });
  }
});

// Enhanced Login
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password || typeof email !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: { message: 'Email and password are required' }
      });
    }

    // Find user and include password for verification
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: { message: 'Invalid email or password' }
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        error: { message: 'Account is deactivated. Please contact support.' }
      });
    }

    // Verify password
    if (!user.password) {
      return res.status(401).json({ 
        success: false,
        error: { message: 'Please use Google Sign-in for this account' }
      });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        error: { message: 'Invalid email or password' }
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Return user in frontend-expected format
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      level: user.stats.level,
      xp: user.stats.xp,
      totalQuizzes: user.stats.totalQuizzes,
      averageScore: user.stats.averageScore,
      currentStreak: user.stats.streak,
      joinDate: user.createdAt,
      lastLogin: user.lastLoginAt,
      achievements: user.achievements.map(a => a.name),
      preferences: {
        theme: user.preferences.theme,
        difficulty: user.preferences.difficulty,
        notifications: user.preferences.notifications.email,
        preferredCategories: user.preferences.categories
      }
    };

    res.json({ 
      success: true,
      message: `Welcome back, ${user.name}!`,
      token, 
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: { message: 'Login failed. Please try again.' }
    });
  }
});

// GET /api/auth/me - Frontend expects this for user verification
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: { message: 'Access token required' }
      });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quiz-secret-key');
    
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false,
        error: { message: 'Invalid token' }
      });
    }

    // Return user in frontend-expected format
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      level: user.stats.level,
      xp: user.stats.xp,
      totalQuizzes: user.stats.totalQuizzes,
      averageScore: user.stats.averageScore,
      currentStreak: user.stats.streak,
      joinDate: user.createdAt,
      lastLogin: user.lastLoginAt,
      achievements: user.achievements.map(a => a.name),
      preferences: {
        theme: user.preferences.theme,
        difficulty: user.preferences.difficulty,
        notifications: user.preferences.notifications.email,
        preferredCategories: user.preferences.categories
      }
    };

    res.json({ 
      success: true,
      user: userResponse
    });
  } catch (error) {
    res.status(401).json({ 
      success: false,
      error: { message: 'Invalid token' }
    });
  }
});

// Google OAuth routes remain the same
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), 
async (req, res) => {
  try {
    const token = generateToken(req.user);
    
    // Redirect to frontend with token
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendURL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

// Token validation endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quiz-secret-key');
    
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ 
      valid: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;