import { useEffect, useState } from "react";
import { Search, Heart, BookOpen, User, Calendar, Trash2, Eye, TrendingUp } from "lucide-react";
import { Axios } from "@config/axios";
import styles from "./favorites.module.css";
import type { StudentQuiz } from "app-types/quiz-types";

export const Favorites = () => {
  const [favorites, setFavorites] = useState<StudentQuiz[]>([])
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const displayedFavorites = searchQuery
    ? favorites.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          quiz.createdBy.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : favorites;

  useEffect(() => {
    setIsLoading(true);
    Axios.get<{ payload: StudentQuiz[] }>("/user/favorites")
    .then(resp => {
      setFavorites(resp.data.payload)
    })
    .catch(err => {
      console.error("Error fetching favorite quizzes:", err);
    })
    .finally(() => {
      setIsLoading(false);
    })
  }, [])

  const handleViewDetails = (id: string) => {
    console.log("View quiz details:", id);
    // Navigate to quiz details: navigate(`/quiz/${id}`)
  };

  const handleRemove = (id: string) => {
    Axios.delete(`/user/favorites/${id}`)
    .then(() => {
      setFavorites(prev => prev.filter(quiz => quiz._id !== id))
    })
    .catch(err => {
      console.error("Error removing favorite quiz:", err);
    })
  }


  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>
          <div className={styles.loaderCircle}></div>
          <div className={styles.loaderCircle}></div>
          <div className={styles.loaderCircle}></div>
        </div>
        <p className={styles.loadingText}>Loading favorites...</p>
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
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleWrapper}>
              <Heart className={styles.titleIcon} size={40} fill="white" />
              <div>
                <h1 className={styles.title}>Favorite Quizzes</h1>
                <p className={styles.subtitle}>
                  Your handpicked collection of awesome quizzes
                </p>
              </div>
            </div>

            <div className={styles.statsCards}>
              <div className={styles.statCard}>
                <Heart size={24} fill="white" />
                <div>
                  <div className={styles.statNumber}>{favorites.length}</div>
                  <div className={styles.statLabel}>Favorites</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <TrendingUp size={24} />
                <div>
                  <div className={styles.statNumber}>{displayedFavorites.length}</div>
                  <div className={styles.statLabel}>Showing</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Search */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search your favorite quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Favorites Grid */}
        {displayedFavorites.length === 0 ? (
          <div className={styles.emptyState}>
            <Heart size={64} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>
              {searchQuery ? "No matches found" : "No favorites yet"}
            </h3>
            <p className={styles.emptyText}>
              {searchQuery
                ? "Try adjusting your search terms"
                : "Start adding quizzes to your favorites to see them here"}
            </p>
          </div>
        ) : (
          <div className={styles.quizGrid}>
            {displayedFavorites.map((quiz, index) => (
              <div
                key={quiz._id}
                className={styles.quizCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.cardBackground}></div>
                <div className={styles.cardGlow}></div>

                <div className={styles.cardTop}>
                  <div className={styles.badges}>
                    <span className={styles.category}>{quiz.category}</span>
                    <span
                      className={`${styles.difficulty} ${
                        styles[
                          `difficulty${
                            quiz.difficulty.charAt(0).toUpperCase() +
                            quiz.difficulty.slice(1)
                          }`
                        ]
                      }`}
                    >
                      {quiz.difficulty}
                    </span>
                  </div>

                  <div className={styles.questionsBadge}>
                    <BookOpen size={18} />
                    <span className={styles.questionCount}>
                      {quiz.questionCount}
                    </span>
                    <span className={styles.questionLabel}>Questions</span>
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.quizTitle}>{quiz.title}</h3>
                  <p className={styles.quizDescription}>{quiz.description}</p>
                </div>

                <div className={styles.cardMeta}>
                  <div className={styles.creatorSection}>
                    <span className={styles.creatorLabel}>Created by</span>
                    <div className={styles.creatorInfo}>
                      {quiz.createdBy.avatar ? (
                        <img
                          src={`${API_URL}/uploads/${quiz.createdBy.avatar}` || "default_avatar.png"}
                          alt={quiz.createdBy.username}
                          className={styles.avatar}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          <User size={14} />
                        </div>
                      )}
                      <span className={styles.username}>
                        {quiz.createdBy.username}
                      </span>
                    </div>
                  </div>

                  <div className={styles.dateSection}>
                    <Calendar size={14} />
                    <span>{quiz.createdAt}</span>
                  </div>
                </div>

                <div className={styles.actionButtons}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => handleViewDetails(quiz._id)}
                  >
                    <Eye size={18} />
                    <span>View Details</span>
                  </button>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(quiz._id)}
                  >
                    <Trash2 size={18} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};