const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const pad = (unit) => String(unit).padStart(2, "0");

export const formatDate = (value, options = {}) => {
  if (!value) return "Sin fecha";

  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = monthNames[date.getMonth()];
  const year = options.withYear ? ` ${date.getFullYear()}` : "";

  if (!options.withTime) {
    return `${day} ${month}${year}`;
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${month}${year} - ${hours}:${minutes}`;
};

export const toInputDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const getCurrentInputDateTime = (value = new Date()) =>
  `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;

export const isPastInputDateTime = (value, reference = new Date()) => {
  if (!value) return false;
  const parsedDate = new Date(value);
  return !Number.isNaN(parsedDate.getTime()) && parsedDate.getTime() < reference.getTime();
};
