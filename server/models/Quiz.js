const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['technology', 'science', 'history', 'geography', 'literature', 'sports', 'entertainment', 'general-knowledge']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard', 'mixed']
  },
  answers: {
    type: [Number],
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0 // in milliseconds
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  xpEarned: {
    type: Number,
    required: true,
    min: 0
  },
  achievements: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
quizSchema.index({ userId: 1, createdAt: -1 });
quizSchema.index({ category: 1, percentage: -1 });
quizSchema.index({ userId: 1, category: 1 });
quizSchema.index({ createdAt: -1 });

// Virtual for formatted time spent
quizSchema.virtual('timeSpentFormatted').get(function() {
  const minutes = Math.floor(this.timeSpent / (1000 * 60));
  const seconds = Math.floor((this.timeSpent % (1000 * 60)) / 1000);
  return `${minutes}m ${seconds}s`;
});

// Virtual for difficulty color
quizSchema.virtual('difficultyColor').get(function() {
  switch (this.difficulty) {
    case 'easy': return 'green';
    case 'medium': return 'yellow';
    case 'hard': return 'red';
    default: return 'gray';
  }
});

// Static method to get user statistics
quizSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        totalScore: { $sum: '$score' },
        totalQuestions: { $sum: '$totalQuestions' },
        totalTime: { $sum: '$timeSpent' },
        totalXP: { $sum: '$xpEarned' },
        averageScore: { $avg: '$percentage' },
        bestScore: { $max: '$percentage' },
        totalAchievements: { $sum: { $size: '$achievements' } }
      }
    }
  ]);

  return stats[0] || {
    totalQuizzes: 0,
    totalScore: 0,
    totalQuestions: 0,
    totalTime: 0,
    totalXP: 0,
    averageScore: 0,
    bestScore: 0,
    totalAchievements: 0
  };
};

// Static method to get category statistics
quizSchema.statics.getCategoryStats = async function(userId) {
  return await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        averageScore: { $avg: '$percentage' },
        bestScore: { $max: '$percentage' },
        totalXP: { $sum: '$xpEarned' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get global leaderboard
quizSchema.statics.getGlobalLeaderboard = async function(limit = 20) {
  return await this.aggregate([
    {
      $group: {
        _id: '$userId',
        totalXP: { $sum: '$xpEarned' },
        totalQuizzes: { $sum: 1 },
        averageScore: { $avg: '$percentage' },
        bestScore: { $max: '$percentage' },
        totalAchievements: { $sum: { $size: '$achievements' } }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 1,
        name: '$user.name',
        email: '$user.email',
        avatar: '$user.avatar',
        level: '$user.level',
        totalXP: 1,
        totalQuizzes: 1,
        averageScore: 1,
        bestScore: 1,
        totalAchievements: 1
      }
    },
    { $sort: { totalXP: -1, averageScore: -1 } },
    { $limit: limit }
  ]);
};

// Static method to get category leaderboard
quizSchema.statics.getCategoryLeaderboard = async function(category, limit = 20) {
  return await this.aggregate([
    { $match: { category } },
    {
      $group: {
        _id: '$userId',
        totalQuizzes: { $sum: 1 },
        averageScore: { $avg: '$percentage' },
        bestScore: { $max: '$percentage' },
        totalXP: { $sum: '$xpEarned' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 1,
        name: '$user.name',
        email: '$user.email',
        avatar: '$user.avatar',
        level: '$user.level',
        totalQuizzes: 1,
        averageScore: 1,
        bestScore: 1,
        totalXP: 1
      }
    },
    { $sort: { averageScore: -1, totalQuizzes: -1 } },
    { $limit: limit }
  ]);
};

// Instance method to get formatted result
quizSchema.methods.getFormattedResult = function() {
  return {
    id: this._id,
    quizId: this.quizId,
    category: this.category,
    difficulty: this.difficulty,
    score: this.score,
    totalQuestions: this.totalQuestions,
    percentage: this.percentage,
    timeSpent: this.timeSpentFormatted,
    xpEarned: this.xpEarned,
    achievements: this.achievements,
    createdAt: this.createdAt,
    difficultyColor: this.difficultyColor
  };
};

module.exports = mongoose.model('Quiz', quizSchema); 