import mongoose from "mongoose";
import { makeError } from "../../shared/errors/index.js";
import {
  countPaymentTransactionsByPaymentId,
  createPaymentAuditLog,
  createPaymentTransaction,
  findLatestPaymentTransactionByPaymentId,
  findOrderById,
  findPendingPaymentTransactionsBefore,
  findPaymentById,
  findPaymentTransactionById,
  findPaymentTransactionsByPaymentId,
  updateOrderById,
  updatePaymentById,
  updatePaymentTransactionById,
} from "./payment.repository.js";
import { getPaymentProviderStrategy } from "./providers/index.js";

const ONLINE_PAYMENT_METHODS = new Set(["momo", "vnpay"]);
const PAYMENT_STATUS_VALUES = new Set(["pending", "paid", "failed"]);
const FINAL_TRANSACTION_STATUSES = new Set(["paid", "failed"]);
const ALLOWED_TRANSACTION_STATUS_TRANSITIONS = {
  pending: new Set(["pending", "paid", "failed"]),
  paid: new Set(["paid"]),
  failed: new Set(["failed"]),
};
const DEFAULT_ATTEMPT_PENDING_TTL_MINUTES = 15;

const assertObjectId = (value, message) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw makeError(400, message);
  }
};

const ensurePaymentAccess = async ({ payment, userId, canReadAll }) => {
  if (!payment) throw makeError(404, "Payment not found");

  const order = await findOrderById(payment.orderId);
  if (!order) throw makeError(404, "Order not found");

  if (!canReadAll && String(order.userId) !== String(userId)) {
    throw makeError(404, "Payment not found");
  }

  return { order };
};

const getPendingAttemptTtlMinutes = () => {
  const raw = Number(process.env.PAYMENT_PENDING_ATTEMPT_TTL_MINUTES);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_ATTEMPT_PENDING_TTL_MINUTES;
  return Math.floor(raw);
};

const isAttemptExpired = (transaction, ttlMinutes) => {
  const createdAt = transaction?.createdAt
    ? new Date(transaction.createdAt).getTime()
    : NaN;
  if (!Number.isFinite(createdAt)) return false;
  const ageMs = Date.now() - createdAt;
  return ageMs >= ttlMinutes * 60 * 1000;
};

const logPaymentAuditSafe = async ({
  actorId = null,
  action,
  paymentId,
  paymentTransactionId = null,
  provider,
  oldStatus,
  newStatus,
  metadata,
  session = null,
}) => {
  try {
    await createPaymentAuditLog(
      {
        actorId,
        action,
        paymentId,
        paymentTransactionId,
        provider,
        oldStatus,
        newStatus,
        metadata,
      },
      session,
    );
  } catch (err) {
    console.error("payment audit log failed", err);
  }
};

export const getPaymentByIdService = async ({
  paymentId,
  userId,
  canReadAll = false,
}) => {
  assertObjectId(paymentId, "Invalid payment id");

  const payment = await findPaymentById(paymentId);
  const { order } = await ensurePaymentAccess({ payment, userId, canReadAll });
  const latestTransaction = await findLatestPaymentTransactionByPaymentId(paymentId);

  return {
    status: 200,
    body: {
      payment,
      orderId: order._id,
      latestTransaction,
    },
  };
};

export const createPaymentAttemptService = async ({
  paymentId,
  userId,
  canReadAll = false,
  payload = {},
  actorId = null,
}) => {
  assertObjectId(paymentId, "Invalid payment id");

  const payment = await findPaymentById(paymentId);
  const { order } = await ensurePaymentAccess({ payment, userId, canReadAll });

  if (payment.status !== "pending") {
    throw makeError(400, "Cannot create transaction attempt for non-pending payment");
  }

  const provider = String(payload.provider || payment.method || "")
    .trim()
    .toLowerCase();
  if (!ONLINE_PAYMENT_METHODS.has(provider)) {
    throw makeError(400, "provider must be one of: momo, vnpay", {
      code: "PAYMENT_PROVIDER_INVALID",
    });
  }
  if (payment.method !== provider) {
    throw makeError(400, `provider must match payment method: ${payment.method}`, {
      code: "PAYMENT_PROVIDER_MISMATCH",
    });
  }

  const latestTx = await findLatestPaymentTransactionByPaymentId(paymentId);
  if (latestTx && latestTx.status !== "failed") {
    if (latestTx.status === "pending") {
      const ttlMinutes = getPendingAttemptTtlMinutes();
      if (isAttemptExpired(latestTx, ttlMinutes)) {
        await updatePaymentTransactionById(latestTx._id, {
          status: "failed",
          failureReason: `Attempt expired after ${ttlMinutes} minutes`,
          paidAt: null,
        });
      } else {
        throw makeError(
          409,
          "Cannot create new attempt until the latest attempt is failed or expired",
          { code: "PAYMENT_ATTEMPT_NOT_ALLOWED" },
        );
      }
    } else {
      throw makeError(
        409,
        "Cannot create new attempt until the latest attempt is failed",
        { code: "PAYMENT_ATTEMPT_NOT_ALLOWED" },
      );
    }
  }

  const refreshedLatestTx = await findLatestPaymentTransactionByPaymentId(paymentId);
  const nextAttemptNo = Number(refreshedLatestTx?.attemptNo || 0) + 1;

  let paymentTransaction;
  try {
    paymentTransaction = await createPaymentTransaction({
      paymentId: payment._id,
      orderId: payment.orderId,
      amount: payment.amount,
      method: provider,
      status: "pending",
      attemptNo: nextAttemptNo,
    });
  } catch (err) {
    if (err?.code === 11000) {
      throw makeError(409, "Duplicate transaction attempt, please retry", {
        code: "PAYMENT_DUPLICATE_ATTEMPT",
      });
    }
    throw err;
  }

  await logPaymentAuditSafe({
    actorId: actorId || userId || null,
    action: "attempt_created",
    paymentId: payment._id,
    paymentTransactionId: paymentTransaction._id,
    provider,
    oldStatus: latestTx?.status || null,
    newStatus: "pending",
    metadata: {
      orderId: payment.orderId,
      attemptNo: paymentTransaction.attemptNo,
    },
  });

  return {
    status: 201,
    body: {
      payment,
      paymentTransaction,
      nextAction: {
        type: "gateway_pending",
        provider,
      },
      orderId: order._id,
    },
  };
};

export const createVnpayCheckoutService = async ({
  paymentId,
  userId,
  canReadAll = false,
  payload = {},
  actorId = null,
}) => {
  const provider = getPaymentProviderStrategy("vnpay");
  const attemptResult = await createPaymentAttemptService({
    paymentId,
    userId,
    canReadAll,
    payload: { ...payload, provider: "vnpay" },
    actorId,
  });
  const paymentTransaction = attemptResult.body.paymentTransaction;
  const payment = attemptResult.body.payment;
  const orderId = String(attemptResult.body.orderId);
  const { checkoutUrl } = provider.buildCheckout({
    payment,
    paymentTransaction,
    orderId,
    payload,
  });

  return {
    status: 201,
    body: {
      ...attemptResult.body,
      checkoutUrl,
      nextAction: {
        ...attemptResult.body.nextAction,
        checkoutUrl,
      },
    },
  };
};

export const listPaymentTransactionsService = async ({
  paymentId,
  userId,
  canReadAll = false,
  query = {},
}) => {
  assertObjectId(paymentId, "Invalid payment id");

  const payment = await findPaymentById(paymentId);
  await ensurePaymentAccess({ payment, userId, canReadAll });

  const safePage = Math.max(parseInt(query.page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (safePage - 1) * safeLimit;

  const [transactions, total] = await Promise.all([
    findPaymentTransactionsByPaymentId({ paymentId, skip, limit: safeLimit }),
    countPaymentTransactionsByPaymentId({ paymentId }),
  ]);

  return {
    status: 200,
    body: {
      paymentId,
      transactions,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
      },
    },
  };
};

export const getPaymentTransactionByIdService = async ({
  transactionId,
  userId,
  canReadAll = false,
}) => {
  assertObjectId(transactionId, "Invalid transaction id");

  const paymentTransaction = await findPaymentTransactionById(transactionId);
  if (!paymentTransaction) throw makeError(404, "Payment transaction not found");

  const payment = await findPaymentById(paymentTransaction.paymentId);
  if (!payment) throw makeError(404, "Payment not found");

  await ensurePaymentAccess({ payment, userId, canReadAll });

  return {
    status: 200,
    body: {
      payment,
      paymentTransaction,
    },
  };
};

export const updatePaymentTransactionStatusService = async ({
  transactionId,
  payload = {},
  actorId = null,
  source = "manual",
}) => {
  assertObjectId(transactionId, "Invalid transaction id");

  const targetStatus = String(payload.status || "")
    .trim()
    .toLowerCase();
  if (!PAYMENT_STATUS_VALUES.has(targetStatus)) {
    throw makeError(400, "status must be one of: pending, paid, failed");
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const paymentTransaction = await findPaymentTransactionById(transactionId, session);
    if (!paymentTransaction) throw makeError(404, "Payment transaction not found");

    const payment = await findPaymentById(paymentTransaction.paymentId, session);
    if (!payment) throw makeError(404, "Payment not found");

    const order = await findOrderById(payment.orderId, session);
    if (!order) throw makeError(404, "Order not found");

    const currentStatus = String(paymentTransaction.status || "").toLowerCase();
    const allowedTargets =
      ALLOWED_TRANSACTION_STATUS_TRANSITIONS[currentStatus] || new Set();
    if (!allowedTargets.has(targetStatus)) {
      throw makeError(
        409,
        `Cannot change payment transaction status from ${currentStatus} to ${targetStatus}`,
        { code: "PAYMENT_INVALID_STATUS_TRANSITION" },
      );
    }

    if (currentStatus === targetStatus && FINAL_TRANSACTION_STATUSES.has(currentStatus)) {
      await session.commitTransaction();
      return {
        status: 200,
        body: {
          message: "Idempotent callback ignored (already finalized)",
          payment,
          paymentTransaction,
          order,
          code: "PAYMENT_DUPLICATE_CALLBACK",
        },
      };
    }

    const latestPaymentTransaction = await findLatestPaymentTransactionByPaymentId(
      payment._id,
      session,
    );
    const isLatestAttempt =
      latestPaymentTransaction &&
      String(latestPaymentTransaction._id) === String(paymentTransaction._id);
    if (!isLatestAttempt && targetStatus !== currentStatus) {
      await session.commitTransaction();
      return {
        status: 200,
        body: {
          message: "Stale callback ignored (not latest attempt)",
          payment,
          paymentTransaction,
          order,
          code: "PAYMENT_STALE_CALLBACK",
        },
      };
    }

    const transactionUpdate = {
      status: targetStatus,
    };
    if (targetStatus === "paid") {
      transactionUpdate.paidAt = payload.paidAt ? new Date(payload.paidAt) : new Date();
      transactionUpdate.failureReason = null;
    }
    if (targetStatus === "failed") {
      transactionUpdate.failureReason = String(payload.failureReason || "Payment failed").trim();
      transactionUpdate.paidAt = null;
    }
    if (payload.providerTransactionId) {
      transactionUpdate.providerTransactionId = String(payload.providerTransactionId).trim();
    }
    if (payload.rawResponse !== undefined) {
      transactionUpdate.rawResponse = payload.rawResponse;
    }

    const updatedPaymentTransaction = await updatePaymentTransactionById(
      transactionId,
      transactionUpdate,
      session,
    );

    const paymentUpdate = { status: targetStatus };
    const updatedPayment = await updatePaymentById(payment._id, paymentUpdate, session);

    const orderUpdate = { paymentStatus: targetStatus };
    const updatedOrder = await updateOrderById(order._id, orderUpdate, session);

    await logPaymentAuditSafe({
      actorId,
      action: "transaction_status_updated",
      paymentId: payment._id,
      paymentTransactionId: paymentTransaction._id,
      provider: payment.method,
      oldStatus: currentStatus,
      newStatus: targetStatus,
      metadata: {
        source,
        providerTransactionId: transactionUpdate.providerTransactionId,
        failureReason: transactionUpdate.failureReason,
      },
      session,
    });

    await session.commitTransaction();

    return {
      status: 200,
      body: {
        message: "Payment transaction updated",
        payment: updatedPayment,
        paymentTransaction: updatedPaymentTransaction,
        order: updatedOrder,
      },
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
};

export const handleVnpayReturnService = async ({ query = {} }) => {
  const provider = getPaymentProviderStrategy("vnpay");
  const isValidSignature = provider.verifyCallback({ query });
  const classified = isValidSignature
    ? provider.classifyCallbackResult({ query }).status
    : "invalid_signature";

  const frontendBase =
    String(process.env.PAYMENT_RESULT_URL || "").trim() ||
    String(process.env.CLIENT_URL || "").trim();

  const status = classified === "paid" ? "success" : classified;

  const txnRef = String(query.vnp_TxnRef || "");
  const paymentRef = String(query.vnp_TransactionNo || "");

  if (!frontendBase) {
    return {
      status: 200,
      body: {
        status,
        txnRef,
        paymentRef,
      },
    };
  }

  const separator = frontendBase.includes("?") ? "&" : "?";
  const redirectUrl =
    `${frontendBase}${separator}` +
    `paymentStatus=${encodeURIComponent(status)}` +
    `&txnRef=${encodeURIComponent(txnRef)}` +
    `&provider=vnpay`;

  return {
    status: 302,
    body: {
      redirectUrl,
      status,
    },
  };
};

export const handleVnpayIpnService = async ({ query = {} }) => {
  const provider = getPaymentProviderStrategy("vnpay");
  const isValidSignature = provider.verifyCallback({ query });
  if (!isValidSignature) {
    return { status: 200, body: { RspCode: "97", Message: "Invalid checksum" } };
  }

  const txnRef = String(query.vnp_TxnRef || "").trim();
  if (!mongoose.Types.ObjectId.isValid(txnRef)) {
    return { status: 200, body: { RspCode: "01", Message: "Transaction not found" } };
  }

  const paymentTransaction = await findPaymentTransactionById(txnRef);
  if (!paymentTransaction) {
    return { status: 200, body: { RspCode: "01", Message: "Transaction not found" } };
  }

  const amount = Number(query.vnp_Amount || 0) / 100;
  if (!Number.isFinite(amount) || amount <= 0 || amount !== Number(paymentTransaction.amount)) {
    return { status: 200, body: { RspCode: "04", Message: "Invalid amount" } };
  }

  const providerResult = provider.classifyCallbackResult({ query });
  const classifiedStatus = providerResult.status;
  if (classifiedStatus === "pending") {
    return { status: 200, body: { RspCode: "00", Message: "Transaction pending" } };
  }
  let result;
  try {
    result = await updatePaymentTransactionStatusService({
      transactionId: txnRef,
      payload: {
        status: classifiedStatus,
        providerTransactionId: providerResult.providerTransactionId,
        failureReason: providerResult.failureReason,
        rawResponse: providerResult.rawResponse,
      },
      source: "vnpay_ipn",
      actorId: null,
    });
  } catch (err) {
    if (err?.status === 409 || err?.status === 404) {
      return { status: 200, body: { RspCode: "02", Message: "Order already confirmed" } };
    }
    throw err;
  }

  const msg = String(result?.body?.message || "").toLowerCase();
  const isIdempotentNoop =
    msg.includes("idempotent callback ignored") ||
    msg.includes("stale callback ignored");

  if (isIdempotentNoop) {
    return { status: 200, body: { RspCode: "02", Message: "Order already confirmed" } };
  }

  return { status: 200, body: { RspCode: "00", Message: "Confirm Success" } };
};

export const reconcileVnpayTransactionService = async ({
  transactionId,
  actorId,
  clientIp,
}) => {
  assertObjectId(transactionId, "Invalid transaction id");

  const paymentTransaction = await findPaymentTransactionById(transactionId);
  if (!paymentTransaction) throw makeError(404, "Payment transaction not found");

  if (String(paymentTransaction.method || "").toLowerCase() !== "vnpay") {
    throw makeError(400, "Only vnpay transaction can be reconciled here", {
      code: "PAYMENT_PROVIDER_MISMATCH",
    });
  }

  const provider = getPaymentProviderStrategy("vnpay");
  const providerResult = await provider.queryTransaction({
    paymentTransaction,
    clientIp,
  });

  if (providerResult.status === "pending") {
    await logPaymentAuditSafe({
      actorId,
      action: "reconcile_pending",
      paymentId: paymentTransaction.paymentId,
      paymentTransactionId: paymentTransaction._id,
      provider: "vnpay",
      oldStatus: paymentTransaction.status,
      newStatus: paymentTransaction.status,
      metadata: { providerResult },
    });
    return {
      status: 200,
      body: {
        message: "Reconcile completed: transaction is still pending",
        transactionId,
        providerResult,
      },
    };
  }

  const result = await updatePaymentTransactionStatusService({
    transactionId,
    payload: {
      status: providerResult.status,
      providerTransactionId: providerResult.providerTransactionId,
      failureReason: providerResult.failureReason,
      rawResponse: providerResult.rawResponse,
    },
    actorId,
    source: "vnpay_reconcile",
  });

  return {
    status: 200,
    body: {
      message: "Reconcile completed",
      transactionId,
      providerResult,
      result: result.body,
    },
  };
};

export const reconcileExpiredPendingVnpayTransactionsService = async ({
  actorId,
  clientIp,
  limit = 50,
}) => {
  const ttlMinutes = getPendingAttemptTtlMinutes();
  const beforeDate = new Date(Date.now() - ttlMinutes * 60 * 1000);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

  const pendingItems = await findPendingPaymentTransactionsBefore({
    beforeDate,
    method: "vnpay",
    limit: safeLimit,
  });

  const summary = {
    scanned: pendingItems.length,
    reconciled: 0,
    paid: 0,
    failed: 0,
    stillPending: 0,
    errors: 0,
  };

  for (const item of pendingItems) {
    try {
      const result = await reconcileVnpayTransactionService({
        transactionId: item._id,
        actorId,
        clientIp,
      });
      summary.reconciled += 1;
      const status = result?.body?.providerResult?.status;
      if (status === "paid") summary.paid += 1;
      else if (status === "failed") summary.failed += 1;
      else summary.stillPending += 1;
    } catch (err) {
      summary.errors += 1;
    }
  }

  return {
    status: 200,
    body: {
      message: "Pending VNPay reconcile job completed",
      beforeDate,
      ttlMinutes,
      summary,
    },
  };
};
