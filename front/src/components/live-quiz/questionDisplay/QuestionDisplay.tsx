import { useState, useEffect } from 'react';
import styles from './questionDisplay.module.css';
import type { QuestionData, QuestionResults, UserRole, Participant } from '@app-types/live-quiz-types';
import { Flag, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface QuestionDisplayProps {
  question: QuestionData;
  questionResults: QuestionResults | null;
  role: UserRole;
  answeredCount?: number;
  totalParticipants?: number;
  participants?: Participant[];
  totalScore?: number;
  onSubmitAnswer: (answer: { questionId: string; selectedOptions?: number[]; textAnswer?: string }) => void;
  onNextQuestion?: () => void;
  onEndQuiz?: () => void;
}

export const QuestionDisplay = ({
  question,
  questionResults,
  role,
  answeredCount = 0,
  totalParticipants = 0,
  participants = [],
  totalScore = 0,
  onSubmitAnswer,
  onNextQuestion,
  onEndQuiz,
}: QuestionDisplayProps) => {

  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const isMultipleChoice = question.questionType === 'multiple-choice';
  const isSingleChoice = question.questionType === 'single-choice';
  const isShortAnswer = question.questionType === 'short-answer';
  const isLastQuestion = question.index === question.total - 1;

  const responseRate = totalParticipants > 0 
    ? Math.round((answeredCount / totalParticipants) * 100) 
    : 0;

  // Reset state when question changes
  useEffect(() => {
    setSelectedOptions([]);
    setTextAnswer('');
    setSubmitted(false);
  }, [question.questionId]);

  const handleOptionClick = (index: number) => {
    if (submitted || questionResults) return;

    if (isSingleChoice) {
      setSelectedOptions([index]);
    } else if (isMultipleChoice) {
      setSelectedOptions(prev =>
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      );
    }
  };

  const handleSubmit = () => {
    if (submitted || role === 'teacher') return;

    if (isShortAnswer && !textAnswer.trim()) return;
    if ((isSingleChoice || isMultipleChoice) && selectedOptions.length === 0) return;

    setSubmitted(true);
    onSubmitAnswer({
      questionId: question.questionId,
      selectedOptions: (isSingleChoice || isMultipleChoice) ? selectedOptions : undefined,
      textAnswer: isShortAnswer ? textAnswer : undefined,
    });
  };

  const getOptionClassName = (index: number) => {
    const baseClass = styles.option;
    const selected = selectedOptions.includes(index);
    const isCorrect = questionResults?.correctAnswers.includes(index);

    if (questionResults) {
      if (isCorrect) return `${baseClass} ${styles.correct}`;
      if (selected && !isCorrect) return `${baseClass} ${styles.wrong}`;
      return `${baseClass} ${styles.disabled}`;
    }

    return `${baseClass} ${selected ? styles.selected : ''}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.progress}>
          <span className={styles.progressText}>
            Question {question.index + 1} of {question.total}
          </span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((question.index + 1) / question.total) * 100}%` }}
            />
          </div>
        </div>

        {role === 'student' && !questionResults && (
          <div className={styles.scoreWrapper}>
            <span className={styles.score}>
              <TrendingUp size={16} /> Score: {totalScore}
            </span>
          </div>
        )}

        {role === 'teacher' && (
          <div className={styles.teacherInfoBar}>
            <div className={styles.infoCard}>
              <Users size={18} />
              <div className={styles.infoText}>
                <span className={styles.infoValue}>{totalParticipants}</span>
                <span className={styles.infoLabel}>Participants</span>
              </div>
            </div>
            <div className={styles.infoCard}>
              <CheckCircle size={18} />
              <div className={styles.infoText}>
                <span className={styles.infoValue}>{answeredCount}</span>
                <span className={styles.infoLabel}>Answered</span>
              </div>
            </div>
            <div className={styles.infoCard}>
              <Clock size={18} />
              <div className={styles.infoText}>
                <span className={styles.infoValue}>{responseRate}%</span>
                <span className={styles.infoLabel}>Response Rate</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Teacher Live Analytics Panel */}
      {role === 'teacher' && !questionResults && (
        <div className={styles.teacherAnalytics}>
          <div className={styles.analyticsHeader}>
            <h3>Live Participation</h3>
            <span className={styles.liveIndicator}>● LIVE</span>
          </div>
          <div className={styles.participantGrid}>
            {participants.map((participant) => (
              <div key={participant._id} className={styles.participantChip}>
                <span className={styles.participantName}>{participant.username}</span>
                <span className={styles.participantStatus}>
                  {answeredCount > 0 ? '✓' : '○'}
                </span>
              </div>
            ))}
            {participants.length === 0 && (
              <p className={styles.noParticipants}>No participants yet</p>
            )}
          </div>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.questionCard}>
          <div className={styles.questionHeader}>
            <span className={styles.questionType}>{question.questionType}</span>
            <span className={styles.points}>{question.points} points</span>
          </div>

          <h2 className={styles.questionText}>{question.questionText}</h2>

          {question.image && (
            <img
              src={`${API_URL}/uploads/${question.image}`}
              alt="Question"
              className={styles.questionImage}
            />
          )}

          {(isSingleChoice || isMultipleChoice) && (
            <div className={styles.options}>
              {question.options.map((option, index) => (
                <button
                  key={index}
                  className={getOptionClassName(index)}
                  onClick={() => handleOptionClick(index)}
                  disabled={submitted || !!questionResults || role === 'teacher'}
                >
                  <span className={styles.optionLetter}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className={styles.optionText}>{option.text}</span>
                  {questionResults?.correctAnswers.includes(index) && (
                    <span className={styles.correctBadge}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {isShortAnswer && !questionResults && role === 'student' && (
            <div className={styles.textAnswerWrapper}>
              <input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className={styles.textInput}
                disabled={submitted}
              />
            </div>
          )}

          {questionResults && (
            <div className={styles.resultsSection}>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{questionResults.stats.totalAnswered}</span>
                  <span className={styles.statLabel}>Answered</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{questionResults.stats.correctAnswers}</span>
                  <span className={styles.statLabel}>Correct</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{questionResults.stats.percentage}%</span>
                  <span className={styles.statLabel}>Accuracy</span>
                </div>
              </div>

              {questionResults.explanation && (
                <div className={styles.explanation}>
                  <h3 className={styles.explanationTitle}>💡 Explanation</h3>
                  <p className={styles.explanationText}>{questionResults.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {/* Student Submit */}
          {role === 'student' && !submitted && !questionResults && (
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={
                (isShortAnswer && !textAnswer.trim()) ||
                ((isSingleChoice || isMultipleChoice) && selectedOptions.length === 0)
              }
            >
              Submit Answer
            </button>
          )}

          {/* Student waiting */}
          {role === 'student' && (submitted || questionResults) && (
            <div className={styles.waitingMessage}>
              <Clock size={20} />
              Waiting for teacher to move to next question...
            </div>
          )}

          {/* Teacher actions */}
          {role === 'teacher' && (
            <div className={styles.teacherActions}>
              {!questionResults && (
                <div className={styles.teacherHint}>
                  <p>💡 Wait for students to answer, then click Next Question to see results</p>
                </div>
              )}
              {!isLastQuestion ? (
                <button
                  className={styles.nextBtn}
                  onClick={onNextQuestion}
                  disabled={questionResults ? true : false}
                >
                  {questionResults ? 'Next Question →' : 'Show Results & Continue →'}
                </button>
              ) : (
                <button className={styles.endBtn} onClick={onEndQuiz}>
                  <Flag size={18}/> 
                  {questionResults ? 'End Quiz' : 'Show Results & End Quiz'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};