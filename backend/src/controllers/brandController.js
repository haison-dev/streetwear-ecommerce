import mongoose from "mongoose";
import Brand from "../models/Brand.js";
import { normalizeString, slugify } from "../utils/normalize.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const listBrands = async (req, res) => {
  try {
    const { status, q, page = 1, limit = 20, sort = "name" } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;
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

    const [brands, total] = await Promise.all([
      Brand.find(filter).sort(sortBy).skip(skip).limit(safeLimit).lean(),
      Brand.countDocuments(filter),
    ]);

    return res.status(200).json({
      brands,
      meta: { page: safePage, limit: safeLimit, total },
    });
  } catch (error) {
    console.error("listBrands error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: "Invalid brand id" });

    const brand = await Brand.findById(id).lean();
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    return res.status(200).json({ brand });
  } catch (error) {
    console.error("getBrandById error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getBrandBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ message: "Slug is required" });

    const brand = await Brand.findOne({ slug }).lean();
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    return res.status(200).json({ brand });
  } catch (error) {
    console.error("getBrandBySlug error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createBrand = async (req, res) => {
  try {
    const { name, slug, logo, status } = req.body || {};
    const cleanName = normalizeString(name);
    if (!cleanName) return res.status(400).json({ message: "Name is required" });

    const finalSlug = slug ? slugify(slug) : slugify(cleanName);
    if (!finalSlug) return res.status(400).json({ message: "Slug is invalid" });

    const brand = await Brand.create({
      name: cleanName,
      slug: finalSlug,
      logo: typeof logo === "string" ? normalizeString(logo) : undefined,
      status,
    });

    return res.status(201).json({ brand });
  } catch (error) {
    console.error("createBrand error", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Brand name or slug already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, logo, status } = req.body || {};
    if (!isObjectId(id)) return res.status(400).json({ message: "Invalid brand id" });

    const update = {};
    if (typeof name === "string") update.name = normalizeString(name);
    if (typeof slug === "string") update.slug = slugify(slug);
    if (typeof logo === "string") update.logo = normalizeString(logo);
    if (typeof status === "string") update.status = status;

    if (!Object.keys(update).length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const brand = await Brand.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!brand) return res.status(404).json({ message: "Brand not found" });
    return res.status(200).json({ brand });
  } catch (error) {
    console.error("updateBrand error", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Brand name or slug already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: "Invalid brand id" });

    const result = await Brand.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Brand not found" });
    }
    return res.sendStatus(204);
  } catch (error) {
    console.error("deleteBrand error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
