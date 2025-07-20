const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  googleId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot exceed 200 characters'],
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  stats: {
    totalQuizzes: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
  },
  quizzesTaken: [{
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    score: Number,
    completedAt: { type: Date, default: Date.now },
    timeSpent: Number, // in seconds
    answers: [{
      questionId: mongoose.Schema.Types.ObjectId,
      selectedAnswer: String,
      isCorrect: Boolean
    }]
  }],
  achievements: [{
    name: String,
    description: String,
    unlockedAt: { type: Date, default: Date.now },
    icon: String
  }],
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' },
    categories: [String], // Preferred categories
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ 'stats.xp': -1 }); // For leaderboards

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate level based on XP
userSchema.virtual('calculatedLevel').get(function() {
  return Math.floor(this.stats.xp / 1000) + 1;
});

// Update level when XP changes
userSchema.pre('save', function(next) {
  this.stats.level = Math.floor(this.stats.xp / 1000) + 1;
  next();
});

module.exports = mongoose.model('User', userSchema);