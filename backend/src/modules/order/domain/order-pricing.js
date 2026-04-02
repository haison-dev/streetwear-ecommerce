import { makeError } from "../../../shared/errors/index.js";
import { COUPON_RULES, SHIPPING_RULES } from "../config/order-rules.js";

const normalizeText = (value) => String(value || "").trim().toLowerCase();

export const computeItemsPrice = (orderItems = []) =>
  orderItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

export const calculateShipping = (itemsPrice, shippingAddress = {}) => {
  const subtotal = Number(itemsPrice || 0);
  if (subtotal <= 0) return 0;
  if (subtotal >= SHIPPING_RULES.freeShippingThreshold) return 0;

  let fee = SHIPPING_RULES.baseFee;
  if (subtotal < SHIPPING_RULES.lowValueThreshold) {
    fee += SHIPPING_RULES.lowValueSurcharge;
  }

  const cityKey = normalizeText(shippingAddress.city);
  if (cityKey && !SHIPPING_RULES.metroCities.has(cityKey)) {
    fee += SHIPPING_RULES.nonMetroSurcharge;
  }

  return Math.max(0, Math.round(fee));
};

export const applyCoupon = (couponCode, itemsPrice) => {
  if (!couponCode) return 0;

  const normalizedCode = String(couponCode).trim().toUpperCase();
  if (!normalizedCode) return 0;

  const rule = COUPON_RULES.find((item) => item.code === normalizedCode);
  if (!rule) {
    throw makeError(400, "Invalid couponCode");
  }

  const subtotal = Number(itemsPrice || 0);
  if (subtotal < Number(rule.minOrder || 0)) {
    throw makeError(400, `Coupon ${rule.code} requires minimum order ${rule.minOrder}`);
  }

  let discount = 0;
  if (rule.type === "percent") {
    discount = Math.floor((subtotal * Number(rule.value || 0)) / 100);
    if (rule.maxDiscount) {
      discount = Math.min(discount, Number(rule.maxDiscount));
    }
  } else if (rule.type === "fixed") {
    discount = Number(rule.value || 0);
  }

  return Math.max(0, Math.min(discount, subtotal));
};

export const computeOrderPricing = ({ orderItems, shippingAddress, couponCode }) => {
  const itemsPrice = computeItemsPrice(orderItems);
  const shippingFee = calculateShipping(itemsPrice, shippingAddress);
  const discount = applyCoupon(couponCode, itemsPrice);
  const totalPrice = Math.max(0, itemsPrice + shippingFee - discount);

  return { itemsPrice, shippingFee, discount, totalPrice };
};
