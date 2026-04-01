import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import {
  createBrandService,
  deleteBrandService,
  getBrandById,
  getBrandBySlug,
  listBrands,
  updateBrandService,
} from "./brands.service.js";

export const listBrandsController = asyncHandler(async (req, res) => {
  const result = await listBrands(req.query);
  return sendResult(res, result);
});

export const getBrandByIdController = asyncHandler(async (req, res) => {
  const result = await getBrandById(req.params.id);
  return sendResult(res, result);
});

export const getBrandBySlugController = asyncHandler(async (req, res) => {
  const result = await getBrandBySlug(req.params.slug);
  return sendResult(res, result);
});

export const createBrandController = asyncHandler(async (req, res) => {
  const result = await createBrandService(req.body || {});
  return sendResult(res, result);
});

export const updateBrandController = asyncHandler(async (req, res) => {
  const result = await updateBrandService(req.params.id, req.body || {});
  return sendResult(res, result);
});

export const deleteBrandController = asyncHandler(async (req, res) => {
  const result = await deleteBrandService(req.params.id);
  return sendResult(res, result);
});

