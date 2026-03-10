import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['cod', 'momo', 'vnpay'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    transactionId: { type: String, trim: true },
    paidAt: Date,
  },
  { timestamps: true, versionKey: false }
);

paymentSchema.index({ orderId: 1 }, { unique: true });
paymentSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
