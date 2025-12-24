import { useEffect, useState } from 'react';
import { BookOpen, Zap, Sparkles, TrendingUp } from 'lucide-react';
import { QuizList } from '@components/quiz/quiz-list/QuizList'; 
import { Axios } from '@config/axios';
import type { IResponse, Quiz } from 'app-types/quiz-types';
import styles from './unpublished.module.css';
import { useNavigate } from 'react-router-dom';

export const Unpublished = () => {
  const [draftQuizzes, setDraftQuizzes] = useState<Quiz[]>([]);
  const [activeMode, setActiveMode] = useState<'standard' | 'live'>('standard');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate()
  const liveQuizzes = draftQuizzes.filter(q => q.mode === 'live');
  const standardQuizzes = draftQuizzes.filter(q => q.mode === 'standard');

  useEffect(() => {
    setIsLoading(true);
    Axios
      .get<IResponse<{ quizzes: Quiz[] }>>('/admin/quiz/unpublished')
      .then(resp => {
        console.log(resp.data.payload)
        setDraftQuizzes(resp.data.payload.quizzes);
      })
      .catch(err => console.log(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleViewQuiz = (id: string) => {
    navigate(`/layout/quizzes/${id}/admin`)
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>
          <div className={styles.loaderCircle}></div>
          <div className={styles.loaderCircle}></div>
          <div className={styles.loaderCircle}></div>
        </div>
        <p className={styles.loadingText}>Loading your quizzes...</p>
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

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <div className={styles.titleWrapper}>
              <Sparkles className={styles.titleIcon} size={36} />
              <h1 className={styles.title}>Draft Quizzes</h1>
            </div>
            <p className={styles.subtitle}>
              Manage and publish your unpublished quizzes
            </p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <BookOpen size={28} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{standardQuizzes.length}</div>
                <div className={styles.statLabel}>Standard</div>
              </div>
              <div className={styles.statGlow}></div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Zap size={28} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{liveQuizzes.length}</div>
                <div className={styles.statLabel}>Live</div>
              </div>
              <div className={styles.statGlow}></div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <TrendingUp size={28} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{draftQuizzes.length}</div>
                <div className={styles.statLabel}>Total</div>
              </div>
              <div className={styles.statGlow}></div>
            </div>
          </div>
        </header>

        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeMode === 'standard' ? styles.tabActive : ''}`}
              onClick={() => setActiveMode('standard')}
            >
              <BookOpen size={22} />
              <span className={styles.tabText}>Standard Quizzes</span>
              <span className={styles.tabBadge}>{standardQuizzes.length}</span>
              {activeMode === 'standard' && <div className={styles.tabIndicator}></div>}
            </button>

            <button
              className={`${styles.tab} ${activeMode === 'live' ? styles.tabActive : ''}`}
              onClick={() => setActiveMode('live')}
            >
              <Zap size={22} />
              <span className={styles.tabText}>Live Quizzes</span>
              <span className={styles.tabBadge}>{liveQuizzes.length}</span>
              {activeMode === 'live' && <div className={styles.tabIndicator}></div>}
            </button>
          </div>
        </div>

        <div className={styles.listWrapper}>
          {activeMode === 'standard' ? (
            <QuizList
              quizzes={standardQuizzes}
              mode="standard"
              onView={handleViewQuiz}
            />
          ) : (
            <QuizList
              quizzes={liveQuizzes}
              mode="live"
              onView={handleViewQuiz}
            />
          )}
        </div>
      </div>
    </div>
  );
};