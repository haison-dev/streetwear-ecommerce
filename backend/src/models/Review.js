import mongoose from 'mongoose';
import Product from './Product.js';

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
  },
  { timestamps: true, versionKey: false }
);

reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

reviewSchema.statics.recalcProductRating = async function (productId) {
  if (!productId) return;
  const stats = await this.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (!stats.length) {
    await Product.updateOne({ _id: productId }, { $set: { rating: 0, reviewCount: 0 } });
    return;
  }
  const { avg, count } = stats[0];
  await Product.updateOne(
    { _id: productId },
    { $set: { rating: Number(avg.toFixed(2)), reviewCount: count } }
  );
};

const safeRecalc = (model, productId) => {
  void model.recalcProductRating(productId).catch(() => {});
};

reviewSchema.post('save', function (doc) {
  safeRecalc(doc.constructor, doc.productId);
});

reviewSchema.post('findOneAndUpdate', function (doc) {
  if (doc?.productId) {
    safeRecalc(doc.constructor, doc.productId);
    return;
  }
  const productId = this.getQuery()?.productId;
  if (productId) safeRecalc(this.model, productId);
});

reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc?.productId) safeRecalc(doc.constructor, doc.productId);
});

reviewSchema.post('findByIdAndDelete', function (doc) {
  if (doc?.productId) safeRecalc(doc.constructor, doc.productId);
});

reviewSchema.post('deleteOne', { document: true, query: false }, function (doc) {
  if (doc?.productId) safeRecalc(doc.constructor, doc.productId);
});

export default mongoose.model('Review', reviewSchema);
