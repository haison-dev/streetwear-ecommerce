import Inventory from '../models/Inventory.js';

export const reserveStock = async (variantId, quantity, session = null) => {
  const res = await Inventory.updateOne(
    { variantId, available: { $gte: quantity } },
    { $inc: { available: -quantity, reserved: quantity } },
    session ? { session } : undefined
  );
  return res.modifiedCount === 1;
};

export const releaseReservedStock = async (variantId, quantity, session = null) => {
  const res = await Inventory.updateOne(
    { variantId, reserved: { $gte: quantity } },
    { $inc: { available: quantity, reserved: -quantity } },
    session ? { session } : undefined
  );
  return res.modifiedCount === 1;
};

export const commitReservedStock = async (variantId, quantity, session = null) => {
  const res = await Inventory.updateOne(
    { variantId, reserved: { $gte: quantity } },
    { $inc: { reserved: -quantity, sold: quantity } },
    session ? { session } : undefined
  );
  return res.modifiedCount === 1;
};

export const reserveStockForItems = async (items, session = null) => {
  for (const item of items) {
    const ok = await reserveStock(item.variantId, item.quantity, session);
    if (!ok) return false;
  }
  return true;
};

export const releaseReservedForItems = async (items, session = null) => {
  for (const item of items) {
    const ok = await releaseReservedStock(item.variantId, item.quantity, session);
    if (!ok) return false;
  }
  return true;
};

export const commitReservedForItems = async (items, session = null) => {
  for (const item of items) {
    const ok = await commitReservedStock(item.variantId, item.quantity, session);
    if (!ok) return false;
  }
  return true;
};
