import { Eye, Zap, BookOpen, BarChart3 } from 'lucide-react';
import styles from './quizCard.module.css';
import type { Quiz } from 'app-types/quiz-types';

interface QuizCardProps {
  quiz: Quiz;
  onView: (id: string) => void;
  variant?: "published" | "draft" 
}

export const QuizCard = ({ quiz, onView, variant = 'draft' }: QuizCardProps) => {
  const difficultyColors = {
    easy: styles.difficultyEasy,
    medium: styles.difficultyMedium,
    hard: styles.difficultyHard
  };

  const cardClass = variant === 'published' 
    ? `${styles.card} ${styles.cardPublished}` 
    : styles.card;


  return (
    <div className={cardClass}>
      <div className={styles.cardGlow}></div>
      
      <div className={styles.cardHeader}>
        <div className={styles.modeBadge}>
          {quiz.mode === 'live' ? (
            <>
              <Zap size={14} className={styles.icon} />
              <span>Live</span>
            </>
          ) : (
            <>
              <BookOpen size={14} className={styles.icon} />
              <span>Standard</span>
            </>
          )}
        </div>
        <span className={`${styles.difficultyBadge} ${difficultyColors[quiz.difficulty]}`}>
          {quiz.difficulty}
        </span>
      </div>
      
      <div className={styles.cardBody}>
        <h3 className={styles.title}>{quiz.title}</h3>
        <p className={styles.description}>{quiz.description}</p>
      </div>
      
      <div className={styles.cardFooter}>
        <div className={styles.category}>
          <BarChart3 size={16} />
          <span>{quiz.category}</span>
        </div>
        <button 
          className={styles.viewBtn} 
          onClick={() => onView(quiz._id)}
          aria-label={`View ${quiz.title}`}
        >
          <Eye size={16} />
          <span>View</span>
          <div className={styles.btnShine}></div>
        </button>
      </div>
    </div>
  );
};