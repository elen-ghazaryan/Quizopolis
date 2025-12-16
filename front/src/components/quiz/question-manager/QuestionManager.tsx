import React, { useState } from "react";
import styles from "./QuestionManager.module.css";
import { AddQuestion } from "../add-question/AddQuestion";
import type { Question, Quiz } from "../../../types";
import { ListX } from "lucide-react";
import { Axios } from "../../../config/axios";

interface QuestionManagerProps {
  quiz: Quiz | null;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({ quiz }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddQuestionPage, setShowAddQuestionPage] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [message, setMessage] = useState("")

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)


  React.useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 2500); 

    return () => clearTimeout(timer);
  }, [message]);

  const openDeleteModal = (id: string) => {
    setQuestionToDelete(id)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setQuestionToDelete(null)
  }

  const confirmToDelete = () => {
    if(questionToDelete) {
      handleDeleteQuestion(questionToDelete)
    }
    closeDeleteModal
  }
  const handleQuestionAdd = (question: Question) => {
    setQuestions([...questions, question]);
    setShowAddQuestionPage(false);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowAddQuestionPage(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    Axios
    .delete(`/admin/quiz/${questionId}`)
    .then(() => setQuestions(prev => prev.filter(q => q._id !== questionId)))
    .catch(err => {
      console.error(err)
      setMessage("Failed to delete, please try later.")
    })
  };

  const handleCancelAdd = () => {
    setShowAddQuestionPage(false);
    setEditingQuestion(null);
  };

  const handleFinishQuiz = () => {
    if (questions.length === 0) {
      setMessage("Please add at least one question before finishing.");
      return;
    }
    // Navigate to quiz list or preview
    console.log("Quiz completed with", questions.length, "questions");
    alert("Quiz created successfully!");
  };

  if (showAddQuestionPage) {
    return (
      <AddQuestion
        quizId={quiz!._id}
        editingQuestion={editingQuestion}
        onQuestionAdded={handleQuestionAdd}
        onCancel={handleCancelAdd}
      />
    );
  }

  return (
    <div className={styles.card}>
      {quiz && (
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{quiz.title}</h1>
            <p className={styles.subtitle}>
              {quiz.category} • {questions.length}{" "}
              {questions.length === 1 ? "question" : "questions"}
            </p>
          </div>
          <button className={styles.finishButton} onClick={handleFinishQuiz}>
            Finish Quiz
          </button>
        </div>
      )}
      {questions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <ListX size={50} />
          </div>
          <h2 className={styles.emptyTitle}>No questions yet</h2>
          <p className={styles.emptyText}>
            Start building your quiz by adding your first question
          </p>
          <button
            className={styles.addButton}
            onClick={() => setShowAddQuestionPage(true)}
          >
            Add First Question
          </button>
        </div>
      ) : (
        <>
          <div className={styles.questionsList}>
            {questions.map((question, index) => (
              <div key={question._id} className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <div className={styles.questionNumber}>
                    Question {index + 1}
                  </div>
                  <div className={styles.questionMeta}>
                    <span className={styles.badge}>
                      {question.questionType}
                    </span>
                    <span className={styles.points}>{question.points} pts</span>
                  </div>
                </div>

                <div className={styles.questionContent}>
                  <p className={styles.questionText}>{question.questionText}</p>

                  {question.image && (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/uploads/${question.image}`}
                      alt="Question"
                      className={styles.questionImage}
                    />
                  )}

                  {(question.questionType === "single-choice" ||
                    question.questionType === "multiple-choice") &&
                    question.options && (
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

                  {question.questionType === "short-answer" &&
                    question.correctAnswer && (
                      <div className={styles.textAnswer}>
                        <strong>Correct Answer:</strong>{" "}
                        {question.correctAnswer}
                      </div>
                    )}

                  {question.explanation && (
                    <div className={styles.explanation}>
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>

                <div className={styles.questionActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditQuestion(question)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteQuestion(question._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            className={styles.addAnotherButton}
            onClick={() => setShowAddQuestionPage(true)}
          >
            + Add Another Question
          </button>
        </>
      )}
      { message && <div className={styles.message}>{message}</div> }
    </div>
  );
};
