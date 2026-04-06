import { Router } from "express";
import { authorize } from "../../shared/middleware/authMiddleware.js";
import {
  createOrderFromCart,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from "./order.controller.js";

const router = Router();

router.get("/", listOrders);
router.get("/:id", getOrderById);
router.post("/", createOrderFromCart);
router.patch("/:id/status", authorize("order", "write"), updateOrderStatus);

export default router;
