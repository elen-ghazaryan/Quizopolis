export type UserRole = 'teacher' | 'student';

export interface SessionInfo {
  quizId: string;
  title: string;
  accessCode: string;
  isActive: boolean;
  totalQuestions: number;
  quizStarted?: boolean;
}

export interface Participant {
  _id: string;
  username: string;
  avatar?: string;
}

export interface QuestionData {
  index: number;
  total: number;
  questionText: string;
  questionType: 'single-choice' | 'multiple-choice' | 'short-answer';
  options: Array<{ text: string }>;
  points: number;
  image?: string;
  questionId: string;
}

export interface QuestionResults {
  questionIndex: number;
  correctAnswers: number[];
  explanation?: string;
  stats: {
    totalAnswered: number;
    correctAnswers: number;
    percentage: number;
  };
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  percentage: string;
}

export interface AnswerSubmission {
  quizId: string;
  questionId: string;
  selectedOptions?: number[];
  textAnswer?: string;
}

export interface AnswerResponse {
  message: string;
  isCorrect: boolean;
  pointsEarned: number;
  totalScore: number;
}

export interface ClientToServerEvents {
  'teacher:join-room': { quizId: string; userId: string };
  'teacher:start-quiz': { quizId: string };
  'teacher:next-question': { quizId: string };
  'teacher:end-quiz': { quizId: string };
  'student:join-room': { quizId: string; userId: string; accessCode?: string };
  'student:submit-answer': AnswerSubmission;
}

export interface ServerToClientEvents {
  'teacher:joined': { message: string; participants: Participant[], totalParticipants: number };
  'student:joined': { message: string; quizTitle: string; waitingForStart: boolean; totalQuestions: number };
  'student:answered': { totalAnswered: number; totalParticipants: number };
  'quiz:started': { message: string; question: QuestionData; startTime: string };
  'question:new': { question: QuestionData; startTime: string };
  'question:results': QuestionResults;
  'quiz:ended': { message: string; leaderboard: LeaderboardEntry[]; totalQuestions: number };
  'participant:joined': { participant: Participant; totalParticipants: number };
  'participant:left': { userId: string };
  'answer:submitted': AnswerResponse;
  'error': { message: string };
}

export type SessionState = 
  | 'lobby'
  | 'waiting'
  | 'question'
  | 'results'
  | 'leaderboard'
  | 'ended';