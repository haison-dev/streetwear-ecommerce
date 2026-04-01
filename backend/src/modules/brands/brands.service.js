import mongoose from "mongoose";
import { normalizeString, slugify } from "../../shared/utils/normalize.js";
import {
  countBrands,
createBrand,
  deleteBrandById,
  findBrandById,
  findBrandBySlug,
  findBrands,
  updateBrandById,
} from "./brands.repository.js";
import { makeError } from "../../shared/errors/index.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);


export const listBrands = async (query = {}) => {
  const { status, q, page = 1, limit = 20, sort = "name" } = query;
  const filter = {};
  if (status && status !== "all") filter.status = status;
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

  const [brands, total] = await Promise.all([
    findBrands({ filter, sortBy, skip, limit: safeLimit }),
    countBrands(filter),
  ]);

  return { status: 200, body: { brands, meta: { page: safePage, limit: safeLimit, total } } };
};

export const getBrandById = async (id) => {
  if (!isObjectId(id)) throw makeError(400, "Invalid brand id");
  const brand = await findBrandById(id);
  if (!brand) throw makeError(404, "Brand not found");
  return { status: 200, body: { brand } };
};

export const getBrandBySlug = async (slug) => {
  if (!slug) throw makeError(400, "Slug is required");
  const brand = await findBrandBySlug(slug);
  if (!brand) throw makeError(404, "Brand not found");
  return { status: 200, body: { brand } };
};

export const createBrandService = async (payload = {}) => {
  const { name, slug, logo, status } = payload;
  const cleanName = normalizeString(name);
  if (!cleanName) throw makeError(400, "Name is required");

  const finalSlug = slug ? slugify(slug) : slugify(cleanName);
  if (!finalSlug) throw makeError(400, "Slug is invalid");

  const brand = await createBrand({
    name: cleanName,
    slug: finalSlug,
    logo: typeof logo === "string" ? normalizeString(logo) : undefined,
    status,
  });

  return { status: 201, body: { brand } };
};

export const updateBrandService = async (id, payload = {}) => {
  if (!isObjectId(id)) throw makeError(400, "Invalid brand id");
  const { name, slug, logo, status } = payload;
  const update = {};
  if (typeof name === "string") update.name = normalizeString(name);
  if (typeof slug === "string") update.slug = slugify(slug);
  if (typeof logo === "string") update.logo = normalizeString(logo);
  if (typeof status === "string") update.status = status;
  if (!Object.keys(update).length) throw makeError(400, "Nothing to update");

  const brand = await updateBrandById(id, update);
  if (!brand) throw makeError(404, "Brand not found");
  return { status: 200, body: { brand } };
};

export const deleteBrandService = async (id) => {
  if (!isObjectId(id)) throw makeError(400, "Invalid brand id");
  const result = await deleteBrandById(id);
  if (result.deletedCount === 0) throw makeError(404, "Brand not found");
  return { status: 204, body: null };
};








