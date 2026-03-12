import { Router } from "express";
import { authorize } from "../middleware/authMiddleware.js";
import { getUserById, listUsers, updateUserRoles } from "../controllers/adminUserController.js";

const router = Router();

router.get("/", authorize("user", "read"), listUsers);
router.get("/:id", authorize("user", "read"), getUserById);
router.patch("/:id/roles", authorize("user", "write"), updateUserRoles);

export default router;
