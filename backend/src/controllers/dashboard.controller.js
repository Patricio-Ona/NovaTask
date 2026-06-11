import * as dashboardService from "../services/dashboard.service.js";

export const getOverview = async (req, res) => {
  const overview = await dashboardService.getDashboardOverview(req.user.id);
  res.json({ success: true, data: overview });
};
