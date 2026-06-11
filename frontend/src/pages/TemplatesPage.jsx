import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api-client";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { PageShell } from "../components/ui/PageShell";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useToast } from "../context/ToastContext";
import { useAsyncData } from "../hooks/useAsyncData";

export function TemplatesPage() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const { data, loading, error, refetch } = useAsyncData(() => apiGet("/templates"), []);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [applying, setApplying] = useState(false);
  const [form, setForm] = useState({
    projectTitle: "",
    description: "",
    dueDate: "",
  });

  const featuredTemplateId = useMemo(() => {
    const templates = data ?? [];
    return [...templates].sort((left, right) => right.templateTasks.length - left.templateTasks.length)[0]?.id ?? null;
  }, [data]);

  const applyTemplate = async (event) => {
    event.preventDefault();
    if (!selectedTemplate) return;

    try {
      setApplying(true);
      const createdProject = await apiPost(`/templates/${selectedTemplate.id}/apply`, {
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      });
      pushToast({
        title: "Plantilla aplicada",
        description: `Se creo "${createdProject.title}" con sus tareas iniciales.`,
        tone: "success",
      });
      setSelectedTemplate(null);
      navigate("/app/projects", {
        replace: false,
        state: {
          selectedProjectId: createdProject.id,
          source: "template",
        },
      });
    } catch (apiError) {
      pushToast({ title: "No se pudo aplicar la plantilla", description: apiError.message, tone: "error" });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-5">
        <SkeletonCard className="h-28" />
        <div className="grid gap-5 xl:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <SkeletonCard key={index} className="h-[360px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        action={
          <button className="btn-primary" onClick={() => refetch().catch(() => {})} type="button">
            Reintentar
          </button>
        }
        description={error.message}
        title="No se pudieron cargar las plantillas"
      />
    );
  }

  return (
    <PageShell
      actions={<span className="pill">Listas para usar</span>}
      description="Crea proyectos nuevos a partir de estructuras preparadas para ahorrar tiempo y comenzar con orden."
      kicker="Plantillas"
      title="Elige una plantilla"
    >
      {!data?.length ? (
        <EmptyState description="Todavia no hay plantillas disponibles." title="Sin plantillas registradas" />
      ) : (
        <div className="grid gap-5 xl:grid-cols-3">
          {data.map((template) => {
            const highPriorityCount = template.templateTasks.filter((task) => task.priority === "HIGH").length;
            const inProgressCount = template.templateTasks.filter((task) => task.status === "IN_PROGRESS").length;
            const isFeatured = featuredTemplateId === template.id;

            return (
              <article
                key={template.id}
                className={`panel relative overflow-hidden p-6 ${isFeatured ? "border-primary/40" : ""}`}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-70"
                  style={{
                    background: `linear-gradient(180deg, ${template.color}26 0%, rgba(15, 23, 42, 0) 100%)`,
                  }}
                />

                {isFeatured ? (
                  <div className="absolute right-5 top-5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                    Recomendada
                  </div>
                ) : null}

                <div className="relative flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: template.color }} />
                  <p className="section-kicker">Plantilla</p>
                </div>
                <h3 className="relative mt-3 text-2xl font-semibold text-text">{template.name}</h3>
                <p className="relative mt-3 text-sm leading-6 text-muted">{template.description}</p>

                <div className="relative mt-5 grid grid-cols-3 gap-3">
                  <StatTile label="Tareas base" value={template.templateTasks.length} />
                  <StatTile label="Alta prioridad" value={highPriorityCount} />
                  <StatTile label="En curso" value={inProgressCount} />
                </div>

                <div className="relative mt-6 space-y-3">
                  {template.templateTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="rounded-3xl border border-border bg-slate-900/65 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-text">{task.title}</p>
                        <StatusBadge value={task.priority} />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted">{task.description}</p>
                    </div>
                  ))}
                  {template.templateTasks.length > 3 ? (
                    <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted">
                      +{template.templateTasks.length - 3} tareas adicionales incluidas en la plantilla
                    </div>
                  ) : null}
                </div>

                <button
                  className="btn-primary relative mt-6 w-full"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setForm({
                      projectTitle: `${template.name} ${new Date().getFullYear()}`,
                      description: template.description,
                      dueDate: "",
                    });
                  }}
                  type="button"
                >
                  Aplicar plantilla
                </button>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        description="Se generara un proyecto nuevo con tareas base asociadas."
        onClose={() => setSelectedTemplate(null)}
        open={Boolean(selectedTemplate)}
        title={`Aplicar: ${selectedTemplate?.name ?? ""}`}
      >
        <form className="space-y-4" onSubmit={applyTemplate}>
          <label className="block">
            <span className="mb-2 block text-sm text-text">Nombre del proyecto</span>
            <input className="input" onChange={(e) => setForm((c) => ({ ...c, projectTitle: e.target.value }))} value={form.projectTitle} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-text">Descripcion</span>
            <textarea className="input min-h-28 resize-none" onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} value={form.description} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-text">Fecha limite del proyecto</span>
            <input className="input" onChange={(e) => setForm((c) => ({ ...c, dueDate: e.target.value }))} type="datetime-local" value={form.dueDate} />
          </label>

          <div className="rounded-3xl border border-border bg-slate-900/55 p-4">
            <div className="flex flex-wrap gap-2">
              <span className="pill">{selectedTemplate?.templateTasks.length ?? 0} tareas base</span>
              <span className="pill">{selectedTemplate?.templateTasks.filter((task) => task.priority === "HIGH").length ?? 0} alta prioridad</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setSelectedTemplate(null)} type="button">
              Cancelar
            </button>
            <button className="btn-primary" disabled={applying} type="submit">
              {applying ? "Creando proyecto..." : "Crear proyecto desde plantilla"}
            </button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-[24px] border border-border bg-gradient-to-br from-slate-900/75 to-slate-950/90 p-4 shadow-soft">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <strong className="mt-3 block text-2xl font-semibold text-text">{value}</strong>
    </div>
  );
}
