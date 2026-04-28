import { Router } from "express";
import { deleteReviewController } from "../reviews/reviews.controller.js";
import { authorize, protectedRoute } from "../../shared/middleware/authMiddleware.js";

const router = Router();

router.delete("/:id", protectedRoute, authorize("review", "write"), deleteReviewController);

export default router;
