import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { registerModuleRoutes } from "./modules/registerRoutes.js";
import { notFound } from "./shared/errors/index.js";
import { errorHandler } from "./shared/middleware/errorHandler.js";

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    }),
  );

  registerModuleRoutes(app);
  app.use((req, res, next) => next(notFound("Route not found")));
  app.use(errorHandler);
  return app;
};

