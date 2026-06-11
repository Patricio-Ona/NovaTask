import { ProjectsPage } from "./ProjectsPage";

export function ListPage() {
  return (
    <ProjectsPage
      forcedView="list"
      shellDescription="Consulta todas las tareas del proyecto activo con mas detalle, filtros y acceso rapido a su informacion clave."
      shellKicker="Vista detallada"
      shellTitle="Lista de tareas"
    />
  );
}
