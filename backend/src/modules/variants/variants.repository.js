import ProductVariant from "../../models/ProductVariant.js";
import Inventory from "../../models/Inventory.js";

export const createVariant = (payload) => ProductVariant.create(payload);

export const findVariantById = (id) => ProductVariant.findById(id).lean();

export const updateVariantById = (id, payload) =>
  ProductVariant.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();

export const ensureInventoryForVariant = async ({ variantId, stock = 0 }) => {
  let inventory = await Inventory.findOne({ variantId });
  if (!inventory) {
    inventory = await Inventory.create({
      variantId,
      available: stock,
      reserved: 0,
      sold: 0,
    });
  }
  return inventory;
};
