export const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const startOfWeek = (date = new Date()) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};
