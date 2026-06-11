import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="panel max-w-xl p-8 text-center"
        initial={{ opacity: 0, y: 18 }}
      >
        <p className="section-kicker">404</p>
        <h1 className="mt-3 text-4xl font-semibold text-text">La ruta solicitada no existe</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Regresa al dashboard para continuar trabajando en tus proyectos y tareas.
        </p>
        <Link className="btn-primary mt-6" to="/app/dashboard">
          Ir al dashboard
        </Link>
      </motion.div>
    </div>
  );
}
