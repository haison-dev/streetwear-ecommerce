import mongoose from "mongoose";
import { makeError } from "../../shared/errors/index.js";
import {
  getRealAvailable,
  reserveStockForItems,
} from "../../shared/utils/inventory.js";
import { createOrderWithRetry } from "./domain/order-number.js";
import { computeOrderPricing } from "./domain/order-pricing.js";
import { validateCreateOrderFromCartInput } from "./domain/order-validation.js";
import {
  createOrder,
  createPayment,
  createPaymentTransaction,
  deleteCartItemsByIds,
  findCartItemsByUserId,
  findInventoryByVariantId,
  findProductById,
  findVariantById,
} from "./order.repository.js";

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
