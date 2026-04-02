import { unauthorized } from "../../shared/errors/index.js";
import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import { createOrderFromCartService } from "./order.service.js";

export const createOrderFromCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();

  const result = await createOrderFromCartService({
    userId,
    payload: req.body || {},
  });

  return sendResult(res, result);
});
