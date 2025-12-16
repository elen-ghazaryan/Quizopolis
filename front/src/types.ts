export type SignupUser = {
  username: string
  email: string
  password: string
  role: "student" | "teacher"
}

export type LoginUser = {
  username: string
  password: string
}


export type IErrorResponse = {
  message: string
  errors?: string[]
}


export type IResponse<T> = {
  message: string
  payload: T
}

export interface IStreakStats {
  currentStreak: number
  lastQuizDate: Date
  longestStreak: number
  weekActivity: Activity[]
}

type Activity = {
  date: Date
  completed: boolean
}


type Difficulty = "easy" | "medium" | "hard"
type Mode = "standard" | "live"

export interface IQuizForm {
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  mode: Mode;
  isPublished: boolean;
}

export type Quiz = IQuizForm & {
  _id: string
  createdAt: Date
  createdBy: { username: string; avatar: string}
  isActive: boolean
  questions: []
  comments: []
  participants: []

}

export interface IQuestionForm {
  questionText: string;
  questionType: string;
  options: Array<{ text: string; isCorrect: boolean }>;
  correctAnswer: string;
  points: number;
  explanation: string;
  image?: string;
}

export type Question = IQuestionForm & {
  _id: string
  quizId: string
} 

export interface TeacherQuizzes {
  quizzes: Quiz[]
  stats: TeacherStats
}

export type TeacherStats = {
  standard: {
    totalAttempts: number
    avgScore: number
    avgPercentage: number
    avgTimeSpent: number
    totalCompleted: number
    completionRate: number
  },
  live: {
    totalParticipants: number
    avgScore: 7.1
  }
}

interface Creator {
  username: string;
  avatar: string;
}

export type StudentQuiz = IQuizForm & {
  _id: string
  createdAt: string
  createdBy: Creator
  questionCount: number
}


export interface UserStats {
  accuracy: number
  averageSCore: number
  averageTime: number
  bestScore: number
  correctAnswers: number
  lastQuizDate: Date | null
  quizzesThisMonth: number
  strongestCategory: string | null
  totalQuestions: number
  totalQuizzes: number
  totalTime: number
  weakestCategory: string | null
  accuracyHistory: { date: string; accuracy: number }[]

}