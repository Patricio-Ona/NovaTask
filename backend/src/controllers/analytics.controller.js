import * as analyticsService from "../services/analytics.service.js";

export const getOverview = async (req, res) => {
  const overview = await analyticsService.getAnalyticsOverview(req.user.id);
  res.json({ success: true, data: overview });
};
