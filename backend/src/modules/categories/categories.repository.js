import Category from "../../models/Category.js";

export const findCategories = ({ filter, sortBy, skip, limit }) =>
  Category.find(filter).sort(sortBy).skip(skip).limit(limit).lean();

export const countCategories = (filter) => Category.countDocuments(filter);
export const findCategoryById = (id) => Category.findById(id).lean();
export const findCategoryBySlug = (slug) => Category.findOne({ slug }).lean();
export const createCategory = (payload) => Category.create(payload);
export const updateCategoryById = (id, payload) =>
  Category.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
export const deleteCategoryById = (id) => Category.deleteOne({ _id: id });

