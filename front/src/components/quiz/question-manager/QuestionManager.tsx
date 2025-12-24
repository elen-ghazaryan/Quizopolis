import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ListX } from "lucide-react";
import styles from "./QuestionManager.module.css";
import { AddQuestion } from "../add-question/AddQuestion";
import { Axios } from "@config/axios";
import type { Question, TeacherQuizDetail } from "app-types/quiz-types";
import { QuestionCard } from "../questionCard/QuestionCard";

interface QuestionManagerProps {
  quiz: TeacherQuizDetail | null;
}

export const QuestionManager: React.FC<QuestionManagerProps> = ({ quiz }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddQuestionPage, setShowAddQuestionPage] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!quiz?._id) return;

    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await Axios.get<{payload: {questions: Question[]}}>(`/admin/quiz/${quiz._id}/questions`);
        const loadedQuestions = response.data.payload.questions
        setQuestions(loadedQuestions);
      } catch (error) {
        console.error('Failed to load questions:', error);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [quiz?._id]);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  const handleQuestionAdded = (question: Question) => {
    if (editingQuestion) {
      setQuestions(prev => 
        prev.map(q => q._id === question._id ? question : q)
      );
      setMessage("Question updated successfully!");
    } else {
      setQuestions(prev => [...prev, question]);
      setMessage("Question added successfully!");
    }
    
    setShowAddQuestionPage(false);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowAddQuestionPage(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await Axios.delete(`/admin/quiz/questions/${questionId}`);
      setQuestions(prev => prev.filter(q => q._id !== questionId));
      setMessage("Question deleted successfully!");
    } catch (error) {
      console.error('Delete error:', error);
      setMessage("Failed to delete question. Please try again.");
    }
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
    navigate("/layout");
  };

  if (showAddQuestionPage) {
    return (
      <AddQuestion
        quizId={quiz!._id}
        editingQuestion={editingQuestion}
        onQuestionAdded={handleQuestionAdded}
        onCancel={handleCancelAdd}
      />
    );
  }

  if (isLoading) {
    return (
      <div className={styles.card}>
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      {/* Quiz Header */}
      {quiz && (
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{quiz.title}</h1>
            <p className={styles.subtitle}>
              {quiz.category} • {questions.length}{" "}
              {questions.length === 1 ? "question" : "questions"}
            </p>
          </div>
          <button 
            className={styles.finishButton} 
            onClick={handleFinishQuiz}
            disabled={questions.length === 0}
          >
            Finish Quiz
          </button>
        </div>
      )}

      {/* Empty State */}
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
          {/* Questions List */}
          <div className={styles.questionsList}>
            {questions.map((question, index) => (
              <QuestionCard
                key={question._id}
                question={question}
                index={index}
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
              />
            ))}
          </div>

          {/* Add Another Question Button */}
          <button
            className={styles.addAnotherButton}
            onClick={() => setShowAddQuestionPage(true)}
          >
            + Add Another Question
          </button>
        </>
      )}

      {/* Message Display */}
      {message && (
        <div className={styles.message}>
          {message}
        </div>
      )}
    </div>
  );
};
