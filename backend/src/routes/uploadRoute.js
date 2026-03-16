import { Router } from "express";
import { protectedRoute, authorize } from "../middleware/authMiddleware.js";
import { uploadImages } from "../middleware/uploadMiddleware.js";
import { uploadImages as uploadImagesController } from "../controllers/uploadController.js";

const router = Router();

const setDefaultFolder = (folder) => (req, res, next) => {
  if (!req.body) req.body = {};
  if (!req.body.folder) req.body.folder = folder;
  next();
};

router.post(
  "/images",
  protectedRoute,
  authorize("product", "write"),
  setDefaultFolder("e-commerce/products"),
  uploadImages.array("images", 10),
  uploadImagesController
);

router.post(
  "/category-images",
  protectedRoute,
  authorize("category", "write"),
  setDefaultFolder("e-commerce/categories"),
  uploadImages.array("images", 10),
  uploadImagesController
);

export default router;
