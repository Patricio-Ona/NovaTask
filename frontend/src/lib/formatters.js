const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

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
  const pad = (unit) => String(unit).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
