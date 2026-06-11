const styles = {
  TODO: "border border-border bg-surface/75 text-muted shadow-card",
  IN_PROGRESS: "border border-primary/20 bg-primary/12 text-primary",
  REVIEW: "border border-secondary/20 bg-secondary/12 text-secondary",
  DONE: "border border-success/20 bg-success/12 text-success",
  HIGH: "border border-danger/20 bg-danger/12 text-danger",
  MEDIUM: "border border-warning/20 bg-warning/12 text-warning",
  LOW: "border border-border bg-surface/75 text-muted shadow-card",
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
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${styles[value] ?? styles.TODO}`}
    >
      {labels[value] ?? String(value).replaceAll("_", " ")}
    </span>
  );
}
