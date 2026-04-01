import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import { createRoleService, listPermissionsService, listRolesService, updateRoleService } from "./rbac.service.js";

export const listRolesController = asyncHandler(async (req, res) => {
  const result = await listRolesService();
  return sendResult(res, result);
});

export const createRoleController = asyncHandler(async (req, res) => {
  const result = await createRoleService(req.body || {});
  return sendResult(res, result);
});

export const updateRoleController = asyncHandler(async (req, res) => {
  const result = await updateRoleService(req.params.id, req.body || {});
  return sendResult(res, result);
});

export const listPermissionsController = asyncHandler(async (req, res) => {
  const result = await listPermissionsService();
  return sendResult(res, result);
});

