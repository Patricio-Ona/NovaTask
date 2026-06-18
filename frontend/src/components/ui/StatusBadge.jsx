const styles = {
  TODO: "border border-border bg-surface/75 text-muted shadow-card",
  IN_PROGRESS: "border border-primary/20 bg-primary/12 text-primary",
  REVIEW: "border border-secondary/20 bg-secondary/12 text-secondary",
  DONE: "border border-success/20 bg-success/12 text-success",
  HIGH: "border border-danger/20 bg-danger/12 text-danger",
  MEDIUM: "border border-warning/20 bg-warning/12 text-warning",
  LOW: "border border-border bg-surface/75 text-muted shadow-card",
};

export const TASK_VALUE_LABELS = {
  TODO: "Pendiente",
  IN_PROGRESS: "En curso",
  REVIEW: "Revision",
  DONE: "Hecha",
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
  ALL: "Todos",
};

export const getTaskValueLabel = (value) => TASK_VALUE_LABELS[value] ?? String(value).replaceAll("_", " ");

export function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.12em] sm:px-3 sm:text-[11px] sm:tracking-[0.14em] ${
        styles[value] ?? styles.TODO
      }`}
    >
      {getTaskValueLabel(value)}
    </span>
  );
}
