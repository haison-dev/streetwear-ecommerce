import { unauthorized } from "../../shared/errors/index.js";
import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import {
  createReviewService,
  deleteReviewService,
  listReviewsByProductService,
} from "./reviews.service.js";

export const listProductReviewsController = asyncHandler(async (req, res) => {
  const result = await listReviewsByProductService({
    productId: req.params.id,
    query: req.query || {},
  });
  return sendResult(res, result);
});

export const createReviewController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();
  const result = await createReviewService({ userId, payload: req.body || {} });
  return sendResult(res, result);
});

export const deleteReviewController = asyncHandler(async (req, res) => {
  const result = await deleteReviewService({ reviewId: req.params.id });
  return sendResult(res, result);
});
