import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Mail } from "lucide-react";
import styles from "./verifyEmail.module.css";
import { Axios } from "../../../config/axios";

type Status = "instructions" | "verifying" | "verified" | "error";

export const VerifyEmail = () => {
  const [status, setStatus] = useState<Status>("instructions");
  const [message, setMessage] = useState<string>("");
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");

    if (token) {
      setStatus("verifying");
      Axios
        .post("/auth/verify", { token })
        .then(() => {
          setStatus("verified");
          setMessage("Your email has been verified successfully!");
        })
        .catch((err) => {
          console.log(err)
          setStatus("error");
          setMessage("Verification failed or token expired.");
        });
    } else {
      setStatus("instructions");
      setMessage("We sent a verification link to your email. Please check your inbox.");
    }
  }, [location.search]);

  const resendEmail = async () => {
    if(!email) {
      navigate("/signup")
      return
    }
    
    Axios.post("/auth/verify/resend", { email })
      .then((resp) => {
        console.log(resp)
        if(resp.data?.message === "Email already verified") {
          setMessage("Your email already verified")
        } else {
          setMessage("Verification email resent. Check your inbox!");
        }
      })
      .catch ((err) => { 
        console.log(err)
        setMessage("Failed to resend. Try again later.");
      })
  };

  const renderIcon = () => {
    if (status === "verified") return <CheckCircle className={styles.iconSuccess} />;
    if (status === "error") return <XCircle className={styles.iconError} />;
    return <Mail className={styles.iconMail} />;
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>{renderIcon()}</div>
        <h1 className={styles.title}>Email Verification</h1>
        <p className={styles.message}>{message}</p>

        {(status === "instructions" || status === "error") && (
          <button className={styles.button} onClick={resendEmail}>
            Resend Verification Email
          </button>
        )}

        {status === "verified" && (
          <Link to="/layout" className={styles.button}>Go to profile</Link>
        )}
      </div>
    </div>
  );
};


