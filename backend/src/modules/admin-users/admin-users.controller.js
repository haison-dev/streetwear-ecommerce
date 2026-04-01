import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import { getUserByIdService, listUsersService, updateUserRolesService } from "./admin-users.service.js";

export const listUsersController = asyncHandler(async (req, res) => {
  const result = await listUsersService();
  return sendResult(res, result);
});

export const getUserByIdController = asyncHandler(async (req, res) => {
  const result = await getUserByIdService(req.params.id);
  return sendResult(res, result);
});

export const updateUserRolesController = asyncHandler(async (req, res) => {
  const result = await updateUserRolesService(req.params.id, req.body || {});
  return sendResult(res, result);
});

