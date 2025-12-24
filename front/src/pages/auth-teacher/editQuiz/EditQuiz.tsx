import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styles from './editQuiz.module.css';
import { type IResponse, type IQuizForm, type TeacherQuizDetail } from '@app-types/quiz-types';
import { Axios } from '@config/axios';
import { QuestionManager } from '@components/quiz/question-manager/QuestionManager';

export const EditQuiz = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [quiz, setQuiz] = useState<TeacherQuizDetail | null>(null);

  const {
    register: registerQuiz,
    handleSubmit: handleSubmitQuiz,
    reset: resetQuiz,
  } = useForm<IQuizForm>({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      mode: 'standard',
      difficulty: 'easy',
      isPublished: false,
    }
  });


  useEffect(() => {
    if (!quizId) return;

    setLoading(true);
    Axios.get<IResponse<TeacherQuizDetail>>(`/admin/quiz/${quizId}`)
      .then(response => {
        const quizData = response.data.payload;
        setQuiz(quizData);
        resetQuiz({
          title: quizData.title,
          description: quizData.description,
          category: quizData.category,
          mode: quizData.mode,
          difficulty: quizData.difficulty,
          isPublished: quizData.isPublished,
        });
        setLoading(false);
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || 'Failed to load quiz';
        setError(errorMsg);
        setLoading(false);
      });
  }, [quizId, resetQuiz]);

  // Save quiz information
  const onSubmitQuizInfo = (data: IQuizForm) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    Axios.put<IResponse<TeacherQuizDetail>>(`/admin/quiz/${quizId}`, data)
      .then(resp => {
        const updatedQuiz = resp.data.payload;
        setQuiz(updatedQuiz);
        setSuccessMessage('Quiz information updated successfully!');
        setSaving(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || 'Failed to update quiz';
        setError(errorMsg);
        setSaving(false);
      });
  };

  const goBackToDetails = () => {
    if (!quiz) return;

    navigate(`/layout/quizzes/${quiz._id}/teacher`);
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

  if (!quiz) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Quiz not found</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Quiz</h1>
        <button className={styles.backBtn} onClick={goBackToDetails}>
          ← Back
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}

      {/* Quiz Information Form */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quiz Information</h2>
        <form className={styles.form} onSubmit={handleSubmitQuiz(onSubmitQuizInfo)}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Title *</label>
            <input
              type="text"
              {...registerQuiz('title', { required: true })}
              className={styles.input}
              placeholder="Enter quiz title"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description *</label>
            <textarea
              {...registerQuiz('description', { required: true })}
              className={styles.textarea}
              rows={4}
              placeholder="Enter quiz description"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Category *</label>
              <input
                type="text"
                {...registerQuiz('category', { required: true })}
                className={styles.input}
                placeholder="e.g., Mathematics, Science"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Difficulty *</label>
              <select
                {...registerQuiz('difficulty')}
                className={styles.select}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Mode *</label>
              <select
                {...registerQuiz('mode')}
                className={styles.select}
              >
                <option value="standard">Standard</option>
                <option value="live">Live</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                {...registerQuiz('isPublished')}
                className={styles.checkbox}
              />
              <span>Publish Quiz</span>
            </label>
          </div>

          <button 
            type="submit"
            className={styles.saveBtn}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Quiz Information'}
          </button>
        </form>
      </section>

      {/* Questions Section - Reuse QuestionManager */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Manage Questions</h2>
        <div className={styles.questionManagerWrapper}>
          <QuestionManager quiz={quiz} />
        </div>
      </section>
    </div>
  );
};