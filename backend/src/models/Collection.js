import mongoose from "mongoose";

const collectionCriteriaSchema = new mongoose.Schema(
  {
    categoryIds: { type: [mongoose.Schema.Types.ObjectId], ref: "Category", default: [] },
    brandIds: { type: [mongoose.Schema.Types.ObjectId], ref: "Brand", default: [] },
    q: { type: String, trim: true, default: "" },
    minPrice: { type: Number, min: 0 },
    maxPrice: { type: Number, min: 0 },
    minRating: { type: Number, min: 0, max: 5 },
    sort: { type: String, trim: true, default: "newest" },
  },
  { _id: false },
);

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, trim: true, default: "" },
    heroImage: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    sortOrder: { type: Number, default: 0 },
    criteria: { type: collectionCriteriaSchema, default: () => ({}) },
  },
  { timestamps: true, versionKey: false },
);

collectionSchema.index({ slug: 1 }, { unique: true });
collectionSchema.index({ status: 1, sortOrder: 1, createdAt: -1 });

export default mongoose.model("Collection", collectionSchema);

