import { Router } from "express";
import {
  addWishlistItem,
  getWishlist,
  removeWishlistItem,
} from "./wishlist.controller.js";
import { protectedRoute } from "../../shared/middleware/authMiddleware.js";

const router = Router();

router.use(protectedRoute);
router.get("/", getWishlist);
router.post("/items", addWishlistItem);
router.delete("/items/:productId", removeWishlistItem);

export default router;
