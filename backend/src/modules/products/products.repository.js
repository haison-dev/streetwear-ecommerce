import Product from "../../models/Product.js";
import ProductVariant from "../../models/ProductVariant.js";
import Inventory from "../../models/Inventory.js";

export const findProducts = ({ filter, sortBy, skip, limit }) =>
  Product.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .populate({ path: "brandId", select: "name slug logo" })
    .populate({ path: "categoryId", select: "name slug image" })
    .lean();

export const countProducts = (filter) => Product.countDocuments(filter);

export const findProductById = (id) =>
  Product.findById(id)
    .populate({ path: "brandId", select: "name slug logo" })
    .populate({ path: "categoryId", select: "name slug image" })
    .lean();

export const findProductBySlug = (slug) =>
  Product.findOne({ slug })
    .populate({ path: "brandId", select: "name slug logo" })
    .populate({ path: "categoryId", select: "name slug image" })
    .lean();

export const findVariantsByProductId = (productId) => ProductVariant.find({ productId }).lean();
export const findInventoriesByVariantIds = (variantIds) => Inventory.find({ variantId: { $in: variantIds } }).lean();

export const aggregateProductFilterStats = (filter) =>
  Product.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        minRating: { $min: "$rating" },
        maxRating: { $max: "$rating" },
      },
    },
  ]);

export const createProduct = (payload) => Product.create(payload);
export const updateProductById = (id, payload) =>
  Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
export const deleteProductById = (id) => Product.deleteOne({ _id: id });

