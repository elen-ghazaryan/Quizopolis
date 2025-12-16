import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import styles from './addQuestion.module.css';
import type { IQuestionForm, IResponse, Question } from '../../../types';
import { Axios } from '../../../config/axios';


interface AddQuestionProps {
  quizId: string;
  editingQuestion: Question | null;
  onQuestionAdded: (question: Question) => void;
  onCancel: () => void;
}

export const AddQuestion: React.FC<AddQuestionProps> = ({ 
  quizId, 
  editingQuestion, 
  onQuestionAdded, 
  onCancel 
}) => {
  const { register, handleSubmit, watch, control, reset, setValue, formState: { errors } } = useForm<IQuestionForm>({
    defaultValues: {
      questionType: 'single',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswer: '',
      points: 1,
      explanation: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options'
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessgae] = useState("")
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false)
  
  const questionType = watch('questionType');
  const options = watch('options');

  
  useEffect(() => {
    if (editingQuestion) {
      reset({
        questionText: editingQuestion.questionText,
        questionType: editingQuestion.questionType,
        options: editingQuestion.options || [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        correctAnswer: editingQuestion.correctAnswer || '',
        points: editingQuestion.points,
        explanation: editingQuestion.explanation || ''
      });

      if (editingQuestion.image) {
        setImagePreview(editingQuestion.image);
      }
    }
  }, [editingQuestion, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setShouldRemoveImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setShouldRemoveImage(true); 
  };

  const addOption = () => {
    append({ text: '', isCorrect: false });
  };

  const onSubmit = async (data: IQuestionForm) => {
    setIsSubmitting(true);

    try {
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
          // New image uploaded - replace existing
          formData.append('image', imageFile);
          formData.append('removeImage', 'false');
        } else if (shouldRemoveImage) {
          formData.append('removeImage', 'true');
        } else {
          formData.append('removeImage', 'false');
        }

      // API calls
      if (editingQuestion?._id) {
        Axios
        .put<IResponse<{question: Question}>>(`/admin/quiz/questions/${editingQuestion._id}`, formData)
        .then(resp => {
          onQuestionAdded(resp.data.payload.question)
          setShouldRemoveImage(false);
        })
        .catch(err => {
          console.error(err)
          setMessgae("Failed to update question.Please try later.")
        })
      } else {
        Axios
        .post<IResponse<{question: Question}>>(`/admin/quiz/${quizId}/questions`, formData)
        .then(resp => {
          onQuestionAdded(resp.data.payload.question)
        })
        .catch(err => {
          console.error(err)
          setMessgae("Failed to add.Please try later")
        })
      }
    } catch (error) {
      console.error('Error saving question:', error);
      setMessgae("Failed to save question. Please try again")
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
          <div className={styles.formGroup}>

            {/* Question Text  */}
            <label className={styles.label}>
              Question Text <span className={styles.required}>*</span>
            </label>
            <textarea
              placeholder="Enter your question here..."
              className={styles.textarea}
              rows={3}
              {...register('questionText', { required: "Question is required" })}
            />
            {errors.questionText && <p className={styles.errorMsg}>{errors.questionText.message}</p> }
          </div>

        
          <div className={styles.row}>
            <div className={styles.formGroup}>

            {/* Question Type  */}
              <label className={styles.label}>
                Question Type <span className={styles.required}>*</span>
              </label>
              <select className={styles.select} {...register('questionType')} defaultValue="">
                <option value="" disabled>Select type</option>
                <option value="single-choice">Single Choice</option>
                <option value="multiple-choice">Multiple Choice</option>
                <option value="short-answer">Short Answer</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              {/* Question points  */}
              <label className={styles.label}>
                Points <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                placeholder="e.g., 1"
                className={styles.input}
                min="1"
                {...register('points', { required: true, min: 1 })}
              />
            </div>
          </div>

          {/* Answer options */}
          {(questionType === 'single-choice' || questionType === 'multiple-choice') && (
            <div className={styles.optionsSection}>
              <div className={styles.optionsHeader}>
                <label className={styles.label}>
                  Answer Options <span className={styles.required}>*</span>
                </label>
                <button
                  type="button"
                  className={styles.addOptionButton}
                  onClick={addOption}
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
                      onChange={(e) => {
                        if (questionType === 'single-choice') {
                          // For radio: uncheck all, then check selected
                          fields.forEach((_, i) => setValue(`options.${i}.isCorrect`, false));
                          setValue(`options.${index}.isCorrect`, true);
                        } else {
                          // For checkbox: toggle
                          setValue(`options.${index}.isCorrect`, e.target.checked);
                        }
                      }}
                    />
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      className={styles.optionInput}
                      {...register(`options.${index}.text`, { required: true })}
                    />
                    {fields.length > 2 && (
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => remove(index)}
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

          {/* Text answer  */}
          {questionType === 'short-answer' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Correct Answer <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter the correct answer"
                className={styles.input}
                {...register('correctAnswer', { required: questionType === 'short-answer' })}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Explanation (Optional)</label>
            <textarea
              placeholder="Provide an explanation for the answer..."
              className={styles.textarea}
              rows={3}
              {...register('explanation')}
            />
          </div>

          {/* Question Image  */}
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
                <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                <button
                  type="button"
                  className={styles.removeImageButton}
                  onClick={removeImage}
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

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
              {isSubmitting ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Add Question')}
            </button>
          </div>

          {message && <p className={styles.errorMsg}>{message}</p>}
        </form>
      </div>
  );
};