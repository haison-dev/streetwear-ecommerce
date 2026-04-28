import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import { listInventoryService, updateInventoryService } from "./inventory.service.js";

export const listInventoryController = asyncHandler(async (req, res) => {
  const result = await listInventoryService(req.query || {});
  return sendResult(res, result);
});

export const updateInventoryController = asyncHandler(async (req, res) => {
  const result = await updateInventoryService(req.params.variantId, req.body || {});
  return sendResult(res, result);
});
