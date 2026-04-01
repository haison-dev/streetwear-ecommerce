import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true, unique: true },
    available: { type: Number, required: true, min: 0, default: 0 },
    reserved: { type: Number, required: true, min: 0, default: 0 },
    sold: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('Inventory', inventorySchema);

