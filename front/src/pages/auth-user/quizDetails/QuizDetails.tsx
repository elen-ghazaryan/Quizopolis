import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Trophy, BookOpen, Calendar, Heart, Share2, Play, User, CheckCircle} from 'lucide-react';
import styles from './quizDetails.module.css';
import { QuizComments } from '../quizComments/quizComments';
import type { QuizDetail } from 'app-types/quiz-types';
import { Axios } from '@config/axios';
import axios from 'axios';
import { getDifficultyColor } from '../../../helpers/difficultyColors';



export const QuizDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null)
  console.log(quiz?.comments)
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true)
    Axios.get<{payload: {quiz: QuizDetail}}>("quiz/"+id)
    .then(resp => {
      setQuiz(resp.data.payload.quiz)
      setIsFavorite(resp.data.payload.quiz.isFavorite)
    })
    .catch(err => {
      if(axios.isAxiosError(err)) {
        const message = err.response?.data?.message
        setError(message || "Failed to load quiz.")
      }
    })
    .finally(() => 
      setLoading(false)
    )
  }, [id]);


  const handleToggleFavorite = async () => {
    if (!quiz?._id || favoriteLoading) return;

    setFavoriteLoading(true);

    try {
      if (isFavorite) {
        await Axios.delete(`/user/favorites/${quiz._id}`);
        setIsFavorite(false);
      } else {
        await Axios.post(`/user/favorites`, { quizId: quiz._id });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = (): void => {
    if (navigator.share) {
      navigator.share({
        title: quiz?.title || '',
        text: quiz?.description || '',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };



  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>
          <div className={styles.loaderCircle}></div>
          <div className={styles.loaderCircle}></div>
          <div className={styles.loaderCircle}></div>
        </div>
        <p className={styles.loadingText}>Loading quiz details...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className={styles.errorContainer}>
        <p>Quiz not found</p>
        <button onClick={() => navigate('/quizzes')} className={styles.backButton}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.backgroundDecor}>
        <div className={styles.decorCircle1}></div>
        <div className={styles.decorCircle2}></div>
        <div className={styles.decorCircle3}></div>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.content}>
        {/* Back Button */}
        <button onClick={() => navigate("/layout/quizzes/")} className={styles.backBtn}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Main Quiz Card */}
        <div className={styles.quizCard}>
          <div className={styles.cardGlow}></div>
          
          {/* Header Section */}
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.badges}>
                <span className={styles.category}>{quiz.category}</span>
                <span className={`${styles.difficulty} ${styles[getDifficultyColor(quiz.difficulty)]}`}>
                  {quiz.difficulty}
                </span>
              </div>
              
              <h1 className={styles.title}>{quiz.title}</h1>
              {quiz.description && (
                <p className={styles.description}>{quiz.description}</p>
              )}
            </div>

            <div className={styles.headerRight}>
              <div className={styles.questionsBox}>
                <BookOpen size={32} />
                <div className={styles.questionsInfo}>
                  <span className={styles.questionsCount}>{quiz.questions.length}</span>
                  <span className={styles.questionsLabel}>Questions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <Clock size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Mode</span>
                <span className={styles.statValue}>{quiz.mode}</span>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <Calendar size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Created</span>
                <span className={styles.statValue}>{formatDate(quiz.createdAt)}</span>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <User size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Creator</span>
                <span className={styles.statValue}>{quiz.createdBy.username}</span>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <Trophy size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Difficulty</span>
                <span className={styles.statValue}>{quiz.difficulty}</span>
              </div>
            </div>
          </div>

          {/* Questions Preview */}
          <div className={styles.questionsSection}>
            <h2 className={styles.sectionTitle}>
              <BookOpen size={24} />
              Questions Preview
            </h2>
            <div className={styles.questionsList}>
              {quiz.questions.slice(0, 5).map((question, index) => (
                <div key={index} className={styles.questionItem}>
                  <div className={styles.questionNumber}>
                    <CheckCircle size={20} />
                    <span>Q{index + 1}</span>
                  </div>
                  <div className={styles.questionContent}>
                    <p className={styles.questionText}>{question.questionText}</p>
                    <span className={styles.answersCount}>
                      {question.options?.length || 4} answer options
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className={styles.questionOthers}>...and others</p>
          </div>

          {/* Creator Info */}
          <div className={styles.creatorSection}>
            <h3 className={styles.creatorTitle}>Created By</h3>
            <div className={styles.creatorInfo}>
              {quiz.createdBy.avatar ? (
                <img 
                  src={`${API_URL}/uploads/${quiz.createdBy.avatar}` || "deafult_avatar.png"} 
                  alt={quiz.createdBy.username}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <User size={24} />
                </div>
              )}
              <div className={styles.creatorDetails}>
                <span className={styles.creatorName}>{quiz.createdBy.username}</span>
                <span className={styles.creatorRole}>Quiz Creator</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button 
              onClick={handleToggleFavorite} 
               disabled={favoriteLoading}
              className={`${styles.actionBtn} ${isFavorite ? styles.favoriteActive : ''}`}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
            </button>

            <button onClick={handleShare} className={styles.actionBtn}>
              <Share2 size={20} />
              <span>Share Quiz</span>
            </button>

            <Link to={`/layout/quizzes/${quiz._id}/start`} style={{textDecoration: "none"}} className={styles.startBtn}>
              <Play size={24} />
              <span>Start Quiz</span>
              <span className={styles.btnArrow}>→</span>
            </Link>
          </div>
        </div>

        {/* Comments Section */}
        <QuizComments quizId={id || ""} initialComments={quiz.comments || []} />
      </div>
    </div>
  );
};
