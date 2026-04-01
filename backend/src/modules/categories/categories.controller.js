import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import {
  createCategoryService,
  deleteCategoryService,
  getCategoryById,
  getCategoryBySlug,
  listCategories,
  updateCategoryService,
} from "./categories.service.js";

export const listCategoriesController = asyncHandler(async (req, res) => {
  const result = await listCategories(req.query);
  return sendResult(res, result);
});

export const getCategoryByIdController = asyncHandler(async (req, res) => {
  const result = await getCategoryById(req.params.id);
  return sendResult(res, result);
});

export const getCategoryBySlugController = asyncHandler(async (req, res) => {
  const result = await getCategoryBySlug(req.params.slug);
  return sendResult(res, result);
});

export const createCategoryController = asyncHandler(async (req, res) => {
  const result = await createCategoryService(req.body || {});
  return sendResult(res, result);
});

export const updateCategoryController = asyncHandler(async (req, res) => {
  const result = await updateCategoryService(req.params.id, req.body || {});
  return sendResult(res, result);
});

export const deleteCategoryController = asyncHandler(async (req, res) => {
  const result = await deleteCategoryService(req.params.id);
  return sendResult(res, result);
});

