import { Router } from "express";
import { addToCart } from "../controllers/cartController.js";

const router = Router();

router.post("/items", addToCart);

export default router;
