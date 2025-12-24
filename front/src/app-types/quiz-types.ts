//USER RELATED TYPES
export type SignupUser = {
  username: string;
  email: string;
  password: string;
  role: "student" | "teacher";
};

export type LoginUser = {
  username: string;
  password: string;
};

//USER STATS
export interface IStreakStats {
  currentStreak: number;
  lastQuizDate: Date;
  longestStreak: number;
  weekActivity: Activity[];
}

type Activity = {
  date: Date;
  completed: boolean;
};

export interface UserStats {
  accuracy: number;
  averageSCore: number;
  averageTime: number;
  bestScore: number;
  correctAnswers: number;
  lastQuizDate: Date | null;
  quizzesThisMonth: number;
  strongestCategory: string | null;
  totalQuestions: number;
  totalQuizzes: number;
  totalTime: number;
  weakestCategory: string | null;
  accuracyHistory: { date: string; accuracy: number }[];
}

//ERROR RESPONSE TYPE
export type IErrorResponse = {
  message: string;
  errors?: string[];
};

export type IResponse<T> = {
  message: string;
  payload: T;
};

//QUIZ RELATED TYPES
type Difficulty = "easy" | "medium" | "hard";
type Mode = "standard" | "live";

export interface IQuizForm {
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  mode: Mode;
  isPublished: boolean;
}

export type Quiz = IQuizForm & {
  _id: string;
  createdAt: Date;
  createdBy: { username: string; avatar: string };
  isActive: boolean;
  questions: [];
  comments: [];
  participants: [];
};

export type QuizDetail = IQuizForm & {
  _id: string;
  createdBy: Creator;
  questions: Question[];
  comments: QuizComment[];
  isFavorite: boolean;
  createdAt: string;
};

interface Creator {
  _id: string;
  username: string;
  avatar?: string;
}

//QUESTION TYPE
export interface IQuestionForm {
  questionText: string;
  questionType: string;
  options: Array<{ text: string; isCorrect: boolean }>;
  correctAnswer: string;
  points: number;
  explanation?: string;
  image?: string;
}

export type Question = IQuestionForm & {
  _id: string;
  quizId: string;
};

//TEACHER QUIZ TYPE
export interface TeacherQuizzes {
  quizzes: Quiz[];
  stats: TeacherStats;
}

export type TeacherStats = {
  standard: {
    totalAttempts: number;
    avgScore: number;
    avgPercentage: number;
    avgTimeSpent: number;
    totalCompleted: number;
    completionRate: number;
  };
  live: {
    totalParticipants: number;
  };
};

export type StudentQuiz = IQuizForm & {
  _id: string;
  createdAt: string;
  createdBy: Creator;
  questionCount: number;
};

//QUIZ COMMENT TYPE
export interface QuizComment {
  _id: string;
  text: string;
  userId: Creator;
  quizId: string;
  createdAt: string;
}

//QUIZ ATTEMPT TYPES
export interface TakeQuiz {
  attempt: Attempt;
  questions: Question[];
}

export interface Attempt {
  attemptId: string;
  quizId: string;
  startedAt: string;
  totalPoints: number;
}

export interface DraftAnswer {
  questionId: string;
  selectedOptions?: number[];
  textAnswer?: string;
}

export interface SubmitQuiz {
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface ResumeQuiz {
  attempt: Pick<Attempt, "attemptId" | "startedAt">;
  draftAnswers: DraftAnswer[];
  questions: Question[];
}

//QUIZ ATTEMPT RESULTS
export interface QuizResults {
  totalScore: number;
  totalPoints: number;
  percentage: number;
  answers: AnswerDetail[];
}

export interface AnswerDetail {
  questionId: string;
  questionText: string;
  options: OptionFeedback[];
  textAnswer?: string;
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswer: string;
}

export interface OptionFeedback {
  text: string;
  isCorrect: boolean;
  userSelected: boolean;
}

//TEACHER-QUIZ RELATED TYPES
type Participant = {
  _id: string;
  username: string;
  avatar: string;
};

export interface QuizStats {
  totalAttempts: number;
  scoreRanges: {
    "0-49%": number;
    "50-69%": number;
    "70-89%": number;
    "90-100%": number;
  };
  averageScore: number;
  highestScore: number;
  activeParticipants: Participant[];
}

export interface TeacherQuizDetail {
  _id: string;
  title: string;
  description: string;
  category: string
  difficulty: Difficulty
  mode: Mode
  isPublished: boolean
  isActive: boolean
  createdBy: Creator
  questions: Question[];
  comments: QuizComment[];
  startTime: string;
  endTime: string;
  createdAt: string;
  participants: Participant[];
}
