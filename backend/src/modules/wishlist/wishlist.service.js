import mongoose from "mongoose";
import { makeError } from "../../shared/errors/index.js";
import { findProductById } from "../products/products.repository.js";
import {
  findWishlistByUserId,
  removeWishlistItem,
  upsertWishlistPushItem,
} from "./wishlist.repository.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const getWishlistService = async ({ userId }) => {
  const wishlist = await findWishlistByUserId(userId);
  return {
    status: 200,
    body: {
      items: wishlist?.items || [],
    },
  };
};

export const addWishlistItemService = async ({ userId, productId }) => {
  if (!isObjectId(productId)) throw makeError(400, "Invalid product id");
  const product = await findProductById(productId);
  if (!product) throw makeError(404, "Product not found");
  if (product.status !== "active") {
    throw makeError(400, "Product not available");
  }

  await upsertWishlistPushItem({ userId, productId });
  const wishlist = await findWishlistByUserId(userId);
  return {
    status: 201,
    body: {
      message: "Item added to wishlist",
      items: wishlist?.items || [],
    },
  };
};

export const removeWishlistItemService = async ({ userId, productId }) => {
  if (!isObjectId(productId)) throw makeError(400, "Invalid product id");
  const removed = await removeWishlistItem({ userId, productId });
  if (!removed) throw makeError(404, "Wishlist item not found");
  return { status: 204, body: null };
};
