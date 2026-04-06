import mongoose from "mongoose";

const paymentAuditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    action: { type: String, required: true, trim: true, index: true },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },
    paymentTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentTransaction",
      index: true,
    },
    provider: { type: String, trim: true, index: true },
    oldStatus: { type: String, trim: true },
    newStatus: { type: String, trim: true },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true, versionKey: false },
);

paymentAuditLogSchema.index({ paymentId: 1, createdAt: -1 });
paymentAuditLogSchema.index({ paymentTransactionId: 1, createdAt: -1 });

export default mongoose.model("PaymentAuditLog", paymentAuditLogSchema);
