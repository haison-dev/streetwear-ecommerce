import { Router } from "express";
import {
  createCategoryController,
  deleteCategoryController,
  getCategoryByIdController,
  getCategoryBySlugController,
  listCategoriesController,
  updateCategoryController,
} from "./categories.controller.js";
import {
  authorize,
  protectedRoute,
} from "../../shared/middleware/authMiddleware.js";

const router = Router();

router.get("/", listCategoriesController);
router.get("/slug/:slug", getCategoryBySlugController);
router.get("/:id", getCategoryByIdController);
router.post(
  "/",
  protectedRoute,
  authorize("category", "write"),
  createCategoryController,
);
router.patch(
  "/:id",
  protectedRoute,
  authorize("category", "write"),
  updateCategoryController,
);
router.delete(
  "/:id",
  protectedRoute,
  authorize("category", "write"),
  deleteCategoryController,
);

export default router;
