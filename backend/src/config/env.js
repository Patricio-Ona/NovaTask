import dotenv from "dotenv";

dotenv.config();

const clientUrls = (process.env.CLIENT_URLS ?? process.env.CLIENT_URL ?? "http://localhost:5173")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  clientUrl: clientUrls[0] ?? "http://localhost:5173",
  clientUrls,
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "novatask-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "novatask-refresh-secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  mailEnabled: process.env.MAIL_ENABLED === "true",
  mailHost: process.env.MAIL_HOST ?? "",
  mailPort: Number(process.env.MAIL_PORT ?? 465),
  mailSecure: process.env.MAIL_SECURE ? process.env.MAIL_SECURE === "true" : true,
  mailUser: process.env.MAIL_USER ?? "",
  mailPassword: process.env.MAIL_PASSWORD ?? "",
  mailFromName: process.env.MAIL_FROM_NAME ?? "NovaTask",
  mailFromAddress: process.env.MAIL_FROM_ADDRESS ?? "",
};
