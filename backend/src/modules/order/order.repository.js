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
export const findProductsByIds = (productIds) =>
  Product.find({ _id: { $in: productIds } }).lean();

export const findVariantById = (variantId) =>
  ProductVariant.findById(variantId).lean();
export const findVariantsByIds = (variantIds) =>
  ProductVariant.find({ _id: { $in: variantIds } }).lean();

export const findInventoryByVariantId = (variantId) =>
  Inventory.findOne({ variantId }).lean();
export const findInventoriesByVariantIds = (variantIds) =>
  Inventory.find({ variantId: { $in: variantIds } }).lean();

export const findOrderById = (id, session = null) =>
  Order.findById(id, null, session ? { session } : undefined).lean();

export const findOrderByIdAndUserId = ({ id, userId }) =>
  Order.findOne({ _id: id, userId }).lean();

export const findOrders = ({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 20 }) =>
  Order.find(filter).sort(sort).skip(skip).limit(limit).lean();

export const countOrders = (filter = {}) => Order.countDocuments(filter);

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

export const updateOrderById = (id, payload, session = null) =>
  Order.findByIdAndUpdate(id, payload, {
    new: true,
    ...(session ? { session } : {}),
  });

export const findPaymentByOrderId = (orderId, session = null) =>
  Payment.findOne({ orderId }, null, session ? { session } : undefined);

export const updatePaymentByOrderId = (orderId, payload, session = null) =>
  Payment.findOneAndUpdate({ orderId }, payload, {
    new: true,
    ...(session ? { session } : {}),
  });

export const findLatestPaymentTransactionByOrderId = (orderId, session = null) =>
  PaymentTransaction.findOne({ orderId }, null, session ? { session } : undefined)
    .sort({ attemptNo: -1, createdAt: -1 });

export const updatePaymentTransactionById = (id, payload, session = null) =>
  PaymentTransaction.findByIdAndUpdate(id, payload, {
    new: true,
    ...(session ? { session } : {}),
  });
