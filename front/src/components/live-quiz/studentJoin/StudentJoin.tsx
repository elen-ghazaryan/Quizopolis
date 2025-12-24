import { useState } from 'react';
import styles from './studentJoin.module.css';

interface StudentJoinProps {
  onJoin: (accessCode: string) => Promise<void>;
  error?: string;
}

export const StudentJoin = ({ onJoin, error }: StudentJoinProps) => {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accessCode.trim().length !== 6) {
      return;
    }

    setLoading(true);
    try {
      await onJoin(accessCode.trim());
    } catch (err) {
      console.error('Failed to join:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setAccessCode(value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>🎯</span>
        </div>
        
        <h1 className={styles.title}>Join Live Quiz</h1>
        <p className={styles.subtitle}>
          Enter the 6-digit access code provided by your teacher
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={accessCode}
              onChange={handleInputChange}
              placeholder="000000"
              className={styles.input}
              maxLength={6}
              autoFocus
              disabled={loading}
            />
            <div className={styles.inputUnderline} />
          </div>

          {error && (
            <div className={styles.error}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.joinBtn}
            disabled={accessCode.length !== 6 || loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Joining...
              </>
            ) : (
              'Join Quiz'
            )}
          </button>
        </form>

        <div className={styles.tips}>
          <h3 className={styles.tipsTitle}>Tips:</h3>
          <ul className={styles.tipsList}>
            <li>Make sure you have a stable internet connection</li>
            <li>The code is case-sensitive and contains only numbers</li>
            <li>You cannot join after the quiz has started</li>
          </ul>
        </div>
      </div>
    </div>
  );
};