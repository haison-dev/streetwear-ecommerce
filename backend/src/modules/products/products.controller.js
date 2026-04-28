import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import {
  createProductService,
  deleteProductService,
  getProductByIdService,
  getProductBySlugService,
  getProductFilterStatsService,
  listProductVariantsService,
  listProducts,
  updateProductService,
} from "./products.service.js";

export const listProductsController = asyncHandler(async (req, res) => {
  const result = await listProducts(req.query);
  return sendResult(res, result);
});

export const getProductByIdController = asyncHandler(async (req, res) => {
  const result = await getProductByIdService(req.params.id);
  return sendResult(res, result);
});

export const getProductBySlugController = asyncHandler(async (req, res) => {
  const result = await getProductBySlugService(req.params.slug);
  return sendResult(res, result);
});

export const listProductVariantsController = asyncHandler(async (req, res) => {
  const result = await listProductVariantsService(req.params.id);
  return sendResult(res, result);
});

export const getProductFilterStatsController = asyncHandler(async (req, res) => {
  const result = await getProductFilterStatsService(req.query);
  return sendResult(res, result);
});

export const createProductController = asyncHandler(async (req, res) => {
  const result = await createProductService(req.body || {});
  return sendResult(res, result);
});

export const updateProductController = asyncHandler(async (req, res) => {
  const result = await updateProductService(req.params.id, req.body || {});
  return sendResult(res, result);
});

export const deleteProductController = asyncHandler(async (req, res) => {
  const result = await deleteProductService(req.params.id);
  return sendResult(res, result);
});

