import Brand from "../../models/Brand.js";

export const findBrands = ({ filter, sortBy, skip, limit }) =>
  Brand.find(filter).sort(sortBy).skip(skip).limit(limit).lean();

export const countBrands = (filter) => Brand.countDocuments(filter);
export const findBrandById = (id) => Brand.findById(id).lean();
export const findBrandBySlug = (slug) => Brand.findOne({ slug }).lean();
export const createBrand = (payload) => Brand.create(payload);
export const updateBrandById = (id, payload) =>
  Brand.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
export const deleteBrandById = (id) => Brand.deleteOne({ _id: id });

