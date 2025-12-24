import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Box } from '@mui/material';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Trophy,
  RotateCcw,
  ArrowLeft,
  X,
  Eye
} from 'lucide-react';
import styles from './startQuiz.module.css';
import { type IResponse, type Attempt, type DraftAnswer, type Question, type ResumeQuiz, type SubmitQuiz, type TakeQuiz } from '@app-types/quiz-types';
import { Axios } from '@config/axios';
import { QuizTimer } from '@components/quiz/timer/Timer';
import { toast } from 'react-toastify';


export const StartQuiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, DraftAnswer>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<SubmitQuiz | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    initializeQuiz()
  }, [id]);

  const initializeQuiz = () => {
    setLoading(true)
    Axios.post<IResponse<TakeQuiz>>(`/quiz/${id}/take`)
    .then(async (resp) => {
      setAttempt(resp.data.payload.attempt)
      setQuestions(resp.data.payload.questions)
      if (resp.data.message === "Resumed quiz") {
        toast.info("Resuming your previous attempt");
      }

      await resumeQuiz(resp.data.payload.attempt.attemptId)
    })
    .catch(err => {
      console.error("Failed to take quiz:", err)
    })
    .finally(() => setLoading(false))
  }

  const resumeQuiz = (attemptId: string) => {
    Axios.get<{payload: ResumeQuiz}>(`/quiz/attempt/${attemptId}/resume`)
    .then(resp => {
      if(resp.data.payload.draftAnswers && resp.data.payload.draftAnswers.length > 0) {
        const answersMap = new Map<string, DraftAnswer>();
        resp.data.payload.draftAnswers.forEach((draft: DraftAnswer) => {
          answersMap.set(draft.questionId, draft)
        })
        setAnswers(answersMap)
      }
    })
    .catch(err => {
      console.error("Failed to resume:", err)
    })
  };

  const handleExitQuiz = async () => {
    navigate(`/layout/quizzes/${id}`);
  };

  const saveAnswer = async (questionId: string, answer: DraftAnswer) => {
    if (!attempt) return;
    setSavingAnswer(true)
    Axios.post(`/quiz/attempt/${attempt.attemptId}/answer`, {
      questionId,
      selectedOptions: answer.selectedOptions || [],
      textAnswer: answer.textAnswer || '',
    })
    .catch(err => console.error("failed to save question:", err))
    .finally(() => setSavingAnswer(false))

  };

  const handleMultipleChoiceAnswer = (optionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers.get(currentQuestion._id);
    const currentSelections = currentAnswer?.selectedOptions || [];

    let newSelections: number[];

    const isSingleChoice = currentQuestion.questionType === 'single-choice';

    if (isSingleChoice) {
      // Single choice: only one option can be selected
      newSelections = [optionIndex];
    } else {
      // Multiple choice: toggle selection
      if (currentSelections.includes(optionIndex)) {
        // Remove if already selected
        newSelections = currentSelections.filter(idx => idx !== optionIndex);
      } else {
        // Add to selections
        newSelections = [...currentSelections, optionIndex];
      }
    }

    const newAnswer: DraftAnswer = {
      questionId: currentQuestion._id,
      selectedOptions: newSelections,
    };

    // Update local state
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion._id, newAnswer);
    setAnswers(newAnswers);
  };

  const handleTextAnswer = (text: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswer: DraftAnswer = {
      questionId: currentQuestion._id,
      textAnswer: text,
    };

    // Update local state
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion._id, newAnswer);
    setAnswers(newAnswers);
  };

  const handleTextAnswerBlur = () => {
    // Save when user leaves the text field
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers.get(currentQuestion._id);
    if (answer && answer.textAnswer) {
      saveAnswer(currentQuestion._id, answer);
    }
  };

  const goToNextQuestion = () => {
    // Save current answer before moving to next question
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers.get(currentQuestion._id);
    
    if (answer && (answer.selectedOptions?.length || answer.textAnswer)) {
      saveAnswer(currentQuestion._id, answer);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    // Save current answer before moving to previous question
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers.get(currentQuestion._id);
    
    if (answer && (answer.selectedOptions?.length || answer.textAnswer)) {
      saveAnswer(currentQuestion._id, answer);
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers.get(currentQuestion._id);
    
    if (answer && (
      (answer.selectedOptions && answer.selectedOptions.length > 0) ||
      (answer.textAnswer && answer.textAnswer.trim())
    )) {
       saveAnswer(currentQuestion._id, answer);
      }

    setCurrentQuestionIndex(index);
  };

  const handleSubmitQuiz = async () => {
    if (!attempt) return;

    // Save current answer
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers.get(currentQuestion._id);
    if (answer && (answer.selectedOptions?.length || answer.textAnswer)) {
      await saveAnswer(currentQuestion._id, answer);
    }


    // Check if all questions are answered
    const unansweredCount = questions.length - answers.size;
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`)) {
        return;
      }
    }

    setIsSubmitting(true)
    Axios.post<IResponse<SubmitQuiz>>(`/quiz/attempt/${attempt.attemptId}/submit`)
    .then((resp) => {
      setQuizResult(resp.data.payload)
      setShowResultModal(true)
    })
    .catch((err) => {
      console.error("Failed to submit quiz: " + err)
      toast.info("Failed to submit quiz. Please try again.")
    }) 
    .finally(() => setIsSubmitting(false))

  };

  const handleRestartQuiz = async () => {
    if (!attempt) return;

    setIsSubmitting(true);
    
    try {
      const response = await Axios.post<IResponse<TakeQuiz>>(
        `/quiz/${attempt.quizId}/restart`
      );
      
      // Update state with new attempt data
      setAttempt(response.data.payload.attempt);
      setQuestions(response.data.payload.questions);
      
      // Reset UI state
      setShowResultModal(false);
      setQuizResult(null);
      setAnswers(new Map());
      setCurrentQuestionIndex(0);
      
      toast.success("Quiz restarted successfully!");
    } catch (err) {
      console.error("Failed to restart quiz:", err);
      toast.error("Failed to restart quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewAnswers = () => {
    if (attempt) {
      navigate(`/layout/quizzes/attempt/${attempt.attemptId}/answers`);
    }
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
    navigate(`/layout/quizzes/${id}`);
  };

  const isQuestionAnswered = (questionId: string): boolean => {
    return answers.has(questionId);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>
          <div className={styles.loaderCircle}></div>
          <div className={styles.loaderCircle}></div>
          <div className={styles.loaderCircle}></div>
        </div>
        <p className={styles.loadingText}>Loading quiz...</p>
      </div>
    );
  }

  if(questions.length === 0) {
  return (
    <div className={styles.noQuestionsContainer}>
      <AlertCircle size={64} className={styles.noQuestionsIcon} />
      <h2 className={styles.noQuestionsTitle}>No Questions Available</h2>
      <p className={styles.noQuestionsText}>This quiz doesn't have any questions yet.</p>
      <button onClick={handleExitQuiz} className={styles.noQuestionsBtn}>
        <ArrowLeft size={20} />
        Go Back
      </button>
    </div>
  );
}

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.get(currentQuestion._id);

  return (
    <div className={styles.container}>
      <div className={styles.backgroundDecor}>
        <div className={styles.decorCircle1}></div>
        <div className={styles.decorCircle2}></div>
        <div className={styles.decorCircle3}></div>
      </div>

      <div className={styles.content}>
        {/* Header */}
        <div className={styles.quizHeader}>
          <button onClick={handleExitQuiz} className={styles.exitBtn}>
            <ArrowLeft size={20} />
            <span>Exit</span>
          </button>

          <QuizTimer isRunning={!!attempt && !showResultModal}/>

          <div className={styles.progressInfo}>
            <span className={styles.progressText}>
              {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Navigation */}
        <div className={styles.questionNav}>
          {questions.map((q, index) => (
            <button
              key={q._id}
              onClick={() => goToQuestion(index)}
              className={`${styles.questionNavBtn} ${
                index === currentQuestionIndex ? styles.questionNavActive : ''
              } ${isQuestionAnswered(q._id) ? styles.questionNavAnswered : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Question Card */}
        <div className={styles.questionCard}>
          <div className={styles.questionHeader}>
            <h2 className={styles.questionTitle}>Question {currentQuestionIndex + 1}</h2>
            {savingAnswer && (
              <span className={styles.savingIndicator}>
                <AlertCircle size={16} />
                Saving...
              </span>
            )}
          </div>

          <p className={styles.questionText}>{currentQuestion.questionText}</p>

          {currentQuestion.image && (
            <img 
              src={`${API_URL}/uploads/${currentQuestion.image}`} 
              className={styles.questionImage} 
            />
          )}

          {/* Multiple Choice or Single Choice */}
          {(currentQuestion.questionType === 'multiple-choice' || currentQuestion.questionType === 'single-choice') && currentQuestion.options && (
            <div className={styles.optionsList}>
              {currentQuestion.options.map((option, index) => {
                const isSingleChoice = currentQuestion.questionType === 'single-choice';
                return (
                  <button
                    key={index}
                    onClick={() => handleMultipleChoiceAnswer(index)}
                    className={`${styles.optionBtn} ${
                      currentAnswer?.selectedOptions?.includes(index) ? styles.optionSelected : ''
                    }`}
                  >
                    <div className={`${styles.optionRadio} ${isSingleChoice ? styles.radioStyle : styles.checkboxStyle}`}>
                      {currentAnswer?.selectedOptions?.includes(index) && (
                        <CheckCircle size={18} />
                      )}
                    </div>
                    <span className={styles.optionText}>{option.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Short text Answer */}
          {currentQuestion.questionType === 'short-answer' && (
            <textarea
              value={currentAnswer?.textAnswer || ''}
              onChange={(e) => handleTextAnswer(e.target.value)}
              onBlur={handleTextAnswerBlur}
              placeholder="Type your answer here..."
              className={styles.textAnswer}
              rows={6}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className={styles.navigationBtns}>
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={styles.navBtn}
          >
            <ChevronLeft size={20} />
            <span>Previous</span>
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className={styles.submitBtn}
            >
              <Trophy size={20} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Quiz'}</span>
            </button>
          ) : (
            <button onClick={goToNextQuestion} className={styles.navBtn}>
              <span>Next</span>
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Answered Count */}
        <div className={styles.answeredInfo}>
          <CheckCircle size={20} />
          <span>
            {answers.size} of {questions.length} questions answered
          </span>
        </div>
      </div>

      {/* Result Modal */}
      <Modal
        open={showResultModal}
        onClose={handleCloseModal}
        aria-labelledby="quiz-result-modal"
      >
        <Box className={styles.modalBox}>
          <button onClick={handleCloseModal} className={styles.modalCloseBtn}>
            <X size={24} />
          </button>

          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <Trophy className={styles.modalTrophyIcon} size={80} />
              <h2 className={styles.modalTitle}>Quiz Completed!</h2>
              <p className={styles.modalSubtitle}>Here's how you did</p>
            </div>

            {quizResult && (
              <>
                <div className={styles.modalScoreCircle}>
                  <div className={styles.modalScoreInner}>
                    <span className={styles.modalScorePercentage}>
                      {Math.round(quizResult.percentage)}%
                    </span>
                    <span className={styles.modalScoreLabel}>Score</span>
                  </div>
                </div>

                <div className={styles.modalStats}>
                  <div className={styles.modalStat}>
                    <span className={styles.modalStatLabel}>Points</span>
                    <span className={styles.modalStatValue}>
                      {quizResult.score}/{quizResult.totalPoints}
                    </span>
                  </div>
                  <div className={styles.modalStat}>
                    <span className={styles.modalStatLabel}>Correct</span>
                    <span className={styles.modalStatValue}>
                      {quizResult.correctAnswers}/{quizResult.totalQuestions}
                    </span>
                  </div>
                  <div className={styles.modalStat}>
                    <span className={styles.modalStatLabel}>Time Spent</span>
                    <span className={styles.modalStatValue}>
                      {Math.floor(quizResult.timeSpent / 60)}m {quizResult.timeSpent % 60}s
                    </span>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button onClick={handleViewAnswers} className={styles.modalViewBtn}>
                    <Eye size={20} />
                    <span>See Correct Answers</span>
                  </button>
                  <button onClick={handleRestartQuiz} className={styles.modalRestartBtn}>
                    <RotateCcw size={20} />
                    <span>Start Again</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </Box>
      </Modal>
    </div>
  );
};
