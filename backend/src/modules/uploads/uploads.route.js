import { Router } from "express";
import { protectedRoute, authorize } from "../../shared/middleware/authMiddleware.js";
import { uploadImages as uploadImagesMiddleware } from "../../shared/middleware/uploadMiddleware.js";
import { uploadImages as uploadImagesController } from "./uploads.controller.js";

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
  uploadImagesMiddleware.array("images", 10),
  uploadImagesController,
);

router.post(
  "/category-images",
  protectedRoute,
  authorize("category", "write"),
  setDefaultFolder("e-commerce/categories"),
  uploadImagesMiddleware.array("images", 10),
  uploadImagesController,
);

export default router;

