import React, { useState } from 'react';
import { MessageCircle, Send, Trash2, User, Clock } from 'lucide-react';
import styles from './quizComments.module.css';
import type { QuizComment } from 'app-types/quiz-types';
import { useContextState } from '../../../context/hooks';
import { Axios } from '@config/axios';


interface CommentsProps {
  quizId: string;
  initialComments: QuizComment[];
}


export const QuizComments: React.FC<CommentsProps> = ({ quizId, initialComments }) => {
  const { user } = useContextState()
  const [comments, setComments] = useState<QuizComment[]>(initialComments);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmitComment = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    Axios.post(`/quiz/${quizId}/comments`, {text: newComment})
    .then(resp => {
      console.log(resp.data)
      setComments([...comments, resp.data.payload.comment])
      setNewComment("")
    })
    .catch(err => {
      console.error(err)

    })
    .finally(() => setIsSubmitting(false))
  };

  const handleDeleteComment = async (commentId: string): Promise<void> => {
    Axios.delete(`/quiz/${quizId}/comments/${commentId}`)
    .then((resp) => {
      setComments(prev => prev.filter(comment => comment._id !== resp.data.payload.id))
    })
    .catch((err) => {
      console.error(err)
    })
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  return (
    <div className={styles.commentsContainer}>
      <div className={styles.commentsHeader}>
        <MessageCircle size={28} />
        <h2 className={styles.commentsTitle}>
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className={styles.commentForm}>
        <div className={styles.formHeader}>
          <div className={styles.userAvatar}>
            <User size={20} />
          </div>
          <span className={styles.currentUsername}>{user?.username}</span>
        </div>
        
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts about this quiz..."
          className={styles.commentInput}
          rows={4}
          disabled={isSubmitting}
        />
        
        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={isSubmitting || !newComment.trim()}
        >
          <Send size={20} />
          <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
        </button>
      </form>

      {/* Comments List */}
      <div className={styles.commentsList}>
        {comments.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageCircle size={64} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No comments yet</p>
            <p className={styles.emptyText}>Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className={styles.commentCard}>
              <div className={styles.commentHeader}>
                <div className={styles.commentUser}>
                  {comment.userId?.avatar ? (
                    <img 
                      src={`${API_URL}/uploads/${comment.userId.avatar}` || "default_avatar.png"} 
                      alt={comment.userId.username}
                      className={styles.commentAvatar}
                    />
                  ) : (
                    <div className={styles.commentAvatarPlaceholder}>
                      <User size={20} />
                    </div>
                  )}
                  <div className={styles.commentUserInfo}>
                    <span className={styles.commentUsername}>
                      {comment.userId.username || 'Unknown User'}
                    </span>
                    <div className={styles.commentTime}>
                      <Clock size={14} />
                      <span>{formatDate(comment.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                {comment.userId?._id === user?.id && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className={styles.deleteBtn}
                    title="Delete comment"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <p className={styles.commentText}>{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
