import CartItem from "../../models/CartItem.js";
import Order from "../../models/Order.js";
import Payment from "../../models/Payment.js";
import PaymentTransaction from "../../models/PaymentTransaction.js";
import Product from "../../models/Product.js";
import ProductVariant from "../../models/ProductVariant.js";
import Inventory from "../../models/Inventory.js";

export const findCartItemsByUserId = (userId) =>
  CartItem.find({ userId }).sort({ createdAt: -1 }).lean();

export const findProductById = (productId) =>
  Product.findById(productId).lean();

export const findVariantById = (variantId) =>
  ProductVariant.findById(variantId).lean();

export const findInventoryByVariantId = (variantId) =>
  Inventory.findOne({ variantId }).lean();

export const createOrder = async (payload, session = null) => {
  const [order] = await Order.create([payload], session ? { session } : undefined);
  return order;
};

export const createPayment = async (payload, session = null) => {
  const [payment] = await Payment.create([payload], session ? { session } : undefined);
  return payment;
};

export const createPaymentTransaction = async (payload, session = null) => {
  const [transaction] = await PaymentTransaction.create(
    [payload],
    session ? { session } : undefined,
  );
  return transaction;
};

export const deleteCartItemsByIds = async ({ userId, ids }, session = null) =>
  CartItem.deleteMany(
    { userId, _id: { $in: ids } },
    session ? { session } : undefined,
  );
