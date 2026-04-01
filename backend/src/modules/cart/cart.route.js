import { Router } from "express";
import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "./cart.controller.js";

const router = Router();

router.get("/", getCart);
router.post("/items", addToCart);
router.patch("/items/:id", updateCartItem);
router.delete("/items/:id", removeCartItem);

export default router;


