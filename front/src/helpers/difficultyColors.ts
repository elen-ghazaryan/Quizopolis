  export const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy':
        return 'difficultyEasy';
      case 'medium':
        return 'difficultyMedium';
      case 'hard':
        return 'difficultyHard';
      default:
        return 'difficultyEasy';
    }
  };