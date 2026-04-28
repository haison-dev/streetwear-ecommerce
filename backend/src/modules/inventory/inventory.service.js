import mongoose from "mongoose";
import { makeError } from "../../shared/errors/index.js";
import {
  countInventories,
  findInventories,
  updateInventoryByVariantId,
} from "./inventory.repository.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const listInventoryService = async (query = {}) => {
  const safePage = Math.max(parseInt(query.page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (safePage - 1) * safeLimit;
  const filter = {};

  if (query.variantId) {
    if (!isObjectId(query.variantId)) throw makeError(400, "Invalid variantId");
    filter.variantId = query.variantId;
  }

  const [inventories, total] = await Promise.all([
    findInventories({ filter, skip, limit: safeLimit }),
    countInventories(filter),
  ]);

  return {
    status: 200,
    body: { inventories, meta: { page: safePage, limit: safeLimit, total } },
  };
};

export const updateInventoryService = async (variantId, payload = {}) => {
  if (!isObjectId(variantId)) throw makeError(400, "Invalid variantId");

  const update = {};
  for (const key of ["available", "reserved", "sold"]) {
    if (payload[key] !== undefined) {
      if (!Number.isFinite(Number(payload[key])) || Number(payload[key]) < 0) {
        throw makeError(400, `${key} must be a non-negative number`);
      }
      update[key] = Number(payload[key]);
    }
  }
  if (!Object.keys(update).length) throw makeError(400, "Nothing to update");

  const inventory = await updateInventoryByVariantId(variantId, update);
  return { status: 200, body: { inventory } };
};
