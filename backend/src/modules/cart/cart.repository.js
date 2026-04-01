import Product from "../../models/Product.js";
import ProductVariant from "../../models/ProductVariant.js";
import Inventory from "../../models/Inventory.js";
import CartItem from "../../models/CartItem.js";

export const findProductById = (id) =>
  Product.findById(id).select("price salePrice status");

export const findVariantById = (id) =>
  ProductVariant.findById(id).select("productId sku stock price size color");

export const findInventoryByVariantId = (variantId) =>
  Inventory.findOne({ variantId }).select("available reserved");

export const findCartItemByUserAndProductVariant = ({ userId, productId, variantId }) =>
  CartItem.findOne({ userId, productId, variantId });

export const createCartItem = (payload) => CartItem.create(payload);

export const updateCartItemById = (id, payload) =>
  CartItem.findByIdAndUpdate(id, payload, { new: true });

export const findCartItemsByUserId = (userId) =>
  CartItem.find({ userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "productId",
      select: "name slug images price salePrice status",
    })
    .populate({
      path: "variantId",
      select: "productId size color sku stock price",
    })
    .lean();

export const findInventoriesByVariantIds = (variantIds) =>
  Inventory.find({ variantId: { $in: variantIds } })
    .select("variantId available reserved")
    .lean();

export const findCartItemByIdAndUser = ({ id, userId }) =>
  CartItem.findOne({ _id: id, userId });

export const deleteCartItemByIdAndUser = ({ id, userId }) =>
  CartItem.deleteOne({ _id: id, userId });


