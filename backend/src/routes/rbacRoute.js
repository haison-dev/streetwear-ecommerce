import { Router } from "express";
import { authorize } from "../middleware/authMiddleware.js";
import { createRole, listPermissions, listRoles, updateRole } from "../controllers/rbacController.js";

const router = Router();

router.get("/roles", authorize("rbac", "read"), listRoles);
router.post("/roles", authorize("rbac", "write"), createRole);
router.patch("/roles/:id", authorize("rbac", "write"), updateRole);
router.get("/permissions", authorize("rbac", "read"), listPermissions);

export default router;
