import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import { getMeService, updateMeService, updateMyPasswordService } from "./users.service.js";

export const getMe = asyncHandler(async (req, res) => {
  const result = await getMeService(req.user);
  return sendResult(res, result);
});

export const updateMe = asyncHandler(async (req, res) => {
  const result = await updateMeService(req.user?._id, req.body || {});
  return sendResult(res, result);
});

export const updateMyPassword = asyncHandler(async (req, res) => {
  const result = await updateMyPasswordService(req.user?._id, req.body || {});
  return sendResult(res, result);
});

