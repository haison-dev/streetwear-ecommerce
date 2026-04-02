import { makeError } from "../../../shared/errors/index.js";
import { ALLOW_PAYMENT_METHODS } from "../config/order-rules.js";

const REQUIRED_SHIPPING_FIELDS = [
  "name",
  "phone",
  "address",
  "city",
  "district",
  "ward",
];

export const validateCreateOrderFromCartInput = ({ userId, payload }) => {
  const { shippingAddress, paymentMethod } = payload || {};

  if (!userId) {
    throw makeError(400, "UserId must exist");
  }

  if (!shippingAddress || typeof shippingAddress !== "object") {
    throw makeError(400, "shippingAddress must exist");
  }

  for (const field of REQUIRED_SHIPPING_FIELDS) {
    const value = shippingAddress[field];
    if (typeof value !== "string" || !value.trim()) {
      throw makeError(400, `shippingAddress.${field} is required`);
    }
  }

  if (!ALLOW_PAYMENT_METHODS.includes(paymentMethod)) {
    throw makeError(400, "paymentMethod must be one of: cod, momo, vnpay");
  }
};
