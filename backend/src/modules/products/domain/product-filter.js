import mongoose from "mongoose";
import { makeError } from "../../../shared/errors/index.js";
import { normalizeString, toNumber } from "../../../shared/utils/normalize.js";
import { normalizeOptionalId } from "../../../shared/utils/query.js";

export const buildProductFilter = ({ q, categoryId, brandId, status = "active", minPrice, maxPrice, minRating } = {}) => {
  const filter = {};
  if (status && status !== "all") filter.status = status;
  const queryText = normalizeString(q);
  if (queryText) filter.name = { $regex: queryText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };

  const normalizedCategoryId = normalizeOptionalId(categoryId);
  const normalizedBrandId = normalizeOptionalId(brandId);
  if (normalizedCategoryId) {
    if (!mongoose.Types.ObjectId.isValid(normalizedCategoryId))
      throw makeError(400, "Invalid categoryId");
    filter.categoryId = normalizedCategoryId;
  }
  if (normalizedBrandId) {
    if (!mongoose.Types.ObjectId.isValid(normalizedBrandId)) throw makeError(400, "Invalid brandId");
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

  return filter;
};
