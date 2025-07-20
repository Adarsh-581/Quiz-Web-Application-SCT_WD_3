import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Users, 
  TrendingUp, 
  Star,
  Code,
  TestTube,
  Landmark,
  Globe,
  BookText,
  Trophy,
  Film,
  Brain,
  Zap
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { quizAPI } from '../utils/api';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  totalQuestions: number;
  averageScore: number;
  participants: number;
  difficulty: string[];
  estimatedTime: string;
}

// Fallback categories data - ensures users never see errors
const fallbackCategories: Category[] = [
  {
    id: 'technology',
    name: 'Technology',
    description: 'Test your knowledge of programming, software, and digital innovations',
    icon: Code,
    color: 'blue',
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
    icon: TestTube,
    color: 'green',
    totalQuestions: 450,
    averageScore: 82,
    participants: 11800,
    difficulty: ['Easy', 'Medium', 'Hard'],
    estimatedTime: '5-20 min'
  },
  {
    id: 'history',
    name: 'History',
    description: 'Journey through time with questions about world history and events',
    icon: Landmark,
    color: 'amber',
    totalQuestions: 400,
    averageScore: 75,
    participants: 9800,
    difficulty: ['Easy', 'Medium', 'Hard'],
    estimatedTime: '5-18 min'
  },
  {
    id: 'geography',
    name: 'Geography',
    description: 'Discover countries, capitals, landmarks, and world geography',
    icon: Globe,
    color: 'emerald',
    totalQuestions: 380,
    averageScore: 79,
    participants: 11200,
    difficulty: ['Easy', 'Medium', 'Hard'],
    estimatedTime: '5-12 min'
  },
  {
    id: 'literature',
    name: 'Literature',
    description: 'Dive into classic and modern literature, authors, and literary works',
    icon: BookText,
    color: 'purple',
    totalQuestions: 320,
    averageScore: 76,
    participants: 8500,
    difficulty: ['Easy', 'Medium', 'Hard'],
    estimatedTime: '5-15 min'
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Test your knowledge of sports, athletes, and sporting events',
    icon: Trophy,
    color: 'orange',
    totalQuestions: 350,
    averageScore: 81,
    participants: 15600,
    difficulty: ['Easy', 'Medium', 'Hard'],
    estimatedTime: '5-10 min'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Movies, music, TV shows, and pop culture knowledge',
    icon: Film,
    color: 'pink',
    totalQuestions: 420,
    averageScore: 83,
    participants: 18900,
    difficulty: ['Easy', 'Medium', 'Hard'],
    estimatedTime: '5-12 min'
  },
  {
    id: 'general-knowledge',
    name: 'General Knowledge',
    description: 'A mix of trivia, current events, and general knowledge questions',
    icon: Brain,
    color: 'indigo',
    totalQuestions: 600,
    averageScore: 74,
    participants: 25300,
    difficulty: ['Easy', 'Medium', 'Hard'],
    estimatedTime: '5-25 min'
  }
];

const QuizCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await quizAPI.getCategories();
        
        if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
          // Transform API response to match our Category interface
          const transformedCategories = response.data.data.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            icon: getCategoryIcon(cat.id),
            color: getCategoryColor(cat.id),
            totalQuestions: cat.totalQuestions || 0,
            averageScore: cat.averageScore || 0,
            participants: cat.participants || 0,
            difficulty: cat.difficulty || ['Easy', 'Medium', 'Hard'],
            estimatedTime: cat.estimatedTime || '5-15 min'
          }));
          setCategories(transformedCategories);
        } else {
          // If API fails, use fallback data
          console.log('Using fallback categories data');
          setCategories(fallbackCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use fallback data on error - ensures users never see errors
        setCategories(fallbackCategories);
        toast.error('Unable to load categories. Using default data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Helper function to get category icon
  const getCategoryIcon = (categoryId: string) => {
    const iconMap: { [key: string]: any } = {
      'technology': Code,
      'science': TestTube,
      'history': Landmark,
      'geography': Globe,
      'literature': BookText,
      'sports': Trophy,
      'entertainment': Film,
      'general-knowledge': Brain,
      'mixed': Zap
    };
    return iconMap[categoryId] || Brain;
  };

  // Helper function to get category color
  const getCategoryColor = (categoryId: string) => {
    const colorMap: { [key: string]: string } = {
      'technology': 'blue',
      'science': 'green',
      'history': 'amber',
      'geography': 'emerald',
      'literature': 'purple',
      'sports': 'orange',
      'entertainment': 'pink',
      'general-knowledge': 'indigo',
      'mixed': 'purple'
    };
    return colorMap[categoryId] || 'gray';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Ensure categories is always an array and has data
  const safeCategories = Array.isArray(categories) ? categories : fallbackCategories;
  const totalQuestions = safeCategories.reduce((acc, cat) => acc + (cat.totalQuestions || 0), 0);
  const totalParticipants = safeCategories.reduce((acc, cat) => acc + (cat.participants || 0), 0);
  const avgScore = safeCategories.length > 0 
    ? Math.round(safeCategories.reduce((acc, cat) => acc + (cat.averageScore || 0), 0) / safeCategories.length)
    : 0;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Quiz Category
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore diverse topics and challenge your knowledge across different fields. 
            Each category offers multiple difficulty levels to match your expertise.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {totalQuestions.toLocaleString()}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Total Questions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {safeCategories.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {totalParticipants.toLocaleString()}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {avgScore}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">Avg Score</div>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {safeCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card 
                  hover 
                  className="p-6 h-full flex flex-col group cursor-pointer"
                >
                  {/* Category Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r from-${category.color}-500 to-${category.color}-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {category.averageScore}% avg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1">
                    {category.description}
                  </p>

                  {/* Stats */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <BookOpen className="w-4 h-4" />
                        <span>{category.totalQuestions} questions</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{category.estimatedTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{category.participants.toLocaleString()} players</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>Trending</span>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {category.difficulty.map((diff) => (
                      <span
                        key={diff}
                        className={`px-2 py-1 text-xs rounded-full ${
                          diff === 'Easy'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400'
                            : diff === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400'
                        }`}
                      >
                        {diff}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Link to={`/quiz/${category.id}`} className="w-full">
                    <Button className="w-full group-hover:from-purple-700 group-hover:to-blue-700 transition-all duration-200">
                      Start Quiz
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <Card className="p-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white bg-transparent">
            <h2 className="text-2xl font-bold mb-4">
              Can't decide? Try our Mixed Quiz!
            </h2>
            <p className="text-purple-100 mb-6">
              Get questions from all categories in one exciting quiz session
            </p>
            <Link to="/quiz/mixed">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-transparent text-purple-600 hover:bg-gray-100 border border-gray-300"
              >
                Start Mixed Quiz
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizCategoryPage;