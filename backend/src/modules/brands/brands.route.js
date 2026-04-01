import { Router } from "express";
import {
  createBrandController,
  deleteBrandController,
  getBrandByIdController,
  getBrandBySlugController,
  listBrandsController,
  updateBrandController,
} from "./brands.controller.js";
import { authorize, protectedRoute } from "../../shared/middleware/authMiddleware.js";

const router = Router();

router.get("/", listBrandsController);
router.get("/slug/:slug", getBrandBySlugController);
router.get("/:id", getBrandByIdController);
router.post("/", protectedRoute, authorize("brand", "write"), createBrandController);
router.patch("/:id", protectedRoute, authorize("brand", "write"), updateBrandController);
router.delete("/:id", protectedRoute, authorize("brand", "write"), deleteBrandController);

export default router;

