const styles = {
  TODO: "bg-slate-800 text-muted",
  IN_PROGRESS: "bg-primary/15 text-primary",
  REVIEW: "bg-secondary/15 text-secondary",
  DONE: "bg-success/15 text-success",
  HIGH: "bg-danger/15 text-danger",
  MEDIUM: "bg-warning/15 text-warning",
  LOW: "bg-slate-800 text-muted",
};

const labels = {
  TODO: "Pendiente",
  IN_PROGRESS: "En progreso",
  REVIEW: "Revision",
  DONE: "Completada",
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
};

export function StatusBadge({ value }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${styles[value] ?? styles.TODO}`}>
      {labels[value] ?? String(value).replaceAll("_", " ")}
    </span>
  );
}
