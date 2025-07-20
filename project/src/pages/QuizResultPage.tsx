import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Clock,
  Target,
  TrendingUp,
  Share2,
  RotateCcw,
  Home,
  Award,
  Zap,
  CheckCircle,
  XCircle,
  Medal,
  Crown,
  Flame
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useQuiz } from '../context/QuizContext';
import { useAuth } from '../context/AuthContext';
import { quizAPI } from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import toast from 'react-hot-toast';

const QuizResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { quizState, resetQuiz } = useQuiz();
  const { user, updateProfile } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!quizState.isCompleted) {
      navigate(`/quiz/${quizState.category}`);
      return;
    }

    // Prevent multiple submissions
    if (hasSubmittedRef.current) {
      return;
    }

    // Submit quiz results
    const submitResults = async () => {
      hasSubmittedRef.current = true;
      setIsSubmitting(true);
      try {
        const quizData = {
          quizId: `quiz_${quizState.category}_${Date.now()}`,
          category: quizState.category,
          difficulty: quizState.difficulty,
          answers: quizState.answers,
          score: quizState.score,
          totalQuestions: quizState.questions.length,
          timeSpent: quizState.timeSpent,
          startTime: new Date(Date.now() - quizState.timeSpent).toISOString(),
          endTime: new Date().toISOString()
        };

        const response = await quizAPI.submitQuiz(quizData);
        
        if (response.data.success && response.data.data) {
          const result = response.data.data;
          setSubmissionResult(result);
          
          // Show achievements if any
          if (result.achievements && result.achievements.length > 0) {
            setAchievements(result.achievements);
            toast.success(`🎉 New achievements unlocked: ${result.achievements.join(', ')}`);
          }

          // Update user profile with new stats
          if (user) {
            const updatedUser = {
              ...user,
              level: result.newLevel || user.level,
              xp: (user.xp || 0) + (result.xpEarned || 0),
              totalQuizzes: (user.totalQuizzes || 0) + 1,
              averageScore: calculateNewAverage(user.averageScore || 0, user.totalQuizzes || 0, result.percentage)
            };
            updateProfile(updatedUser);
          }

          // Dispatch custom event for dashboard refresh
          window.dispatchEvent(new Event('quizCompleted'));

          toast.success(`Quiz completed! You earned ${result.xpEarned} XP!`);
        } else {
          throw new Error(response.data.error?.message || 'Failed to submit results');
        }
      } catch (error) {
        console.error('Error submitting quiz results:', error);
        toast.error('Failed to submit results, but your score has been saved locally.');
        
        // Create local submission result for offline mode
        const localResult = {
          score: quizState.score,
          percentage: Math.round((quizState.score / quizState.questions.length) * 100),
          xpEarned: Math.round((quizState.score / quizState.questions.length) * 100) * 2,
          newLevel: user?.level || 1,
          achievements: [],
          rank: 0,
          categoryRank: 0
        };
        setSubmissionResult(localResult);
      } finally {
        setIsSubmitting(false);
      }
    };

    submitResults();
  }, [quizState.isCompleted, quizState.category, quizState.score, quizState.questions.length, quizState.timeSpent, navigate]);

  const calculateNewAverage = (currentAvg: number, currentTotal: number, newScore: number): number => {
    if (currentTotal === 0) return newScore;
    return Math.round(((currentAvg * currentTotal) + newScore) / (currentTotal + 1));
  };

  if (!quizState.isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to quiz...</p>
        </div>
      </div>
    );
  }

  const scorePercentage = Math.round((quizState.score / quizState.questions.length) * 100);
  const timeSpentMinutes = Math.floor(quizState.timeSpent / (1000 * 60));
  const timeSpentSeconds = Math.floor((quizState.timeSpent % (1000 * 60)) / 1000);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return { title: 'Outstanding!', message: 'You\'ve mastered this topic!', icon: Crown };
    if (percentage >= 80) return { title: 'Excellent!', message: 'Great job on this quiz!', icon: Trophy };
    if (percentage >= 70) return { title: 'Good Work!', message: 'You\'re on the right track!', icon: Star };
    if (percentage >= 60) return { title: 'Keep Learning!', message: 'Room for improvement!', icon: Target };
    return { title: 'Keep Trying!', message: 'Practice makes perfect!', icon: Flame };
  };

  const scoreMessage = getScoreMessage(scorePercentage);

  // Data for charts
  const pieData = [
    { name: 'Correct', value: quizState.score, color: '#10b981' },
    { name: 'Incorrect', value: quizState.questions.length - quizState.score, color: '#ef4444' }
  ];

  const performanceData = Array.from({ length: quizState.questions.length }, (_, i) => ({
    question: i + 1,
    correct: quizState.answers[i] === quizState.questions[i]?.correctAnswer ? 1 : 0
  }));

  const handleRetakeQuiz = () => {
    resetQuiz();
    navigate(`/quiz/${quizState.category}`);
  };

  const handleShareResults = () => {
    const shareText = `I just scored ${scorePercentage}% on the ${quizState.category} quiz at QuizMaster! 🎯`;
    if (navigator.share) {
      navigator.share({
        title: 'QuizMaster Results',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Results copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <scoreMessage.icon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Quiz Complete!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 capitalize">
            {quizState.category} Quiz Results
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-8 text-center bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {scoreMessage.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {scoreMessage.message}
            </p>
            <div className={`text-6xl font-bold mb-4 ${getScoreColor(scorePercentage)}`}>
              {scorePercentage}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {quizState.score} out of {quizState.questions.length} questions correct
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {timeSpentMinutes}m {timeSpentSeconds}s
            </div>
            <div className="text-gray-600 dark:text-gray-400">Time Spent</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {Math.round((quizState.score / quizState.questions.length) * 100)}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">Accuracy</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              +{submissionResult?.xpEarned || scorePercentage * 2}
            </div>
            <div className="text-gray-600 dark:text-gray-400">XP Earned</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Medal className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              #{submissionResult?.rank || 'N/A'}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Global Rank</div>
          </Card>
        </motion.div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-600" />
                New Achievements Unlocked!
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {achievement}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Pie Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Score Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Correct</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Incorrect</span>
              </div>
            </div>
          </Card>

          {/* Performance Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Question Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="question" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="correct" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={handleRetakeQuiz}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </Button>

          <Button
            onClick={handleShareResults}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Results</span>
          </Button>

          <Link to="/dashboard">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Button>
          </Link>

          <Link to="/leaderboard">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>View Leaderboard</span>
            </Button>
          </Link>
        </motion.div>

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Submitting your results...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResultPage;