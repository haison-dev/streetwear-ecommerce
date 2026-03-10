import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true, versionKey: false }
);

brandSchema.index({ slug: 1 }, { unique: true });
brandSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Brand', brandSchema);
