import { normalizeString, toNumber } from "../../shared/utils/normalize.js";
import { makeError } from "../../shared/errors/index.js";
import {
  countCollections,
  countProductsByCollectionFilter,
  findCollectionBySlug,
  findCollections,
  findProductsByCollectionFilter,
} from "./collections.repository.js";

const PRODUCT_SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price: { price: 1 },
  "price:desc": { price: -1 },
  rating: { rating: -1 },
  name: { name: 1 },
  "name:desc": { name: -1 },
};

const COLLECTION_SORT_MAP = {
  order: { sortOrder: 1, createdAt: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name: { name: 1 },
};

const buildCollectionProductFilter = (collection) => {
  const criteria = collection?.criteria || {};
  const filter = { status: "active" };
  const q = normalizeString(criteria.q);

  if (q) filter.name = { $regex: q, $options: "i" };
  if (Array.isArray(criteria.categoryIds) && criteria.categoryIds.length) {
    filter.categoryId = { $in: criteria.categoryIds };
  }
  if (Array.isArray(criteria.brandIds) && criteria.brandIds.length) {
    filter.brandId = { $in: criteria.brandIds };
  }

  const min = toNumber(criteria.minPrice);
  const max = toNumber(criteria.maxPrice);
  if (min !== undefined || max !== undefined) {
    filter.price = {};
    if (min !== undefined) filter.price.$gte = min;
    if (max !== undefined) filter.price.$lte = max;
  }

  const minR = toNumber(criteria.minRating);
  if (minR !== undefined) filter.rating = { $gte: minR };

  return filter;
};

export const listCollectionsService = async (query = {}) => {
  const { status = "active", q, page = 1, limit = 20, sort = "order" } = query;
  const filter = {};
  if (status && status !== "all") filter.status = status;
  const queryText = normalizeString(q);
  if (queryText) filter.name = { $regex: queryText, $options: "i" };

  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (safePage - 1) * safeLimit;
  const sortBy = COLLECTION_SORT_MAP[sort] || COLLECTION_SORT_MAP.order;

  const [collections, total] = await Promise.all([
    findCollections({ filter, sortBy, skip, limit: safeLimit }),
    countCollections(filter),
  ]);

  return {
    status: 200,
    body: { collections, meta: { page: safePage, limit: safeLimit, total } },
  };
};

export const getCollectionBySlugService = async (slug) => {
  const normalizedSlug = normalizeString(slug)?.toLowerCase();
  if (!normalizedSlug) throw makeError(400, "Slug is required");

  const collection = await findCollectionBySlug(normalizedSlug);
  if (!collection) throw makeError(404, "Collection not found");

  return { status: 200, body: { collection } };
};

export const listCollectionProductsService = async ({ slug, query = {} }) => {
  const normalizedSlug = normalizeString(slug)?.toLowerCase();
  if (!normalizedSlug) throw makeError(400, "Slug is required");

  const collection = await findCollectionBySlug(normalizedSlug);
  if (!collection) throw makeError(404, "Collection not found");
  if (collection.status !== "active") throw makeError(404, "Collection not found");

  const { page = 1, limit = 20, sort } = query;
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (safePage - 1) * safeLimit;
  const sortKey = normalizeString(sort) || collection.criteria?.sort || "newest";
  const sortBy = PRODUCT_SORT_MAP[sortKey] || PRODUCT_SORT_MAP.newest;

  const filter = buildCollectionProductFilter(collection);
  const [products, total] = await Promise.all([
    findProductsByCollectionFilter({ filter, sortBy, skip, limit: safeLimit }),
    countProductsByCollectionFilter(filter),
  ]);

  return {
    status: 200,
    body: {
      collection,
      products,
      meta: { page: safePage, limit: safeLimit, total },
    },
  };
};
