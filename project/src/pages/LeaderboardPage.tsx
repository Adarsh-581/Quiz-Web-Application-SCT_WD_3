import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Filter,
  Star,
  Zap
} from 'lucide-react';
import { leaderboardAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  xp: number;
  level: number;
  rank: number;
  previousRank: number;
  quizzesCompleted: number;
  accuracy: number;
  category?: string;
}

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('all-time');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'technology', name: 'Technology' },
    { id: 'science', name: 'Science' },
    { id: 'history', name: 'History' },
    { id: 'geography', name: 'Geography' },
    { id: 'literature', name: 'Literature' },
    { id: 'sports', name: 'Sports' },
    { id: 'entertainment', name: 'Entertainment' }
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        let response;
        if (selectedCategory === 'all') {
          response = await leaderboardAPI.getGlobalLeaderboard();
        } else {
          response = await leaderboardAPI.getCategoryLeaderboard(selectedCategory);
        }
        setLeaderboardData(response.data.leaderboard);
        
        // Fetch user rank
        const userRankResponse = await leaderboardAPI.getUserRank();
        setUserRank(userRankResponse.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Mock data for demo
        const mockData: LeaderboardEntry[] = [
          {
            id: '1',
            name: 'Alex Chen',
            avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150',
            score: 12500,
            xp: 12500,
            level: 25,
            rank: 1,
            previousRank: 1,
            quizzesCompleted: 156,
            accuracy: 94
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150',
            score: 11800,
            xp: 11800,
            level: 23,
            rank: 2,
            previousRank: 3,
            quizzesCompleted: 142,
            accuracy: 92
          },
          {
            id: '3',
            name: 'Mike Rodriguez',
            avatar: 'https://images.pexels.com/photos/2586105/pexels-photo-2586105.jpeg?w=150',
            score: 11200,
            xp: 11200,
            level: 22,
            rank: 3,
            previousRank: 2,
            quizzesCompleted: 134,
            accuracy: 89
          },
          {
            id: '4',
            name: 'Emily Davis',
            score: 10800,
            xp: 10800,
            level: 21,
            rank: 4,
            previousRank: 4,
            quizzesCompleted: 128,
            accuracy: 88
          },
          {
            id: '5',
            name: 'David Kim',
            score: 10400,
            xp: 10400,
            level: 20,
            rank: 5,
            previousRank: 6,
            quizzesCompleted: 125,
            accuracy: 87
          }
        ];
        setLeaderboardData(mockData);
        setUserRank({
          id: user?.id || '',
          name: user?.name || '',
          avatar: user?.avatar,
          score: user?.xp || 0,
          xp: user?.xp || 0,
          level: user?.level || 1,
          rank: 42,
          previousRank: 45,
          quizzesCompleted: user?.totalQuizzes || 0,
          accuracy: user?.averageScore || 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedCategory, selectedPeriod, user]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-500 dark:text-gray-400">#{rank}</span>;
  };

  const getRankChange = (rank: number, previousRank: number) => {
    if (rank < previousRank) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (rank > previousRank) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <div className="w-4 h-4" />;
  };

  const getRankBackground = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600';
    return 'bg-gradient-to-r from-purple-600 to-blue-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Leaderboard
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Compete with learners from around the world
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Category Filter */}
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Filter */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {[
                    { id: 'weekly', label: 'Weekly' },
                    { id: 'monthly', label: 'Monthly' },
                    { id: 'all-time', label: 'All Time' }
                  ].map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedPeriod(period.id as any)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        selectedPeriod === period.id
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            {/* Top 3 Podium */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <Card className="p-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <div className="flex items-end justify-center space-x-8">
                  {/* 2nd Place */}
                  {leaderboardData[1] && (
                    <div className="text-center">
                      <div className="relative mb-4">
                        <Avatar 
                          src={leaderboardData[1].avatar} 
                          name={leaderboardData[1].name} 
                          size="lg"
                          className="ring-4 ring-gray-400"
                        />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">2</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{leaderboardData[1].name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{leaderboardData[1].xp.toLocaleString()} XP</p>
                      <div className="w-20 h-16 bg-gray-400 rounded-t-lg mt-4 flex items-end justify-center pb-2">
                        <Medal className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {leaderboardData[0] && (
                    <div className="text-center">
                      <div className="relative mb-4">
                        <Avatar 
                          src={leaderboardData[0].avatar} 
                          name={leaderboardData[0].name} 
                          size="xl"
                          className="ring-4 ring-yellow-400"
                        />
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{leaderboardData[0].name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{leaderboardData[0].xp.toLocaleString()} XP</p>
                      <div className="w-24 h-20 bg-yellow-500 rounded-t-lg mt-4 flex items-end justify-center pb-2">
                        <Crown className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {leaderboardData[2] && (
                    <div className="text-center">
                      <div className="relative mb-4">
                        <Avatar 
                          src={leaderboardData[2].avatar} 
                          name={leaderboardData[2].name} 
                          size="lg"
                          className="ring-4 ring-amber-600"
                        />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">3</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{leaderboardData[2].name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{leaderboardData[2].xp.toLocaleString()} XP</p>
                      <div className="w-20 h-12 bg-amber-600 rounded-t-lg mt-4 flex items-end justify-center pb-2">
                        <Medal className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Full Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Rankings
                </h2>
                <div className="space-y-3">
                  {leaderboardData.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 ${
                        entry.id === user?.id
                          ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                          : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex items-center space-x-2 w-16">
                        {getRankIcon(entry.rank)}
                        {getRankChange(entry.rank, entry.previousRank)}
                      </div>

                      {/* Avatar and Name */}
                      <div className="flex items-center space-x-3 flex-1">
                        <Avatar 
                          src={entry.avatar} 
                          name={entry.name} 
                          size="md"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {entry.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Level {entry.level}</span>
                            <span>{entry.quizzesCompleted} quizzes</span>
                            <span>{entry.accuracy}% accuracy</span>
                          </div>
                        </div>
                      </div>

                      {/* XP */}
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {entry.xp.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          XP
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Rank */}
            {userRank && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Your Ranking
                  </h3>
                  <div className="text-center">
                    <div className="relative mb-4">
                      <Avatar 
                        src={userRank.avatar} 
                        name={userRank.name} 
                        size="lg"
                        className="mx-auto"
                      />
                      <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${getRankBackground(userRank.rank)} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">#{userRank.rank}</span>
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {userRank.name}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Rank:</span>
                        <span className="font-medium text-gray-900 dark:text-white">#{userRank.rank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">XP:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{userRank.xp.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Level:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{userRank.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{userRank.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Competition Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Players</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(leaderboardData.length * 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Top Score</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {leaderboardData[0]?.xp.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg Score</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(leaderboardData.reduce((acc, entry) => acc + entry.xp, 0) / leaderboardData.length).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Take Quiz CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <div className="text-center">
                  <Trophy className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Climb the Rankings!
                  </h3>
                  <p className="text-purple-100 mb-4 text-sm">
                    Take more quizzes to earn XP and improve your rank
                  </p>
                  <Button 
                    variant="secondary"
                    className="bg-white text-purple-600 hover:bg-gray-100 w-full"
                    onClick={() => window.location.href = '/quiz'}
                  >
                    Take a Quiz
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;