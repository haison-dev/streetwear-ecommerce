import { Router } from "express";
import {
  createProductController,
  deleteProductController,
  getProductByIdController,
  getProductBySlugController,
  getProductFilterStatsController,
  listProductsController,
  updateProductController,
} from "./products.controller.js";
import { authorize, protectedRoute } from "../../shared/middleware/authMiddleware.js";

const router = Router();

router.get("/", listProductsController);
router.get("/filters", getProductFilterStatsController);
router.get("/slug/:slug", getProductBySlugController);
router.get("/:id", getProductByIdController);
router.post("/", protectedRoute, authorize("product", "write"), createProductController);
router.patch("/:id", protectedRoute, authorize("product", "write"), updateProductController);
router.delete("/:id", protectedRoute, authorize("product", "write"), deleteProductController);

export default router;

