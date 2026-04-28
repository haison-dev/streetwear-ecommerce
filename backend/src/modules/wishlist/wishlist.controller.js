import { unauthorized } from "../../shared/errors/index.js";
import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import {
  addWishlistItemService,
  getWishlistService,
  removeWishlistItemService,
} from "./wishlist.service.js";

export const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();
  const result = await getWishlistService({ userId });
  return sendResult(res, result);
});

export const addWishlistItem = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();
  const result = await addWishlistItemService({
    userId,
    productId: req.body?.productId,
  });
  return sendResult(res, result);
});

export const removeWishlistItem = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();
  const result = await removeWishlistItemService({
    userId,
    productId: req.params.productId,
  });
  return sendResult(res, result);
});
