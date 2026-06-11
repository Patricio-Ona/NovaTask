import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "../../context/ToastContext";

const toneStyles = {
  info: "border-primary/40 bg-slate-900 text-text",
  success: "border-success/40 bg-slate-900 text-text",
  error: "border-danger/40 bg-slate-900 text-text",
};

export function ToastViewport() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="pointer-events-none fixed left-4 right-4 top-4 z-50 flex w-auto max-w-none flex-col gap-3 sm:left-auto sm:w-full sm:max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            animate={{ opacity: 1, y: 0 }}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-card ${toneStyles[toast.tone]}`}
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{toast.title}</p>
                {toast.description ? <p className="mt-1 text-sm text-muted">{toast.description}</p> : null}
              </div>
              <button className="btn-ghost !p-0 text-xs" onClick={() => removeToast(toast.id)} type="button">
                Cerrar
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
