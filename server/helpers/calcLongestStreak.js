import { QuizAttempt } from "../models/index.js";

export const calculateLongestStreak = async (userId) => {
  // Get all attempts by this specific user
  console.log("start")
  const quizAttempts = await QuizAttempt.find({ userId });
  if (!quizAttempts || quizAttempts.length === 0) return 0;

  // Extract unique dates (one per day)
  const uniqueDates = [...new Set(
    quizAttempts.map(a => new Date(a.createdAt).toDateString())
  )];

  // Sort from oldest to newest
  uniqueDates.sort((a, b) => new Date(a) - new Date(b));

  // Count consecutive day streaks
  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);

    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  console.log(longestStreak)
  return longestStreak;
}
