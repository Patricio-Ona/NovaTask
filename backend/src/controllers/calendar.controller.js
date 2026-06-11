import * as calendarService from "../services/calendar.service.js";

export const getCalendar = async (req, res) => {
  const items = await calendarService.getCalendarItems(req.user.id);
  res.json({ success: true, data: items });
};
