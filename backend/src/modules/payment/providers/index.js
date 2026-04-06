import { makeError } from "../../../shared/errors/index.js";
import { momoProvider } from "./momo.service.js";
import { vnpayProvider } from "./vnpay.service.js";

const providers = new Map([
  ["vnpay", vnpayProvider],
  ["momo", momoProvider],
]);

export const getPaymentProviderStrategy = (providerName) => {
  const key = String(providerName || "").trim().toLowerCase();
  const provider = providers.get(key);
  if (!provider) {
    throw makeError(400, `Unsupported payment provider: ${providerName}`, {
      code: "PAYMENT_PROVIDER_UNSUPPORTED",
    });
  }
  return provider;
};
