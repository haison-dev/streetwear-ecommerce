import mongoose from "mongoose";
import { normalizeString, slugify } from "../../shared/utils/normalize.js";
import {
  countCategories,
createCategory,
  deleteCategoryById,
  findCategories,
  findCategoryById,
  findCategoryBySlug,
  updateCategoryById,
} from "./categories.repository.js";
import { makeError } from "../../shared/errors/index.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);


export const listCategories = async (query = {}) => {
  const { status, parentId, q, page = 1, limit = 20, sort = "name" } = query;
  const filter = {};
  if (status && status !== "all") filter.status = status;
  if (parentId) {
    if (!isObjectId(parentId)) throw makeError(400, "Invalid parentId");
    filter.parentId = parentId;
  }
  const queryText = normalizeString(q);
  if (queryText) filter.name = { $regex: queryText, $options: "i" };

  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const sortMap = {
    name: { name: 1 },
    "name:desc": { name: -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
  };
  const sortBy = sortMap[sort] || sortMap.name;

  const [categories, total] = await Promise.all([
    findCategories({ filter, sortBy, skip, limit: safeLimit }),
    countCategories(filter),
  ]);

  return { status: 200, body: { categories, meta: { page: safePage, limit: safeLimit, total } } };
};

export const getCategoryById = async (id) => {
  if (!isObjectId(id)) throw makeError(400, "Invalid category id");
  const category = await findCategoryById(id);
  if (!category) throw makeError(404, "Category not found");
  return { status: 200, body: { category } };
};

export const getCategoryBySlug = async (slug) => {
  if (!slug) throw makeError(400, "Slug is required");
  const category = await findCategoryBySlug(slug);
  if (!category) throw makeError(404, "Category not found");
  return { status: 200, body: { category } };
};

export const createCategoryService = async (payload = {}) => {
  const { name, slug, image, parentId, status } = payload;
  const cleanName = normalizeString(name);
  if (!cleanName) throw makeError(400, "Name is required");

  let parent = undefined;
  if (parentId) {
    if (!isObjectId(parentId)) throw makeError(400, "Invalid parentId");
    parent = parentId;
  }

  const finalSlug = slug ? slugify(slug) : slugify(cleanName);
  if (!finalSlug) throw makeError(400, "Slug is invalid");

  const category = await createCategory({
    name: cleanName,
    slug: finalSlug,
    image: typeof image === "string" ? normalizeString(image) : "",
    parentId: parent,
    status,
  });

  return { status: 201, body: { category } };
};

export const updateCategoryService = async (id, payload = {}) => {
  if (!isObjectId(id)) throw makeError(400, "Invalid category id");

  const { name, slug, image, parentId, status } = payload;
  const update = {};
  if (typeof name === "string") update.name = normalizeString(name);
  if (typeof slug === "string") update.slug = slugify(slug);
  if (typeof image === "string") update.image = normalizeString(image);
  if (typeof status === "string") update.status = status;
  if (parentId !== undefined) {
    if (parentId && !isObjectId(parentId)) throw makeError(400, "Invalid parentId");
    update.parentId = parentId || undefined;
  }
  if (!Object.keys(update).length) throw makeError(400, "Nothing to update");

  const category = await updateCategoryById(id, update);
  if (!category) throw makeError(404, "Category not found");
  return { status: 200, body: { category } };
};

export const deleteCategoryService = async (id) => {
  if (!isObjectId(id)) throw makeError(400, "Invalid category id");
  const result = await deleteCategoryById(id);
  if (result.deletedCount === 0) throw makeError(404, "Category not found");
  return { status: 204, body: null };
};








