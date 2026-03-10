import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, trim: true },
    resource: { type: String, required: true, trim: true },
  },
  { timestamps: true, versionKey: false }
);

permissionSchema.index({ action: 1, resource: 1 }, { unique: true });

export default mongoose.model('Permission', permissionSchema);
