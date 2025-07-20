import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Trash2,
  Save,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';

const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    profile: {
      name: user?.name || '',
      email: user?.email || '',
    },
    notifications: {
      quizReminders: user?.preferences?.notifications || true,
      achievements: true,
      leaderboard: true,
      newsletter: false,
    },
    privacy: {
      publicProfile: true,
      showInLeaderboard: true,
      shareProgress: false,
    },
    preferences: {
      theme: theme,
      difficulty: user?.preferences?.difficulty || 'mixed',
      categories: user?.preferences?.preferredCategories || [],
      autoSubmit: false,
    }
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        name: settings.profile.name,
        email: settings.profile.email,
        preferences: {
          ...user?.preferences,
          notifications: settings.notifications.quizReminders,
          difficulty: settings.preferences.difficulty,
          preferredCategories: settings.preferences.categories,
        }
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    // In a real app, this would make an API call to delete the account
    console.log('Delete account');
    setShowDeleteModal(false);
  };

  const categories = [
    'Technology', 'Science', 'History', 'Geography', 
    'Literature', 'Sports', 'Entertainment', 'General Knowledge'
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and privacy settings
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={settings.profile.name}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, name: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, email: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h2>
              </div>
              
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {key === 'quizReminders' && 'Get reminded to take daily quizzes'}
                        {key === 'achievements' && 'Notifications when you unlock achievements'}
                        {key === 'leaderboard' && 'Updates about your leaderboard position'}
                        {key === 'newsletter' && 'Weekly newsletter with quiz highlights'}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          [key]: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Privacy & Security
                </h2>
              </div>
              
              <div className="space-y-4">
                {Object.entries(settings.privacy).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {key === 'publicProfile' && 'Allow others to view your profile'}
                        {key === 'showInLeaderboard' && 'Display your name on leaderboards'}
                        {key === 'shareProgress' && 'Share your progress on social media'}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setSettings({
                        ...settings,
                        privacy: {
                          ...settings.privacy,
                          [key]: e.target.checked
                        }
                      })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <Palette className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Preferences
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={settings.preferences.theme}
                    onChange={(e) => {
                      const newTheme = e.target.value as any;
                      setTheme(newTheme);
                      setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, theme: newTheme }
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Difficulty
                  </label>
                  <select
                    value={settings.preferences.difficulty}
                    onChange={(e) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, difficulty: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Categories
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.preferences.categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSettings({
                              ...settings,
                              preferences: {
                                ...settings.preferences,
                                categories: [...settings.preferences.categories, category]
                              }
                            });
                          } else {
                            setSettings({
                              ...settings,
                              preferences: {
                                ...settings.preferences,
                                categories: settings.preferences.categories.filter(c => c !== category)
                              }
                            });
                          }
                        }}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Account Actions
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Change Password</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Update your password to keep your account secure
                    </p>
                  </div>
                  <Button variant="outline">
                    Change Password
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div>
                    <h3 className="font-medium text-red-900 dark:text-red-300">Delete Account</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button 
                    variant="danger"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex justify-end"
          >
            <Button
              onClick={handleSaveSettings}
              loading={isLoading}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </Button>
          </motion.div>
        </div>

        {/* Delete Account Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Account"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Are you absolutely sure?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This action cannot be undone. This will permanently delete your account,
              remove your data from our servers, and you will lose all your progress.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                className="flex-1"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default SettingsPage;