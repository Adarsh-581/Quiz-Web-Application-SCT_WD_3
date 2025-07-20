import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  Trophy,
  Users,
  Target,
  Calendar,
  Activity,
  BookOpen,
  Award,
  Zap,
  ArrowRight,
  Clock,
  Star,
  Medal,
  Crown,
  Flame,
  TrendingDown,
  Eye,
  Brain,
  Heart
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext';
import { userAPI } from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import Avatar from '../components/Avatar';
import toast from 'react-hot-toast';

interface DashboardStats {
  recentScores: Array<{ date: string; score: number }>;
  categoryPerformance: Array<{ category: string; score: number; fullMark: number }>;
  recentActivity: Array<{ id: string; type: string; description: string; date: string; score?: number }>;
  weeklyGoal: { current: number; target: number };
  dailyChallenge: { completed: boolean; title: string; category: string; xp: number };
  recommendedQuizzes: Array<{ id: string; title: string; category: string; difficulty: string; estimatedTime: number }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { quizState } = useQuiz();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getDashboardStats();
      
      if (response.data.success && response.data.data) {
        setDashboardData(response.data.data);
      } else {
        // Use fallback data if API fails
        setDashboardData(getFallbackDashboardData());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use fallback data
      setDashboardData(getFallbackDashboardData());
      toast.error('Using offline dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, user]); // Refresh when user data changes

  // Listen for custom 'quizCompleted' event
  useEffect(() => {
    const handleQuizCompleted = () => {
      fetchDashboardData();
    };
    window.addEventListener('quizCompleted', handleQuizCompleted);
    return () => window.removeEventListener('quizCompleted', handleQuizCompleted);
  }, [fetchDashboardData]);

  // Refresh dashboard when navigating back from quiz results
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      fetchDashboardData();
    }
  }, [location.pathname, fetchDashboardData]);

  // Fallback data to ensure dashboard always works
  const getFallbackDashboardData = (): DashboardStats => ({
    recentScores: [
      { date: 'Mon', score: 85 },
      { date: 'Tue', score: 92 },
      { date: 'Wed', score: 78 },
      { date: 'Thu', score: 88 },
      { date: 'Fri', score: 95 },
      { date: 'Sat', score: 82 },
      { date: 'Sun', score: 90 }
    ],
    categoryPerformance: [
      { category: 'Technology', score: 85, fullMark: 100 },
      { category: 'Science', score: 78, fullMark: 100 },
      { category: 'History', score: 72, fullMark: 100 },
      { category: 'Geography', score: 88, fullMark: 100 },
      { category: 'Literature', score: 75, fullMark: 100 },
      { category: 'Sports', score: 82, fullMark: 100 }
    ],
    recentActivity: [
      { id: '1', type: 'quiz', description: 'Completed Technology Quiz', date: '2 hours ago', score: 85 },
      { id: '2', type: 'achievement', description: 'Unlocked "Quiz Master" badge', date: '1 day ago' },
      { id: '3', type: 'streak', description: 'Maintained 7-day streak', date: '2 days ago' },
      { id: '4', type: 'quiz', description: 'Completed Science Quiz', date: '3 days ago', score: 78 }
    ],
    weeklyGoal: { current: 3, target: 5 },
    dailyChallenge: {
      completed: false,
      title: 'Master the Basics',
      category: 'Technology',
      xp: 50
    },
    recommendedQuizzes: [
      { id: '1', title: 'JavaScript Fundamentals', category: 'Technology', difficulty: 'Easy', estimatedTime: 10 },
      { id: '2', title: 'World Capitals', category: 'Geography', difficulty: 'Medium', estimatedTime: 15 },
      { id: '3', title: 'Classic Literature', category: 'Literature', difficulty: 'Hard', estimatedTime: 20 }
    ]
  });

  const StatCard = ({ icon: Icon, title, value, change, color = 'purple', subtitle }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
          {change && (
            <div className="flex items-center mt-2">
              {change > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900 rounded-full flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const safeData = dashboardData || getFallbackDashboardData();

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {user?.name || 'Quiz Master'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Ready to challenge yourself today? You're doing amazing!
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <Button onClick={fetchDashboardData} variant="outline" size="sm">
                Refresh
              </Button>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg">
                <Crown className="w-5 h-5" />
                <span className="font-medium">Level {user?.level || 1}</span>
              </div>
              <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg">
                <Star className="w-5 h-5" />
                <span className="font-medium">{user?.xp || 0} XP</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <StatCard
              icon={Trophy}
              title="Total Quizzes"
              value={user?.totalQuizzes || 0}
              subtitle="Completed this month"
              color="purple"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <StatCard
              icon={Target}
              title="Average Score"
              value={`${user?.averageScore || 0}%`}
              subtitle="Your performance"
              color="green"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <StatCard
              icon={Zap}
              title="Current Streak"
              value={user?.currentStreak || 0}
              subtitle="Days in a row"
              color="yellow"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <StatCard
              icon={Medal}
              title="Achievements"
              value={user?.achievements?.length || 0}
              subtitle="Badges earned"
              color="blue"
            />
          </motion.div>
        </div>

        {/* Performance Chart & Weekly Goal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Weekly Performance
                </h3>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    +12% from last week
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={safeData.recentScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Score']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#8b5cf6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Weekly Goal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Weekly Goal
                </h3>
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {safeData.weeklyGoal.current}/{safeData.weeklyGoal.target}
                </div>
                <p className="text-gray-600 dark:text-gray-400">Quizzes completed</p>
              </div>
              <ProgressBar 
                progress={(safeData.weeklyGoal.current || 0) / (safeData.weeklyGoal.target || 1) * 100}
                showLabel={false}
                color="purple"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                {(safeData.weeklyGoal.target || 0) - (safeData.weeklyGoal.current || 0)} more to reach your goal!
              </p>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Category Performance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={safeData.categoryPerformance}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="space-y-4">
                {safeData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      {activity.type === 'quiz' && <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                      {activity.type === 'achievement' && <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                      {activity.type === 'streak' && <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.date}
                      </p>
                    </div>
                    {activity.score && (
                      <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {activity.score}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Daily Challenge & Recommended Quizzes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Challenge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Daily Challenge
                </h3>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    +{safeData.dailyChallenge.xp} XP
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {safeData.dailyChallenge.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Category: {safeData.dailyChallenge.category}
                </p>
              </div>
              {safeData.dailyChallenge.completed ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Challenge Completed!
                  </p>
                </div>
              ) : (
                <Link to={`/quiz/${safeData.dailyChallenge.category?.toLowerCase()}`}>
                  <Button className="w-full group">
                    Start Challenge
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </Card>
          </motion.div>

          {/* Recommended Quizzes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recommended for You
                </h3>
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="space-y-3">
                {safeData.recommendedQuizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {quiz.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{quiz.category}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded ${
                          quiz.difficulty === 'Easy' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400'
                            : quiz.difficulty === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400'
                        }`}>
                          {quiz.difficulty}
                        </span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{quiz.estimatedTime}m</span>
                      </div>
                    </div>
                    <Link to={`/quiz/${quiz.category.toLowerCase()}`}>
                      <Button size="sm" variant="outline">
                        Start
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link to="/quiz">
                  <Button variant="outline" className="w-full">
                    Browse All Quizzes
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;