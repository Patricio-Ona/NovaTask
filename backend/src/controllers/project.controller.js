import * as projectService from "../services/project.service.js";

export const getProjects = async (req, res) => {
  const projects = await projectService.getProjects(req.user.id);
  res.json({ success: true, data: projects });
};

export const getProjectById = async (req, res) => {
  const project = await projectService.getProjectById(req.validated.params.projectId, req.user.id);
  res.json({ success: true, data: project });
};

export const createProject = async (req, res) => {
  const project = await projectService.createProject(req.user.id, req.validated.body);
  res.status(201).json({ success: true, data: project });
};

export const updateProject = async (req, res) => {
  const project = await projectService.updateProject(req.validated.params.projectId, req.user.id, req.validated.body);
  res.json({ success: true, data: project });
};

export const deleteProject = async (req, res) => {
  const result = await projectService.deleteProject(req.validated.params.projectId, req.user.id);
  res.json({ success: true, data: result });
};
