const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true }, // Can be rich text/LaTeX
  image: { type: String },
  options: [{ type: String }],
  answer: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be string, array, etc.
  type: { type: String, enum: ['MCQ', 'TrueFalse', 'FillBlank', 'MatchPairs'], required: true },
  explanation: { type: String },
  media: { type: String }, // For audio/video
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Question', questionSchema); 