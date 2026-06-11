import { Router } from "express";
import * as templateController from "../controllers/template.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { applyTemplateSchema } from "../validators/template.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(templateController.getTemplates));
router.post("/:templateId/apply", validate(applyTemplateSchema), asyncHandler(templateController.applyTemplate));

export default router;
