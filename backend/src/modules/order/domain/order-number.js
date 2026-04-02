import { makeError } from "../../../shared/errors/index.js";
import { MAX_ORDER_NUMBER_RETRIES } from "../config/order-rules.js";

export const generateOrderNumber = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rnd = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `ORD-${yyyy}${mm}${dd}-${rnd}`;
};

const isDuplicateOrderNumberError = (err) => {
  if (!err || err.code !== 11000) return false;
  if (err.keyPattern?.orderNumber) return true;
  return String(err.message || "").includes("orderNumber");
};

export const createOrderWithRetry = async ({
  orderPayload,
  session,
  createOrderFn,
  maxRetries = MAX_ORDER_NUMBER_RETRIES,
}) => {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await createOrderFn(
        {
          ...orderPayload,
          orderNumber: generateOrderNumber(),
        },
        session,
      );
    } catch (err) {
      if (isDuplicateOrderNumberError(err) && attempt < maxRetries) {
        continue;
      }
      throw err;
    }
  }

  throw makeError(500, "Unable to generate unique order number");
};
