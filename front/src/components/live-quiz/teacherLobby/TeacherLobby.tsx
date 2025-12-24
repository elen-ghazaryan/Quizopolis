// src/components/TeacherLobby.tsx
import { useState } from 'react';
import styles from './teacherLobby.module.css';
import { ParticipantList } from '../participant/ParticipantList';
import type { SessionInfo, Participant } from '@app-types/live-quiz-types';
import { FileText, Target, Users } from 'lucide-react';

interface TeacherLobbyProps {
  sessionInfo: SessionInfo;
  participants: Participant[];
  onStartQuiz: () => void;
  isConnected: boolean;
}

export const TeacherLobby = ({
  sessionInfo, 
  participants,
  onStartQuiz,
  isConnected,
}: TeacherLobbyProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sessionInfo.accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{sessionInfo.title}</h1>
        <div className={styles.statusBadge}>
          <span className={`${styles.dot} ${isConnected ? styles.connected : styles.disconnected}`} />
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.accessCodeSection}>
          <h2 className={styles.sectionTitle}>Access Code</h2>
          <div className={styles.codeDisplay}>
            <span className={styles.code}>{sessionInfo.accessCode}</span>
            <button 
              className={styles.copyBtn} 
              onClick={handleCopyCode}
              disabled={copied}
            >
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>
          <p className={styles.instruction}>
            Share this code with students to join the quiz
          </p>
        </div>

        <div className={styles.infoCards}>
          <div className={styles.infoCard}>
            <FileText className={styles.cardIcon} size={35} />
            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>Total Questions</span>
              <span className={styles.cardValue}>{sessionInfo.totalQuestions}</span>
            </div>
          </div>
          <div className={styles.infoCard}>
            <Users size={35} className={styles.cardIcon} />
            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>Joined Students</span>
              <span className={styles.cardValue}>{participants.length}</span>
            </div>
          </div>
        </div>

        <ParticipantList 
          participants={participants} 
          title="Waiting for Students"
        />

        <div className={styles.actions}>
          <button
            className={styles.startBtn}
            onClick={onStartQuiz}
            disabled={!isConnected || participants.length === 0}
          >
            🎯 Start Quiz
          </button>
          {participants.length === 0 && (
            <p className={styles.hint}>
              Waiting for at least one student to join...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};