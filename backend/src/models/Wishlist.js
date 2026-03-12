import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' },
  },
  { _id: false }
);

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    productIds: { type: [mongoose.Schema.Types.ObjectId], ref: 'Product', default: [] },
    items: { type: [wishlistItemSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

wishlistSchema.pre('validate', function (next) {
  if (!this.items?.length && this.productIds?.length) {
    this.items = this.productIds.map((productId) => ({ productId }));
  }
  if (this.items?.length) {
    const ids = new Set(this.items.map((item) => String(item.productId)));
    this.productIds = Array.from(ids).map((id) => new mongoose.Types.ObjectId(id));
  }
  next();
});

wishlistSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model('Wishlist', wishlistSchema);
