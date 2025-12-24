
export const calculateLongestStreak = (dates) => {
  if (!dates.length) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const diff =
      (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
};


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
