import { Router } from "express";
import { getMe, updateMe, updateMyPassword } from "./users.controller.js";

const router = Router();

router.get("/me", getMe);
router.patch("/me", updateMe);
router.put("/me/password", updateMyPassword);

export default router;

