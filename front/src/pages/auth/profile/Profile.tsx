import { useEffect, useState } from "react"
import { Axios } from "../../../config/axios"
import type { IUser } from "../../../context/types"
import { useContextDispatch, useContextState } from "../../../context/hooks"
import axios from "axios"
import type { IErrorResponse, IResponse } from "../../../types"
import styles from "./profile.module.css"
import { BookOpen, Camera, Edit2, GraduationCap, Settings } from "lucide-react"


export const Profile = () => {
  const dispatch = useContextDispatch()
  const { user } = useContextState();
  const [error, setError] = useState('')

  useEffect(() => {
    Axios
    .get<IResponse<IUser>>("/user/profile")
    .then((res) => {
      dispatch({ type: "SET_USER", payload: res.data.payload })
    })
    .catch(err => {
      if(axios.isAxiosError(err)) {
        const errorResp = err.response?.data as IErrorResponse;
        if(errorResp) setError(errorResp.message)
      }
    })
  }, [])

  if(!user) {
    return (
      <div>No User</div>
    )
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.banner}>
        {/* Animated Background */}
        <div className={styles.bannerBackground}>
          <div className={styles.gradient1}></div>
          <div className={styles.gradient2}></div>
          <div className={styles.gradient3}></div>
          <div className={styles.particles}></div>
        </div>

        {/* Banner Actions */}
        <div className={styles.bannerActions}>
          <button className={styles.actionBtn}>
            <Edit2 size={16} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Profile Section */}
        <div className={styles.profileSection}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatarContainer}>
              <img 
                src={user?.avatar || "default_avatar.png"} 
                alt="Profile" 
                className={styles.avatar}
              />
              <div className={styles.avatarOverlay}>
                <Camera size={24} />
              </div>
            </div>
          </div>

          <div className={styles.userInfo}>
            <h1 className={styles.userName}>
              {user?.username || 'John Doe'}
            </h1>
            <p className={styles.userRole}>
              {user?.role === 'teacher' ? (
                <>
                  <GraduationCap size={18} />
                  <span>Teacher</span>
                </>
              ) : (
                <>
                  <BookOpen size={18} />
                  <span>Student</span>
                </>
              )}
            </p>
            <p className={styles.userBio}>
              {user.bio || "No bio yet"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};