import { AppError } from "../utils/AppError.js";
import { prisma } from "../utils/prisma.js";

export const getTags = async (userId) =>
  prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });

export const createTag = async (userId, payload) => {
  const existing = await prisma.tag.findFirst({
    where: {
      userId,
      name: payload.name,
    },
  });

  if (existing) {
    throw new AppError("Ya existe una etiqueta con ese nombre", 409);
  }

  return prisma.tag.create({
    data: {
      userId,
      name: payload.name,
      color: payload.color,
    },
  });
};
