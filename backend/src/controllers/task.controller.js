import * as taskService from "../services/task.service.js";

export const getTasks = async (req, res) => {
  const tasks = await taskService.getTasks(req.user.id, req.validated.query);
  res.json({ success: true, data: tasks });
};

export const createTask = async (req, res) => {
  const task = await taskService.createTask(req.user.id, req.validated.body);
  res.status(201).json({ success: true, data: task });
};

export const updateTask = async (req, res) => {
  const task = await taskService.updateTask(req.validated.params.taskId, req.user.id, req.validated.body);
  res.json({ success: true, data: task });
};

export const moveTask = async (req, res) => {
  const task = await taskService.moveTask(req.validated.params.taskId, req.user.id, req.validated.body);
  res.json({ success: true, data: task });
};

export const deleteTask = async (req, res) => {
  const result = await taskService.deleteTask(req.validated.params.taskId, req.user.id);
  res.json({ success: true, data: result });
};

export const createSubtask = async (req, res) => {
  const subtask = await taskService.createSubtask(req.validated.params.taskId, req.user.id, req.validated.body);
  res.status(201).json({ success: true, data: subtask });
};

export const updateSubtask = async (req, res) => {
  const subtask = await taskService.updateSubtask(req.validated.params.subtaskId, req.user.id, req.validated.body);
  res.json({ success: true, data: subtask });
};

export const deleteSubtask = async (req, res) => {
  const result = await taskService.deleteSubtask(req.validated.params.subtaskId, req.user.id);
  res.json({ success: true, data: result });
};
