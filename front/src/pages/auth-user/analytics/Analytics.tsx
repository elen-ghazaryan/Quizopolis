import { useEffect, useState } from "react";
import {LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid} from "recharts";
import { TrendingUp, Target, Clock, Award, CheckCircle, BarChart3, Calendar, Zap, Trophy, ThumbsUp, ThumbsDown, Brain, Star} from "lucide-react";
import { Axios } from "@config/axios";
import type { UserStats } from "app-types/quiz-types";
import styles from "./analytics.module.css";

export const Analytics = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Axios.get<{ payload: UserStats }>("/user/stats")
      .then((res) => setStats(res.data.payload))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>
          <div className={styles.loaderCircle}></div>
          <div className={styles.loaderCircle}></div>
          <div className={styles.loaderCircle}></div>
        </div>
        <p className={styles.loadingText}>Loading your analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <BarChart3 size={64} />
          <h3>Unable to load statistics</h3>
          <p>Please try again later</p>
        </div>
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
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroIcon}>
              <BarChart3 size={48} />
            </div>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>Performance Dashboard</h1>
              <p className={styles.heroSubtitle}>
                Your complete learning journey and achievement insights
              </p>
            </div>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStatItem}>
              <Trophy size={24} />
              <div>
                <div className={styles.heroStatValue}>{stats.totalQuizzes}</div>
                <div className={styles.heroStatLabel}>Completed</div>
              </div>
            </div>
            <div className={styles.heroDivider}></div>
            <div className={styles.heroStatItem}>
              <Star size={24} />
              <div>
                <div className={styles.heroStatValue}>{stats.accuracy}%</div>
                <div className={styles.heroStatLabel}>Accuracy</div>
              </div>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className={styles.overviewSection}>
          <h2 className={styles.sectionTitle}>
            <Target size={28} />
            Performance Overview
          </h2>
          <div className={styles.overviewGrid}>
            <div className={styles.overviewCard}>
              <div className={styles.overviewHeader}>
                <div className={styles.overviewIcon}>
                  <Target size={32} />
                </div>
                <div className={styles.overviewBadge}>Accuracy</div>
              </div>
              <div className={styles.overviewValue}>{stats.accuracy}%</div>
              <div className={styles.overviewLabel}>Overall Success Rate</div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${stats.accuracy}%` }}
                ></div>
              </div>
            </div>

            <div className={styles.overviewCard}>
              <div className={styles.overviewHeader}>
                <div className={styles.overviewIcon}>
                  <TrendingUp size={32} />
                </div>
                <div className={styles.overviewBadge}>Average</div>
              </div>
              <div className={styles.overviewValue}>{stats.averageSCore}</div>
              <div className={styles.overviewLabel}>Points per Quiz</div>
              <div className={styles.overviewFooter}>
                Best Score: <strong>{stats.bestScore}</strong>
              </div>
            </div>

            <div className={styles.overviewCard}>
              <div className={styles.overviewHeader}>
                <div className={styles.overviewIcon}>
                  <Clock size={32} />
                </div>
                <div className={styles.overviewBadge}>Time</div>
              </div>
              <div className={styles.overviewValue}>{formatTime(stats.averageTime)}</div>
              <div className={styles.overviewLabel}>Average Duration</div>
              <div className={styles.overviewFooter}>
                Total: <strong>{formatTime(stats.totalTime)}</strong>
              </div>
            </div>

            <div className={styles.overviewCard}>
              <div className={styles.overviewHeader}>
                <div className={styles.overviewIcon}>
                  <CheckCircle size={32} />
                </div>
                <div className={styles.overviewBadge}>Questions</div>
              </div>
              <div className={styles.overviewValue}>{stats.correctAnswers}</div>
              <div className={styles.overviewLabel}>Correct Answers</div>
              <div className={styles.overviewFooter}>
                Out of <strong>{stats.totalQuestions}</strong> total
              </div>
            </div>
          </div>
        </section>

        {/* Accuracy Trend Section */}
        {stats.accuracyHistory.length > 0 && (
          <section className={styles.chartSection}>
            <h2 className={styles.sectionTitle}>
              <TrendingUp size={28} />
              Accuracy Progress
            </h2>

            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div>
                  <h3 className={styles.chartTitle}>Accuracy Over Time</h3>
                  <p className={styles.chartSubtitle}>
                    Track how your performance improves with each quiz
                  </p>
                </div>

                <div className={styles.chartBadge}>
                  <Target size={16} />
                  Last {stats.accuracyHistory.length} quizzes
                </div>
              </div>

              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={stats.accuracyHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ede9fe" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#6d28d9", fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#6d28d9", fontSize: 12 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(value) => {
                        if (typeof value !== "number") return ["0%", "Accuracy"];
                        return [`${value}%`, "Accuracy"];
                      }}
                      labelStyle={{ color: "#6d28d9", fontWeight: 700 }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "2px solid #e9d5ff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 5, strokeWidth: 2, fill: "#fff" }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}


        {/* Activity Section */}
        <section className={styles.activitySection}>
          <h2 className={styles.sectionTitle}>
            <Calendar size={28} />
            Recent Activity
          </h2>
          <div className={styles.activityGrid}>
            <div className={styles.activityCard}>
              <div className={styles.activityIcon}>
                <Calendar size={28} />
              </div>
              <div className={styles.activityContent}>
                <div className={styles.activityValue}>{stats.quizzesThisMonth}</div>
                <div className={styles.activityLabel}>Quizzes This Month</div>
                <div className={styles.activityDescription}>
                  Keep up the momentum! You're making great progress.
                </div>
              </div>
            </div>

            <div className={styles.activityCard}>
              <div className={styles.activityIcon}>
                <Clock size={28} />
              </div>
              <div className={styles.activityContent}>
                <div className={styles.activityValue}>{formatDate(stats.lastQuizDate)}</div>
                <div className={styles.activityLabel}>Last Quiz Taken</div>
                <div className={styles.activityDescription}>
                  {stats.lastQuizDate 
                    ? "Ready for another challenge?"
                    : "Start your first quiz today!"}
                </div>
              </div>
            </div>

            <div className={styles.activityCard}>
              <div className={styles.activityIcon}>
                <Award size={28} />
              </div>
              <div className={styles.activityContent}>
                <div className={styles.activityValue}>{stats.bestScore}</div>
                <div className={styles.activityLabel}>Personal Best</div>
                <div className={styles.activityDescription}>
                  Your highest score achieved so far!
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className={styles.categoriesSection}>
          <h2 className={styles.sectionTitle}>
            <Brain size={28} />
            Category Insights
          </h2>
          <div className={styles.categoriesGrid}>
            <div className={styles.categoryCard}>
              <div className={styles.categoryTop}>
                <div className={styles.categoryIconWrapper}>
                  <ThumbsUp size={40} />
                </div>
                <div className={styles.categoryBadge}>Strongest</div>
              </div>
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryTitle}>
                  {stats.strongestCategory || "No data yet"}
                </h3>
                <p className={styles.categoryDescription}>
                  You excel in this category! Your performance here is outstanding.
                </p>
              </div>
              <div className={styles.categoryFooter}>
                <Zap size={18} />
                <span>Keep dominating!</span>
              </div>
            </div>

            <div className={styles.categoryCard}>
              <div className={styles.categoryTop}>
                <div className={styles.categoryIconWrapper}>
                  <ThumbsDown size={40} />
                </div>
                <div className={styles.categoryBadge}>Growth Area</div>
              </div>
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryTitle}>
                  {stats.weakestCategory || "No data yet"}
                </h3>
                <p className={styles.categoryDescription}>
                  Focus here for improvement. Practice makes perfect!
                </p>
              </div>
              <div className={styles.categoryFooter}>
                <Target size={18} />
                <span>Room to grow</span>
              </div>
            </div>
          </div>
        </section>

        {/* Summary Section */}
        {stats.totalQuizzes > 0 && (
          <section className={styles.summarySection}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <TrendingUp size={32} />
              </div>
              <div className={styles.summaryContent}>
                <h3 className={styles.summaryTitle}>Your Journey So Far</h3>
                <p className={styles.summaryText}>
                  You've completed <strong>{stats.totalQuizzes}</strong> {stats.totalQuizzes === 1 ? 'quiz' : 'quizzes'} with 
                  an impressive accuracy of <strong>{stats.accuracy}%</strong>. 
                  {stats.correctAnswers > 0 && (
                    <>
                      {" "}You've answered <strong>{stats.correctAnswers}</strong> questions 
                      correctly out of <strong>{stats.totalQuestions}</strong> total questions.
                    </>
                  )}
                  {stats.quizzesThisMonth > 0 && (
                    <>
                      {" "}This month alone, you've completed <strong>{stats.quizzesThisMonth}</strong> {stats.quizzesThisMonth === 1 ? 'quiz' : 'quizzes'}!
                    </>
                  )}
                  {" "}Keep up the excellent work and continue pushing your limits!
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};