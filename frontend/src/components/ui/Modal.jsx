import { AnimatePresence, motion } from "framer-motion";

export function Modal({ open, title, description, onClose, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="modal-overlay"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="panel flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden p-5 sm:p-6"
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          onClick={(event) => event.stopPropagation()}
          transition={{ duration: 0.22 }}
        >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">NovaTask</p>
                <h3 className="mt-2 text-2xl font-semibold text-text">{title}</h3>
                {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
              </div>
              <button className="btn-ghost" onClick={onClose} type="button">
                Cerrar
              </button>
            </div>
            <div className="mt-6 overflow-y-auto pr-1">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
