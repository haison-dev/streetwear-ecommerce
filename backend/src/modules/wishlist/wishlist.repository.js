import Wishlist from "../../models/Wishlist.js";

export const findWishlistByUserId = (userId) =>
  Wishlist.findOne({ userId }).populate("items.productId").lean();

export const upsertWishlistPushItem = async ({ userId, productId }) => {
  const wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    return Wishlist.create({
      userId,
      items: [{ productId }],
      productIds: [productId],
    });
  }

  const exists = wishlist.items.some(
    (item) => String(item.productId) === String(productId),
  );
  if (!exists) {
    wishlist.items.push({ productId });
    wishlist.productIds.push(productId);
    await wishlist.save();
  }

  return wishlist;
};

export const removeWishlistItem = async ({ userId, productId }) => {
  const wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) return false;

  const before = wishlist.items.length;
  wishlist.items = wishlist.items.filter(
    (item) => String(item.productId) !== String(productId),
  );
  wishlist.productIds = wishlist.productIds.filter(
    (id) => String(id) !== String(productId),
  );
  await wishlist.save();
  return wishlist.items.length < before;
};
