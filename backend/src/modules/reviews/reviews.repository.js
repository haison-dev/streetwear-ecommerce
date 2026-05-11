import Review from "../../models/Review.js";

export const findReviewsByProductId = ({ productId, skip, limit, sort }) =>
  Review.find({ productId })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate({ path: "userId", select: "displayName email" })
    .lean();

export const countReviewsByProductId = (productId) =>
  Review.countDocuments({ productId });

export const upsertReview = ({ userId, productId, rating, comment }) =>
  Review.findOneAndUpdate(
    { userId, productId },
    { rating, comment },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  );

export const deleteReviewById = (id) => Review.findByIdAndDelete(id);
