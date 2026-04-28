import mongoose from "mongoose";
import { makeError } from "../../shared/errors/index.js";
import { findProductById } from "../products/products.repository.js";
import {
  countReviewsByProductId,
  deleteReviewById,
  findReviewsByProductId,
  upsertReview,
} from "./reviews.repository.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const listReviewsByProductService = async ({ productId, query = {} }) => {
  if (!isObjectId(productId)) throw makeError(400, "Invalid product id");
  const product = await findProductById(productId);
  if (!product) throw makeError(404, "Product not found");

  const safePage = Math.max(parseInt(query.page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (safePage - 1) * safeLimit;
  const sort = String(query.sort || "newest") === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  const [reviews, total] = await Promise.all([
    findReviewsByProductId({ productId, skip, limit: safeLimit, sort }),
    countReviewsByProductId(productId),
  ]);

  return {
    status: 200,
    body: { reviews, meta: { page: safePage, limit: safeLimit, total } },
  };
};

export const createReviewService = async ({ userId, payload = {} }) => {
  const { productId, rating, comment = "" } = payload;
  if (!isObjectId(productId)) throw makeError(400, "Invalid product id");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw makeError(400, "rating must be an integer between 1 and 5");
  }
  const product = await findProductById(productId);
  if (!product) throw makeError(404, "Product not found");

  const review = await upsertReview({
    userId,
    productId,
    rating,
    comment: String(comment || "").trim(),
  });

  return {
    status: 201,
    body: { review },
  };
};

export const deleteReviewService = async ({ reviewId }) => {
  if (!isObjectId(reviewId)) throw makeError(400, "Invalid review id");
  const review = await deleteReviewById(reviewId);
  if (!review) throw makeError(404, "Review not found");
  return { status: 204, body: null };
};
