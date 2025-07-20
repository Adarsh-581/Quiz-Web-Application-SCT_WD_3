import React, { createContext, useContext, useState } from 'react';
import { Question, QuizState } from '../types';

interface QuizContextType {
  quizState: QuizState;
  startQuiz: (questions: Question[], category: string, difficulty: string) => void;
  answerQuestion: (answerIndex: number) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
  getCurrentQuestion: () => Question | null;
  getProgress: () => number;
  getTimeRemaining: () => number;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

const initialQuizState: QuizState = {
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  score: 0,
  timeSpent: 0,
  isCompleted: false,
  startTime: 0,
  category: '',
  difficulty: '',
};

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quizState, setQuizState] = useState<QuizState>(initialQuizState);

  const startQuiz = (questions: Question[], category: string, difficulty: string) => {
    setQuizState({
      ...initialQuizState,
      questions,
      startTime: Date.now(),
      category,
      difficulty,
    });
  };

  const answerQuestion = (answerIndex: number) => {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    setQuizState(prev => ({
      ...prev,
      answers: [...prev.answers, answerIndex],
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
  };

  const nextQuestion = () => {
    setQuizState(prev => {
      const newIndex = prev.currentQuestionIndex + 1;
      const isCompleted = newIndex >= prev.questions.length;
      
      return {
        ...prev,
        currentQuestionIndex: newIndex,
        isCompleted,
        timeSpent: isCompleted ? Date.now() - prev.startTime : prev.timeSpent,
      };
    });
  };

  const resetQuiz = () => {
    setQuizState(initialQuizState);
  };

  const getCurrentQuestion = (): Question | null => {
    if (quizState.currentQuestionIndex < quizState.questions.length) {
      return quizState.questions[quizState.currentQuestionIndex];
    }
    return null;
  };

  const getProgress = (): number => {
    if (quizState.questions.length === 0) return 0;
    return (quizState.currentQuestionIndex / quizState.questions.length) * 100;
  };

  const getTimeRemaining = (): number => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return 0;
    const elapsed = Date.now() - quizState.startTime;
    const timeLimit = currentQuestion.timeLimit * 1000;
    return Math.max(0, timeLimit - elapsed);
  };

  return (
    <QuizContext.Provider value={{
      quizState,
      startQuiz,
      answerQuestion,
      nextQuestion,
      resetQuiz,
      getCurrentQuestion,
      getProgress,
      getTimeRemaining
    }}>
      {children}
    </QuizContext.Provider>
  );
};