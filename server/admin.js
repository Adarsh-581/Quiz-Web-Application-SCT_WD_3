const express = require('express');
const Quiz = require('./quiz');
const Question = require('./question');
const User = require('./user');
const { authenticateJWT } = require('./authHelpers');

const router = express.Router();

// Admin middleware
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Admin access required' });
}

// --- QUIZ CRUD ---
// Create quiz
router.post('/quiz', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});
// Update quiz
router.put('/quiz/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});
// Delete quiz
router.delete('/quiz/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// --- QUESTION CRUD ---
// Create question
router.post('/question', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create question' });
  }
});
// Update question
router.put('/question/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});
// Delete question
router.delete('/question/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// --- USER MANAGEMENT ---
// List users
router.get('/users', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
// Update user role
router.put('/user/:id/role', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});
// Delete user
router.delete('/user/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// --- CATEGORY MANAGEMENT (simple string array for now) ---
let categories = ['Science', 'Tech', 'History', 'Anime'];
router.get('/categories', authenticateJWT, requireAdmin, (req, res) => {
  res.json(categories);
});
router.post('/categories', authenticateJWT, requireAdmin, (req, res) => {
  const { name } = req.body;
  if (!name || categories.includes(name)) return res.status(400).json({ error: 'Invalid or duplicate category' });
  categories.push(name);
  res.status(201).json({ message: 'Category added', categories });
});
router.delete('/categories/:name', authenticateJWT, requireAdmin, (req, res) => {
  categories = categories.filter(c => c !== req.params.name);
  res.json({ message: 'Category deleted', categories });
});

// --- ANALYTICS (placeholder) ---
router.get('/analytics', authenticateJWT, requireAdmin, (req, res) => {
  // TODO: Implement analytics (quiz stats, trends, etc.)
  res.json({ message: 'Analytics endpoint coming soon.' });
});

module.exports = router; 