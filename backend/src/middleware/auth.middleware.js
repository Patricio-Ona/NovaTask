import { prisma } from "../utils/prisma.js";
import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const requireAuth = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new AppError("No autorizado", 401);
    }

    const token = authorization.replace("Bearer ", "");
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });

    if (!user) {
      throw new AppError("No autorizado", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError("No autorizado", 401));
  }
};
