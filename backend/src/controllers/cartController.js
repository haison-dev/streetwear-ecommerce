import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import Inventory from "../models/Inventory.js";
import CartItem from "../models/CartItem.js";

export const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;

    if (!productId || !variantId || quantity === undefined) {
      return res
        .status(400)
        .json({ message: "productId, variantId, quantity are required" });
    }

    if (!isObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    if (!isObjectId(variantId)) {
      return res.status(400).json({ message: "Invalid variantId" });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 100) {
      return res
        .status(400)
        .json({ message: "Quantity must be between 1 and 100" });
    }

    const [product, variant] = await Promise.all([
      Product.findById(productId).select("price salePrice status"),
      ProductVariant.findById(variantId).select("productId sku stock"),
    ]);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.status !== "active") {
      return res.status(400).json({ message: "Product not available" });
    }

    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    if (String(variant.productId) !== String(productId)) {
      return res
        .status(400)
        .json({ message: "Variant does not belong to this product" });
    }

    //check inventory
    const inventory = await Inventory.findOne({ variantIId }).select(
      "available reserved",
    );

    if (!inventory) {
      return res
        .status(400)
        .json({ message: "Inventory not found for this variant" });
    }

    const realAvailable = inventory.available - inventory.reserved;
    if (realAvailable < qty) {
      return res.status(400).json({
        message: `Only ${realAvailable} items available, you requested ${qty}`,
      });
    }

    const price = variant.price || product.salePrice || product.price;

    const userId = req.user._id;

    const existingCartItem = await CartItem.findOne({
      userId,
      productId,
      variantId,
    });

    let cartItem;

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + qty;
      if (realAvailable < newQuantity) {
        return res.status(400).json({
          message: `Only ${realAvailable} items available, total would be ${newQuantity}`,
        });
      }

      cartItem = await CartItem.findByIdAndUpdate(
        existingCartItem._id,
        { quantity: newQuantity },
        { new: true },
      );
    } else {
      cartItem = await CartItem.create({
        userId,
        productId,
        variantId,
        quantity: qty,
        price,
      });
    }

    return res.status(existingCartItem ? 200 : 201).json({
      message: existingCartItem ? "Cart updated" : "Item added to cart",
      cartItem,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Product is already in your cart",
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
