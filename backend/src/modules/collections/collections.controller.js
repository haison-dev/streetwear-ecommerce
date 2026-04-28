import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import {
  getCollectionBySlugService,
  listCollectionProductsService,
  listCollectionsService,
} from "./collections.service.js";

export const listCollectionsController = asyncHandler(async (req, res) => {
  const result = await listCollectionsService(req.query || {});
  return sendResult(res, result);
});

export const getCollectionBySlugController = asyncHandler(async (req, res) => {
  const result = await getCollectionBySlugService(req.params.slug);
  return sendResult(res, result);
});

export const listCollectionProductsController = asyncHandler(async (req, res) => {
  const result = await listCollectionProductsService({
    slug: req.params.slug,
    query: req.query || {},
  });
  return sendResult(res, result);
});

