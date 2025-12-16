import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import styles from "./quizForm.module.css";
import { type IQuizForm, type IResponse, type Quiz } from "../../../types";
import { Axios } from "../../../config/axios";

interface QuizFormProps {
  onQuizCreated: (quiz: Quiz) => void;
}

export const QuizForm: React.FC<QuizFormProps> = ({ onQuizCreated }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IQuizForm>();
  const [message, setMessage] = useState("")

  const onSubmit: SubmitHandler<IQuizForm> = (data) => {
    Axios.post<IResponse<{ quiz: Quiz }>>("/admin/quiz", data)
      .then((resp) => {
        onQuizCreated(resp.data.payload.quiz);
        setMessage("Quiz created successfully!")
      })
      .catch((err) => {
        console.log(err)
        setMessage("Failed to create quiz.")
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Quiz Information</h1>
        <p className={styles.subtitle}>Enter the basic details for your quiz</p>

        {/* Quiz title  */}
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Quiz Title <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., General Knowledge Quiz"
                className={styles.input}
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className={styles.errorMsg}>{errors.title.message}</p>
              )}
            </div>

            {/* Quiz category  */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Category <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Science, History, Math"
                className={styles.input}
                {...register("category", { required: "Category is required" })}
              />
              {errors.category && (
                <p className={styles.errorMsg}>{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Quiz difficulty  */}
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Difficulty Level <span className={styles.required}>*</span></label>
              <select
                className={styles.select}
                defaultValue=""
                {...register("difficulty", {
                  required: "Difficulty level is required",
                })}
              >
                <option value="" disabled>
                  Select level
                </option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              {errors.difficulty && (
                <p className={styles.errorMsg}>{errors.difficulty.message}</p>
              )}
            </div>

            {/* Quiz mode  */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Quiz Mode <span className={styles.required}>*</span></label>
              <select
                className={styles.select}
                defaultValue=""
                {...register("mode", { required: "Mode is required" })}
              >
                <option value="" disabled>
                  Select mode
                </option>
                <option value="standard">Standard</option>
                <option value="live">Live</option>
              </select>
              {errors.mode && (
                <p className={styles.errorMsg}>{errors.mode.message}</p>
              )}
            </div>
          </div>

          {/* Quiz description  */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Description
            </label>
            <textarea
              placeholder="Provide a brief description of what this quiz covers..."
              className={styles.textarea}
              rows={5}
              {...register("description")}
              defaultValue=""
            />
          </div>

          {/* Quiz publish/no publish  */}
          <div className={styles.publishSection}>
            <div className={styles.switchContainer}>
              <div>
                <span className={styles.checkboxLabel}>
                  Publish immediately
                </span>
                <p className={styles.checkboxDescription}>
                  Make this quiz available to users right away
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  className={styles.switchInput}
                  {...register("isPublished")}
                />
                <span className={styles.switchSlider}></span>
              </label>
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.submitButton}>
              Create Quiz
            </button>
          </div>
          {message && <p className={styles.errorMsg}>{message}</p>}
        </form>
      </div>
    </div>
  );
};
