import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

export const app = express();

const allowedOrigins = new Set([
  ...env.clientUrls,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const isAllowedDevelopmentOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/i.test(origin);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(origin) || (env.nodeEnv !== "production" && isAllowedDevelopmentOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
