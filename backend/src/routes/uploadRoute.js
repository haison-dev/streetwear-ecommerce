import { Router } from "express";
import { protectedRoute, authorize } from "../middleware/authMiddleware.js";
import { uploadImages } from "../middleware/uploadMiddleware.js";
import { uploadImages as uploadImagesController } from "../controllers/uploadController.js";

const router = Router();

router.post(
  "/images",
  protectedRoute,
  authorize("product", "write"),
  uploadImages.array("images", 10),
  uploadImagesController
);

export default router;
