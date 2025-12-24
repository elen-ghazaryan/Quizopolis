import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { Axios } from '@config/axios';
import { toast } from 'react-toastify';
import type {
  SessionInfo,
  Participant,
  QuestionData,
  QuestionResults,
  LeaderboardEntry,
  SessionState,
  UserRole,
  AnswerSubmission,
  AnswerResponse,
} from "@app-types/live-quiz-types";

interface UseLiveSessionProps {
  quizId: string;
  userId: string;
  role: UserRole;
}

export const useLiveSession = ({ quizId, userId, role }: UseLiveSessionProps) => {
  const { emit, on, off, isConnected, disconnect } = useWebSocket();
  
  const [sessionState, setSessionState] = useState<SessionState>('lobby');
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [questionResults, setQuestionResults] = useState<QuestionResults | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [error, setError] = useState<string>('');

  // API Calls
  const startLiveSession = useCallback(async () => {
    try {
      const response = await Axios.post(`/admin/quiz/${quizId}/live/start`);
      setSessionInfo(response.data.payload.quiz);
      return response.data.payload.quiz;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to start session';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [quizId]);

  const joinLiveQuiz = useCallback(async (accessCode: string) => {
    try {
      const response = await Axios.post(`/quiz/${quizId}/live/join`, { accessCode });
      setSessionInfo(response.data.payload);
      return response.data.payload;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to join quiz';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [quizId]);

  // WebSocket Actions
  const joinRoom = useCallback(() => {
    console.log('joinRoom - Full data:', { role, userId, quizId, accessCode: sessionInfo?.accessCode });

    if (role === 'teacher') {
      emit('teacher:join-room', { quizId, userId });
    } else {
      emit('student:join-room', { quizId, userId, accessCode: sessionInfo?.accessCode || '' });
    }
  }, [emit, quizId, userId, role, sessionInfo?.accessCode]);

  const startQuiz = useCallback(() => {
    if (role === 'teacher') {
      emit('teacher:start-quiz', { quizId });
    }
  }, [emit, quizId, role]);

  const nextQuestion = useCallback(() => {
    if (role === 'teacher') {
      emit('teacher:next-question', { quizId });
      setQuestionResults(null);
      setAnsweredCount(0);
    }
  }, [emit, quizId, role]);

  const endQuiz = useCallback(() => {
    if (role === 'teacher') {
      emit('teacher:end-quiz', { quizId });
    }
  }, [emit, quizId, role]);

  const submitAnswer = useCallback((answer: Omit<AnswerSubmission, 'quizId'>) => {
    if (role === 'student') {
      emit('student:submit-answer', { quizId, ...answer });
    }
  }, [emit, quizId, role]);

  // WebSocket Event Listeners
  useEffect(() => {
    if (!isConnected) return;

    // Teacher-specific events
    if (role === 'teacher') {
      on('teacher:joined', (data) => {
        console.log('Teacher joined:', data);

        if(data.participants && Array.isArray(data.participants)) {
          console.log("setting initial participants: " + data.participants)
          setParticipants(data.participants)
        }

        setSessionState('lobby');
      });

      on('student:answered', (data) => {
        setAnsweredCount(data.totalAnswered);
      });
    }

    // Student-specific events
    if (role === 'student') {
      on('student:joined', (data) => {
        console.log('Student joined:', data);
        setSessionState('waiting');
        toast.success('Joined the quiz! Waiting for teacher to start...');
      });

      on('answer:submitted', (data: AnswerResponse) => {
        setTotalScore(data.totalScore);
        if (data.isCorrect) {
          toast.success(`Correct! +${data.pointsEarned} points`);
        } else {
          toast.error('Incorrect answer');
        }
      });
    }

    // Shared events
    on('quiz:started', (data) => {
      setCurrentQuestion(data.question);
      setSessionState('question');
      setQuestionResults(null);
      toast.info('Quiz has started! Good luck!');
    });

    on('question:new', (data) => {
      setCurrentQuestion(data.question);
      setSessionState('question');
      setQuestionResults(null);
      setAnsweredCount(0);
    });

    on('question:results', (data) => {
      setQuestionResults(data);
      setSessionState('results');
    });

    on('quiz:ended', (data) => {
      setLeaderboard(data.leaderboard);
      setSessionState('ended');
    });

    on('participant:joined', (data) => {
      setParticipants(prev => {
        const exists = prev.some(p => p._id === data.participant._id);
        if (exists) return prev;
        
        if (role === 'teacher') {
          toast.info(`${data.participant.username} joined the quiz`, {
            autoClose: 3000,
          });
        }
        
        return [...prev, data.participant];
      });
    });

    on('participant:left', (data) => {
      setParticipants(prev => {
        const participant = prev.find(p => p._id === data.userId);
        
        if (role === 'teacher' && participant) {
          toast.warning(`${participant.username} left the quiz`, {
            autoClose: 3000,
          });
        }
        
        return prev.filter(p => p._id !== data.userId);
      });
    });

    on('error', (data) => {
      setError(data.message);
      toast.error(data.message);
      console.error('WebSocket error:', data.message);
    });

    return () => {
      off('teacher:joined');
      off('student:joined');
      off('student:answered');
      off('answer:submitted');
      off('quiz:started');
      off('question:new');
      off('question:results');
      off('quiz:ended');
      off('participant:joined');
      off('participant:left');
      off('error');
    };
  }, [isConnected, role, on, off]);

  return {
    // State
    sessionState,
    sessionInfo,
    participants,
    currentQuestion,
    questionResults,
    leaderboard,
    answeredCount,
    totalScore,
    error,
    isConnected,
    
    // Actions
    startLiveSession,
    joinLiveQuiz,
    joinRoom,
    startQuiz,
    nextQuestion,
    endQuiz,
    submitAnswer,
    clearError: () => setError(''),
    disconnect
  };
};