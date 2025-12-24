// src/components/StudentLobby.tsx
import styles from './studentLobby.module.css';
import { ParticipantList } from '../participant/ParticipantList';
import type { SessionInfo, Participant } from '@app-types/live-quiz-types';
import { Clock, FileText, Lightbulb, Users } from 'lucide-react';

interface StudentLobbyProps {
  sessionInfo: SessionInfo;
  participants: Participant[];
  isConnected: boolean;
}

export const StudentLobby = ({
  sessionInfo,
  participants,
  isConnected,
}: StudentLobbyProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Clock className={styles.icon} />
          </div>
          <h1 className={styles.title}>{sessionInfo.title}</h1>
          <p className={styles.subtitle}>Waiting for teacher to start the quiz...</p>
          
          <div className={styles.statusBadge}>
            <span className={`${styles.dot} ${isConnected ? styles.connected : styles.disconnected}`} />
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
        </div>

        <div className={styles.infoCards}>
          <div className={styles.infoCard}>
            <FileText className={styles.cardIcon} />
            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>Total Questions</span>
              <span className={styles.cardValue}>{sessionInfo.totalQuestions}</span>
            </div>
          </div>
          <div className={styles.infoCard}>
            <Users className={styles.cardIcon} />
            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>Students Joined</span>
              <span className={styles.cardValue}>{participants.length}</span>
            </div>
          </div>
        </div>

        <ParticipantList 
          participants={participants} 
          title="Other Participants"
        />

        <div className={styles.loadingSection}>
          <div className={styles.loadingDots}>
            <span className={styles.loadingDot}></span>
            <span className={styles.loadingDot}></span>
            <span className={styles.loadingDot}></span>
          </div>
          <p className={styles.loadingText}>
            Get ready! The quiz will begin shortly...
          </p>
        </div>

        <div className={styles.tips}>
          <Lightbulb className={styles.tipsTitle} /> 
          <h3> Quick Tips</h3>
          <ul className={styles.tipsList}>
            <li>Stay focused and read each question carefully</li>
            <li>Answer as quickly as you can for bonus points</li>
            <li>Don't refresh the page during the quiz</li>
          </ul>
        </div>
      </div>
    </div>
  );
};