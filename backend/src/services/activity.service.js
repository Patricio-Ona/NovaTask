import { prisma } from "../utils/prisma.js";

export const logActivity = ({ userId, action, entityType, entityId }) =>
  prisma.activityLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
    },
  });
