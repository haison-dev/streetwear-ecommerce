import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ["cod", "momo", "vnpay"], required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    providerTransactionId: { type: String, trim: true },
    attemptNo: { type: Number, min: 1, default: 1 },
    paidAt: Date,
    failureReason: { type: String, trim: true },
    rawResponse: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true, versionKey: false },
);

paymentTransactionSchema.index({ paymentId: 1, attemptNo: 1 }, { unique: true });
paymentTransactionSchema.index({ providerTransactionId: 1 }, { sparse: true, unique: true });
paymentTransactionSchema.index({ orderId: 1, createdAt: -1 });

export default mongoose.model("PaymentTransaction", paymentTransactionSchema);
