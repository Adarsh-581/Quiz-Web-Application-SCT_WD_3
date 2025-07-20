const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'quiz-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

// Hash Password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

// Compare Password
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// JWT Authentication Middleware
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    } else {
      return res.status(500).json({ error: 'Token verification failed.' });
    }
  }
};

// Admin Authorization Middleware
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

// Rate Limiting Helper
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old attempts
    for (const [ip, times] of attempts.entries()) {
      attempts.set(ip, times.filter(time => time > windowStart));
      if (attempts.get(ip).length === 0) {
        attempts.delete(ip);
      }
    }
    
    // Check current attempts
    const currentAttempts = attempts.get(key) || [];
    
    if (currentAttempts.length >= max) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current attempt
    currentAttempts.push(now);
    attempts.set(key, currentAttempts);
    
    next();
  };
};

// Input validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateName = (name) => {
  return name && name.trim().length >= 2 && name.length <= 50;
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  authenticateJWT,
  authorizeAdmin,
  createRateLimit,
  validateEmail,
  validatePassword,
  validateName
};