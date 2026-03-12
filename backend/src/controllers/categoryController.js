import mongoose from "mongoose";
import Category from "../models/Category.js";
import { normalizeString, slugify } from "../utils/normalize.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const listCategories = async (req, res) => {
  try {
    const { status, parentId, q, page = 1, limit = 20, sort = "name" } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (parentId) {
      if (!isObjectId(parentId)) return res.status(400).json({ message: "Invalid parentId" });
      filter.parentId = parentId;
    }
    const queryText = normalizeString(q);
    if (queryText) filter.name = { $regex: queryText, $options: "i" };

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const sortMap = {
      name: { name: 1 },
      "name:desc": { name: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
    };
    const sortBy = sortMap[sort] || sortMap.name;

    const [categories, total] = await Promise.all([
      Category.find(filter).sort(sortBy).skip(skip).limit(safeLimit).lean(),
      Category.countDocuments(filter),
    ]);

    return res.status(200).json({
      categories,
      meta: { page: safePage, limit: safeLimit, total },
    });
  } catch (error) {
    console.error("listCategories error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: "Invalid category id" });

    const category = await Category.findById(id).lean();
    if (!category) return res.status(404).json({ message: "Category not found" });
    return res.status(200).json({ category });
  } catch (error) {
    console.error("getCategoryById error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ message: "Slug is required" });

    const category = await Category.findOne({ slug }).lean();
    if (!category) return res.status(404).json({ message: "Category not found" });
    return res.status(200).json({ category });
  } catch (error) {
    console.error("getCategoryBySlug error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, parentId, status } = req.body || {};
    const cleanName = normalizeString(name);
    if (!cleanName) return res.status(400).json({ message: "Name is required" });

    let parent = undefined;
    if (parentId) {
      if (!isObjectId(parentId)) return res.status(400).json({ message: "Invalid parentId" });
      parent = parentId;
    }

    const finalSlug = slug ? slugify(slug) : slugify(cleanName);
    if (!finalSlug) return res.status(400).json({ message: "Slug is invalid" });

    const category = await Category.create({
      name: cleanName,
      slug: finalSlug,
      parentId: parent,
      status,
    });

    return res.status(201).json({ category });
  } catch (error) {
    console.error("createCategory error", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Slug already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, parentId, status } = req.body || {};
    if (!isObjectId(id)) return res.status(400).json({ message: "Invalid category id" });

    const update = {};
    if (typeof name === "string") update.name = normalizeString(name);
    if (typeof slug === "string") update.slug = slugify(slug);
    if (typeof status === "string") update.status = status;
    if (parentId !== undefined) {
      if (parentId && !isObjectId(parentId)) return res.status(400).json({ message: "Invalid parentId" });
      update.parentId = parentId || undefined;
    }

    if (!Object.keys(update).length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const category = await Category.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!category) return res.status(404).json({ message: "Category not found" });
    return res.status(200).json({ category });
  } catch (error) {
    console.error("updateCategory error", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Slug already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: "Invalid category id" });

    const result = await Category.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.sendStatus(204);
  } catch (error) {
    console.error("deleteCategory error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
