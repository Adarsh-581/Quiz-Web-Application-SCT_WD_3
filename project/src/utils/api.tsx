import axios from 'axios';
import {
  ApiResponse,
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  QuizCategory,
  QuizSubmission,
  QuizResult,
  QuizHistory,
  DashboardData,
  Achievement,
  LeaderboardEntry,
  UserRank,
  UserPreferences
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints with proper TypeScript types
export const authAPI = {
  login: (data: LoginRequest) => 
    api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => 
    api.post<AuthResponse>('/auth/register', data),
  getProfile: () => 
    api.get<ApiResponse<User>>('/auth/me'),
  updateProfile: (data: Partial<User>) => 
    api.put<ApiResponse<User>>('/user/profile', data),
};

export const quizAPI = {
  getCategories: () => 
    api.get<ApiResponse<QuizCategory[]>>('/quiz/categories'),
  getQuizByCategory: (category: string, difficulty?: string, limit?: number) => 
    api.get<ApiResponse<{ quiz: { id: string; category: string; difficulty: string; questions: any[] } }>>(
      `/quiz/category/${category}`, 
      { params: { difficulty, limit } }
    ),
  submitQuiz: (quizData: QuizSubmission) => 
    api.post<ApiResponse<QuizResult>>('/quiz/submit', quizData),
  getQuizHistory: () => 
    api.get<ApiResponse<QuizHistory[]>>('/quiz/history'),
  getQuizStats: () => 
    api.get<ApiResponse<any>>('/quiz/stats'),
};

export const leaderboardAPI = {
  getGlobalLeaderboard: () => 
    api.get<ApiResponse<LeaderboardEntry[]>>('/leaderboard/global'),
  getCategoryLeaderboard: (category: string) => 
    api.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard/category/${category}`),
  getUserRank: () => 
    api.get<ApiResponse<UserRank>>('/leaderboard/rank'),
};

export const userAPI = {
  getAchievements: () => 
    api.get<ApiResponse<Achievement[]>>('/user/achievements'),
  updatePreferences: (preferences: UserPreferences) => 
    api.put<ApiResponse<User>>('/user/preferences', preferences),
  getDashboardStats: () => 
    api.get<ApiResponse<DashboardData>>('/user/dashboard'),
};