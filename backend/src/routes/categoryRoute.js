import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategoryBySlug,
  listCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { authorize, protectedRoute } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", listCategories);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/:id", getCategoryById);

router.post("/", protectedRoute, authorize("category", "write"), createCategory);
router.patch("/:id", protectedRoute, authorize("category", "write"), updateCategory);
router.delete("/:id", protectedRoute, authorize("category", "write"), deleteCategory);

export default router;
