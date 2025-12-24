import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveSession } from '../../../hooks/useLiveSession';
import { TeacherLobby } from '@components/live-quiz/teacherLobby/TeacherLobby';
import { StudentJoin } from '@components/live-quiz/studentJoin/StudentJoin';
import { StudentLobby } from '@components/live-quiz/studentLobby/StudentLobby'; 
import { QuestionDisplay } from '@components/live-quiz/questionDisplay/QuestionDisplay'; 
import { Leaderboard } from '@components/live-quiz/leaderboard/Leaderboard'; 
import { useContextState } from '../../../context/hooks';
import styles from './liveSession.module.css'
import { AlertTriangle } from 'lucide-react';

export const LiveSessionPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user } = useContextState()

  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);

  const {
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
    startLiveSession,
    joinLiveQuiz,
    joinRoom,
    startQuiz,
    nextQuestion,
    endQuiz,
    submitAnswer,
    disconnect
  } = useLiveSession({
    quizId: quizId || '',
    userId: user?.id || '',
    role: user?.role || 'student',
  });

  // Teacher: Auto-start session
  useEffect(() => {
    if (user && user.role === 'teacher' && quizId && !sessionInfo) {
      startLiveSession().catch((err) => {
        console.error('Failed to start session:', err);
      });
    }
  }, [user?.role, quizId, sessionInfo, startLiveSession]);

  // Join WebSocket room after session info is available
  useEffect(() => {
    if (sessionInfo && isConnected && !hasJoinedRoom && user?.id) {
      console.log('Joining room with user:', user.id); 
      joinRoom();
       Promise.resolve().then(() => setHasJoinedRoom(true));
    }
  }, [sessionInfo, isConnected, hasJoinedRoom, joinRoom]);

  useEffect(() => {
    return () => {
      console.log('LiveSessionPage unmounting, disconnecting...');
      disconnect?.();
    };
  }, [disconnect]);

  const handleJoinQuiz = async (accessCode: string) => {
    try {
      await joinLiveQuiz(accessCode);
    } catch (err) {
      console.error('Join failed:', err);
    }
  };

  const handleStartQuiz = () => {
    startQuiz();
  };

  const handleNextQuestion = () => {
    nextQuestion();
  };

  const handleEndQuiz = () => {
    endQuiz();
  };

  const handleSubmitAnswer = (answer: {
    questionId: string;
    selectedOptions?: number[];
    textAnswer?: string;
  }) => {
    submitAnswer(answer);
  };

  const handleLeaderboardClose = () => {
    navigate('/layout/quizzes');
  };

  if (error) {
    return (
      <div className={styles.errContainer}>
        <div className={styles.errBox}>
          <AlertTriangle className={styles.errIcon} />
          <h2 className={styles.errTitle}>Error</h2>
          <p className={styles.errMessage}>{error}</p>
          <button className={styles.errButton} onClick={() => navigate('/layout/quizzes')}>
            Return to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (!user || !user.id) {
    return <div className={styles.loading}>Loading user data...</div>;
  }

  // Render based on state
  if (sessionState === 'ended') {
    return (
      <Leaderboard
        leaderboard={leaderboard}
        totalQuestions={sessionInfo?.totalQuestions || 0}
        quizTitle={sessionInfo?.title || ''}
        onClose={handleLeaderboardClose}
      />
    );
  }

  if (sessionState === 'question' || sessionState === 'results') {
    if (!currentQuestion) return null;

    return (
      <QuestionDisplay
        question={currentQuestion}
        questionResults={questionResults}
        role={user?.role || 'student'}
        answeredCount={answeredCount}
        totalParticipants={participants.length}
        participants={participants}
        totalScore={totalScore}
        onSubmitAnswer={handleSubmitAnswer}
        onNextQuestion={handleNextQuestion}
        onEndQuiz={handleEndQuiz}
      />
    );
  }

  if (user?.role === 'teacher' && sessionState === 'lobby') {
    if (!sessionInfo) return <div>Loading...</div>;

    return (
      <TeacherLobby
        sessionInfo={sessionInfo}
        participants={participants}
        onStartQuiz={handleStartQuiz}
        isConnected={isConnected}
      />
    );
  }

  if (user?.role === 'student') {
    if (!sessionInfo) {
      return <StudentJoin onJoin={handleJoinQuiz} error={error} />;
    }

    if (sessionState === 'waiting') {
      return (
        <StudentLobby
          sessionInfo={sessionInfo}
          participants={participants}
          isConnected={isConnected}
        />
      );
    }
  }

  return <div>Loading...</div>;
};