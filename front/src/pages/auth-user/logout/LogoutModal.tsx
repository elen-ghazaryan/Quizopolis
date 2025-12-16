import { Modal } from "@mui/material";
import styles from "./logoutModal.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Axios } from "@config/axios";



export const Logout = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)

  const handleCancel = () => {
    setOpen(false)
    navigate("/layout")
  }

  const handleLogout = async () => {
    Axios.post("/auth/logout")
    .then(() => navigate("/signup"))
  }

  return (
    <Modal open={open}>
      <div className={styles.logoutOverlay}>
        <div className={styles.logoutModal}>
          <h3>Log out</h3>
          <p>Are you sure you want to log out?</p>

          <div className={styles.actions}>
            <button
              className={styles.cancelBtn}
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button className={styles.logoutBtn} onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
