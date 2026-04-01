import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    size: { type: String, required: true, enum: ['S', 'M', 'L', 'XL', 'XXL'] },
    color: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, min: 0 },
  },
  { timestamps: true, versionKey: false }
);

productVariantSchema.index({ productId: 1, size: 1, color: 1 }, { unique: true });

export default mongoose.model('ProductVariant', productVariantSchema);

