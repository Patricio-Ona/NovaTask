import * as academicService from "../services/academic.service.js";

export const getAcademicOverview = async (req, res) => {
  const overview = await academicService.getAcademicOverview(req.user.id);
  res.json({ success: true, data: overview });
};

export const createTerm = async (req, res) => {
  const term = await academicService.createTerm(req.user.id, req.validated.body);
  res.status(201).json({ success: true, data: term });
};

export const updateTerm = async (req, res) => {
  const term = await academicService.updateTerm(req.validated.params.termId, req.user.id, req.validated.body);
  res.json({ success: true, data: term });
};

export const deleteTerm = async (req, res) => {
  const result = await academicService.deleteTerm(req.validated.params.termId, req.user.id);
  res.json({ success: true, data: result });
};

export const createSubject = async (req, res) => {
  const subject = await academicService.createSubject(req.user.id, req.validated.body);
  res.status(201).json({ success: true, data: subject });
};

export const updateSubject = async (req, res) => {
  const subject = await academicService.updateSubject(req.validated.params.subjectId, req.user.id, req.validated.body);
  res.json({ success: true, data: subject });
};

export const deleteSubject = async (req, res) => {
  const result = await academicService.deleteSubject(req.validated.params.subjectId, req.user.id);
  res.json({ success: true, data: result });
};

export const createEvent = async (req, res) => {
  const event = await academicService.createEvent(req.user.id, req.validated.body);
  res.status(201).json({ success: true, data: event });
};

export const updateEvent = async (req, res) => {
  const event = await academicService.updateEvent(req.validated.params.eventId, req.user.id, req.validated.body);
  res.json({ success: true, data: event });
};

export const deleteEvent = async (req, res) => {
  const result = await academicService.deleteEvent(req.validated.params.eventId, req.user.id);
  res.json({ success: true, data: result });
};
