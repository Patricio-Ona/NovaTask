import { Router } from "express";
import * as academicController from "../controllers/academic.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createEventSchema,
  createSubjectSchema,
  createTermSchema,
  eventIdSchema,
  subjectIdSchema,
  termIdSchema,
  updateEventSchema,
  updateSubjectSchema,
  updateTermSchema,
} from "../validators/academic.validator.js";

const router = Router();

router.get("/overview", asyncHandler(academicController.getAcademicOverview));

router.post("/terms", validate(createTermSchema), asyncHandler(academicController.createTerm));
router.patch("/terms/:termId", validate(updateTermSchema), asyncHandler(academicController.updateTerm));
router.delete("/terms/:termId", validate(termIdSchema), asyncHandler(academicController.deleteTerm));

router.post("/subjects", validate(createSubjectSchema), asyncHandler(academicController.createSubject));
router.patch("/subjects/:subjectId", validate(updateSubjectSchema), asyncHandler(academicController.updateSubject));
router.delete("/subjects/:subjectId", validate(subjectIdSchema), asyncHandler(academicController.deleteSubject));

router.post("/events", validate(createEventSchema), asyncHandler(academicController.createEvent));
router.patch("/events/:eventId", validate(updateEventSchema), asyncHandler(academicController.updateEvent));
router.delete("/events/:eventId", validate(eventIdSchema), asyncHandler(academicController.deleteEvent));

export default router;
