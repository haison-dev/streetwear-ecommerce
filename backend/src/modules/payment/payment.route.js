import { Router } from "express";
import {
  authorize,
  protectedRoute,
} from "../../shared/middleware/authMiddleware.js";
import {
  createPaymentAttempt,
  createVnpayCheckout,
  getPaymentById,
  getPaymentTransactionById,
  listAllPaymentTransactions,
  listPaymentTransactions,
  reconcileExpiredPendingVnpayTransactions,
  reconcileVnpayTransaction,
  vnpayIpn,
  vnpayReturn,
  updatePaymentTransactionStatus,
} from "./payment.controller.js";

const router = Router();

router.get("/vnpay/return", vnpayReturn);
router.get("/vnpay/ipn", vnpayIpn);

router.use(protectedRoute);

router.get("/transactions", authorize("payment", "read"), listAllPaymentTransactions);
router.get("/transactions/:id", getPaymentTransactionById);
router.patch(
  "/transactions/:id/status",
  authorize("payment", "write"),
  updatePaymentTransactionStatus,
);
router.post(
  "/transactions/:id/reconcile/vnpay",
  authorize("payment", "write"),
  reconcileVnpayTransaction,
);
router.post(
  "/reconcile/vnpay/pending-expired",
  authorize("payment", "write"),
  reconcileExpiredPendingVnpayTransactions,
);
router.get("/:id", getPaymentById);
router.post("/:paymentId/attempts", createPaymentAttempt);
router.post("/:paymentId/vnpay/checkout", createVnpayCheckout);
router.get("/:paymentId/transactions", listPaymentTransactions);

export default router;
