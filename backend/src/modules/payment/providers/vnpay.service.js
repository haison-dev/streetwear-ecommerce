import crypto from "node:crypto";
import { makeError } from "../../../shared/errors/index.js";
import {
  buildVnpayCheckoutUrl,
  classifyVnpayResult,
  resolveVnpayFailureReason,
  verifyVnpayChecksum,
} from "./vnpay.js";

const createDateFromDate = (dateInput) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    throw makeError(400, "Invalid transaction create date", {
      code: "PAYMENT_RECONCILE_INVALID_CREATE_DATE",
    });
  }
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mi = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
};

const randomRequestId = () =>
  `${Date.now()}${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`;

const hmacSha512 = (secret, data) =>
  crypto.createHmac("sha512", secret).update(data, "utf8").digest("hex");

const getConfig = () => {
  const tmnCode = String(process.env.VNPAY_TMN_CODE || "").trim();
  const hashSecret = String(process.env.VNPAY_HASH_SECRET || "").trim();
  const paymentUrl = String(process.env.VNPAY_PAYMENT_URL || "").trim();
  const returnUrl = String(process.env.VNPAY_RETURN_URL || "").trim();
  const ipnUrl = String(process.env.VNPAY_IPN_URL || "").trim();
  const apiUrl = String(process.env.VNPAY_API_URL || "").trim();

  if (!tmnCode || !hashSecret || !paymentUrl || !returnUrl || !ipnUrl) {
    throw makeError(500, "VNPay configuration is missing", {
      code: "PAYMENT_VNPAY_CONFIG_MISSING",
    });
  }

  return {
    tmnCode,
    hashSecret,
    paymentUrl,
    returnUrl,
    ipnUrl,
    apiUrl: apiUrl || "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  };
};

export const vnpayProvider = {
  name: "vnpay",
  buildCheckout({ paymentTransaction, payment, orderId, payload = {} }) {
    const { tmnCode, hashSecret, paymentUrl, returnUrl } = getConfig();
    const checkoutUrl = buildVnpayCheckoutUrl({
      paymentUrl,
      hashSecret,
      tmnCode,
      returnUrl,
      txnRef: String(paymentTransaction._id),
      amount: payment.amount,
      clientIp: payload.clientIp,
      bankCode: payload.bankCode,
      locale: payload.locale || "vn",
      orderInfo: `Order ${orderId} - attempt ${paymentTransaction.attemptNo}`,
    });
    return { checkoutUrl };
  },
  verifyCallback({ query = {} }) {
    const { hashSecret } = getConfig();
    return verifyVnpayChecksum({ query, hashSecret });
  },
  classifyCallbackResult({ query = {} }) {
    const status = classifyVnpayResult(query);
    return {
      status,
      failureReason: status === "failed" ? resolveVnpayFailureReason(query) : undefined,
      providerTransactionId: query.vnp_TransactionNo,
      rawResponse: query,
    };
  },
  async queryTransaction({ paymentTransaction, clientIp }) {
    const { tmnCode, hashSecret, apiUrl } = getConfig();
    const requestId = randomRequestId();
    const createDate = createDateFromDate(new Date());
    const txnRef = String(paymentTransaction._id);
    const transactionDate = createDateFromDate(paymentTransaction.createdAt);
    const ipAddr = clientIp || "127.0.0.1";
    const orderInfo = `Reconcile ${txnRef}`;

    const dataToSign = [
      requestId,
      "2.1.0",
      "querydr",
      tmnCode,
      txnRef,
      transactionDate,
      createDate,
      ipAddr,
      orderInfo,
    ].join("|");
    const secureHash = hmacSha512(hashSecret, dataToSign);

    const payload = {
      vnp_RequestId: requestId,
      vnp_Version: "2.1.0",
      vnp_Command: "querydr",
      vnp_TmnCode: tmnCode,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: orderInfo,
      vnp_TransactionDate: transactionDate,
      vnp_CreateDate: createDate,
      vnp_IpAddr: ipAddr,
      vnp_SecureHash: secureHash,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw makeError(502, "VNPay reconcile request failed", {
        code: "PAYMENT_VNPAY_RECONCILE_HTTP_FAILED",
        details: { status: response.status },
      });
    }

    const json = await response.json();
    const status = classifyVnpayResult({
      vnp_ResponseCode: json?.vnp_ResponseCode,
      vnp_TransactionStatus: json?.vnp_TransactionStatus,
    });

    return {
      provider: "vnpay",
      status,
      providerTransactionId: json?.vnp_TransactionNo,
      failureReason: status === "failed" ? resolveVnpayFailureReason(json) : undefined,
      rawResponse: json,
    };
  },
};
