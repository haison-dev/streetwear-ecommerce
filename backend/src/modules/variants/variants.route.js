import { Router } from "express";
import { authorize, protectedRoute } from "../../shared/middleware/authMiddleware.js";
import {
  createVariantController,
  updateVariantController,
} from "./variants.controller.js";

const router = Router();

router.post("/", protectedRoute, authorize("product", "write"), createVariantController);
router.patch("/:id", protectedRoute, authorize("product", "write"), updateVariantController);

export default router;
