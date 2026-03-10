import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    productIds: { type: [mongoose.Schema.Types.ObjectId], ref: 'Product', default: [] },
  },
  { timestamps: true, versionKey: false }
);

wishlistSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model('Wishlist', wishlistSchema);
