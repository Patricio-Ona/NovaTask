export const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const isFutureOrPresentDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() >= Date.now();
};

export const startOfWeek = (date = new Date()) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};
