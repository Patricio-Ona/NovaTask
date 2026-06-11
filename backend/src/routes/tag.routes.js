import { Router } from "express";
import * as tagController from "../controllers/tag.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createTagSchema } from "../validators/tag.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(tagController.getTags));
router.post("/", validate(createTagSchema), asyncHandler(tagController.createTag));

export default router;
