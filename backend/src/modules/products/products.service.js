import mongoose from "mongoose";
import { normalizeString, slugify, toNumber } from "../../shared/utils/normalize.js";
import { normalizeOptionalId } from "../../shared/utils/query.js";
import {
  aggregateProductFilterStats,
  countProducts,
  createProduct,
  deleteProductById,
  findInventoriesByVariantIds,
  findProductById,
  findProductBySlug,
  findProducts,
  findVariantsByProductId,
  updateProductById,
} from "./products.repository.js";
import { makeError } from "../../shared/errors/index.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const attachVariantsWithInventory = async (product) => {
  const variants = await findVariantsByProductId(product._id);
  const variantIds = variants.map((variant) => variant._id);
  const inventories = await findInventoriesByVariantIds(variantIds);
  const inventoryMap = new Map(
    inventories.map((inv) => [String(inv.variantId), inv]),
  );

  const variantsWithStock = variants.map((variant) => {
    const inv = inventoryMap.get(String(variant._id));
    return {
      ...variant,
      inventory: inv
        ? { available: inv.available, reserved: inv.reserved, sold: inv.sold }
        : { available: 0, reserved: 0, sold: 0 },
    };
  });

  return { ...product, variants: variantsWithStock };
};

export const listProducts = async (query = {}) => {
  const {
    q,
    categoryId,
    brandId,
    status = "active",
    minPrice,
    maxPrice,
    minRating,
    page = 1,
    limit = 20,
    sort = "newest",
  } = query;

  const filter = {};
  if (status && status !== "all") filter.status = status;
  const queryText = normalizeString(q);
  if (queryText) filter.name = { $regex: queryText, $options: "i" };

  const normalizedCategoryId = normalizeOptionalId(categoryId);
  const normalizedBrandId = normalizeOptionalId(brandId);
  if (normalizedCategoryId) {
    if (!isObjectId(normalizedCategoryId))
      throw makeError(400, "Invalid categoryId");
    filter.categoryId = normalizedCategoryId;
  }
  if (normalizedBrandId) {
    if (!isObjectId(normalizedBrandId)) throw makeError(400, "Invalid brandId");
    filter.brandId = normalizedBrandId;
  }

  const min = toNumber(minPrice);
  const max = toNumber(maxPrice);
  if (minPrice !== undefined && min === undefined)
    throw makeError(400, "Invalid minPrice");
  if (maxPrice !== undefined && max === undefined)
    throw makeError(400, "Invalid maxPrice");
  if (min !== undefined || max !== undefined) {
    filter.price = {};
    if (min !== undefined) filter.price.$gte = min;
    if (max !== undefined) filter.price.$lte = max;
  }

  const minR = toNumber(minRating);
  if (minRating !== undefined && minR === undefined)
    throw makeError(400, "Invalid minRating");
  if (minR !== undefined) filter.rating = { $gte: minR };

  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price: { price: 1 },
    "price:desc": { price: -1 },
    rating: { rating: -1 },
    name: { name: 1 },
    "name:desc": { name: -1 },
  };
  const sortBy = sortMap[sort] || sortMap.newest;

  const [products, total] = await Promise.all([
    findProducts({ filter, sortBy, skip, limit: safeLimit }),
    countProducts(filter),
  ]);

  return {
    status: 200,
    body: { products, meta: { page: safePage, limit: safeLimit, total } },
  };
};

export const getProductByIdService = async (id) => {
  if (!isObjectId(id)) throw makeError(400, "Invalid product id");
  const product = await findProductById(id);
  if (!product) throw makeError(404, "Product not found");
  return {
    status: 200,
    body: { product: await attachVariantsWithInventory(product) },
  };
};

export const getProductBySlugService = async (slug) => {
  if (!slug) throw makeError(400, "Slug is required");
  const product = await findProductBySlug(slug);
  if (!product) throw makeError(404, "Product not found");
  return {
    status: 200,
    body: { product: await attachVariantsWithInventory(product) },
  };
};

export const getProductFilterStatsService = async (query = {}) => {
  const { categoryId, brandId, status = "active", q } = query;
  const filter = {};
  if (status && status !== "all") filter.status = status;
  const queryText = normalizeString(q);
  if (queryText) filter.name = { $regex: queryText, $options: "i" };

  const normalizedCategoryId = normalizeOptionalId(categoryId);
  const normalizedBrandId = normalizeOptionalId(brandId);

  if (normalizedCategoryId) {
    if (!isObjectId(normalizedCategoryId))
      throw makeError(400, "Invalid categoryId");
    filter.categoryId = new mongoose.Types.ObjectId(normalizedCategoryId);
  }
  if (normalizedBrandId) {
    if (!isObjectId(normalizedBrandId)) throw makeError(400, "Invalid brandId");
    filter.brandId = new mongoose.Types.ObjectId(normalizedBrandId);
  }

  const stats = await aggregateProductFilterStats(filter);
  return {
    status: 200,
    body: {
      stats: stats[0] || {
        minPrice: 0,
        maxPrice: 0,
        minRating: 0,
        maxRating: 0,
      },
    },
  };
};

export const createProductService = async (payload = {}) => {
  const {
    name,
    slug,
    brandId,
    categoryId,
    description,
    images,
    price,
    salePrice,
    status,
  } = payload;
  const cleanName = normalizeString(name);

  if (!cleanName || !brandId || !categoryId || price === undefined) {
    throw makeError(400, "name, brandId, categoryId, and price are required");
  }
  if (!isObjectId(brandId)) throw makeError(400, "Invalid brandId");
  if (!isObjectId(categoryId)) throw makeError(400, "Invalid categoryId");

  const finalSlug = slug ? slugify(slug) : slugify(cleanName);
  if (!finalSlug) throw makeError(400, "Slug is invalid");

  const product = await createProduct({
    name: cleanName,
    slug: finalSlug,
    brandId,
    categoryId,
    description:
      typeof description === "string" ? normalizeString(description) : "",
    images: Array.isArray(images) ? images : [],
    price,
    salePrice,
    status,
  });

  return { status: 201, body: { product } };
};

export const updateProductService = async (id, payload = {}) => {
  if (!isObjectId(id)) throw makeError(400, "Invalid product id");

  const {
    name,
    slug,
    brandId,
    categoryId,
    description,
    images,
    price,
    salePrice,
    status,
  } = payload;
  const update = {};
  if (typeof name === "string") update.name = normalizeString(name);
  if (typeof slug === "string") update.slug = slugify(slug);
  if (typeof description === "string")
    update.description = normalizeString(description);
  if (Array.isArray(images)) update.images = images;
  if (price !== undefined) update.price = price;
  if (salePrice !== undefined) update.salePrice = salePrice;
  if (typeof status === "string") update.status = status;
  if (brandId !== undefined) {
    if (brandId && !isObjectId(brandId))
      throw makeError(400, "Invalid brandId");
    update.brandId = brandId;
  }
  if (categoryId !== undefined) {
    if (categoryId && !isObjectId(categoryId))
      throw makeError(400, "Invalid categoryId");
    update.categoryId = categoryId;
  }

  if (!Object.keys(update).length) throw makeError(400, "Nothing to update");

  const product = await updateProductById(id, update);
  if (!product) throw makeError(404, "Product not found");
  return { status: 200, body: { product } };
};

export const deleteProductService = async (id) => {
  if (!isObjectId(id)) throw makeError(400, "Invalid product id");
  const result = await deleteProductById(id);
  if (result.deletedCount === 0) throw makeError(404, "Product not found");
  return { status: 204, body: null };
};





