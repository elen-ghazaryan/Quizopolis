import styles from './participantList.module.css';
import type { Participant } from '@app-types/live-quiz-types';

interface ParticipantListProps {
  participants: Participant[];
  title?: string;
}

export const ParticipantList = ({ participants, title = 'Participants' }: ParticipantListProps) => {
  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {title} ({participants.length})
      </h3>
      <div className={styles.list}>
        {participants.length === 0 ? (
          <p className={styles.empty}>No participants yet</p>
        ) : (
          participants.map((participant) => (
            <div key={participant._id} className={styles.participant}>
              <img
                src={
                  participant.avatar
                    ? `${API_URL}/uploads/${participant.avatar}`
                    : '/default_avatar.png'
                }
                alt={participant.username}
                className={styles.avatar}
              />
              <span className={styles.username}>{participant.username}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};