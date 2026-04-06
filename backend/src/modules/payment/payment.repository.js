import Order from "../../models/Order.js";
import PaymentAuditLog from "../../models/PaymentAuditLog.js";
import Payment from "../../models/Payment.js";
import PaymentTransaction from "../../models/PaymentTransaction.js";

export const findOrderById = (id, session = null) =>
  Order.findById(id, null, session ? { session } : undefined);

export const updateOrderById = (id, payload, session = null) =>
  Order.findByIdAndUpdate(id, payload, {
    new: true,
    ...(session ? { session } : {}),
  });

export const findPaymentById = (id, session = null) =>
  Payment.findById(id, null, session ? { session } : undefined);

export const updatePaymentById = (id, payload, session = null) =>
  Payment.findByIdAndUpdate(id, payload, {
    new: true,
    ...(session ? { session } : {}),
  });

export const findPaymentTransactionById = (id, session = null) =>
  PaymentTransaction.findById(id, null, session ? { session } : undefined);

export const findLatestPaymentTransactionByPaymentId = (paymentId, session = null) =>
  PaymentTransaction.findOne(
    { paymentId },
    null,
    session ? { session } : undefined,
  ).sort({ attemptNo: -1, createdAt: -1 });

export const createPaymentTransaction = async (payload, session = null) => {
  const [transaction] = await PaymentTransaction.create(
    [payload],
    session ? { session } : undefined,
  );
  return transaction;
};

export const findPaymentTransactionsByPaymentId = ({
  paymentId,
  skip = 0,
  limit = 20,
  session = null,
}) =>
  PaymentTransaction.find(
    { paymentId },
    null,
    session ? { session } : undefined,
  )
    .sort({ attemptNo: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

export const countPaymentTransactionsByPaymentId = ({ paymentId, session = null }) =>
  PaymentTransaction.countDocuments(
    { paymentId },
    session ? { session } : undefined,
  );

export const updatePaymentTransactionById = (id, payload, session = null) =>
  PaymentTransaction.findByIdAndUpdate(id, payload, {
    new: true,
    ...(session ? { session } : {}),
  });

export const createPaymentAuditLog = (payload, session = null) =>
  PaymentAuditLog.create([payload], session ? { session } : undefined).then(
    (docs) => docs[0],
  );

export const findPendingPaymentTransactionsBefore = ({
  beforeDate,
  method,
  limit = 50,
}) =>
  PaymentTransaction.find({
    status: "pending",
    method,
    createdAt: { $lte: beforeDate },
  })
    .sort({ createdAt: 1 })
    .limit(limit);
