import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProductBySlug,
  getProductFilterStats,
  listProducts,
  updateProduct,
} from "../controllers/productController.js";
import { authorize, protectedRoute } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", listProducts);
router.get("/filters", getProductFilterStats);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);

router.post("/", protectedRoute, authorize("product", "write"), createProduct);
router.patch("/:id", protectedRoute, authorize("product", "write"), updateProduct);
router.delete("/:id", protectedRoute, authorize("product", "write"), deleteProduct);

export default router;
