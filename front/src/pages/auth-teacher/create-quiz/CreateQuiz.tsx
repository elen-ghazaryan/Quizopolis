import { useState } from 'react';

import { CheckCircle2 } from 'lucide-react';
import styles from './createQuiz.module.css';
import type { Quiz } from "app-types/quiz-types";
import { QuizForm } from '../../../components/quiz/quiz-form/QuizForm';
import { QuestionManager } from '../../../components/quiz/question-manager/QuestionManager';



export const CreateQuiz = () => {
  const [currentStep, setCurrentStep] = useState<'quiz' | 'questions'>('quiz');
  const [createdQuiz, setCreatedQuiz] = useState<Quiz | null>(null);
  const handleQuizCreate = (quiz: Quiz) => {
      setCreatedQuiz(quiz)
      setCurrentStep("questions")
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create Your Quiz</h1>
        <p className={styles.subtitle}>Build engaging quizzes with custom questions and answers</p>
      </div>

      <div className={styles.stepIndicator}>
        <div className={`${styles.step} ${currentStep === 'quiz' || createdQuiz ? styles.stepActive : ''}`}>
          <div className={styles.stepCircle}>
            {createdQuiz ? <CheckCircle2 className="w-5 h-5" /> : '1'}
          </div>
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.step} ${currentStep === 'questions' ? styles.stepActive : ''}`}>
          <div className={styles.stepCircle}>2</div>
        </div>
      </div>

      <div className={styles.content}>
        {currentStep === 'quiz' ? (
          <QuizForm  onQuizCreated={handleQuizCreate}/>
        ) : (
              <QuestionManager 
                quiz={createdQuiz}
              />
        )}
      </div>
    </div>
  );
};

