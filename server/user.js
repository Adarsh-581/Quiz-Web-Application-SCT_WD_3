const express = require('express');
const User = require('./models/User');
const { authenticateJWT } = require('./middleware/authHelpers');

const router = express.Router();

// PUT /api/user/profile - Frontend expects this endpoint
router.put('/profile', authenticateJWT, async (req, res) => {
  try {
    const { name, email, avatar, preferences } = req.body;
    const updates = {};
    
    // Only include allowed fields
    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase();
    if (avatar) updates.avatar = avatar;
    if (preferences) {
      updates.preferences = {
        theme: preferences.theme || 'auto',
        difficulty: preferences.difficulty || 'mixed',
        notifications: {
          email: preferences.notifications !== undefined ? preferences.notifications : true,
          push: true
        },
        categories: preferences.preferredCategories || []
      };
    }

    // Validate name if provided
    if (updates.name && (updates.name.trim().length < 2 || updates.name.length > 50)) {
      return res.status(400).json({ 
        success: false,
        error: { message: 'Name must be between 2-50 characters' }
      });
    }

    // Validate email if provided
    if (updates.email && !/^\S+@\S+\.\S+$/.test(updates.email)) {
      return res.status(400).json({ 
        success: false,
        error: { message: 'Please enter a valid email address' }
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id, 
      updates, 
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: { message: 'User not found' }
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
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false,
      error: { message: 'Failed to update profile' }
    });
  }
});

// PUT /api/user/preferences - Frontend expects this endpoint
router.put('/preferences', authenticateJWT, async (req, res) => {
  try {
    const { theme, difficulty, notifications, preferredCategories } = req.body;
    
    const updates = {
      preferences: {
        theme: theme || 'auto',
        difficulty: difficulty || 'mixed',
        notifications: {
          email: notifications !== undefined ? notifications : true,
          push: true
        },
        categories: preferredCategories || []
      }
    };

    const user = await User.findByIdAndUpdate(
      req.user.id, 
      updates, 
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: { message: 'User not found' }
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
      message: 'Preferences updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ 
      success: false,
      error: { message: 'Failed to update preferences' }
    });
  }
});

// GET /api/user/dashboard - Frontend expects this endpoint
router.get('/dashboard', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Get recent scores (last 7 days)
    const recentScores = user.quizzesTaken
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 7)
      .map(quiz => ({
        date: quiz.completedAt.toISOString().split('T')[0],
        score: Math.round((quiz.score / 10) * 100) // Assuming 10 questions per quiz
      }));

    // Calculate category performance
    const categoryPerformance = [];
    const categoryStats = {};
    
    user.quizzesTaken.forEach(quiz => {
      if (quiz.quizId && quiz.quizId.category) {
        if (!categoryStats[quiz.quizId.category]) {
          categoryStats[quiz.quizId.category] = { total: 0, count: 0 };
        }
        categoryStats[quiz.quizId.category].total += quiz.score;
        categoryStats[quiz.quizId.category].count += 1;
      }
    });

    Object.keys(categoryStats).forEach(category => {
      categoryPerformance.push({
        category,
        score: Math.round(categoryStats[category].total / categoryStats[category].count),
        fullMark: 100
      });
    });

    // Recent activity
    const recentActivity = user.quizzesTaken
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5)
      .map(quiz => ({
        id: quiz._id.toString(),
        type: 'quiz',
        description: `Completed ${quiz.quizId?.category || 'Quiz'}`,
        date: getTimeAgo(quiz.completedAt),
        score: Math.round((quiz.score / 10) * 100)
      }));

    // Weekly goal (quizzes completed this week)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weeklyQuizzes = user.quizzesTaken.filter(quiz => 
      new Date(quiz.completedAt) >= weekStart
    ).length;

    // Daily challenge
    const dailyChallenge = {
      completed: false,
      title: "Daily Quiz Challenge",
      category: "Mixed",
      xp: 150
    };

    // Recommended quizzes
    const recommendedQuizzes = [
      {
        id: "1",
        title: "JavaScript Fundamentals",
        category: "Technology",
        difficulty: "Medium",
        estimatedTime: 15
      },
      {
        id: "2", 
        title: "World Geography",
        category: "Geography",
        difficulty: "Easy",
        estimatedTime: 10
      }
    ];

    res.json({
      success: true,
      data: {
        recentScores,
        categoryPerformance,
        recentActivity,
        weeklyGoal: { current: weeklyQuizzes, target: 10 },
        dailyChallenge,
        recommendedQuizzes
      }
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: { message: 'Failed to fetch dashboard' }
    });
  }
});

// GET /api/user/achievements - Frontend expects this endpoint
router.get('/achievements', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Convert achievements to frontend format
    const achievements = user.achievements.map(achievement => ({
      id: achievement._id.toString(),
      name: achievement.name,
      description: achievement.description,
      earned: true,
      date: achievement.unlockedAt.toISOString().split('T')[0],
      icon: achievement.icon || 'trophy',
      xp: 50 // Default XP for achievements
    }));

    // Add some default achievements if user has none
    if (achievements.length === 0) {
      achievements.push({
        id: "1",
        name: "First Quiz",
        description: "Complete your first quiz",
        earned: user.stats.totalQuizzes > 0,
        date: user.stats.totalQuizzes > 0 ? user.createdAt.toISOString().split('T')[0] : null,
        icon: "trophy",
        xp: 50
      });
    }

    res.json({
      success: true,
      achievements
    });
  } catch (error) {
    console.error('Achievements fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: { message: 'Failed to fetch achievements' }
    });
  }
});

// Helper function to get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} weeks ago`;
}

module.exports = router;