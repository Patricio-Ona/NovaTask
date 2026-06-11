import { motion } from "framer-motion";

export function PageShell({ title, kicker, description, actions, children }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 overflow-x-hidden sm:space-y-6"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
    >
      {title || kicker || description || actions ? (
        <div className="flex flex-col gap-3 px-1 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            {kicker ? <p className="section-kicker">{kicker}</p> : null}
            {title ? <h1 className="mt-2 text-2xl font-semibold leading-tight text-text sm:text-3xl">{title}</h1> : null}
            {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:justify-end">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </motion.div>
  );
}
