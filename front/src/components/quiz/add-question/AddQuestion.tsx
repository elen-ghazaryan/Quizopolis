import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import styles from './addQuestion.module.css';
import type { IQuestionForm, IResponse, Question } from 'app-types/quiz-types';
import { Axios } from "@config/axios";

interface AddQuestionProps {
  quizId: string;
  editingQuestion: Question | null;
  onQuestionAdded: (question: Question) => void;
  onCancel: () => void;
}

const DEFAULT_OPTIONS = [
  { text: '', isCorrect: false },
  { text: '', isCorrect: false }
];

export const AddQuestion: React.FC<AddQuestionProps> = ({ 
  quizId, 
  editingQuestion, 
  onQuestionAdded, 
  onCancel 
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false);
  console.log(imagePreview)
  const API_URL = import.meta.env.VITE_API_URL;
  const { 
    register, 
    handleSubmit, 
    watch, 
    control, 
    reset, 
    setValue, 
    formState: { errors } 
  } = useForm<IQuestionForm>({
    defaultValues: {
      questionText: '',
      questionType: 'single-choice',
      options: DEFAULT_OPTIONS,
      correctAnswer: '',
      points: 1,
      explanation: ''
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'options'
  });

  const questionType = watch('questionType');
  const options = watch('options');

  // Initialize form when editing
  useEffect(() => {
    if (!editingQuestion) return;

    const isShortAnswer = editingQuestion.questionType === 'short-answer';
    
    reset({
      questionText: editingQuestion.questionText,
      questionType: editingQuestion.questionType,
      options: isShortAnswer ? [] : (editingQuestion.options || DEFAULT_OPTIONS),
      correctAnswer: editingQuestion.correctAnswer || '',
      points: editingQuestion.points,
      explanation: editingQuestion.explanation || ''
    });

    if (editingQuestion.image) {
      setImagePreview(editingQuestion.image);
    }
  }, [editingQuestion, reset]);

  // Handle question type changes
  useEffect(() => {
    if (editingQuestion) return;

    if (questionType === 'short-answer' && fields.length > 0) {
      replace([]);
    } else if (questionType !== 'short-answer' && fields.length === 0) {
      replace(DEFAULT_OPTIONS);
    }
  }, [questionType, fields.length, replace, editingQuestion]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setShouldRemoveImage(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setShouldRemoveImage(true);
  };

  const handleAddOption = () => {
    append({ text: '', isCorrect: false });
  };

  const handleCorrectAnswerChange = (index: number, checked: boolean) => {
    if (questionType === 'single-choice') {
      // Uncheck all others for single choice
      fields.forEach((_, i) => setValue(`options.${i}.isCorrect`, i === index));
    } else {
      // Toggle for multiple choice
      setValue(`options.${index}.isCorrect`, checked);
    }
  };

  const validateForm = (data: IQuestionForm): string | null => {
    if (questionType === 'short-answer') {
      if (!data.correctAnswer?.trim()) {
        return 'Correct answer is required for short answer questions';
      }
    } else {
      if (!data.options || data.options.length < 2) {
        return 'At least 2 options are required';
      }

      const hasCorrectAnswer = data.options.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        return 'Please select at least one correct answer';
      }

      const hasEmptyOption = data.options.some(opt => !opt.text?.trim());
      if (hasEmptyOption) {
        return 'All options must have text';
      }
    }
    return null;
  };

  const buildFormData = (data: IQuestionForm): FormData => {
    const formData = new FormData();
    
    formData.append('questionText', data.questionText);
    formData.append('questionType', data.questionType);
    formData.append('points', data.points.toString());
    formData.append('explanation', data.explanation || '');

    if (questionType === 'short-answer') {
      formData.append('correctAnswer', data.correctAnswer);
    } else {
      const transformedOptions = data.options.map(opt => ({
        text: opt.text,
        isCorrect: Boolean(opt.isCorrect)
      }));
      formData.append('options', JSON.stringify(transformedOptions));
    }

    if (imageFile) {
      formData.append('image', imageFile);
      formData.append('removeImage', 'false');
    } else if (shouldRemoveImage) {
      formData.append('removeImage', 'true');
    } else {
      formData.append('removeImage', 'false');
    }

    return formData;
  };

  const resetForm = () => {
    reset({
      questionText: '',
      questionType: 'single-choice',
      options: DEFAULT_OPTIONS,
      correctAnswer: '',
      points: 1,
      explanation: ''
    });
    setImageFile(null);
    setImagePreview('');
    setShouldRemoveImage(false);
  };

  const onSubmit = async (data: IQuestionForm) => {
    setMessage("");
    
    const validationError = validateForm(data);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = buildFormData(data);

      if (editingQuestion?._id) {
        // Update existing question
        const response = await Axios.put<IResponse<{question: Question}>>(
          `/admin/quiz/questions/${editingQuestion._id}`, 
          formData
        );
        onQuestionAdded(response.data.payload.question);
      } else {
        // Create new question
        const response = await Axios.post<IResponse<{question: Question}>>(
          `/admin/quiz/${quizId}/questions`, 
          formData
        );
        onQuestionAdded(response.data.payload.question);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving question:', error);
      setMessage(editingQuestion 
        ? "Failed to update question. Please try again." 
        : "Failed to add question. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quizId) {
    return (
      <div className={styles.errorWrapper}>
        <div className={styles.errorCard}>
          <h2 className={styles.errorTitle}>No Quiz Found</h2>
          <p className={styles.errorText}>Something went wrong. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>
        {editingQuestion ? 'Edit Question' : 'Add Question'}
      </h1>
      <p className={styles.subtitle}>
        {editingQuestion ? 'Update the question details' : 'Create a new question for your quiz'}
      </p>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        {/* Question Text */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Question Text <span className={styles.required}>*</span>
          </label>
          <textarea
            placeholder="Enter your question here..."
            className={styles.textarea}
            rows={3}
            {...register('questionText', { 
              required: "Question text is required" 
            })}
          />
          {errors.questionText && (
            <p className={styles.errorMsg}>{errors.questionText.message}</p>
          )}
        </div>

        {/* Question Type and Points */}
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Question Type <span className={styles.required}>*</span>
            </label>
            <select 
              className={styles.select} 
              {...register('questionType')}
            >
              <option value="single-choice">Single Choice</option>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="short-answer">Short Answer</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Points <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              placeholder="e.g., 1"
              className={styles.input}
              min="1"
              {...register('points', { 
                required: "Points are required",
                min: { value: 1, message: "Points must be at least 1" },
                valueAsNumber: true
              })}
            />
            {errors.points && (
              <p className={styles.errorMsg}>{errors.points.message}</p>
            )}
          </div>
        </div>

        {/* Answer Options for Choice Questions */}
        {(questionType === 'single-choice' || questionType === 'multiple-choice') && (
          <div className={styles.optionsSection}>
            <div className={styles.optionsHeader}>
              <label className={styles.label}>
                Answer Options <span className={styles.required}>*</span>
              </label>
              <button
                type="button"
                className={styles.addOptionButton}
                onClick={handleAddOption}
              >
                + Add Option
              </button>
            </div>

            <div className={styles.optionsList}>
              {fields.map((field, index) => (
                <div key={field.id} className={styles.optionItem}>
                  <input
                    type={questionType === 'single-choice' ? 'radio' : 'checkbox'}
                    className={styles.optionCheckbox}
                    checked={options[index]?.isCorrect || false}
                    onChange={(e) => handleCorrectAnswerChange(index, e.target.checked)}
                  />
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    className={styles.optionInput}
                    {...register(`options.${index}.text`, { 
                      required: "Option text is required" 
                    })}
                  />
                  {fields.length > 2 && (
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => remove(index)}
                      aria-label="Remove option"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className={styles.helperText}>
              {questionType === 'single-choice' 
                ? 'Select the correct answer by clicking the radio button' 
                : 'Select all correct answers by checking the boxes'}
            </p>
          </div>
        )}

        {/* Correct Answer for Short Answer Questions */}
        {questionType === 'short-answer' && (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Correct Answer <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="Enter the correct answer"
              className={styles.input}
              {...register('correctAnswer', { 
                required: questionType === 'short-answer' ? "Correct answer is required" : false 
              })}
            />
            {errors.correctAnswer && (
              <p className={styles.errorMsg}>{errors.correctAnswer.message}</p>
            )}
          </div>
        )}

        {/* Explanation */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Explanation (Optional)</label>
          <textarea
            placeholder="Provide an explanation for the answer..."
            className={styles.textarea}
            rows={3}
            {...register('explanation')}
          />
        </div>

        {/* Question Image */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Question Image (Optional)</label>
          {!imagePreview ? (
            <div className={styles.uploadArea}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
                id="imageUpload"
              />
              <label htmlFor="imageUpload" className={styles.uploadLabel}>
                <div className={styles.uploadIcon}>📷</div>
                <p className={styles.uploadText}>Click to upload image</p>
                <p className={styles.uploadSubtext}>PNG, JPG up to 5MB</p>
              </label>
            </div>
          ) : (
            <div className={styles.imagePreview}>
              <img src={imagePreview.startsWith('data:') 
                ? imagePreview 
                : `${API_URL}/uploads/${imagePreview}`} className={styles.previewImage} />
              <button
                type="button"
                className={styles.removeImageButton}
                onClick={handleRemoveImage}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.buttonContainer}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Saving...' 
              : (editingQuestion ? 'Update Question' : 'Add Question')
            }
          </button>
        </div>

        {/* Error/Success Message */}
        {message && <p className={styles.errorMsg}>{message}</p>}
      </form>
    </div>
  );
};