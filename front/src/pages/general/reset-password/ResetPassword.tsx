import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import styles from "./resetPassword.module.css";
import { Axios } from "../../../config/axios";
import axios from "axios";

type Status = "instructions" | "resetting" | "success" | "error";

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export const ResetPassword = () => {
  const [status, setStatus] = useState<Status>("instructions");
  const [message, setMessage] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>();

  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    if (token) {
      setStatus("resetting");
      setMessage("Please enter your new password below.");
    } else {
      setStatus("instructions");
      setMessage("We sent a password reset link to your email. Please check your inbox.");
    }
  }, [token]);

  const resendPassword = async () => {
    if (!email) {
      navigate("/layout");
      return;
    }

    Axios.post("/auth/forgot-password", { email })
      .then((resp) => {
        console.log(resp);
        setMessage("Password reset email resent. Check your inbox!");
      })
      .catch((err) => {
        console.log(err);
        setMessage("Failed to resend. Try again later.");
      });
  };

  const onSubmit = async (data: ResetPasswordForm) => {
    console.log(data, token);
    if(data.password !== data.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!token) {
      setMessage("Invalid or missing token.");
      setStatus("error");
      return;
    }

    try {
      await Axios.post("/auth/reset-password", {
        token,
        newPassword: data.password,
      });
      setStatus("success");
      setMessage("Your password has been reset successfully!");
      navigate(-1)
    } catch (err) {
       if (axios.isAxiosError(err)) {
        setMessage(
          "Failed to reset password: " +
            (err.response?.data?.message ?? "Unknown error.")
        );
      } else {
        setMessage("Failed to reset password: Unknown error.");
      }
    }
  };

  const renderIcon = () => {
    if (status === "success") return <CheckCircle className={styles.iconSuccess} />;
    if (status === "error") return <XCircle className={styles.iconError} />;
    if (status === "resetting") return <Lock className={styles.iconLock} />;
    return <Mail className={styles.iconMail} />;
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>{renderIcon()}</div>
        <h1 className={styles.title}>Password Reset</h1>
        <p className={styles.message}>{message}</p>

        {status === "resetting" && (
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                New Password
              </label>
              <input
                id="password"
                type="password"
                className={styles.input}
                disabled={isSubmitting}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              {errors.password && (
                <span className={styles.errorText}>{errors.password.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={styles.input}
                disabled={isSubmitting}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                })}
              />
              {errors.confirmPassword && (
                <span className={styles.errorText}>{errors.confirmPassword.message}</span>
              )}
            </div>

            <button type="submit" className={styles.button} disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {status === "instructions" && (
          <button className={styles.button} onClick={resendPassword}>
            Resend Password
          </button>
        )}

        {status === "error" && (
          <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={resendPassword}>
              Resend Reset Link
            </button>
            <Link to="/reset-password" className={styles.buttonSecondary}>
              Try Again
            </Link>
          </div>
        )}
        {status === "success" && (
          <Link to="/login" className={styles.button}>
            Go to Login
          </Link>
        )}
      </div>
    </div>
  );
};