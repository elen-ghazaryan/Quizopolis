import React, { useEffect, useState } from "react"
import { Axios } from "../../../config/axios"
import { useContextDispatch, useContextState } from "../../../context/hooks"
import axios from "axios"
import type { IErrorResponse, IResponse, IStreakStats } from "../../../types"
import styles from "./profile.module.css"
import { TrendingUp, Calendar, Camera, GraduationCap, BookOpen, CheckCircle, XCircle, Star, Clock, CheckCheck, CalendarCheck, Timer, BookCheck } from "lucide-react"

export const Profile = () => {
  const { user } = useContextState();
  const dispatch = useContextDispatch()
  const [error, setError] = useState('')
  const [stats, setStats] = useState<IStreakStats | null>(null)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const API_URL = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
  const loadStats = async () => {
    try {
      const res = await Axios.get<IResponse<IStreakStats>>("/user/streak");
      setStats(res.data.payload);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorResp = err.response?.data as IErrorResponse;
        if (errorResp) setError(errorResp.message);
      }
    }
  };

  loadStats();
}, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    Axios.post<IResponse<{ avatar: string }>>('/user/avatar', formData)
    .then((res) => {
      const newAvatarUrl = res.data.payload.avatar;
      dispatch({ type: 'UPDATE_AVATAR', payload: newAvatarUrl });
    })
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          const errorResp = err.response?.data as IErrorResponse;
          if (errorResp) setError(errorResp.message);
        }
      });
  };

  if(!user || !stats) {
    return <div>Loading...</div>
  }

  if(error) {
    return <p>{error}</p>
  }

  // Today index: Monday=0, Sunday=6
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

  const isTodayCompleted = () => stats.weekActivity[todayIndex]?.completed ?? false
  const getTodayStatus = () => (isTodayCompleted() ? 'Completed' : 'Not Completed')

  return (
    <>
    <div className={styles.contentHeader}>
          <h1>Welcome Back! 👋 </h1>
          <p>Ready to continue your learning journey?</p>
    </div>
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
         <div className={styles.avatarWrapper}>
            <div className={styles.avatarContainer} onClick={() => fileInputRef.current?.click()}>
              <img 
                src={`${API_URL}/uploads/${user?.avatar}` || "default_avatar.png"} 
                alt="Profile" 
                className={styles.avatar}
              />
              <div className={styles.avatarOverlay}>
                <Camera size={24} />
              </div>
              <div className={styles.roleBadge}>
                {user.role === 'teacher' ? (
                  <>
                    <GraduationCap size={18} />
                    <span>Teacher</span>
                  </>
                ) : (
                  <>
                  <BookOpen size={18} />
                  <span>Student</span>
                  </>
                )}
              </div>

              <input 
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>


          <div className={styles.userInfo}>
            <h1 className={styles.username}>{user.username}</h1>
            <p className={styles.bio}>{user.bio || 'No bio yet'}</p>
          </div>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.statsGrid}>
            <div
              className={`${styles.statCard} ${
                isTodayCompleted() ? styles.completedCard : styles.incompleteCard
              }`}
            >
              <div className={styles.statIconWrapper}>
                <div className={styles.statIcon}>
                  {isTodayCompleted() ? (
                    <CheckCheck className={styles.checkIcon} size={28} stroke="#2f831b"/>
                  ) : (
                    <Clock className={styles.clockIcon} size={40} stroke="#26363e" />
                  )}
                </div>
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Today's Quiz</p>
                <p className={styles.statValue}>{getTodayStatus()}</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.streakCard}`}>
              <div className={styles.statIconWrapper}>
                <span className={styles.fireEmoji}>🔥</span>
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Current Streak</p>
                <p className={styles.statValue}>{stats.currentStreak}</p>
                <p className={styles.statSubText}>days</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <TrendingUp className={styles.trendIcon} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Longest Streak</p>
                <p className={styles.statValue}>{stats.longestStreak}</p>
                <p className={styles.statSubText}>days</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Star className={styles.achievementIcon} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Total Completed</p>
                <p className={styles.statValue}>
                  {stats.weekActivity.filter(a => a.completed).length}
                </p>
                <p className={styles.statSubText}>this week</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.weeklySection}>
          <div className={styles.weeklyHeader}>
            <Calendar className={styles.calendarIcon} />
            <h2 className={styles.weeklyTitle}>This Week</h2>
          </div>
          <div className={styles.weekGrid}>
            {stats.weekActivity.map((activity, index) => (
              <div
                key={index}
                className={`${styles.dayCard} ${
                  activity.completed ? styles.dayCompleted : styles.dayIncomplete
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <span className={styles.dayLabel}>{weekDays[index]}</span>
                <div className={styles.dayIndicator}>
                  {activity.completed ? (
                    <span className={styles.checkmark}>✓</span>
                  ) : (
                    <span className={styles.emptyDot}>•</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {stats.lastQuizDate && (
          <div className={styles.lastQuizInfo}>
            <Clock size={45} className={styles.lastQuizIcon}/>
            <p className={styles.lastQuizLabel}>Last Quiz</p>
            <p className={styles.lastQuizDate}>
              {new Date(stats.lastQuizDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'Asia/Yerevan'
              })}
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default Profile;
