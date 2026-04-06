import crypto from "node:crypto";

const VNPAY_DATE_TIME_REGEX = /^\d{14}$/;

const encodeValue = (value) =>
  encodeURIComponent(String(value)).replace(/%20/g, "+");

const buildSignedData = (params = {}) =>
  Object.keys(params)
    .filter((key) => {
      const value = params[key];
      return value !== undefined && value !== null && value !== "";
    })
    .sort()
    .map((key) => `${encodeValue(key)}=${encodeValue(params[key])}`)
    .join("&");

const hmacSha512 = (secret, data) =>
  crypto.createHmac("sha512", secret).update(data, "utf8").digest("hex");

const getVnpayDateTime = () => {
  const now = new Date();
  const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const yyyy = vnNow.getUTCFullYear();
  const mm = String(vnNow.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(vnNow.getUTCDate()).padStart(2, "0");
  const hh = String(vnNow.getUTCHours()).padStart(2, "0");
  const mi = String(vnNow.getUTCMinutes()).padStart(2, "0");
  const ss = String(vnNow.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
};

export const buildVnpayCheckoutUrl = ({
  paymentUrl,
  hashSecret,
  tmnCode,
  returnUrl,
  txnRef,
  amount,
  clientIp,
  orderInfo,
  locale = "vn",
  orderType = "other",
  bankCode,
}) => {
  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: Math.round(Number(amount || 0) * 100),
    vnp_CreateDate: getVnpayDateTime(),
    vnp_CurrCode: "VND",
    vnp_IpAddr: clientIp || "127.0.0.1",
    vnp_Locale: locale,
    vnp_OrderInfo: orderInfo || `Payment for ${txnRef}`,
    vnp_OrderType: orderType,
    vnp_ReturnUrl: returnUrl,
    vnp_TxnRef: txnRef,
  };

  if (bankCode) {
    vnpParams.vnp_BankCode = bankCode;
  }

  const signData = buildSignedData(vnpParams);
  const secureHash = hmacSha512(hashSecret, signData);
  const query = `${signData}&vnp_SecureHash=${secureHash}`;
  return `${paymentUrl}?${query}`;
};

export const verifyVnpayChecksum = ({ query = {}, hashSecret }) => {
  const secureHash = String(query.vnp_SecureHash || "");
  if (!secureHash) return false;

  const cloned = { ...query };
  delete cloned.vnp_SecureHash;
  delete cloned.vnp_SecureHashType;

  const signData = buildSignedData(cloned);
  const expected = hmacSha512(hashSecret, signData);
  return secureHash.toLowerCase() === expected.toLowerCase();
};

export const isVnpaySuccessResponse = (query = {}) =>
  String(query.vnp_ResponseCode || "") === "00" &&
  String(query.vnp_TransactionStatus || "") === "00";

const FINAL_FAILURE_TRANSACTION_STATUSES = new Set(["02", "07", "09"]);
const NON_FINAL_TRANSACTION_STATUSES = new Set(["01", "04", "05", "06"]);
const FINAL_FAILURE_RESPONSE_CODES = new Set([
  "07",
  "09",
  "10",
  "11",
  "12",
  "13",
  "24",
  "51",
  "65",
  "75",
  "79",
  "99",
]);

export const classifyVnpayResult = (query = {}) => {
  if (isVnpaySuccessResponse(query)) return "paid";

  const transactionStatus = String(query.vnp_TransactionStatus || "").trim();
  const responseCode = String(query.vnp_ResponseCode || "").trim();

  if (NON_FINAL_TRANSACTION_STATUSES.has(transactionStatus)) {
    return "pending";
  }
  if (FINAL_FAILURE_TRANSACTION_STATUSES.has(transactionStatus)) {
    return "failed";
  }

  if (responseCode === "00" && !transactionStatus) {
    return "pending";
  }
  if (FINAL_FAILURE_RESPONSE_CODES.has(responseCode)) {
    return "failed";
  }

  return "pending";
};

export const resolveVnpayFailureReason = (query = {}) => {
  const responseCode = String(query.vnp_ResponseCode || "");
  const transactionStatus = String(query.vnp_TransactionStatus || "");
  return `VNPay failed (responseCode=${responseCode}, transactionStatus=${transactionStatus})`;
};

export const isValidVnpayDateTime = (value) =>
  typeof value === "string" && VNPAY_DATE_TIME_REGEX.test(value);
