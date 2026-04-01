import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    displayName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
    addresses: [
      {
        name: { type: String, trim: true },
        phone: { type: String, trim: true },
        address: { type: String, trim: true },
        city: { type: String, trim: true },
        district: { type: String, trim: true },
        ward: { type: String, trim: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

userSchema.index({ roles: 1 });

export default mongoose.model('User', userSchema);

