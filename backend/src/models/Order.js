import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    size: { type: String, trim: true },
    color: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const computeItemsPrice = (items = []) =>
  items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: { type: [orderItemSchema], default: [] },
    itemsPrice: { type: Number, required: true, min: 0, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["cod", "momo", "vnpay"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      district: { type: String, trim: true },
      ward: { type: String, trim: true },
    },
    note: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true, versionKey: false },
);

orderSchema.pre("validate", function () {
  const itemsPrice = computeItemsPrice(this.items);
  this.itemsPrice = Math.max(0, itemsPrice);
  const shippingFee = Number(this.shippingFee || 0);
  const discount = Number(this.discount || 0);
  this.totalPrice = Math.max(0, this.itemsPrice + shippingFee - discount);
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
