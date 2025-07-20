import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Award,
  Star,
  Trophy,
  Clock,
  Target,
  Settings,
  Camera,
  Edit3,
  Save,
  X,
  Shield,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Update editData when user changes
  React.useEffect(() => {
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
    });
  }, [user]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const achievements = [
    { id: 1, name: 'First Quiz', description: 'Complete your first quiz', earned: true, date: '2025-07-20' },
    { id: 2, name: 'Week Warrior', description: 'Complete 7 quizzes in a week', earned: true, date: '2025-07-15' },
    { id: 3, name: 'Tech Expert', description: 'Score 90% or higher in Technology', earned: true, date: '2025-07-20' },
    { id: 4, name: 'Streak Master', description: 'Maintain a 30-day streak', earned: false, progress: 23 },
    { id: 5, name: 'Knowledge Seeker', description: 'Complete 100 quizzes', earned: false, progress: 67 },
    { id: 6, name: 'Perfect Score', description: 'Get 100% on any quiz', earned: false, progress: 0 },
  ];

  const stats = [
    { label: 'Total Quizzes', value: user?.totalQuizzes || 0, icon: Target, color: 'purple' },
    { label: 'Average Score', value: `${user?.averageScore || 0}%`, icon: Trophy, color: 'blue' },
    { label: 'Current Streak', value: `${user?.currentStreak || 1} days`, icon: Star, color: 'green' },
    { label: 'Time Spent', value: '0', icon: Clock, color: 'orange' },
  ];

  const categoryProgress = [
    { name: 'Technology', score: 85, quizzes: 12 },
    { name: 'Science', score: 78, quizzes: 8 },
    { name: 'History', score: 72, quizzes: 6 },
    { name: 'Geography', score: 80, quizzes: 10 },
    { name: 'Literature', score: 75, quizzes: 5 },
    { name: 'Sports', score: 88, quizzes: 9 },
  ];

  const handleSaveProfile = async () => {
    const success = await updateProfile(editData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to your server
      // For demo purposes, we'll just close the modal
      setShowAvatarModal(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar Section */}
              <div className="relative group">
                <Avatar 
                  src={user.avatar} 
                  name={user.name} 
                  size="xl" 
                  className="ring-4 ring-white dark:ring-gray-800 shadow-lg"
                />
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="text-2xl font-bold bg-transparent border-b-2 border-purple-500 focus:outline-none text-gray-900 dark:text-white"
                      placeholder="Enter your name"
                    />
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="text-gray-600 dark:text-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-purple-500"
                      placeholder="Enter your email"
                    />
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveProfile} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user.name}
                      </h1>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
                    <div className="flex items-center justify-center md:justify-start space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Last login {new Date(user.lastLogin).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Level Badge */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full">
                  <div className="text-sm font-medium">Level</div>
                  <div className="text-2xl font-bold">{user.level}</div>
                </div>
                <div className="mt-2">
                  <ProgressBar 
                    progress={(user.xp % 1000) / 10} 
                    showLabel={false} 
                    size="sm"
                    className="w-20"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {user.xp % 1000}/1000 XP
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4 text-center">
                <div className={`w-12 h-12 bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </Card>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Achievements
                </h2>
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-center space-x-4 p-3 rounded-lg ${
                      achievement.earned
                        ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.earned 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-400 text-gray-600'
                    }`}>
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        achievement.earned 
                          ? 'text-purple-900 dark:text-purple-100' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                      {!achievement.earned && achievement.progress !== undefined && (
                        <div className="mt-2">
                          <ProgressBar 
                            progress={achievement.progress} 
                            size="sm"
                            showLabel={false}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {achievement.progress}% complete
                          </p>
                        </div>
                      )}
                    </div>
                    {achievement.earned && achievement.date && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(achievement.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Category Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Category Progress
                </h2>
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="space-y-4">
                {categoryProgress.map((category) => (
                  <div key={category.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                      <div className="text-right text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {category.score}%
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                          ({category.quizzes} quizzes)
                        </span>
                      </div>
                    </div>
                    <ProgressBar 
                      progress={category.score} 
                      showLabel={false}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Settings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Preferences
              </h2>
              <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Theme Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              {/* Difficulty Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Difficulty
                </label>
                <select
                  value={user.preferences?.difficulty || 'mixed'}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Notifications
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive quiz reminders and updates
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={user.preferences?.notifications || false}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>

              {/* Privacy */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Public Profile
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Show your profile on leaderboards
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Avatar Upload Modal */}
        <Modal
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          title="Update Profile Picture"
        >
          <div className="text-center">
            <div className="mb-6">
              <Avatar 
                src={user.avatar} 
                name={user.name} 
                size="xl" 
                className="mx-auto mb-4"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <div className="space-y-3">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload New Picture
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAvatarModal(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ProfilePage;