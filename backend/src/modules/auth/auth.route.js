import { Router } from "express";
import { login, logout, me, refreshToken, register } from "./auth.controller.js";
import { protectedRoute } from "../../shared/middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", protectedRoute, me);

export default router;

