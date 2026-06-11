import * as templateService from "../services/template.service.js";

export const getTemplates = async (_req, res) => {
  const templates = await templateService.getTemplates();
  res.json({ success: true, data: templates });
};

export const applyTemplate = async (req, res) => {
  const project = await templateService.applyTemplate(
    req.user.id,
    req.validated.params.templateId,
    req.validated.body
  );

  res.status(201).json({ success: true, data: project });
};
