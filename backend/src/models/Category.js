import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true, versionKey: false }
);

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parentId: 1, status: 1 });

export default mongoose.model('Category', categorySchema);
