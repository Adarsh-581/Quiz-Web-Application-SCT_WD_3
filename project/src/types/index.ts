// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    details?: string;
  };
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  totalQuizzes: number;
  averageScore: number;
  currentStreak: number;
  joinDate: string;
  lastLogin: string;
  achievements: string[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  notifications: boolean;
  preferredCategories: string[];
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

// Quiz Types
export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  timeLimit: number;
}

export interface QuizCategory {
  id: string;
  name: string;
  description: string;
  totalQuestions: number;
  averageScore: number;
  participants: number;
  difficulty: string[];
  estimatedTime: string;
}

export interface QuizSubmission {
  quizId: string;
  category: string;
  difficulty: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  timeSpent: number;
  startTime: string;
  endTime: string;
}

export interface QuizResult {
  score: number;
  percentage: number;
  xpEarned: number;
  newLevel: number;
  achievements: string[];
  rank: number;
  categoryRank: number;
}

export interface QuizHistory {
  id: string;
  category: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
  difficulty: string;
}

// Dashboard Types
export interface DashboardData {
  recentScores: Array<{
    date: string;
    score: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    score: number;
    fullMark: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
    score: number;
  }>;
  weeklyGoal: {
    current: number;
    target: number;
  };
  dailyChallenge: {
    completed: boolean;
    title: string;
    category: string;
    xp: number;
  };
  recommendedQuizzes: Array<{
    id: string;
    title: string;
    category: string;
    difficulty: string;
    estimatedTime: number;
  }>;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  date: string | null;
  icon: string;
  xp: number;
}

// Leaderboard Types
export interface LeaderboardEntry {
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

export interface UserRank {
  global: number;
  category: number;
  totalUsers: number;
}

// Quiz State Types
export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: number[];
  score: number;
  timeSpent: number;
  isCompleted: boolean;
  startTime: number;
  category: string;
  difficulty: string;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'auto';

// API Error Types
export interface ApiError {
  success: false;
  error: {
    message: string;
    details?: string;
  };
} 