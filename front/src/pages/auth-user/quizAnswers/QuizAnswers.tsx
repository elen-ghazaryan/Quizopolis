import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import styles from "./quizAnswers.module.css";
import { type IResponse, type QuizResults } from "@app-types/quiz-types";
import { Axios } from "@config/axios";


export const QuizAnswers = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  console.log(attemptId)
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<QuizResults | null>(null);

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
    setLoading(true)
    Axios.get<IResponse<QuizResults>>(`/quiz/attempt/${attemptId}/result`)
    .then(resp => {
      setResults(resp.data.payload)
    })
    .catch(err => {
      console.error("Failed to get quiz results: "+ err)
    })
    .finally(() => setLoading(false))
  };

  const getCorrectCount = (): number => {
    return results ? results.answers.filter((a) => a.isCorrect).length : 0;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>
          <div className={styles.loaderCircle}></div>
          <div className={styles.loaderCircle}></div>
          <div className={styles.loaderCircle}></div>
        </div>
        <p className={styles.loadingText}>Loading answers...</p>
      </div>
    );
  }

  if (!results) {
    return <div className={styles.container}>No results available.</div>;
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
        <div className={styles.header}>
          <button onClick={() => navigate("/layout/quizzes")} className={styles.backBtn}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>
              <BookOpen size={32} />
              Quiz Review
            </h1>
            <p className={styles.subtitle}>
              Review your answers and see where you can improve
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryItem}>
            <CheckCircle size={48} className={styles.summaryIconCorrect} />
            <div className={styles.summaryInfo}>
              <span className={styles.summaryLabel}>Correct Answers</span>
              <span className={styles.summaryValue}>{getCorrectCount()}</span>
            </div>
          </div>
          <div className={styles.summaryItem}>
            <XCircle size={48} className={styles.summaryIconIncorrect} />
            <div className={styles.summaryInfo}>
              <span className={styles.summaryLabel}>Incorrect Answers</span>
              <span className={styles.summaryValue}>
                {results.answers.length - getCorrectCount()}
              </span>
            </div>
          </div>
          <div className={styles.summaryItem}>
            <AlertCircle size={48} className={styles.summaryIconTotal} />
            <div className={styles.summaryInfo}>
              <span className={styles.summaryLabel}>Total Questions</span>
              <span className={styles.summaryValue}>
                {results.answers.length}
              </span>
            </div>
          </div>
        </div>

        {/* Answers List */}
        <div className={styles.answersList}>
          <h2 className={styles.answersTitle}>Question by Question Review</h2>

          {results.answers.map((answer, index) => {
            const isCorrect = answer.isCorrect;
            const hasOptions = answer.options && answer.options.length > 0;

            return (
              <div
                key={answer.questionId}
                className={`${styles.answerCard} ${
                  isCorrect ? styles.answerCorrect : styles.answerIncorrect
                }`}
              >
                {/* Answer Header */}
                <div className={styles.answerHeader}>
                  <span className={styles.answerNumber}>
                    Question {index + 1}
                  </span>
                  <div
                    className={`${styles.answerBadge} ${
                      isCorrect ? styles.badgeCorrect : styles.badgeIncorrect
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle size={16} />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        <span>Incorrect</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <p className={styles.answerQuestion}>{answer.questionText}</p>

                {/* Options for multiple/single choice - Only show when options exist */}
                {hasOptions && (
                  <div className={styles.answerOptions}>
                    {answer.options.map((option, optIdx) => {
                      const isUserSelected = option.userSelected;
                      const isCorrectOption = option.isCorrect;

                      let optionClass = styles.answerOption;
                      if (isCorrectOption) {
                        optionClass += ` ${styles.answerOptionCorrect}`;
                      } else if (isUserSelected && !isCorrectOption) {
                        optionClass += ` ${styles.answerOptionWrong}`;
                      }

                      return (
                        <div key={optIdx} className={optionClass}>
                          <span className={styles.answerOptionText}>
                            {option.text}
                          </span>
                          <div className={styles.answerOptionLabels}>
                            {isCorrectOption && (
                              <span className={styles.answerLabelCorrect}>
                                <CheckCircle size={16} /> Correct Answer
                              </span>
                            )}
                            {isUserSelected && !isCorrectOption && (
                              <span className={styles.answerLabelWrong}>
                                <XCircle size={16} /> Your Answer
                              </span>
                            )}
                            {isUserSelected && isCorrectOption && (
                              <span className={styles.answerLabelCorrect}>
                                <CheckCircle size={16} /> Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Text Answer - Only show when there are NO options */}
                {!hasOptions && answer.textAnswer !== undefined && (
                  <div className={styles.textAnswerReview}>
                    <div className={styles.textAnswerSection}>
                      <span className={styles.textAnswerLabel}>
                        Your Answer:
                      </span>
                      <div
                        className={`${styles.textAnswerContent} ${
                          !answer.textAnswer ? styles.textAnswerEmpty : ""
                        }`}
                      >
                        {answer.textAnswer || "No answer provided"}
                      </div>
                    </div>
                    <div className={styles.textAnswerSection}>
                      <span className={styles.textAnswerLabel}>
                        Correct Answer:
                      </span>
                      <div className={styles.textAnswerContent}>
                        {answer.correctAnswer}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};