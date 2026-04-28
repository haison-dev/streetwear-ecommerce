import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { registerModuleRoutes } from "./modules/registerRoutes.js";
import { notFound } from "./shared/errors/index.js";
import { errorHandler } from "./shared/middleware/errorHandler.js";

const parseAllowedOrigins = () => {
  const origins = new Set();
  const rawSingle = String(process.env.CLIENT_URL || "").trim();
  const rawList = String(process.env.CLIENT_URLS || "").trim();

  if (rawSingle) origins.add(rawSingle);
  if (rawList) {
    rawList
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => origins.add(item));
  }

  origins.add("http://localhost:5173");
  origins.add("http://127.0.0.1:5173");
  return origins;
};

const isVercelPreviewOrigin = (origin) => {
  if (!origin) return false;
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === "https:" && hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

export const createApp = () => {
  const app = express();
  const allowedOrigins = parseAllowedOrigins();

  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.has(origin)) return callback(null, true);
        if (isVercelPreviewOrigin(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    }),
  );

  registerModuleRoutes(app);
  app.use((req, res, next) => next(notFound("Route not found")));
  app.use(errorHandler);
  return app;
};
