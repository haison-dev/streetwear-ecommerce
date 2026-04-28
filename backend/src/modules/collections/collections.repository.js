import Collection from "../../models/Collection.js";
import Product from "../../models/Product.js";

export const findCollections = ({ filter, sortBy, skip, limit }) =>
  Collection.find(filter).sort(sortBy).skip(skip).limit(limit).lean();

export const countCollections = (filter) => Collection.countDocuments(filter);

export const findCollectionBySlug = (slug) => Collection.findOne({ slug }).lean();

export const findProductsByCollectionFilter = ({ filter, sortBy, skip, limit }) =>
  Product.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .populate({ path: "brandId", select: "name slug logo" })
    .populate({ path: "categoryId", select: "name slug image" })
    .lean();

export const countProductsByCollectionFilter = (filter) => Product.countDocuments(filter);

