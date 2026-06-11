import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email, name: user.name }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });

export const signRefreshToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);
