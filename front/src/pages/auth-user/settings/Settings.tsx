import { useForm } from 'react-hook-form'
import { PasswordUpdate } from '../passwordUpdate/PasswordUpdate'
import styles from './settings.module.css'
import { useContextDispatch, useContextState } from '../../../context/hooks'
import { useEffect, useState } from 'react'
import { Axios } from '@config/axios'
import type { IUser } from 'context/types'

interface ProfileFormData {
  username: string
  bio: string
  role: string
}

export const Settings = () => {
  const { user } = useContextState()
  const dispatch = useContextDispatch()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null) 

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      username: user?.username || '',
      bio: user?.bio || '',
      role: user?.role || '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        username: user.username ?? '',
        bio: user.bio ?? '',
        role: user.role ?? 'student',
      })
    }
    setError(null)
    setMessage(null)
  }, [user, reset])

  const onSubmit = async (data: ProfileFormData) => {
    Axios.put<{payload: {user: IUser}}>('/user/profile', data)
    .then(resp => {
      setError(null)
      setMessage('Profile updated successfully.')
      if (resp.data.payload.user) {
        dispatch({ type: 'SET_USER', payload: resp.data.payload.user })
      }
    })
    .catch(() => {
      setMessage(null)
      setError('An error occurred while updating profile. Please try again later.')
    })

  }


  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>Settings</h2>

      <div className={styles.sections}>
        {/* Profile Information Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Profile Information</h3>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="username" className={styles.label}>
                Username *
              </label>
              <input
                id="username"
                type="text"
                className={styles.input}
                disabled={isSubmitting}
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters',
                  },
                })}
              />
              {errors.username && (
                <span className={styles.errorText}>{errors.username.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="role" className={styles.label}>
                Role *
              </label>
              <select
                id="role"
                className={styles.input}
                disabled={isSubmitting}
                {...register('role', {
                  required: 'Role is required',
                })}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
              {errors.role && (
                <span className={styles.errorText}>{errors.role.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="bio" className={styles.label}>
                Bio
              </label>
              <textarea
                id="bio"
                className={styles.textarea}
                disabled={isSubmitting}
                rows={4}
                placeholder="Tell us about yourself..."
                {...register('bio', {
                  maxLength: {
                    value: 500,
                    message: 'Bio must be less than 500 characters',
                  },
                })}
              />
              {errors.bio && (
                <span className={styles.errorText}>{errors.bio.message}</span>
              )}
            </div>

            {errors.root && <div className={styles.error}>{errors.root.message}</div>}

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.button} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                Reset
              </button>
            </div>

            {message && <div className={styles.message}>{message}</div>}
            {error && <div className={styles.errMsg}>{error}</div>}
          </form>
        </div>

        {/* Password Update Section */}
        <div className={styles.section}>
          <PasswordUpdate />
        </div>
      </div>
    </div>
  )
}