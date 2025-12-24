import { useEffect, useState } from 'react';
import { BookOpen, Zap, Sparkles, Target, Clock, TrendingUp, Users, Award, CheckCircle } from 'lucide-react';
import { QuizList } from '@components/quiz/quiz-list/QuizList';
import { Axios } from '@config/axios';
import type { IResponse, TeacherQuizzes } from 'app-types/quiz-types';
import styles from './published.module.css';
import { useNavigate } from 'react-router-dom';

export const Published = () => {
  const [data, setData] = useState<TeacherQuizzes | null>(null);
  const [activeMode, setActiveMode] = useState<'standard' | 'live'>('standard');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate()
  const liveQuizzes = data?.quizzes.filter(q => q.mode === 'live') || [];
  const standardQuizzes = data?.quizzes.filter(q => q.mode === 'standard') || [];
  const stats = data?.stats;

  useEffect(() => {
    setIsLoading(true);
    Axios
      .get<IResponse<TeacherQuizzes>>('/admin/quiz/published')
      .then(resp => {
        setData(resp.data.payload);
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
        <p className={styles.loadingText}>Loading published quizzes...</p>
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
              <h1 className={styles.title}>Published Quizzes</h1>
            </div>
            <p className={styles.subtitle}>
              Track performance and manage your live quizzes
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
                <div className={styles.statNumber}>{data?.quizzes.length || 0}</div>
                <div className={styles.statLabel}>Total</div>
              </div>
              <div className={styles.statGlow}></div>
            </div>
          </div>
        </header>

        {/* Performance Metrics Section */}
        {activeMode === 'standard' && stats?.standard && (
        <div className={styles.performanceSection}>
          <h2 className={styles.sectionTitle}>
            <Target size={24} />
            Performance Overview
          </h2>

            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>
                  <Users size={24} />
                </div>
                <div className={styles.metricInfo}>
                  <div className={styles.metricValue}>
                    {stats.standard.totalAttempts.toLocaleString()}
                  </div>
                  <div className={styles.metricLabel}>Total Attempts</div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>
                  <Award size={24} />
                </div>
                <div className={styles.metricInfo}>
                  <div className={styles.metricValue}>
                    {stats.standard.avgScore.toFixed(1)}
                  </div>
                  <div className={styles.metricLabel}>Avg Score</div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>
                  <Target size={24} />
                </div>
                <div className={styles.metricInfo}>
                  <div className={styles.metricValue}>
                    {stats.standard.avgPercentage.toFixed(1)}%
                  </div>
                  <div className={styles.metricLabel}>Avg Percentage</div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>
                  <Clock size={24} />
                </div>
                <div className={styles.metricInfo}>
                  <div className={styles.metricValue}>
                    {Math.round(stats.standard.avgTimeSpent / 60)}m
                  </div>
                  <div className={styles.metricLabel}>Avg Time</div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>
                  <CheckCircle size={24} />
                </div>
                <div className={styles.metricInfo}>
                  <div className={styles.metricValue}>
                    {stats.standard.totalCompleted.toLocaleString()}
                  </div>
                  <div className={styles.metricLabel}>Completed</div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>
                  <TrendingUp size={24} />
                </div>
                <div className={styles.metricInfo}>
                  <div className={styles.metricValue}>
                    {stats.standard.completionRate.toFixed(1)}%
                  </div>
                  <div className={styles.metricLabel}>Completion Rate</div>
                </div>
              </div>
            </div>
        </div>
        )}

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
              variant='published'
            />
          ) : (
            <QuizList
              quizzes={liveQuizzes}
              mode="live"
              onView={handleViewQuiz}
              variant='published'
            />
          )}
        </div>
      </div>
    </div>
  );
};