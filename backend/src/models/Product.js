import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    description: { type: String, default: '' },
    images: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'draft' },
  },
  { timestamps: true, versionKey: false }
);

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ brandId: 1, status: 1 });
productSchema.index({ categoryId: 1, status: 1 });

export default mongoose.model('Product', productSchema);
