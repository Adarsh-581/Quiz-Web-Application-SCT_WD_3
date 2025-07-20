const express = require('express');
const User = require('./models/User');
const { authenticateJWT } = require('./middleware/authHelpers');

const router = express.Router();

// GET /api/leaderboard/global - Frontend expects this endpoint
router.get('/global', async (req, res) => {
  try {
    const { period = 'all-time', limit = 50 } = req.query;

    // Get top users by XP
    const users = await User.find({ isActive: true })
      .select('name avatar stats')
      .sort({ 'stats.xp': -1 })
      .limit(parseInt(limit));

    const leaderboard = users.map((user, index) => ({
      id: user._id.toString(),
      name: user.name,
      avatar: user.avatar,
      score: user.stats.xp,
      xp: user.stats.xp,
      level: user.stats.level,
      rank: index + 1,
      previousRank: index + 1, // Mock data - in production would track previous ranks
      quizzesCompleted: user.stats.totalQuizzes,
      accuracy: user.stats.averageScore
    }));

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Global leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch global leaderboard' }
    });
  }
});

// GET /api/leaderboard/category/:category - Frontend expects this endpoint
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 50 } = req.query;

    // Mock category leaderboard data - in production would calculate based on category performance
    const users = await User.find({ isActive: true })
      .select('name avatar stats')
      .sort({ 'stats.xp': -1 })
      .limit(parseInt(limit));

    const leaderboard = users.map((user, index) => ({
      id: user._id.toString(),
      name: user.name,
      avatar: user.avatar,
      score: Math.floor(user.stats.xp * 0.8), // Mock category score
      xp: user.stats.xp,
      level: user.stats.level,
      rank: index + 1,
      previousRank: index + 1,
      quizzesCompleted: user.stats.totalQuizzes,
      accuracy: user.stats.averageScore,
      category: category
    }));

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Category leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch category leaderboard' }
    });
  }
});

// GET /api/leaderboard/rank - Frontend expects this endpoint
router.get('/rank', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Calculate user's global rank
    const globalRank = await User.countDocuments({
      'stats.xp': { $gt: user.stats.xp }
    }) + 1;

    // Calculate user's category rank (mock data)
    const categoryRank = Math.floor(Math.random() * 100) + 1;

    res.json({
      success: true,
      rank: {
        global: globalRank,
        category: categoryRank,
        totalUsers: await User.countDocuments({ isActive: true })
      }
    });
  } catch (error) {
    console.error('User rank error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch user rank' }
    });
  }
});

module.exports = router; 