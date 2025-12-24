import { useState } from 'react';
import { Filter, Clock, BarChart3, Sparkles } from 'lucide-react';
import { QuizCard } from '../quiz-card/QuizCard';
import styles from './quizList.module.css';
import type { Quiz } from 'app-types/quiz-types';


interface QuizListProps {
  quizzes: Quiz[];
  mode: 'standard' | 'live';
  onView: (id: string) => void;
  variant?: 'draft' | 'published';
}

export const QuizList = ({ quizzes, mode, onView, variant = 'draft' }: QuizListProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const categories = ['all', ...new Set(quizzes.map(q => q.category))];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  const filteredQuizzes = quizzes.filter(quiz => {
    const categoryMatch = selectedCategory === 'all' || quiz.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

   const containerClass = variant === 'published' 
    ? `${styles.container} ${styles.containerPublished}` 
    : styles.container;

  return (
    <div className={containerClass}>
      <div className={styles.filterSection}>
        <div className={styles.filterHeader}>
          <Sparkles size={20} className={styles.sparkleIcon} />
          <h2 className={styles.filterTitle}>Filter Quizzes</h2>
        </div>
        
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>
              <Filter size={16} />
              <span>Category</span>
            </div>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.filterSelect}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <div className={styles.selectArrow}></div>
          </div>
          
          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>
              <BarChart3 size={16} />
              <span>Difficulty</span>
            </div>
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className={styles.filterSelect}
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff}>
                  {diff === 'all' ? 'All Difficulties' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>
            <div className={styles.selectArrow}></div>
          </div>

          {(selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
            <button 
              className={styles.clearBtn}
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className={styles.resultsCount}>
          <span className={styles.countNumber}>{filteredQuizzes.length}</span>
          <span className={styles.countText}>
            {filteredQuizzes.length === 1 ? 'quiz found' : 'quizzes found'}
          </span>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Clock size={64} />
            <div className={styles.emptyIconCircle}></div>
          </div>
          <h3 className={styles.emptyTitle}>No {mode} quizzes found</h3>
          <p className={styles.emptyText}>
            {selectedCategory !== 'all' || selectedDifficulty !== 'all' 
              ? 'Try adjusting your filters to see more results' 
              : 'Create your first quiz to get started'}
          </p>
          {(selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
            <button 
              className={styles.emptyBtn}
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.quizGrid}>
          {filteredQuizzes.map((quiz, index) => (
            <div 
              key={quiz._id} 
              className={styles.gridItem}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <QuizCard quiz={quiz} onView={onView} variant={variant}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};