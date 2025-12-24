import { useForm } from 'react-hook-form'
import styles from './passwordUpdate.module.css'
import { Axios } from '@config/axios'
import { useState } from 'react'
import { useContextState } from '../../../context/hooks'
import { useNavigate } from 'react-router-dom'



interface FormValues {
  oldPassword: string
  newPassword: string
}

export const PasswordUpdate = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>()
  const navigate = useNavigate()
  const { user } = useContextState()

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    if (data.oldPassword === data.newPassword) {
      setError('New password must be different from old password')
      setMessage(null)
      return;
    }
    Axios.patch('/user/password', data)
    .then(() => {
      setError(null)
      setMessage('Password updated successfully')
      reset()
    })
    .catch((err) => {
      console.log(err)
      setError('Failed to update password, try again later.')
      setMessage(null)
    })
  }

  const handlePasswordReset = () => {
    Axios.post('/auth/forgot-password', { email: user?.email })
    .then(() => {
      navigate('/reset-password', { state: { email: user?.email } })
    })
    .catch(() => {
      setError('Failed to initiate password reset, try again later.')
    })
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Change Password</h3>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="oldPassword" className={styles.label}>
            Current Password *
          </label>
          <input
            id="oldPassword"
            type="password"
            className={styles.input}
            disabled={isSubmitting}
            {...register('oldPassword', {
              required: 'All fields are required'
            })}
          />
          {errors.oldPassword && (
            <div className={styles.error}>{errors.oldPassword.message}</div>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="newPassword" className={styles.label}>
            New Password *
          </label>
          <input
            id="newPassword"
            type="password"
            className={styles.input}
            disabled={isSubmitting}
            {...register('newPassword', {
              required: 'All fields are required',
              minLength: {
                value: 8,
                message: 'New password must be at least 8 characters'
              }
            })}
          />
        {errors.newPassword && (
          <div className={styles.error}>{errors.newPassword.message}</div>
        )}
        </div>


        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
        
        <div className={styles.forgotPasswordContainer}><p onClick={handlePasswordReset}>Forgot password</p></div>
      </form>

      {message && <div className={styles.message}>{message}</div>}
      {error && <div className={styles.errMsg}>{error}</div>}
    </div>
  )
}
