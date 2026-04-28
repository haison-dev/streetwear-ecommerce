import { Router } from "express";
import { authorize, protectedRoute } from "../../shared/middleware/authMiddleware.js";
import {
  listInventoryController,
  updateInventoryController,
} from "./inventory.controller.js";

const router = Router();

router.get("/", protectedRoute, authorize("inventory", "read"), listInventoryController);
router.patch(
  "/:variantId",
  protectedRoute,
  authorize("inventory", "write"),
  updateInventoryController,
);

export default router;
