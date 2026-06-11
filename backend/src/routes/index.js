import { Router } from "express";
import authRoutes from "./auth.routes.js";
import projectRoutes from "./project.routes.js";
import taskRoutes from "./task.routes.js";
import tagRoutes from "./tag.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import calendarRoutes from "./calendar.routes.js";
import templateRoutes from "./template.routes.js";
import academicRoutes from "./academic.routes.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API de NovaTask activa",
  });
});

router.use("/auth", authRoutes);
router.use("/projects", requireAuth, projectRoutes);
router.use("/tasks", requireAuth, taskRoutes);
router.use("/tags", requireAuth, tagRoutes);
router.use("/dashboard", requireAuth, dashboardRoutes);
router.use("/analytics", requireAuth, analyticsRoutes);
router.use("/calendar", requireAuth, calendarRoutes);
router.use("/templates", requireAuth, templateRoutes);
router.use("/academics", requireAuth, academicRoutes);

export default router;
