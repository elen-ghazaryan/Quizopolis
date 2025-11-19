import { useState } from 'react';
import { Eye, EyeOff, Zap } from 'lucide-react';
import styles from './login.module.css';
import Background from "../../../UI/Background"
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { IErrorResponse, LoginUser } from '../../../types';
import { useNavigate } from 'react-router-dom';
import { Axios } from '../../../config/axios';
import axios from 'axios';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginUser>()
  
  const handleSignup:SubmitHandler<LoginUser> = (data) => {
    Axios
    .post("/auth/login", data)
    .then(() => {
      navigate("/layout")
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

        <div className={styles.formContainer}>
          <div className={styles.header}>
            <div className={styles.logoBox}>
              <Zap size={40} />
            </div>
            <h1>Sign in</h1>
          </div>

          <div className={styles.formContent}>
            <form onSubmit={handleSubmit(handleSignup)}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Username</label>
              <input
                {...register("username", { 
                  required: "Username is required",
                })}
              />
              {errors.username && <p>{errors.username.message}</p>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
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

            <button className={styles.loginButton}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}