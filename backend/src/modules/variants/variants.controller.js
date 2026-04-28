import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import { createVariantService, updateVariantService } from "./variants.service.js";

export const createVariantController = asyncHandler(async (req, res) => {
  const result = await createVariantService(req.body || {});
  return sendResult(res, result);
});

export const updateVariantController = asyncHandler(async (req, res) => {
  const result = await updateVariantService(req.params.id, req.body || {});
  return sendResult(res, result);
});
