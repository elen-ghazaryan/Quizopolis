import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './standardQuizDetail.module.css';
import type { IResponse, QuizStats, TeacherQuizDetail } from 'app-types/quiz-types';
import { Axios } from '@config/axios';
import { toast } from 'react-toastify';

export const TeacherQuizDetails = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<TeacherQuizDetail | null>(null);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showComments, setShowComments] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const isLiveMode = quiz?.mode === 'live';

  useEffect(() => {
    if (!quizId) return;

    setLoading(true);
    
    Axios.get<IResponse<TeacherQuizDetail>>(`/admin/quiz/${quizId}`)
      .then(resp => {
        setQuiz(resp.data.payload);
        return Axios.get<IResponse<QuizStats>>(`/admin/quiz/${quizId}/stats`);
      })
      .then(resp => {
        setStats(resp.data.payload);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        const errorMsg = err.response?.data?.message || 'Failed to load quiz details';
        setError(errorMsg);
        setLoading(false);
      });
  }, [quizId]);

  const handleEdit = () => {
    navigate(`/layout/quizzes/${quizId}/edit`);
  };

  const handleGoBack = () => {
    if (quiz?.isPublished) {
      navigate("/layout/quizzes/published");
    } else {
      navigate("/layout/quizzes/unpublished");
    }
  };

  const handleStartLiveSession = () => {
    navigate(`/layout/quizzes/${quizId}/admin/live`);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await Axios.delete(`quiz/${quizId}/comment/${commentId}`);
      
      setQuiz(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.filter(c => c._id !== commentId)
        };
      });
      toast.success('Comment deleted successfully');
    } catch (err) {
      console.error('Failed to delete comment:', err);
      toast.error('Failed to delete comment. Please try again.');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading quiz details...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!quiz || !stats) {
    return <div className={styles.error}>Quiz not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{quiz.title}</h1>
          <div className={styles.badges}>
            <span className={`${styles.badge} ${styles[quiz.difficulty]}`}>
              {quiz.difficulty}
            </span>
            <span className={`${styles.badge} ${isLiveMode ? styles.live : styles.mode}`}>
              {isLiveMode ? 'LIVE MODE' : quiz.mode}
            </span>
            {quiz.isPublished ? (
              <span className={`${styles.badge} ${styles.published}`}>Published</span>
            ) : (
              <span className={`${styles.badge} ${styles.draft}`}>Draft</span>
            )}
          </div>
        </div>
        
        <div className={styles.actionButtons}>
          {isLiveMode && (
            <button className={styles.startBtn} onClick={handleStartLiveSession}>
              🎯 Start Live Session
            </button>
          )}
          <button className={styles.editBtn} onClick={handleEdit}>
            Edit Quiz
          </button>
          <button className={styles.backBtn} onClick={handleGoBack}>
            ← Back
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Quiz Info Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Quiz Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Description:</span>
              <p className={styles.infoValue}>{quiz.description}</p>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Category:</span>
              <span className={styles.infoValue}>{quiz.category}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Created by:</span>
              <div className={styles.creator}>
                <img 
                  src={quiz.createdBy.avatar ? `${API_URL}/uploads/${quiz.createdBy.avatar}` : "default_avatar.png"} 
                  alt={quiz.createdBy.username} 
                  className={styles.avatar} 
                />
                <span className={styles.infoValue}>{quiz.createdBy.username}</span>
              </div>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Created at:</span>
              <span className={styles.infoValue}>
                {new Date(quiz.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {isLiveMode ? 'Live Session Statistics' : 'Quiz Statistics'}
          </h2>
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${isLiveMode ? styles.purple : ''}`}>
              <div className={styles.statValue}>{stats.totalAttempts}</div>
              <div className={styles.statLabel}>
                {isLiveMode ? 'Total Participants' : 'Total Attempts'}
              </div>
            </div>
            <div className={`${styles.statCard} ${isLiveMode ? styles.blue : ''}`}>
              <div className={styles.statValue}>{stats.averageScore.toFixed(1)}%</div>
              <div className={styles.statLabel}>Average Score</div>
            </div>
            <div className={`${styles.statCard} ${isLiveMode ? styles.green : ''}`}>
              <div className={styles.statValue}>{stats.highestScore}%</div>
              <div className={styles.statLabel}>Highest Score</div>
            </div>
          </div>

          <div className={styles.scoreRanges}>
            <h3 className={styles.scoreRangesTitle}>Score Distribution</h3>
            <div className={styles.rangeGrid}>
              <div className={styles.rangeItem}>
                <span className={styles.rangeLabel}>0-49%</span>
                <div className={styles.rangeBar}>
                  <div 
                    className={`${styles.rangeProgress} ${styles.low}`}
                    style={{ width: `${stats.totalAttempts > 0 ? (stats.scoreRanges['0-49%'] / stats.totalAttempts) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className={styles.rangeCount}>{stats.scoreRanges['0-49%']}</span>
              </div>
              <div className={styles.rangeItem}>
                <span className={styles.rangeLabel}>50-69%</span>
                <div className={styles.rangeBar}>
                  <div 
                    className={`${styles.rangeProgress} ${styles.medium}`}
                    style={{ width: `${stats.totalAttempts > 0 ? (stats.scoreRanges['50-69%'] / stats.totalAttempts) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className={styles.rangeCount}>{stats.scoreRanges['50-69%']}</span>
              </div>
              <div className={styles.rangeItem}>
                <span className={styles.rangeLabel}>70-89%</span>
                <div className={styles.rangeBar}>
                  <div 
                    className={`${styles.rangeProgress} ${styles.good}`}
                    style={{ width: `${stats.totalAttempts > 0 ? (stats.scoreRanges['70-89%'] / stats.totalAttempts) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className={styles.rangeCount}>{stats.scoreRanges['70-89%']}</span>
              </div>
              <div className={styles.rangeItem}>
                <span className={styles.rangeLabel}>90-100%</span>
                <div className={styles.rangeBar}>
                  <div 
                    className={`${styles.rangeProgress} ${styles.excellent}`}
                    style={{ width: `${stats.totalAttempts > 0 ? (stats.scoreRanges['90-100%'] / stats.totalAttempts) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className={styles.rangeCount}>{stats.scoreRanges['90-100%']}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Questions Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Questions ({quiz.questions.length})</h2>
          <div className={styles.questionsList}>
            {quiz.questions.map((question, index) => (
              <div key={question._id} className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <span className={styles.questionNumber}>Q{index + 1}</span>
                  <span className={styles.questionType}>{question.questionType}</span>
                  <span className={styles.questionPoints}>{question.points} pts</span>
                </div>
                <p className={styles.questionText}>{question.questionText}</p>
                {question.image && (
                  <img 
                    src={`${API_URL}/uploads/${question.image}`} 
                    alt="Question" 
                    className={styles.questionImage} 
                  />
                )}
                
                {(question.questionType === "single-choice" || question.questionType === "multiple-choice") && (
                  <div className={styles.optionsList}>
                    {question.options.map((option, optIdx) => (
                      <div 
                        key={optIdx} 
                        className={`${styles.option} ${option.isCorrect ? styles.correctOption : ''}`}
                      >
                        {option.text}
                        {option.isCorrect && <span className={styles.correctBadge}>✓ Correct</span>}
                      </div>
                    ))}
                  </div>
                )}

                {question.questionType === "short-answer" && (
                  <div className={styles.textAnswer}>
                    <p>{question.correctAnswer}</p>
                  </div>
                )}
                
                {question.explanation && (
                  <div className={styles.explanation}>
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Participants Section */}
        {quiz.participants && quiz.participants.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {isLiveMode ? `Past Participants (${quiz.participants.length})` : `Participants (${quiz.participants.length})`}
            </h2>
            <div className={styles.participantsList}>
              {quiz.participants.map((participant: any) => (
                <div key={participant._id} className={styles.participantCard}>
                  <img 
                    src={participant.avatar ? `${API_URL}/uploads/${participant.avatar}` : "default_avatar.png"} 
                    alt={participant.username}
                    className={styles.participantAvatar} 
                  />
                  <span className={styles.participantName}>{participant.username}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section className={styles.section}>
          <div className={styles.commentsHeader}>
            <h2 className={styles.sectionTitle}>Comments ({quiz.comments.length})</h2>
            <button 
              className={styles.toggleBtn}
              onClick={() => setShowComments(!showComments)}
            >
              {showComments ? 'Hide Comments' : 'Show Comments'}
            </button>
          </div>
          
          {showComments && (
            <div className={styles.commentsList}>
              {quiz.comments.length === 0 ? (
                <p className={styles.noComments}>No comments yet</p>
              ) : (
                quiz.comments.map((comment) => (
                  <div key={comment._id} className={styles.commentCard}>
                    <div className={styles.commentHeader}>
                      <div className={styles.commentAuthor}>
                        <img 
                          src={comment.userId.avatar ? `${API_URL}/uploads/${comment.userId.avatar}` : "default_avatar.png"} 
                          alt={comment.userId.username}
                          className={styles.commentAvatar} 
                        />
                        <span className={styles.commentUsername}>{comment.userId.username}</span>
                      </div>
                      <div className={styles.commentActions}>
                        <span className={styles.commentDate}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        <button 
                          className={styles.deleteCommentBtn}
                          onClick={() => handleDeleteComment(comment._id)}
                          title="Delete comment"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className={styles.commentText}>{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};