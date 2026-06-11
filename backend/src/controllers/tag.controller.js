import * as tagService from "../services/tag.service.js";

export const getTags = async (req, res) => {
  const tags = await tagService.getTags(req.user.id);
  res.json({ success: true, data: tags });
};

export const createTag = async (req, res) => {
  const tag = await tagService.createTag(req.user.id, req.validated.body);
  res.status(201).json({ success: true, data: tag });
};
