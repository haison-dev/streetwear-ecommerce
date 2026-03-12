import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
  },
  { timestamps: true, versionKey: false }
);

roleSchema.index({ permissions: 1 });

export default mongoose.model('Role', roleSchema);
