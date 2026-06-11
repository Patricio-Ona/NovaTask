import { Router } from "express";
import * as projectController from "../controllers/project.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createProjectSchema, projectIdSchema, updateProjectSchema } from "../validators/project.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(projectController.getProjects));
router.get("/:projectId", validate(projectIdSchema), asyncHandler(projectController.getProjectById));
router.post("/", validate(createProjectSchema), asyncHandler(projectController.createProject));
router.patch("/:projectId", validate(updateProjectSchema), asyncHandler(projectController.updateProject));
router.delete("/:projectId", validate(projectIdSchema), asyncHandler(projectController.deleteProject));

export default router;
