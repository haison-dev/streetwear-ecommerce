import { Router } from "express";
import { createReviewController } from "./reviews.controller.js";
import { protectedRoute } from "../../shared/middleware/authMiddleware.js";

const router = Router();

router.post("/", protectedRoute, createReviewController);

export default router;
