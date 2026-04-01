import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import {
  addToCart as addToCartService,
  getCart as getCartService,
  removeCartItem as removeCartItemService,
  updateCartItem as updateCartItemService,
} from "./cart.service.js";
import { unauthorized } from "../../shared/errors/index.js";

export const addToCart = asyncHandler(async (req, res) => {
  const result = await addToCartService({
    userId: req.user?._id,
    productId: req.body?.productId,
    variantId: req.body?.variantId,
    quantity: req.body?.quantity,
  });
  return sendResult(res, result);
});

export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();
  const result = await getCartService({ userId });
  return sendResult(res, result);
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();
  const result = await updateCartItemService({
    userId,
    cartItemId: req.params?.id,
    quantity: req.body?.quantity,
  });
  return sendResult(res, result);
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();
  const result = await removeCartItemService({ userId, cartItemId: req.params?.id });
  return sendResult(res, result);
});

