import mongoose from "mongoose";
import { makeError } from "../../shared/errors/index.js";
import { findProductById } from "../products/products.repository.js";
import {
  createVariant,
  ensureInventoryForVariant,
  findVariantById,
  updateVariantById,
} from "./variants.repository.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const createVariantService = async (payload = {}) => {
  const { productId, size, color, sku, stock = 0, price } = payload;
  if (!isObjectId(productId)) throw makeError(400, "Invalid product id");
  if (!size || !color || !sku) throw makeError(400, "size, color, sku are required");
  if (!Number.isFinite(Number(stock)) || Number(stock) < 0) {
    throw makeError(400, "stock must be a non-negative number");
  }

  const product = await findProductById(productId);
  if (!product) throw makeError(404, "Product not found");

  const variant = await createVariant({
    productId,
    size,
    color,
    sku,
    stock: Number(stock),
    price,
  });
  await ensureInventoryForVariant({ variantId: variant._id, stock: Number(stock) });
  return { status: 201, body: { variant } };
};

export const updateVariantService = async (id, payload = {}) => {
  if (!isObjectId(id)) throw makeError(400, "Invalid variant id");
  const current = await findVariantById(id);
  if (!current) throw makeError(404, "Variant not found");

  const update = {};
  if (payload.size !== undefined) update.size = payload.size;
  if (payload.color !== undefined) update.color = payload.color;
  if (payload.sku !== undefined) update.sku = payload.sku;
  if (payload.stock !== undefined) {
    if (!Number.isFinite(Number(payload.stock)) || Number(payload.stock) < 0) {
      throw makeError(400, "stock must be a non-negative number");
    }
    update.stock = Number(payload.stock);
  }
  if (payload.price !== undefined) update.price = payload.price;
  if (!Object.keys(update).length) throw makeError(400, "Nothing to update");

  const variant = await updateVariantById(id, update);
  if (update.stock !== undefined) {
    await ensureInventoryForVariant({ variantId: variant._id, stock: update.stock });
  }
  return { status: 200, body: { variant } };
};
