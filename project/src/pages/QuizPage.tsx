import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  HelpCircle,
  Bookmark,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Flag,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { quizAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  timeLimit: number;
}

// Fallback questions for each category - ensures users never see errors
const fallbackQuestions: { [key: string]: Question[] } = {
  technology: [
    {
      id: 'tech_1',
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 1,
      explanation: 'Binary search has O(log n) time complexity because it divides the search space in half with each iteration.',
      difficulty: 'medium',
      category: 'technology',
      timeLimit: 30
    },
    {
      id: 'tech_2',
      question: 'Which programming language is known as the "language of the web"?',
      options: ['Python', 'JavaScript', 'Java', 'C++'],
      correctAnswer: 1,
      explanation: 'JavaScript is the primary language for web development, running in browsers and enabling interactive web applications.',
      difficulty: 'easy',
      category: 'technology',
      timeLimit: 25
    },
    {
      id: 'tech_3',
      question: 'What does API stand for?',
      options: ['Application Programming Interface', 'Advanced Programming Interface', 'Automated Programming Interface', 'Application Process Interface'],
      correctAnswer: 0,
      explanation: 'API stands for Application Programming Interface, which allows different software applications to communicate with each other.',
      difficulty: 'easy',
      category: 'technology',
      timeLimit: 20
    },
    {
      id: 'tech_4',
      question: 'Which data structure operates on LIFO principle?',
      options: ['Queue', 'Stack', 'Tree', 'Graph'],
      correctAnswer: 1,
      explanation: 'A Stack operates on LIFO (Last In, First Out) principle, where the last element added is the first one to be removed.',
      difficulty: 'medium',
      category: 'technology',
      timeLimit: 25
    },
    {
      id: 'tech_5',
      question: 'What is the main purpose of CSS?',
      options: ['To create dynamic content', 'To style and layout web pages', 'To handle server-side logic', 'To manage databases'],
      correctAnswer: 1,
      explanation: 'CSS (Cascading Style Sheets) is used to style and layout web pages, controlling the visual presentation of HTML elements.',
      difficulty: 'easy',
      category: 'technology',
      timeLimit: 20
    }
  ],
  science: [
    {
      id: 'sci_1',
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 1,
      explanation: 'Mars is called the Red Planet due to iron oxide (rust) on its surface giving it a reddish appearance.',
      difficulty: 'easy',
      category: 'science',
      timeLimit: 20
    },
    {
      id: 'sci_2',
      question: 'What is the chemical symbol for gold?',
      options: ['Ag', 'Au', 'Fe', 'Cu'],
      correctAnswer: 1,
      explanation: 'Au is the chemical symbol for gold, derived from the Latin word "aurum".',
      difficulty: 'easy',
      category: 'science',
      timeLimit: 15
    },
    {
      id: 'sci_3',
      question: 'What is the largest organ in the human body?',
      options: ['Heart', 'Brain', 'Liver', 'Skin'],
      correctAnswer: 3,
      explanation: 'The skin is the largest organ in the human body, covering approximately 20 square feet in adults.',
      difficulty: 'medium',
      category: 'science',
      timeLimit: 25
    },
    {
      id: 'sci_4',
      question: 'What is the speed of light in vacuum?',
      options: ['299,792 km/s', '199,792 km/s', '399,792 km/s', '499,792 km/s'],
      correctAnswer: 0,
      explanation: 'The speed of light in vacuum is approximately 299,792 kilometers per second.',
      difficulty: 'medium',
      category: 'science',
      timeLimit: 30
    },
    {
      id: 'sci_5',
      question: 'Which gas do plants absorb from the atmosphere?',
      options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
      correctAnswer: 1,
      explanation: 'Plants absorb carbon dioxide from the atmosphere during photosynthesis to produce glucose and oxygen.',
      difficulty: 'easy',
      category: 'science',
      timeLimit: 20
    }
  ],
  history: [
    {
      id: 'hist_1',
      question: 'In which year did World War II end?',
      options: ['1943', '1944', '1945', '1946'],
      correctAnswer: 2,
      explanation: 'World War II ended in 1945 with the surrender of Germany in May and Japan in September.',
      difficulty: 'medium',
      category: 'history',
      timeLimit: 25
    },
    {
      id: 'hist_2',
      question: 'Who was the first President of the United States?',
      options: ['Thomas Jefferson', 'John Adams', 'George Washington', 'Benjamin Franklin'],
      correctAnswer: 2,
      explanation: 'George Washington was the first President of the United States, serving from 1789 to 1797.',
      difficulty: 'easy',
      category: 'history',
      timeLimit: 20
    },
    {
      id: 'hist_3',
      question: 'Which ancient wonder was located in Alexandria?',
      options: ['Colossus of Rhodes', 'Lighthouse of Alexandria', 'Hanging Gardens', 'Temple of Artemis'],
      correctAnswer: 1,
      explanation: 'The Lighthouse of Alexandria was one of the Seven Wonders of the Ancient World, located in Alexandria, Egypt.',
      difficulty: 'hard',
      category: 'history',
      timeLimit: 30
    },
    {
      id: 'hist_4',
      question: 'What year did Christopher Columbus discover America?',
      options: ['1490', '1491', '1492', '1493'],
      correctAnswer: 2,
      explanation: 'Christopher Columbus discovered America in 1492, landing in the Bahamas on October 12th.',
      difficulty: 'medium',
      category: 'history',
      timeLimit: 25
    },
    {
      id: 'hist_5',
      question: 'Which empire was ruled by Julius Caesar?',
      options: ['Greek Empire', 'Roman Empire', 'Persian Empire', 'Egyptian Empire'],
      correctAnswer: 1,
      explanation: 'Julius Caesar was a prominent leader of the Roman Empire, though he was never officially emperor.',
      difficulty: 'medium',
      category: 'history',
      timeLimit: 25
    }
  ],
  geography: [
    {
      id: 'geo_1',
      question: 'What is the capital of Australia?',
      options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
      correctAnswer: 2,
      explanation: 'Canberra is the capital of Australia, chosen as a compromise between Sydney and Melbourne.',
      difficulty: 'medium',
      category: 'geography',
      timeLimit: 25
    },
    {
      id: 'geo_2',
      question: 'Which is the largest ocean on Earth?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      correctAnswer: 3,
      explanation: 'The Pacific Ocean is the largest and deepest ocean on Earth, covering about one-third of the Earth\'s surface.',
      difficulty: 'easy',
      category: 'geography',
      timeLimit: 20
    },
    {
      id: 'geo_3',
      question: 'What is the highest mountain in the world?',
      options: ['K2', 'Mount Everest', 'Kangchenjunga', 'Lhotse'],
      correctAnswer: 1,
      explanation: 'Mount Everest is the highest mountain in the world, with a peak elevation of 8,848 meters above sea level.',
      difficulty: 'easy',
      category: 'geography',
      timeLimit: 20
    },
    {
      id: 'geo_4',
      question: 'Which country has the largest population in the world?',
      options: ['India', 'China', 'United States', 'Indonesia'],
      correctAnswer: 1,
      explanation: 'China has the largest population in the world, with over 1.4 billion people.',
      difficulty: 'easy',
      category: 'geography',
      timeLimit: 20
    },
    {
      id: 'geo_5',
      question: 'What is the longest river in the world?',
      options: ['Amazon River', 'Nile River', 'Yangtze River', 'Mississippi River'],
      correctAnswer: 1,
      explanation: 'The Nile River is the longest river in the world, flowing approximately 6,650 kilometers through northeastern Africa.',
      difficulty: 'medium',
      category: 'geography',
      timeLimit: 25
    }
  ],
  literature: [
    {
      id: 'lit_1',
      question: 'Who wrote "Romeo and Juliet"?',
      options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
      correctAnswer: 1,
      explanation: 'William Shakespeare wrote "Romeo and Juliet", one of his most famous tragedies.',
      difficulty: 'easy',
      category: 'literature',
      timeLimit: 20
    },
    {
      id: 'lit_2',
      question: 'What is the main character in "The Great Gatsby"?',
      options: ['Nick Carraway', 'Jay Gatsby', 'Daisy Buchanan', 'Tom Buchanan'],
      correctAnswer: 1,
      explanation: 'Jay Gatsby is the main character in F. Scott Fitzgerald\'s "The Great Gatsby".',
      difficulty: 'medium',
      category: 'literature',
      timeLimit: 25
    },
    {
      id: 'lit_3',
      question: 'Who wrote "1984"?',
      options: ['Aldous Huxley', 'George Orwell', 'Ray Bradbury', 'Isaac Asimov'],
      correctAnswer: 1,
      explanation: 'George Orwell wrote "1984", a dystopian novel published in 1949.',
      difficulty: 'medium',
      category: 'literature',
      timeLimit: 25
    },
    {
      id: 'lit_4',
      question: 'What is the setting of "Pride and Prejudice"?',
      options: ['Victorian England', 'Regency England', 'Modern England', 'Medieval England'],
      correctAnswer: 1,
      explanation: '"Pride and Prejudice" is set in Regency England during the early 19th century.',
      difficulty: 'hard',
      category: 'literature',
      timeLimit: 30
    },
    {
      id: 'lit_5',
      question: 'Who is the author of "To Kill a Mockingbird"?',
      options: ['Harper Lee', 'J.D. Salinger', 'John Steinbeck', 'Ernest Hemingway'],
      correctAnswer: 0,
      explanation: 'Harper Lee wrote "To Kill a Mockingbird", published in 1960.',
      difficulty: 'medium',
      category: 'literature',
      timeLimit: 25
    }
  ],
  sports: [
    {
      id: 'sport_1',
      question: 'Which country has won the most FIFA World Cups?',
      options: ['Germany', 'Argentina', 'Brazil', 'Italy'],
      correctAnswer: 2,
      explanation: 'Brazil has won the most FIFA World Cups with 5 titles (1958, 1962, 1970, 1994, 2002).',
      difficulty: 'medium',
      category: 'sports',
      timeLimit: 25
    },
    {
      id: 'sport_2',
      question: 'How many players are on a basketball court at once?',
      options: ['8', '10', '12', '14'],
      correctAnswer: 1,
      explanation: 'There are 10 players on a basketball court at once - 5 players per team.',
      difficulty: 'easy',
      category: 'sports',
      timeLimit: 15
    },
    {
      id: 'sport_3',
      question: 'Which sport is known as "The Beautiful Game"?',
      options: ['Basketball', 'Tennis', 'Soccer', 'Baseball'],
      correctAnswer: 2,
      explanation: 'Soccer (football) is known as "The Beautiful Game" due to its fluid and artistic nature.',
      difficulty: 'easy',
      category: 'sports',
      timeLimit: 20
    },
    {
      id: 'sport_4',
      question: 'Who holds the record for most Olympic gold medals?',
      options: ['Usain Bolt', 'Michael Phelps', 'Carl Lewis', 'Mark Spitz'],
      correctAnswer: 1,
      explanation: 'Michael Phelps holds the record for most Olympic gold medals with 23 gold medals.',
      difficulty: 'medium',
      category: 'sports',
      timeLimit: 25
    },
    {
      id: 'sport_5',
      question: 'What is the national sport of Japan?',
      options: ['Sumo', 'Baseball', 'Soccer', 'Tennis'],
      correctAnswer: 0,
      explanation: 'Sumo is considered the national sport of Japan, with deep cultural and historical significance.',
      difficulty: 'hard',
      category: 'sports',
      timeLimit: 30
    }
  ],
  entertainment: [
    {
      id: 'ent_1',
      question: 'Who played Iron Man in the Marvel Cinematic Universe?',
      options: ['Chris Evans', 'Robert Downey Jr.', 'Chris Hemsworth', 'Mark Ruffalo'],
      correctAnswer: 1,
      explanation: 'Robert Downey Jr. played Tony Stark/Iron Man in the Marvel Cinematic Universe.',
      difficulty: 'easy',
      category: 'entertainment',
      timeLimit: 20
    },
    {
      id: 'ent_2',
      question: 'Which band released "Bohemian Rhapsody"?',
      options: ['The Beatles', 'Queen', 'Led Zeppelin', 'Pink Floyd'],
      correctAnswer: 1,
      explanation: 'Queen released "Bohemian Rhapsody" in 1975, written by Freddie Mercury.',
      difficulty: 'medium',
      category: 'entertainment',
      timeLimit: 25
    },
    {
      id: 'ent_3',
      question: 'What year did "The Lion King" first premiere?',
      options: ['1992', '1993', '1994', '1995'],
      correctAnswer: 2,
      explanation: '"The Lion King" premiered in 1994 and became one of Disney\'s most successful animated films.',
      difficulty: 'medium',
      category: 'entertainment',
      timeLimit: 25
    },
    {
      id: 'ent_4',
      question: 'Who directed "Titanic"?',
      options: ['Steven Spielberg', 'James Cameron', 'Christopher Nolan', 'Quentin Tarantino'],
      correctAnswer: 1,
      explanation: 'James Cameron directed "Titanic", which won 11 Academy Awards including Best Picture.',
      difficulty: 'medium',
      category: 'entertainment',
      timeLimit: 25
    },
    {
      id: 'ent_5',
      question: 'Which TV show features dragons and is based on George R.R. Martin\'s novels?',
      options: ['The Walking Dead', 'Game of Thrones', 'Breaking Bad', 'Stranger Things'],
      correctAnswer: 1,
      explanation: 'Game of Thrones features dragons and is based on George R.R. Martin\'s "A Song of Ice and Fire" series.',
      difficulty: 'easy',
      category: 'entertainment',
      timeLimit: 20
    }
  ],
  'general-knowledge': [
    {
      id: 'gk_1',
      question: 'What is the largest mammal in the world?',
      options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
      correctAnswer: 1,
      explanation: 'The Blue Whale is the largest mammal in the world, reaching lengths of up to 100 feet.',
      difficulty: 'easy',
      category: 'general-knowledge',
      timeLimit: 20
    },
    {
      id: 'gk_2',
      question: 'How many sides does a hexagon have?',
      options: ['5', '6', '7', '8'],
      correctAnswer: 1,
      explanation: 'A hexagon has 6 sides, from the Greek word "hex" meaning six.',
      difficulty: 'easy',
      category: 'general-knowledge',
      timeLimit: 15
    },
    {
      id: 'gk_3',
      question: 'What is the currency of Japan?',
      options: ['Yuan', 'Won', 'Yen', 'Ringgit'],
      correctAnswer: 2,
      explanation: 'The Yen is the currency of Japan, symbolized by ¥.',
      difficulty: 'medium',
      category: 'general-knowledge',
      timeLimit: 20
    },
    {
      id: 'gk_4',
      question: 'Which planet is closest to the Sun?',
      options: ['Venus', 'Mercury', 'Earth', 'Mars'],
      correctAnswer: 1,
      explanation: 'Mercury is the closest planet to the Sun in our solar system.',
      difficulty: 'easy',
      category: 'general-knowledge',
      timeLimit: 20
    },
    {
      id: 'gk_5',
      question: 'What is the main ingredient in guacamole?',
      options: ['Tomato', 'Avocado', 'Onion', 'Lime'],
      correctAnswer: 1,
      explanation: 'Avocado is the main ingredient in guacamole, a traditional Mexican dish.',
      difficulty: 'easy',
      category: 'general-knowledge',
      timeLimit: 20
    }
  ]
};

const QuizPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    quizState,
    startQuiz,
    answerQuestion,
    nextQuestion,
    getCurrentQuestion,
    getProgress
  } = useQuiz();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [showExplanation, setShowExplanation] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
  const [showExitModal, setShowExitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to fetch from API first
        const response = await quizAPI.getQuizByCategory(category || '', 'mixed', 10);
        
        if (response.data.success && response.data.data && response.data.data.quiz && response.data.data.quiz.questions) {
          const fetchedQuestions = response.data.data.quiz.questions;
          setQuestions(fetchedQuestions);
          // Only start quiz if not already in progress for this category and not completed
          if ((!quizState.questions.length || quizState.category !== category) && !quizState.isCompleted) {
            setTimeout(() => {
              startQuiz(fetchedQuestions, category || '', 'mixed');
            }, 0);
          }
          toast.success(`Loaded ${fetchedQuestions.length} questions for ${category} quiz!`);
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (error) {
        console.error('Error fetching quiz questions:', error);
        
        // Use fallback questions - ensures users never see errors
        const fallbackCategory = category || 'general-knowledge';
        const fallbackQuestionsForCategory = fallbackQuestions[fallbackCategory] || fallbackQuestions['general-knowledge'];
        
        setQuestions(fallbackQuestionsForCategory);
        // Only start quiz if not already in progress for this category and not completed
        if ((!quizState.questions.length || quizState.category !== category) && !quizState.isCompleted) {
          setTimeout(() => {
            startQuiz(fallbackQuestionsForCategory, fallbackCategory, 'mixed');
          }, 0);
        }
        
        if (retryCount === 0) {
          toast.error('Using offline questions. Some features may be limited.');
        }
        
        setError('Using offline questions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [category, retryCount, quizState.questions.length, quizState.category, quizState.isCompleted, startQuiz]);

  useEffect(() => {
    if (!currentQuestion || isAnswered) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, isAnswered]);

  useEffect(() => {
    if (currentQuestion) {
      setTimeRemaining(currentQuestion.timeLimit);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplanation(false);
    }
  }, [currentQuestion]);

  // Navigate to results when quiz is completed
  useEffect(() => {
    if (quizState.isCompleted) {
      navigate('/quiz/result');
    }
  }, [quizState.isCompleted, navigate]);

  const handleTimeUp = () => {
    if (!isAnswered) {
      setIsAnswered(true);
      answerQuestion(-1); // -1 indicates no answer selected
      toast.error('Time\'s up! Moving to next question.');
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    answerQuestion(answerIndex);
    setShowExplanation(true);
    
    // Show feedback
    const isCorrect = answerIndex === currentQuestion?.correctAnswer;
    if (isCorrect) {
      toast.success('Correct! Well done! 🎉');
    } else {
      toast.error(`Incorrect. The correct answer was: ${currentQuestion?.options[currentQuestion.correctAnswer]}`);
    }
  };

  const handleNextQuestion = () => {
    if (quizState.currentQuestionIndex + 1 >= quizState.questions.length) {
      // Quiz completed - call nextQuestion to mark as completed, then navigate
      nextQuestion();
      // The useEffect above will handle the navigation
    } else {
      nextQuestion();
    }
  };

  const toggleBookmark = () => {
    if (!currentQuestion) return;
    
    const newBookmarks = new Set(bookmarkedQuestions);
    if (newBookmarks.has(currentQuestion.id)) {
      newBookmarks.delete(currentQuestion.id);
      toast.success('Question removed from bookmarks');
    } else {
      newBookmarks.add(currentQuestion.id);
      toast.success('Question bookmarked!');
    }
    setBookmarkedQuestions(newBookmarks);
  };

  const handleExitQuiz = () => {
    navigate('/quiz');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz questions...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Preparing your {category} challenge</p>
        </div>
      </div>
    );
  }

  if (quizState.isCompleted) {
    return null;
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">No questions available for this category</p>
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
              <Button onClick={handleRetry} className="mt-2" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
          <Button onClick={() => navigate('/quiz')} className="mt-4">
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Quiz Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Progress Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                    {category} Quiz
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                    {currentQuestion.difficulty}
                  </span>
                  {error && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs">
                      Offline Mode
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                  <span>Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}</span>
                  <span>Score: {quizState.score}/{quizState.currentQuestionIndex + (isAnswered ? 1 : 0)}</span>
                  {user && (
                    <span>Player: {user.name} (Level {user.level})</span>
                  )}
                </div>
                <div className="mt-3">
                  <ProgressBar progress={progress} showLabel={false} />
                </div>
              </div>

              {/* Timer and Actions */}
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${timeRemaining <= 10 ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'}`}>
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">{timeRemaining}s</span>
                </div>
                
                <button
                  onClick={toggleBookmark}
                  className={`p-2 rounded-lg transition-colors ${
                    bookmarkedQuestions.has(currentQuestion.id)
                      ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Bookmark question"
                >
                  <Bookmark className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setShowExitModal(true)}
                  className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Exit quiz"
                >
                  <Flag className="w-5 h-5" />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 mb-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                let optionClass = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ";
                
                if (!isAnswered) {
                  optionClass += "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer";
                } else {
                  if (index === currentQuestion.correctAnswer) {
                    optionClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300";
                  } else if (index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer) {
                    optionClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300";
                  } else {
                    optionClass += "border-gray-200 dark:border-gray-600 opacity-50";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                    className={optionClass}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-medium">{option}</span>
                      {isAnswered && index === currentQuestion.correctAnswer && (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 ml-auto" />
                      )}
                      {isAnswered && index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer && (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HelpCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Explanation</h4>
                      <p className="text-blue-800 dark:text-blue-200">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate('/quiz')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Categories</span>
          </Button>

          {isAnswered && (
            <Button
              onClick={handleNextQuestion}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <span>
                {quizState.currentQuestionIndex + 1 >= quizState.questions.length ? 'Finish Quiz' : 'Next Question'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Exit Confirmation Modal */}
        <Modal
          isOpen={showExitModal}
          onClose={() => setShowExitModal(false)}
          title="Exit Quiz?"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Are you sure you want to exit?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your progress will be lost and you'll need to start over.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowExitModal(false)}
                className="flex-1"
              >
                Continue Quiz
              </Button>
              <Button
                variant="danger"
                onClick={handleExitQuiz}
                className="flex-1"
              >
                Exit Quiz
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default QuizPage;