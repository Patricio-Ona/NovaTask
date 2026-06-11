import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { pushToast } = useToast();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const onChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (mode === "register" && form.name.trim().length < 3) {
      nextErrors.name = "El nombre debe tener al menos 3 caracteres.";
    }
    if (!form.email.includes("@")) {
      nextErrors.email = "Ingresa un correo valido.";
    }
    if (form.password.length < 8) {
      nextErrors.password = "La contrasena debe tener al menos 8 caracteres.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
        pushToast({ title: "Bienvenido", description: "Tu espacio ya esta listo.", tone: "success" });
        navigate("/app/dashboard", { replace: true });
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
        pushToast({ title: "Cuenta creada", description: "Ya puedes empezar a organizarte.", tone: "success" });
        navigate("/app/projects", { replace: true });
      }
    } catch (error) {
      pushToast({ title: "No se pudo continuar", description: error.message, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-[min(1440px,calc(100%-24px))] items-center py-6">
      <div className="grid w-full gap-5 xl:grid-cols-[1.04fr,0.96fr]">
        <motion.section
          animate={{ opacity: 1, x: 0 }}
          className="panel relative overflow-hidden border-primary/20 bg-primary-glow p-6 sm:p-8"
          initial={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.25 }}
        >
          <div className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-2xl font-semibold text-white">
              N
            </div>
            <div>
              <p className="section-kicker">NovaTask</p>
              <h1 className="mt-3 max-w-lg text-4xl font-semibold leading-tight text-text sm:text-5xl">
                Ordena tus tareas y avanza sin perder el ritmo.
              </h1>
            </div>
          </div>

          <p className="mt-8 max-w-2xl text-base leading-7 text-muted">
            Reune tus pendientes, organiza entregas y revisa tu progreso diario desde una interfaz simple, clara y
            pensada para mantener el enfoque.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Todo en un lugar", "Tus proyectos, tareas y fechas importantes conectados."],
              ["Flujo claro", "Mueve tareas por etapas y visualiza lo que sigue."],
              ["Mejor seguimiento", "Identifica prioridades y manten el ritmo cada semana."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-3xl border border-border bg-slate-900/65 p-5">
                <p className="text-sm font-semibold text-text">{title}</p>
                <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          animate={{ opacity: 1, x: 0 }}
          className="panel p-6 sm:p-8"
          initial={{ opacity: 0, x: 18 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-slate-900/60 p-1">
            {[
              ["login", "Iniciar sesion"],
              ["register", "Crear cuenta"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  mode === value ? "bg-primary text-white" : "text-muted hover:text-text"
                }`}
                onClick={() => setMode(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <p className="section-kicker">{mode === "login" ? "Accede a tu cuenta" : "Crea tu cuenta"}</p>
            <h2 className="mt-3 text-3xl font-semibold text-text">
              {mode === "login" ? "Bienvenido de nuevo" : "Comienza a organizarte"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {mode === "login"
                ? "Ingresa con tu correo y contrasena."
                : "Completa tus datos para entrar a tu espacio personal."}
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            {mode === "register" ? (
              <Field label="Nombre completo" error={errors.name}>
                <input autoComplete="name" className="input" onChange={onChange("name")} value={form.name} />
              </Field>
            ) : null}

            <Field label="Correo electronico" error={errors.email}>
              <input
                autoComplete="email"
                className="input"
                onChange={onChange("email")}
                type="email"
                value={form.email}
              />
            </Field>

            <Field label="Contrasena" error={errors.password}>
              <div className="flex gap-3">
                <input
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="input"
                  onChange={onChange("password")}
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                />
                <button className="btn-secondary shrink-0" onClick={() => setShowPassword((current) => !current)} type="button">
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </Field>

            <button className="btn-primary w-full" disabled={loading} type="submit">
              {loading ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>

        </motion.section>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-xs text-danger">{error}</span> : null}
    </label>
  );
}
