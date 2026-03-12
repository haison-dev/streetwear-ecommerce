import { Router } from "express";
import { login, logout, me, refreshToken, register } from "../controllers/authController.js";
import { protectedRoute } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", protectedRoute, me);

export default router;
