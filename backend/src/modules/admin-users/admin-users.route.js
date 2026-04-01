import { Router } from "express";
import { authorize } from "../../shared/middleware/authMiddleware.js";
import {
  getUserByIdController,
  listUsersController,
  updateUserRolesController,
} from "./admin-users.controller.js";

const router = Router();

router.get("/", authorize("user", "read"), listUsersController);
router.get("/:id", authorize("user", "read"), getUserByIdController);
router.patch("/:id/roles", authorize("user", "write"), updateUserRolesController);

export default router;

