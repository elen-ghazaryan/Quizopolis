import { QuizAttempt } from "../models/index.js";

export const calculateLongestStreak = async (userId) => {
  // Get all attempts by this specific user
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

  return longestStreak;
}

// Convert a date to Armenia timezone
export const toArmeniaDate = (date) => {
  const d = new Date(date);
  const utcTime = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utcTime + 4 * 60 * 60 * 1000); // UTC+4
};

export const getMonday = (date) => {
  const d = toArmeniaDate(date);
  const day = d.getDay(); 
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getSunday = (monday) => {
  const s = new Date(monday);
  s.setDate(monday.getDate() + 6);
  s.setHours(23, 59, 59, 999);
  return s;
};
