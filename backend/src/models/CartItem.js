import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, versionKey: false }
);

cartItemSchema.index({ userId: 1, productId: 1, variantId: 1 }, { unique: true });

export default mongoose.model('CartItem', cartItemSchema);

