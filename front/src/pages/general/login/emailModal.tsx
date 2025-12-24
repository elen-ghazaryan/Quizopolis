import { Modal } from "@mui/material"
import styles from "./emailModal.module.css"
import { useState } from "react";
import { set } from "react-hook-form";

interface EmailModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (email: string) => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({open, onClose, onConfirm}) => {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");

  const handleConfirm = () => {
    if(!value.trim()) {
      setMessage("Email cannot be empty.");
      return;
    }
    setMessage("");
    onConfirm(value);
    setValue("");
  };

  return (
    <Modal open={open} onClose={onClose}>
     <div className={styles.overlay}>
      <div className={styles.card}>
        <h2 className={styles.title}>Reset Password</h2>
        <p className={styles.text}>
          Please enter your email address to receive a reset link.
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={styles.input}
        />

        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose} >
            Cancel
          </button>
          <button className={styles.confirm} onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
    </Modal>
  )
} 