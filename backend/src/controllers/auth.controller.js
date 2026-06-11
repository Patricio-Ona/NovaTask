import * as authService from "../services/auth.service.js";

export const register = async (req, res) => {
  const session = await authService.register(req.validated.body);
  res.status(201).json({ success: true, data: session });
};

export const login = async (req, res) => {
  const session = await authService.login(req.validated.body);
  res.json({ success: true, data: session });
};

export const refresh = async (req, res) => {
  const data = await authService.refreshSession(req.validated.body.refreshToken);
  res.json({ success: true, data });
};

export const logout = async (req, res) => {
  const data = await authService.logout(req.body?.refreshToken);
  res.json({ success: true, data });
};

export const me = async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({ success: true, data: user });
};

export const updateMe = async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.validated.body);
  res.json({ success: true, data: user });
};
