import { useEffect, useMemo, useState } from "react";
import { Search, Filter, BookOpen, User, Calendar, TrendingUp, Award, ArrowUpDown } from "lucide-react";
import { Axios } from "@config/axios";
import type { IResponse, StudentQuiz } from "app-types/quiz-types";
import styles from "./quizzes.module.css";
import { Link, useNavigate } from "react-router-dom";
import { pickGradient } from "../../../helpers/gradientColors";


export const Quizzes = () => {
  const [quizzes, setQuizzes] = useState<StudentQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL;

  // unique categories
  const categories = ["all", ...new Set(quizzes.map((q) => q.category))];
  const difficulties = ["all", "easy", "medium", "hard"];

  useEffect(() => {
    setIsLoading(true);
    Axios.get<IResponse<StudentQuiz[]>>("/quiz/")
      .then((resp) => {
        setQuizzes(resp.data.payload);
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredQuizzes = useMemo(() => {
  let filtered = quizzes;

  if (searchQuery) {
    filtered = filtered.filter(
      quiz =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.createdBy.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (selectedCategory !== "all") {
    filtered = filtered.filter(q => q.category === selectedCategory);
  }

  if (selectedDifficulty !== "all") {
    filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
  }

  filtered.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return filtered;
}, [quizzes, searchQuery, selectedCategory, selectedDifficulty, sortOrder]);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
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
        <p className={styles.loadingText}>Loading quizzes...</p>
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
              <Award className={styles.titleIcon} size={40} />
              <div>
                <h1 className={styles.title}>Explore Quizzes</h1>
                <p className={styles.subtitle}>
                  Challenge yourself and test your knowledge
                </p>
              </div>
            </div>

            <div className={styles.statsCards}>
              <div className={styles.statCard}>
                <BookOpen size={24} />
                <div>
                  <div className={styles.statNumber}>{quizzes.length}</div>
                  <div className={styles.statLabel}>Available</div>
                </div>
              </div>
              <div className={styles.statCard}>
                <TrendingUp size={24} />
                <div>
                  <div className={styles.statNumber}>
                    {filteredQuizzes.length}
                  </div>
                  <div className={styles.statLabel}>Filtered</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className={styles.filterSection}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search quizzes, authors, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <Filter size={16} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.filterSelect}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <Award size={16} />
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className={styles.filterSelect}
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff === "all"
                      ? "All Difficulties"
                      : diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <ArrowUpDown size={16} />
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as "newest" | "oldest")
                }
                className={styles.filterSelect}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {(searchQuery ||
              selectedCategory !== "all" ||
              selectedDifficulty !== "all") && (
              <button
                className={styles.clearBtn}
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedDifficulty("all");
                }}
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Quiz Grid */}
        {filteredQuizzes.length === 0 ? (
          <div className={styles.emptyState}>
            <BookOpen size={64} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No quizzes found</h3>
            <p className={styles.emptyText}>
              Try adjusting your filters or search terms
            </p>
            <button
              className={styles.resetBtn}
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedDifficulty("all");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={styles.quizGrid}>
            {filteredQuizzes.map((quiz, index) => (
              <div
                key={quiz._id}
                className={styles.quizCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.cardBackground} style={{ background: pickGradient(quiz._id)}}></div>
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
                    <span>{formatDate(quiz.createdAt)}</span>
                  </div>
                </div>

                <Link
                  to={`/layout/quizzes/${quiz._id}`}
                  style={{textDecoration: "none"}}
                  className={styles.startBtn}
                >
                  <span>See more</span>
                  <div className={styles.btnArrow}>→</div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
