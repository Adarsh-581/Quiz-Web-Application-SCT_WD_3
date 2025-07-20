import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { QuizProvider } from './context/QuizContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import QuizCategoryPage from './pages/QuizCategoryPage';
import QuizPage from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';
import LeaderboardPage from './pages/LeaderboardPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QuizProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 transition-colors duration-300">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/quiz" element={
                    <ProtectedRoute>
                      <QuizCategoryPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/quiz/:category" element={
                    <ProtectedRoute>
                      <QuizPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/quiz/result" element={
                    <ProtectedRoute>
                      <QuizResultPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/leaderboard" element={
                    <ProtectedRoute>
                      <LeaderboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1f2937',
                    color: '#f9fafb',
                    borderRadius: '12px',
                  },
                }}
              />
            </div>
          </Router>
        </QuizProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;