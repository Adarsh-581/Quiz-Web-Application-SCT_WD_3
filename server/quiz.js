const express = require('express');
const router = express.Router();
const Quiz = require('./models/Quiz');
const User = require('./models/User');
const { authenticateJWT } = require('./middleware/authHelpers');

// Submit quiz results
router.post('/submit', authenticateJWT, async (req, res) => {
  try {
    const {
      quizId,
      category,
      difficulty,
      answers,
      score,
      totalQuestions,
      timeSpent,
      startTime,
      endTime
    } = req.body;

    const userId = req.user.id;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Calculate XP earned (base XP + bonus for high scores)
    let xpEarned = percentage * 2; // Base XP
    if (percentage >= 90) xpEarned += 50; // Perfect score bonus
    else if (percentage >= 80) xpEarned += 30; // High score bonus
    else if (percentage >= 70) xpEarned += 15; // Good score bonus

    // Calculate achievements
    const achievements = [];
    if (percentage === 100) achievements.push('Perfect Score');
    if (percentage >= 90) achievements.push('Quiz Master');
    if (percentage >= 80) achievements.push('High Achiever');
    if (timeSpent < 300000) achievements.push('Speed Demon'); // Under 5 minutes
    if (score >= 8) achievements.push('Consistent Performer');

    // Get user's current stats
    const user = await User.findById(userId);
    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    const newXP = currentXP + xpEarned;
    
    // Calculate new level (every 1000 XP = 1 level)
    const newLevel = Math.floor(newXP / 1000) + 1;

    // Create quiz result
    const quizResult = new Quiz({
      userId,
      quizId,
      category,
      difficulty,
      answers,
      score,
      totalQuestions,
      percentage,
      timeSpent,
      startTime,
      endTime,
      xpEarned,
      achievements
    });

    await quizResult.save();

    // Update user stats
    const totalQuizzes = (user.totalQuizzes || 0) + 1;
    const newAverageScore = calculateNewAverage(user.averageScore || 0, totalQuizzes - 1, percentage);

    await User.findByIdAndUpdate(userId, {
      xp: newXP,
      level: newLevel,
      totalQuizzes,
      averageScore: newAverageScore,
      lastQuizDate: new Date()
    });

    // Calculate global rank
    const globalRank = await calculateGlobalRank(userId, newXP);
    const categoryRank = await calculateCategoryRank(userId, category, percentage);

    res.json({
      success: true,
      data: {
        score,
        percentage,
        xpEarned,
        newLevel,
        achievements,
        rank: globalRank,
        categoryRank,
        totalQuizzes,
        averageScore: newAverageScore
      }
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to submit quiz results' }
    });
  }
});

// Get user's quiz history
router.get('/history', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, category } = req.query;

    const query = { userId };
    if (category) query.category = category;

    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Quiz.countDocuments(query);

    res.json({
      success: true,
      data: {
        quizzes,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch quiz history' }
    });
  }
});

// Get quiz statistics
router.get('/stats', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Quiz.aggregate([
      { $match: { userId: userId } },
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

    const categoryStats = await Quiz.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageScore: { $avg: '$percentage' },
          bestScore: { $max: '$percentage' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const recentQuizzes = await Quiz.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('category percentage createdAt');

    res.json({
      success: true,
      data: {
        overall: stats[0] || {
          totalQuizzes: 0,
          totalScore: 0,
          totalQuestions: 0,
          totalTime: 0,
          totalXP: 0,
          averageScore: 0,
          bestScore: 0,
          totalAchievements: 0
        },
        byCategory: categoryStats,
        recent: recentQuizzes
      }
    });

  } catch (error) {
    console.error('Error fetching quiz stats:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch quiz statistics' }
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;

    let matchStage = {};
    if (category) {
      matchStage.category = category;
    }

    const leaderboard = await Quiz.aggregate([
      { $match: matchStage },
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
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch leaderboard' }
    });
  }
});

// Get category leaderboard
router.get('/leaderboard/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;

    const leaderboard = await Quiz.aggregate([
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
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    console.error('Error fetching category leaderboard:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch category leaderboard' }
    });
  }
});

// GET /api/quiz/categories - Returns all quiz categories
router.get('/categories', (req, res) => {
  const categories = [
    {
      id: 'technology',
      name: 'Technology',
      description: 'Test your knowledge of programming, software, and digital innovations',
      totalQuestions: 500,
      averageScore: 78,
      participants: 12450,
      difficulty: ['Easy', 'Medium', 'Hard'],
      estimatedTime: '5-15 min'
    },
    {
      id: 'science',
      name: 'Science',
      description: 'Explore physics, chemistry, biology, and scientific discoveries',
      totalQuestions: 400,
      averageScore: 72,
      participants: 8900,
      difficulty: ['Easy', 'Medium', 'Hard'],
      estimatedTime: '5-15 min'
    },
    {
      id: 'geography',
      name: 'Geography',
      description: 'Discover countries, capitals, landmarks, and world geography',
      totalQuestions: 350,
      averageScore: 85,
      participants: 15600,
      difficulty: ['Easy', 'Medium', 'Hard'],
      estimatedTime: '5-15 min'
    },
    {
      id: 'history',
      name: 'History',
      description: 'Journey through time with questions about world history and events',
      totalQuestions: 300,
      averageScore: 68,
      participants: 7200,
      difficulty: ['Easy', 'Medium', 'Hard'],
      estimatedTime: '5-15 min'
    },
    {
      id: 'literature',
      name: 'Literature',
      description: 'Classic books, authors, poetry, and literary masterpieces',
      totalQuestions: 250,
      averageScore: 75,
      participants: 5400,
      difficulty: ['Easy', 'Medium', 'Hard'],
      estimatedTime: '5-15 min'
    },
    {
      id: 'sports',
      name: 'Sports',
      description: 'Test your knowledge of sports, athletes, and championships',
      totalQuestions: 200,
      averageScore: 82,
      participants: 9800,
      difficulty: ['Easy', 'Medium', 'Hard'],
      estimatedTime: '5-15 min'
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      description: 'Movies, music, TV shows, and pop culture trivia',
      totalQuestions: 300,
      averageScore: 80,
      participants: 11000,
      difficulty: ['Easy', 'Medium', 'Hard'],
      estimatedTime: '5-15 min'
    },
    {
      id: 'general-knowledge',
      name: 'General Knowledge',
      description: 'A mix of trivia, current events, and general facts',
      totalQuestions: 350,
      averageScore: 74,
      participants: 10500,
      difficulty: ['Easy', 'Medium', 'Hard'],
      estimatedTime: '5-15 min'
    }
  ];
  res.json({ success: true, data: categories });
});

// GET /api/quiz/category/:category - Returns questions for a category
router.get('/category/:category', (req, res) => {
  const { category } = req.params;
  const { difficulty = 'mixed', limit = 10 } = req.query;
  // For now, return mock questions (should be replaced with DB fetch)
  const questions = [
    {
      id: '1',
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 1,
      explanation: 'Binary search has O(log n) time complexity because it divides the search space in half with each iteration.',
      difficulty: 'medium',
      category: category,
      timeLimit: 30
    },
    {
      id: '2',
      question: 'Which programming language is known as the "language of the web"?',
      options: ['Python', 'JavaScript', 'Java', 'C++'],
      correctAnswer: 1,
      explanation: 'JavaScript is the primary language for web development, running in browsers and enabling interactive web applications.',
      difficulty: 'easy',
      category: category,
      timeLimit: 25
    },
    {
      id: '3',
      question: 'What does API stand for?',
      options: ['Application Programming Interface', 'Advanced Programming Interface', 'Automated Programming Interface', 'Application Process Interface'],
      correctAnswer: 0,
      explanation: 'API stands for Application Programming Interface, which allows different software applications to communicate with each other.',
      difficulty: 'easy',
      category: category,
      timeLimit: 20
    }
  ];
  res.json({ success: true, data: { quiz: { id: `quiz_${category}_${Date.now()}`, category, difficulty, questions } } });
});

// Helper functions
function calculateNewAverage(currentAvg, currentTotal, newScore) {
  if (currentTotal === 0) return newScore;
  return Math.round(((currentAvg * currentTotal) + newScore) / (currentTotal + 1));
}

async function calculateGlobalRank(userId, xp) {
  const rank = await User.countDocuments({ xp: { $gt: xp } });
  return rank + 1;
}

async function calculateCategoryRank(userId, category, score) {
  const rank = await Quiz.countDocuments({
    category,
    percentage: { $gt: score }
  });
  return rank + 1;
}

module.exports = router; 