import { addDays } from "../utils/date.js";
import { AppError } from "../utils/AppError.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { prisma } from "../utils/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { logActivity } from "./activity.service.js";

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
});

const buildSessionPayload = async (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: addDays(7),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: serializeUser(user),
  };
};

export const register = async ({ name, email, password, avatarUrl }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("El correo ya esta en uso", 409);
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      avatarUrl: avatarUrl || null,
    },
  });

  await logActivity({
    userId: user.id,
    action: "USER_REGISTERED",
    entityType: "AUTH",
    entityId: user.id,
  });

  return buildSessionPayload(user);
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError("Credenciales invalidas", 401);
  }

  const isMatch = await comparePassword(password, user.passwordHash);

  if (!isMatch) {
    throw new AppError("Credenciales invalidas", 401);
  }

  await logActivity({
    userId: user.id,
    action: "USER_LOGGED_IN",
    entityType: "AUTH",
    entityId: user.id,
  });

  return buildSessionPayload(user);
};

export const refreshSession = async (refreshToken) => {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    throw new AppError("La sesion ya no es valida", 401);
  }

  verifyRefreshToken(refreshToken);

  const accessToken = signAccessToken(storedToken.user);
  return {
    accessToken,
    user: serializeUser(storedToken.user),
  };
};

export const logout = async (refreshToken) => {
  if (!refreshToken) {
    return { success: true };
  }

  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return { success: true };
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
  });

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  return user;
};

export const updateProfile = async (userId, payload) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: payload.name,
      avatarUrl:
        payload.avatarUrl === ""
          ? null
          : payload.avatarUrl === undefined
            ? undefined
            : payload.avatarUrl,
    },
  });

  await logActivity({
    userId,
    action: "USER_PROFILE_UPDATED",
    entityType: "AUTH",
    entityId: user.id,
  });

  return serializeUser(user);
};
