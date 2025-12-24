import type { Question } from "app-types/quiz-types";
import styles from "./questionCard.module.css"

interface QuestionCardProps {
  question: Question;
  index: number;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  index, 
  onEdit, 
  onDelete 
}) => {
  const isChoiceQuestion = 
    question.questionType === "single-choice" || 
    question.questionType === "multiple-choice";
  
  const isShortAnswer = question.questionType === "short-answer";

  const formatQuestionType = (type: string): string => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };


  const getImageUrl = (imagePath: string): string => {
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    return `${import.meta.env.VITE_API_URL}/uploads/${imagePath}`;
  };

  return (
    <div className={styles.questionCard}>
      {/* Question Header */}
      <div className={styles.questionHeader}>
        <div className={styles.questionNumber}>
          Question {index + 1}
        </div>
        <div className={styles.questionMeta}>
          <span className={styles.badge}>
            {formatQuestionType(question.questionType)}
          </span>
          <span className={styles.points}>
            {question.points} {question.points === 1 ? 'pt' : 'pts'}
          </span>
        </div>
      </div>

      {/* Question Content */}
      <div className={styles.questionContent}>
        <p className={styles.questionText}>{question.questionText}</p>

        {/* Question Image */}
        {question.image && (
          <img
            src={getImageUrl(question.image)}
            alt="Question"
            className={styles.questionImage}
          />
        )}

        {/* Choice Options */}
        {isChoiceQuestion && question.options && (
          <div className={styles.optionsList}>
            {question.options.map((option, optIndex) => (
              <div
                key={optIndex}
                className={`${styles.option} ${
                  option.isCorrect ? styles.correctOption : ""
                }`}
              >
                <span className={styles.optionLabel}>
                  {String.fromCharCode(65 + optIndex)}.
                </span>
                <span className={styles.optionText}>
                  {option.text}
                </span>
                {option.isCorrect && (
                  <span className={styles.correctBadge}>✓</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Short Answer */}
        {isShortAnswer && question.correctAnswer && (
          <div className={styles.textAnswer}>
            <strong>Correct Answer:</strong> {question.correctAnswer}
          </div>
        )}

        {/* Explanation */}
        {question.explanation && (
          <div className={styles.explanation}>
            <strong>Explanation:</strong> {question.explanation}
          </div>
        )}
      </div>

      {/* Question Actions */}
      <div className={styles.questionActions}>
        <button
          className={styles.editButton}
          onClick={() => onEdit(question)}
        >
          Edit
        </button>
        <button
          className={styles.deleteButton}
          onClick={() => onDelete(question._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};