import Inventory from "../../models/Inventory.js";

export const findInventories = ({ filter, skip, limit }) =>
  Inventory.find(filter)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "variantId",
      select: "productId size color sku stock price",
      populate: { path: "productId", select: "name" },
    })
    .lean();

export const countInventories = (filter) => Inventory.countDocuments(filter);

export const updateInventoryByVariantId = (variantId, payload) =>
  Inventory.findOneAndUpdate({ variantId }, payload, {
    new: true,
    runValidators: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }).lean();
