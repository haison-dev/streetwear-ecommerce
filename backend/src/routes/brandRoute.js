import { Router } from "express";
import {
  createBrand,
  deleteBrand,
  getBrandById,
  getBrandBySlug,
  listBrands,
  updateBrand,
} from "../controllers/brandController.js";
import { authorize, protectedRoute } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", listBrands);
router.get("/slug/:slug", getBrandBySlug);
router.get("/:id", getBrandById);

router.post("/", protectedRoute, authorize("brand", "write"), createBrand);
router.patch("/:id", protectedRoute, authorize("brand", "write"), updateBrand);
router.delete("/:id", protectedRoute, authorize("brand", "write"), deleteBrand);

export default router;
