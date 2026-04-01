import { Router } from "express";
import { authorize } from "../../shared/middleware/authMiddleware.js";
import {
  createRoleController,
  listPermissionsController,
  listRolesController,
  updateRoleController,
} from "./rbac.controller.js";

const router = Router();

router.get("/roles", authorize("rbac", "read"), listRolesController);
router.post("/roles", authorize("rbac", "write"), createRoleController);
router.patch("/roles/:id", authorize("rbac", "write"), updateRoleController);
router.get("/permissions", authorize("rbac", "read"), listPermissionsController);

export default router;

