import { Router } from "express";
import { createOrderFromCart } from "./order.controller.js";

const router = Router();

router.post("/", createOrderFromCart);

export default router;
