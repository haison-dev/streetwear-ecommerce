import { makeError } from "../../../shared/errors/index.js";

const notImplemented = () =>
  makeError(501, "MoMo provider strategy is not implemented yet", {
    code: "PAYMENT_PROVIDER_NOT_IMPLEMENTED",
  });

export const momoProvider = {
  name: "momo",
  buildCheckout() {
    throw notImplemented();
  },
  verifyCallback() {
    throw notImplemented();
  },
  classifyCallbackResult() {
    throw notImplemented();
  },
  async queryTransaction() {
    throw notImplemented();
  },
};
