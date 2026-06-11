import { Router } from "express";
import * as taskController from "../controllers/task.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createSubtaskSchema,
  createTaskSchema,
  listTasksSchema,
  moveTaskSchema,
  taskIdSchema,
  updateSubtaskSchema,
  updateTaskSchema,
} from "../validators/task.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", validate(listTasksSchema), asyncHandler(taskController.getTasks));
router.post("/", validate(createTaskSchema), asyncHandler(taskController.createTask));
router.patch("/:taskId", validate(updateTaskSchema), asyncHandler(taskController.updateTask));
router.patch("/:taskId/move", validate(moveTaskSchema), asyncHandler(taskController.moveTask));
router.delete("/:taskId", validate(taskIdSchema), asyncHandler(taskController.deleteTask));
router.post("/:taskId/subtasks", validate(createSubtaskSchema), asyncHandler(taskController.createSubtask));
router.patch("/subtasks/:subtaskId", validate(updateSubtaskSchema), asyncHandler(taskController.updateSubtask));
router.delete("/subtasks/:subtaskId", validate(updateSubtaskSchema), asyncHandler(taskController.deleteSubtask));

export default router;
