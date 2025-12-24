import { useState } from 'react';
import { Eye, EyeOff, Zap, GraduationCap, BookOpen } from 'lucide-react';
import styles from './signup.module.css';
import Background from "../../../UI/Background"
import Modal from '@mui/material/Modal';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { IErrorResponse, SignupUser } from '../../../app-types/quiz-types';
import { Link, useNavigate } from 'react-router-dom';
import { Axios } from '../../../config/axios';
import axios from 'axios';

export const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'student'|'teacher'>('student');
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<SignupUser>()
  
  const handleSignup:SubmitHandler<SignupUser> = (data) => {
    data.role = selectedRole

    Axios
    .post("/auth/signup", data)
    .then(() => {
      navigate("/verify", { state: { email: data.email}})
    })
    .catch(err => {
      if(axios.isAxiosError(err)) {
        const errorResp = err.response?.data as IErrorResponse;
        if(errorResp) setError(errorResp.message)
      }
    })
  }

  return (
    <div className={styles.container}>
      <Background
        particleColors={['#ffffffff', '#ffffffff']}
        particleCount={1000}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={100}
        moveParticlesOnHover={true}
        alphaParticles={false}
        disableRotation={false}
      />

        {/* Signup Form  */}
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <div className={styles.logoBox}>
              <Zap size={40} />
            </div>
            <h1>Sign up</h1>
            <p>Create your account to get started</p>
          </div>

          <div className={styles.formContent}>
            <form onSubmit={handleSubmit(handleSignup)}>
              <div className={styles.inputGroup}>
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  {...register("username", 
                    { required: "Username is required" }
                  )}
                />
                {errors.username && <p>{errors.username.message}</p>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && <p>{errors.email.message}</p>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    validate: (value) => {
                      if (!/[A-Z]/.test(value)) return "Password must include an uppercase letter";
                      if (!/[a-z]/.test(value)) return "Password must include a lowercase letter";
                      if (!/[0-9]/.test(value)) return "Password must include a number";
                      if (!/[#?!@$%^&*_.]/.test(value)) return "Password must include a special character (#?!@$%^&*_. )";
                      if (value.length < 8) return "Password must be at least 8 characters";
                      return true; 
                    }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeButton}
                  >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              {errors.password && <p>{errors.password.message}</p>}
            </div>
           
           <p className={styles.errorMessage}>{error}</p>

            <button className={styles.signupButton}>
              Sign up
            </button>
          </form>


            <div className={styles.divider}>
              <div className={styles.dividerLine}>
                <div></div>
              </div>
              <div className={styles.dividerText}>
                <span>Or continue with</span>
              </div>
            </div>

            <div className={styles.socialButtons}>
              <button className={styles.socialButton}>
                <svg viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </button>
            </div>

            <div className={styles.footer}>
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>

        {/* Role Selector Modal*/}
        <Modal 
          open={open} 
          slotProps={{
          backdrop: {
          style: {
            backgroundColor: "rgba(0, 0, 0, 0.11)",  
            backdropFilter: "blur(12px)",          
          }
         }
        }}>
          <div className={styles.roleContainer}>
            <div className={styles.roleHeader}>
              <h2>Choose Your Role</h2>
              <p>Select whether you're joining as a teacher or student</p>
            </div>

            <div className={styles.roleCards}>
              {/* Teacher Card */}
              <div
                onClick={() => setSelectedRole('teacher')}
                className={`${styles.roleCard} ${selectedRole === 'teacher' ? styles.roleCardActive : ''}`}
              >
                {selectedRole === 'teacher' && (
                  <div className={styles.shimmer} />
                )}
                
                <div className={styles.roleCardContent}>
                  <div className={`${styles.roleIcon} ${styles.roleIconTeacher}`}>
                    <GraduationCap size={32} />
                  </div>
                  
                  <div className={styles.roleInfo}>
                    <h3>Teacher</h3>
                    <p>Create and manage classes</p>
                  </div>

                  {selectedRole === 'teacher' && (
                    <div className={`${styles.checkmark} ${styles.checkmarkTeacher}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Student Card */}
              <div
                onClick={() => setSelectedRole('student')}
                className={`${styles.roleCard} ${selectedRole === 'student' ? styles.roleCardActive : ''}`}
              >
                {selectedRole === 'student' && (
                  <div className={styles.shimmer} />
                )}
                
                <div className={styles.roleCardContent}>
                  <div className={`${styles.roleIcon} ${styles.roleIconStudent}`}>
                    <BookOpen size={32} />
                  </div>
                  
                  <div className={styles.roleInfo}>
                    <h3>Student</h3>
                    <p>Join and learn from classes</p>
                  </div>

                  {selectedRole === 'student' && (
                    <div className={`${styles.checkmark} ${styles.checkmarkStudent}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedRole && (
              <>
                <button className={styles.continueButton} onClick={() => setOpen(false)}>
                  Continue as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                </button>
                <p className={styles.selectedText}>
                  Selected role: <span>{selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
                </p>
              </>
            )}
          </div>
        </Modal>
      </div>
  );
}