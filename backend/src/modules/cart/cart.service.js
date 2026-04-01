import mongoose from "mongoose";
import {
createCartItem,
deleteCartItemByIdAndUser,
  findCartItemByIdAndUser,
  findCartItemByUserAndProductVariant,
  findCartItemsByUserId,
  findInventoriesByVariantIds,
  findInventoryByVariantId,
  findProductById,
  findVariantById,
  updateCartItemById,
} from "./cart.repository.js";
import { makeError } from "../../shared/errors/index.js";

const MAX_CART_QTY = 100;
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);



const parseQuantity = (value) => {
  const qty = parseInt(value, 10);
  if (isNaN(qty) || qty < 1 || qty > MAX_CART_QTY) return null;
  return qty;
};

const getEffectivePrice = (product, variant, fallback = 0) =>
  variant?.price ?? product?.salePrice ?? product?.price ?? fallback ?? 0;

const getRealAvailable = (inventory) =>
  Math.max(0, (inventory?.available || 0) - (inventory?.reserved || 0));

const loadDependencies = async ({ productId, variantId }) => {
  const [product, variant, inventory] = await Promise.all([
    findProductById(productId),
    findVariantById(variantId),
    findInventoryByVariantId(variantId),
  ]);
  return { product, variant, inventory };
};

export const addToCart = async ({ userId, productId, variantId, quantity }) => {
  if (!productId || !variantId || quantity === undefined) {
    throw makeError(400, "productId, variantId, quantity are required");
  }
  if (!isObjectId(productId)) throw makeError(400, "Invalid productId");
  if (!isObjectId(variantId)) throw makeError(400, "Invalid variantId");

  const qty = parseQuantity(quantity);
  if (!qty) throw makeError(400, `Quantity must be between 1 and ${MAX_CART_QTY}`);

  const { product, variant, inventory } = await loadDependencies({ productId, variantId });

  if (!product) throw makeError(404, "Product not found");
  if (product.status !== "active") throw makeError(400, "Product not available");
  if (!variant) throw makeError(404, "Variant not found");
  if (String(variant.productId) !== String(productId)) {
    throw makeError(400, "Variant does not belong to this product");
  }
  if (!inventory) throw makeError(400, "Inventory not found for this variant");

  const realAvailable = getRealAvailable(inventory);
  if (realAvailable < qty) {
    throw makeError(400, `Only ${realAvailable} items available, you requested ${qty}`);
  }

  const price = getEffectivePrice(product, variant);

  const existingCartItem = await findCartItemByUserAndProductVariant({
    userId,
    productId,
    variantId,
  });

  let cartItem;
  if (existingCartItem) {
    const newQuantity = existingCartItem.quantity + qty;
    if (realAvailable < newQuantity) {
      throw makeError(
        400,
        `Only ${realAvailable} items available, total would be ${newQuantity}`,
      );
    }
    cartItem = await updateCartItemById(existingCartItem._id, { quantity: newQuantity });
  } else {
    cartItem = await createCartItem({
      userId,
      productId,
      variantId,
      quantity: qty,
      price,
    });
  }

  return {
    status: existingCartItem ? 200 : 201,
    body: {
      message: existingCartItem ? "Cart updated" : "Item added to cart",
      cartItem,
    },
  };
};

export const getCart = async ({ userId }) => {
  const cartItems = await findCartItemsByUserId(userId);
  if (!cartItems.length) {
    return {
      status: 200,
      body: {
        items: [],
        summary: { totalItems: 0, subtotal: 0, invalidItems: 0 },
      },
    };
  }

  const variantIds = [
    ...new Set(
      cartItems
        .map((item) => item.variantId?._id || item.variantId)
        .filter(Boolean)
        .map((id) => String(id)),
    ),
  ];
  const inventories = await findInventoriesByVariantIds(variantIds);
  const inventoryMap = new Map(
    inventories.map((inventory) => [String(inventory.variantId), inventory]),
  );

  let totalItems = 0;
  let subtotal = 0;
  let invalidItems = 0;

  const items = cartItems.map((item) => {
    const product = item.productId;
    const variant = item.variantId;
    const quantity = item.quantity || 0;
    totalItems += quantity;

    const inventory = variant ? inventoryMap.get(String(variant._id || variant)) : null;
    const realAvailable = getRealAvailable(inventory);

    const exists = Boolean(product && variant);
    const isProductActive = product?.status === "active";
    const isVariantMatch = exists && String(variant.productId) === String(product._id);
    const isInStock = realAvailable >= quantity;
    const isAvailable = exists && isProductActive && isVariantMatch && isInStock;

    const unitPrice = getEffectivePrice(product, variant, item.price);
    const lineTotal = unitPrice * quantity;
    if (isAvailable) subtotal += lineTotal;
    else invalidItems += 1;

    return {
      _id: item._id,
      quantity,
      unitPrice,
      lineTotal,
      isAvailable,
      availableStock: realAvailable,
      product,
      variant,
    };
  });

  return {
    status: 200,
    body: {
      items,
      summary: { totalItems, subtotal, invalidItems },
    },
  };
};

export const updateCartItem = async ({ userId, cartItemId, quantity }) => {
  if (!isObjectId(cartItemId)) throw makeError(400, "Invalid cart item id");

  const qty = parseQuantity(quantity);
  if (!qty) throw makeError(400, `Quantity must be between 1 and ${MAX_CART_QTY}`);

  const cartItem = await findCartItemByIdAndUser({ id: cartItemId, userId });
  if (!cartItem) throw makeError(404, "Cart item not found");

  const { product, variant, inventory } = await loadDependencies({
    productId: cartItem.productId,
    variantId: cartItem.variantId,
  });

  if (!product) throw makeError(404, "Product not found");
  if (product.status !== "active") throw makeError(400, "Product not available");
  if (!variant) throw makeError(404, "Variant not found");
  if (String(variant.productId) !== String(cartItem.productId)) {
    throw makeError(400, "Variant does not belong to this product");
  }
  if (!inventory) throw makeError(400, "Inventory not found for this variant");

  const realAvailable = getRealAvailable(inventory);
  if (realAvailable < qty) {
    throw makeError(400, `Only ${realAvailable} items available, you requested ${qty}`);
  }

  cartItem.quantity = qty;
  cartItem.price = getEffectivePrice(product, variant, cartItem.price);
  await cartItem.save();

  return {
    status: 200,
    body: {
      message: "Cart item updated",
      cartItem,
    },
  };
};

export const removeCartItem = async ({ userId, cartItemId }) => {
  if (!isObjectId(cartItemId)) throw makeError(400, "Invalid cart item id");

  const result = await deleteCartItemByIdAndUser({ id: cartItemId, userId });
  if (result.deletedCount === 0) throw makeError(404, "Cart item not found");

  return {
    status: 204,
    body: null,
  };
};





