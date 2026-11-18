import Wishlist from "../../models/Wishlist.js";

export const findWishlistByUserId = (userId) =>
  Wishlist.findOne({ userId }).populate({
    path: "items.productId productIds",
    select: "name slug images price salePrice status",
    transform: (product, id) => product ?? id,
  }).lean();

const restoreLegacyItems = (wishlist) => {
  if (!wishlist.items.length && wishlist.productIds.length) {
    wishlist.items = wishlist.productIds.map((productId) => ({ productId }));
  }
};

export const upsertWishlistPushItem = async ({ userId, productId }) => {
  const wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    return Wishlist.create({
      userId,
      items: [{ productId }],
      productIds: [productId],
    });
  }

  restoreLegacyItems(wishlist);
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

  restoreLegacyItems(wishlist);
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
