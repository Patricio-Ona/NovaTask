import { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { useAuth } from "./context/AuthContext";
import { ToastViewport } from "./components/ui/ToastViewport";

const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage").then((module) => ({ default: module.AnalyticsPage })));
const CalendarPage = lazy(() => import("./pages/CalendarPage").then((module) => ({ default: module.CalendarPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const ListPage = lazy(() => import("./pages/ListPage").then((module) => ({ default: module.ListPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((module) => ({ default: module.ProfilePage })));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage").then((module) => ({ default: module.ProjectsPage })));
const TemplatesPage = lazy(() => import("./pages/TemplatesPage").then((module) => ({ default: module.TemplatesPage })));

function ProtectedApp() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <FullScreenLoader message="Verificando sesion..." />;
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return <AppLayout />;
}

export default function App() {
  const location = useLocation();

  return (
    <>
      <Suspense fallback={<FullScreenLoader message="Cargando NovaTask..." />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/app" element={<ProtectedApp />}>
              <Route index element={<Navigate replace to="dashboard" />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="list" element={<ListPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="/" element={<Navigate replace to="/login" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      <ToastViewport />
    </>
  );
}

function FullScreenLoader({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="panel w-full max-w-md p-8 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
        <p className="mt-6 text-sm text-muted">{message}</p>
      </div>
    </div>
  );
}
