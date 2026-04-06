import { unauthorized } from "../../shared/errors/index.js";
import { asyncHandler } from "../../shared/http/asyncHandler.js";
import { sendResult } from "../../shared/http/sendResult.js";
import {
  createPaymentAttemptService,
  reconcileExpiredPendingVnpayTransactionsService,
  reconcileVnpayTransactionService,
  createVnpayCheckoutService,
  getPaymentByIdService,
  getPaymentTransactionByIdService,
  handleVnpayIpnService,
  handleVnpayReturnService,
  listPaymentTransactionsService,
  updatePaymentTransactionStatusService,
} from "./payment.service.js";

const canReadAllPayments = (permissions = new Set()) =>
  permissions.has("read:payment") ||
  permissions.has("write:payment");

export const getPaymentById = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();

  const result = await getPaymentByIdService({
    paymentId: req.params.id,
    userId,
    canReadAll: canReadAllPayments(req.userPermissions),
  });
  return sendResult(res, result);
});

export const createPaymentAttempt = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();

  const result = await createPaymentAttemptService({
    paymentId: req.params.paymentId,
    userId,
    canReadAll: canReadAllPayments(req.userPermissions),
    payload: req.body || {},
    actorId: userId,
  });
  return sendResult(res, result);
});

export const createVnpayCheckout = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();

  const forwardedFor = String(req.headers["x-forwarded-for"] || "");
  const clientIp = forwardedFor.split(",")[0]?.trim() || req.ip || "127.0.0.1";

  const result = await createVnpayCheckoutService({
    paymentId: req.params.paymentId,
    userId,
    canReadAll: canReadAllPayments(req.userPermissions),
    payload: {
      ...req.body,
      clientIp,
    },
    actorId: userId,
  });
  return sendResult(res, result);
});

export const listPaymentTransactions = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();

  const result = await listPaymentTransactionsService({
    paymentId: req.params.paymentId,
    userId,
    canReadAll: canReadAllPayments(req.userPermissions),
    query: req.query || {},
  });
  return sendResult(res, result);
});

export const getPaymentTransactionById = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw unauthorized();

  const result = await getPaymentTransactionByIdService({
    transactionId: req.params.id,
    userId,
    canReadAll: canReadAllPayments(req.userPermissions),
  });
  return sendResult(res, result);
});

export const updatePaymentTransactionStatus = asyncHandler(async (req, res) => {
  const result = await updatePaymentTransactionStatusService({
    transactionId: req.params.id,
    payload: req.body || {},
    source: "manual",
    actorId: req.user?._id || null,
  });
  return sendResult(res, result);
});

export const reconcileVnpayTransaction = asyncHandler(async (req, res) => {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "");
  const clientIp = forwardedFor.split(",")[0]?.trim() || req.ip || "127.0.0.1";

  const result = await reconcileVnpayTransactionService({
    transactionId: req.params.id,
    actorId: req.user?._id || null,
    clientIp,
  });
  return sendResult(res, result);
});

export const reconcileExpiredPendingVnpayTransactions = asyncHandler(async (req, res) => {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "");
  const clientIp = forwardedFor.split(",")[0]?.trim() || req.ip || "127.0.0.1";

  const result = await reconcileExpiredPendingVnpayTransactionsService({
    actorId: req.user?._id || null,
    clientIp,
    limit: req.body?.limit ?? req.query?.limit,
  });
  return sendResult(res, result);
});

export const vnpayReturn = asyncHandler(async (req, res) => {
  const result = await handleVnpayReturnService({ query: req.query || {} });
  if (result.status === 302 && result.body?.redirectUrl) {
    return res.redirect(result.body.redirectUrl);
  }
  return sendResult(res, result);
});

export const vnpayIpn = asyncHandler(async (req, res) => {
  const result = await handleVnpayIpnService({ query: req.query || {} });
  return sendResult(res, result);
});
