import mongoose from "mongoose";
import { makeError } from "../../shared/errors/index.js";
import {
  commitReservedForItems,
  getRealAvailable,
  releaseReservedForItems,
  reserveStockForItems,
} from "../../shared/utils/inventory.js";
import { createOrderWithRetry } from "./domain/order-number.js";
import { computeOrderPricing } from "./domain/order-pricing.js";
import { validateCreateOrderFromCartInput } from "./domain/order-validation.js";
import {
  countOrders,
  createOrder,
  createPayment,
  createPaymentTransaction,
  deleteCartItemsByIds,
  findCartItemsByUserId,
  findInventoryByVariantId,
  findLatestPaymentTransactionByOrderId,
  findOrderById,
  findOrderByIdAndUserId,
  findOrders,
  findPaymentByOrderId,
  findProductById,
  findVariantById,
  updateOrderById,
  updatePaymentByOrderId,
  updatePaymentTransactionById,
} from "./order.repository.js";

const ORDER_STATUS_TRANSITIONS = {
  pending: new Set(["confirmed", "cancelled"]),
  confirmed: new Set(["shipping", "cancelled"]),
  shipping: new Set(["delivered"]),
  delivered: new Set([]),
  cancelled: new Set([]),
};
const ORDER_STATUSES = Object.keys(ORDER_STATUS_TRANSITIONS);

const ORDER_SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  totalPrice: { totalPrice: 1, createdAt: -1 },
  "totalPrice:desc": { totalPrice: -1, createdAt: -1 },
};

export const createOrderFromCartService = async ({ userId, payload }) => {
  const { shippingAddress, paymentMethod, note, couponCode } = payload || {};

  validateCreateOrderFromCartInput({ userId, payload });

  const cartItems = await findCartItemsByUserId(userId);
  if (!cartItems.length) {
    throw makeError(400, "Cart is empty");
  }

  const orderItems = [];
  const stockItems = [];
  const cartItemIds = [];

  for (const item of cartItems) {
    const { productId, variantId, quantity, _id: cartItemId } = item;

    const [product, variant, inventory] = await Promise.all([
      findProductById(productId),
      findVariantById(variantId),
      findInventoryByVariantId(variantId),
    ]);

    if (!product) throw makeError(400, "Product not found");
    if (product.status !== "active")
      throw makeError(400, "Product not available");
    if (!variant) throw makeError(400, "Variant not found");
    if (String(variant.productId) !== String(productId)) {
      throw makeError(400, "Variant does not belong to this product");
    }
    if (!inventory) throw makeError(400, "Inventory not found");

    const realAvailable = getRealAvailable(inventory);
    if (realAvailable < quantity) {
      throw makeError(
        409,
        `Only ${realAvailable} items available, you requested ${quantity}`,
      );
    }

    const unitPrice = variant.price ?? product.salePrice ?? product.price;

    orderItems.push({
      productId,
      variantId,
      name: product.name,
      image: product.images?.[0] || "",
      size: variant.size,
      color: variant.color,
      quantity,
      price: unitPrice,
    });

    stockItems.push({ variantId, quantity });
    cartItemIds.push(cartItemId);
  }

  const { shippingFee, discount, totalPrice } = computeOrderPricing({
    orderItems,
    shippingAddress,
    couponCode,
  });

  const initialOrderStatus = "pending";
  const initialPaymentStatus = "pending";

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const reserved = await reserveStockForItems(stockItems, session);
    if (!reserved) throw makeError(409, "Insufficient stock");

    const orderPayload = {
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      status: initialOrderStatus,
      shippingFee,
      discount,
      totalPrice,
    };

    if (typeof note === "string" && note.trim()) {
      orderPayload.note = note.trim();
    }

    const order = await createOrderWithRetry({
      orderPayload,
      session,
      createOrderFn: createOrder,
    });

    const payment = await createPayment(
      {
        orderId: order._id,
        amount: order.totalPrice,
        method: paymentMethod,
        status: "pending",
      },
      session,
    );

    const paymentTransaction = await createPaymentTransaction(
      {
        paymentId: payment._id,
        orderId: order._id,
        amount: payment.amount,
        method: payment.method,
        status: "pending",
        attemptNo: 1,
      },
      session,
    );

    await deleteCartItemsByIds({ userId, ids: cartItemIds }, session);

    await session.commitTransaction();

    return {
      status: 201,
      body: { order, payment, paymentTransaction },
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
};

export const listOrdersService = async ({
  userId,
  query = {},
  canReadAllOrders = false,
}) => {
  const { status, page = 1, limit = 20, sort = "newest", userId: filterUserId } = query;

  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (safePage - 1) * safeLimit;
  const sortBy = ORDER_SORT_MAP[sort] || ORDER_SORT_MAP.newest;

  const filter = {};
  if (status) {
    if (!ORDER_STATUSES.includes(status)) {
      throw makeError(400, `status must be one of: ${ORDER_STATUSES.join(", ")}`);
    }
    filter.status = status;
  }

  if (canReadAllOrders) {
    if (filterUserId) {
      if (!mongoose.Types.ObjectId.isValid(filterUserId)) {
        throw makeError(400, "Invalid userId");
      }
      filter.userId = filterUserId;
    }
  } else {
    filter.userId = userId;
  }

  const [orders, total] = await Promise.all([
    findOrders({ filter, sort: sortBy, skip, limit: safeLimit }),
    countOrders(filter),
  ]);

  return {
    status: 200,
    body: {
      orders,
      meta: { page: safePage, limit: safeLimit, total },
    },
  };
};

export const getOrderByIdService = async ({
  orderId,
  userId,
  canReadAllOrders = false,
}) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw makeError(400, "Invalid order id");
  }

  const order = canReadAllOrders
    ? await findOrderById(orderId)
    : await findOrderByIdAndUserId({ id: orderId, userId });

  if (!order) throw makeError(404, "Order not found");

  return {
    status: 200,
    body: { order },
  };
};

export const updateOrderStatusService = async ({ orderId, nextStatus }) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw makeError(400, "Invalid order id");
  }

  const targetStatus = String(nextStatus || "").trim();
  if (!targetStatus) throw makeError(400, "status is required");
  if (!ORDER_STATUSES.includes(targetStatus)) {
    throw makeError(400, `status must be one of: ${ORDER_STATUSES.join(", ")}`);
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const order = await findOrderById(orderId);
    if (!order) throw makeError(404, "Order not found");

    const allowedNext = ORDER_STATUS_TRANSITIONS[order.status] || new Set();
    if (!allowedNext.has(targetStatus)) {
      throw makeError(400, `Cannot change order status from ${order.status} to ${targetStatus}`);
    }

    const stockItems = (order.items || []).map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    const paymentUpdate = {};
    const paymentTransactionUpdate = {};

    if (targetStatus === "cancelled") {
      const released = await releaseReservedForItems(stockItems, session);
      if (!released) throw makeError(409, "Unable to release reserved stock");

      paymentUpdate.status = "failed";
      paymentTransactionUpdate.status = "failed";
      paymentTransactionUpdate.failureReason = "Order cancelled";
      paymentTransactionUpdate.paidAt = null;
    }

    if (targetStatus === "delivered") {
      const committed = await commitReservedForItems(stockItems, session);
      if (!committed) throw makeError(409, "Unable to commit reserved stock");

      if (order.paymentMethod === "cod") {
        paymentUpdate.status = "paid";
        paymentTransactionUpdate.status = "paid";
        paymentTransactionUpdate.paidAt = new Date();
        paymentTransactionUpdate.failureReason = null;
      }
    }

    const orderUpdate = { status: targetStatus };
    if (targetStatus === "cancelled") {
      orderUpdate.paymentStatus = "failed";
    }
    if (targetStatus === "delivered" && order.paymentMethod === "cod") {
      orderUpdate.paymentStatus = "paid";
    }

    const updatedOrder = await updateOrderById(orderId, orderUpdate, session);

    let payment = null;
    if (Object.keys(paymentUpdate).length) {
      payment = await updatePaymentByOrderId(orderId, paymentUpdate, session);
    } else {
      payment = await findPaymentByOrderId(orderId, session);
    }

    let paymentTransaction = await findLatestPaymentTransactionByOrderId(orderId, session);
    if (paymentTransaction && Object.keys(paymentTransactionUpdate).length) {
      paymentTransaction = await updatePaymentTransactionById(
        paymentTransaction._id,
        paymentTransactionUpdate,
        session,
      );
    }

    await session.commitTransaction();

    return {
      status: 200,
      body: {
        message: "Order status updated",
        order: updatedOrder,
        payment,
        paymentTransaction,
      },
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
};
