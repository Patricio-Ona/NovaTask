import { Router } from "express";
import * as calendarController from "../controllers/calendar.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(calendarController.getCalendar));

export default router;
