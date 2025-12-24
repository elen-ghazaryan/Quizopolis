import { useNavigate } from 'react-router-dom';
import { Star, Trophy, Crown, Medal, ArrowLeft, Users, FileText } from 'lucide-react';
import styles from './leaderboard.module.css';
import type { LeaderboardEntry } from '@app-types/live-quiz-types';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  totalQuestions: number;
  quizTitle: string;
  onClose?: () => void;
}

const PodiumCard = ({ 
  entry, 
  position, 
  apiUrl 
}: { 
  entry: LeaderboardEntry; 
  position: 1 | 2 | 3; 
  apiUrl: string;
}) => {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const positionClasses = {
    1: styles.first,
    2: styles.second,
    3: styles.third
  };

  return (
    <div className={`${styles.podiumCard} ${positionClasses[position]}`}>
      {position === 1 && (
        <div className={styles.crown}>
          <Crown size={36} className={styles.crownIcon} />
        </div>
      )}
      <div className={styles.podiumRank}>{medals[position]}</div>
      <div className={styles.avatarWrapper}>
        <img
          src={entry.avatar ? `${apiUrl}/uploads/${entry.avatar}` : '/default_avatar.png'}
          alt={entry.username}
          className={styles.podiumAvatar}
        />
        <div className={styles.avatarGlow}></div>
      </div>
      <h3 className={styles.podiumName}>{entry.username}</h3>
      <div className={styles.scoreContainer}>
        <div className={styles.podiumScore}>
          <Trophy size={20} className={styles.trophyIcon} />
          {entry.score}
        </div>
        <div className={styles.podiumPercentage}>{entry.percentage}% accuracy</div>
      </div>
    </div>
  );
};

const LeaderboardListItem = ({ 
  entry, 
  index, 
  apiUrl 
}: { 
  entry: LeaderboardEntry; 
  index: number; 
  apiUrl: string;
}) => {
  const rank = index + 1;
  
  const getRankIcon = (rank: number) => {
    const medals: { [key: number]: string } = { 1: '🥇', 2: '🥈', 3: '🥉' };
    return medals[rank] || rank;
  };

  const getRankClass = (rank: number) => {
    const classes: { [key: number]: string } = {
      1: styles.gold,
      2: styles.silver,
      3: styles.bronze
    };
    return classes[rank] || '';
  };

  return (
    <div className={`${styles.listItem} ${getRankClass(rank)}`}>
      <div className={styles.listRank}>
        {rank <= 3 ? (
          <span className={styles.medalIcon}>{getRankIcon(rank)}</span>
        ) : (
          <span className={styles.rankNumber}>#{rank}</span>
        )}
      </div>
      <div className={styles.listAvatarWrapper}>
        <img
          src={entry.avatar ? `${apiUrl}/uploads/${entry.avatar}` : '/default_avatar.png'}
          alt={entry.username}
          className={styles.listAvatar}
        />
      </div>
      <div className={styles.listInfo}>
        <span className={styles.listName}>{entry.username}</span>
        <span className={styles.listPercentage}>
          <Medal size={14} className={styles.percentageIcon} />
          {entry.percentage}% correct
        </span>
      </div>
      <div className={styles.listScoreContainer}>
        <div className={styles.listScore}>{entry.score}</div>
        <div className={styles.listScoreLabel}>points</div>
      </div>
    </div>
  );
};

export const Leaderboard = ({
  leaderboard,
  totalQuestions,
  quizTitle,
  onClose,
}: LeaderboardProps) => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/layout/quizzes');
    }
  };

  // Sort and get top 3 for podium
  const topThree = leaderboard.slice(0, 3);
  const remainingParticipants = leaderboard.slice(3);

  return (
    <div className={styles.container}>
      <div className={styles.backgroundEffects}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gradientOrb3}></div>
      </div>

      <div className={styles.content}>
        {/* Header Section */}
        <header className={styles.header}>
          <div className={styles.celebration}>
            <Star className={styles.celebrationStar} size={48} />
          </div>
          <h1 className={styles.title}>Quiz Complete!</h1>
          <p className={styles.subtitle}>{quizTitle}</p>
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <FileText className={styles.statIcon} size={30} />
              <div className={styles.statValue}>{totalQuestions}</div>
              <div className={styles.statLabel}>Questions</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <Users size={24} className={styles.statIcon} />
              <div className={styles.statValue}>{leaderboard.length}</div>
              <div className={styles.statLabel}>Participants</div>
            </div>
          </div>
        </header>

        {/* Podium Section */}
        {topThree.length > 0 && (
          <section className={styles.podiumSection}>
            <div className={styles.podium}>
              {topThree.length >= 2 && (
                <PodiumCard entry={topThree[1]} position={2} apiUrl={API_URL} />
              )}
              {topThree.length >= 1 && (
                <PodiumCard entry={topThree[0]} position={1} apiUrl={API_URL} />
              )}
              {topThree.length >= 3 && (
                <PodiumCard entry={topThree[2]} position={3} apiUrl={API_URL} />
              )}
            </div>
          </section>
        )}

        {/* Full Rankings List */}
        {remainingParticipants.length > 0 && (
          <section className={styles.fullList}>
            <div className={styles.listHeader}>
              <Trophy size={24} className={styles.listHeaderIcon} />
              <h2 className={styles.listTitle}>Full Rankings</h2>
            </div>
            <div className={styles.list}>
              {leaderboard.map((entry, index) => (
                <LeaderboardListItem 
                  key={entry.userId} 
                  entry={entry} 
                  index={index} 
                  apiUrl={API_URL}
                />
              ))}
            </div>
          </section>
        )}

        {/* Action Button */}
        <footer className={styles.footer}>
          <button className={styles.closeBtn} onClick={handleClose}>
            <ArrowLeft size={20} className={styles.btnIcon} />
            <span>Return to Quizzes</span>
          </button>
        </footer>
      </div>
    </div>
  );
};