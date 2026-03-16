import mongoose from "mongoose";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import Inventory from "../models/Inventory.js";
import { normalizeString, slugify, toNumber } from "../utils/normalize.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const listProducts = async (req, res) => {
  try {
    const {
      q,
      categoryId,
      brandId,
      status = "active",
      minPrice,
      maxPrice,
      minRating,
      page = 1,
      limit = 20,
      sort = "newest",
    } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    const queryText = normalizeString(q);
    if (queryText) filter.name = { $regex: queryText, $options: "i" };
    if (categoryId) {
      if (!isObjectId(categoryId)) return res.status(400).json({ message: "Invalid categoryId" });
      filter.categoryId = categoryId;
    }
    if (brandId) {
      if (!isObjectId(brandId)) return res.status(400).json({ message: "Invalid brandId" });
      filter.brandId = brandId;
    }
    const min = toNumber(minPrice);
    const max = toNumber(maxPrice);
    if (minPrice !== undefined && min === undefined) {
      return res.status(400).json({ message: "Invalid minPrice" });
    }
    if (maxPrice !== undefined && max === undefined) {
      return res.status(400).json({ message: "Invalid maxPrice" });
    }
    if (min !== undefined || max !== undefined) {
      filter.price = {};
      if (min !== undefined) filter.price.$gte = min;
      if (max !== undefined) filter.price.$lte = max;
    }
    const minR = toNumber(minRating);
    if (minRating !== undefined && minR === undefined) {
      return res.status(400).json({ message: "Invalid minRating" });
    }
    if (minR !== undefined) {
      filter.rating = { $gte: minR };
    }

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price: { price: 1 },
      "price:desc": { price: -1 },
      rating: { rating: -1 },
      name: { name: 1 },
      "name:desc": { name: -1 },
    };
    const sortBy = sortMap[sort] || sortMap.newest;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(safeLimit)
        .populate({ path: "brandId", select: "name slug logo" })
        .populate({ path: "categoryId", select: "name slug image" })
        .lean(),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      products,
      meta: { page: safePage, limit: safeLimit, total },
    });
  } catch (error) {
    console.error("listProducts error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: "Invalid product id" });

    const product = await Product.findById(id)
      .populate({ path: "brandId", select: "name slug logo" })
      .populate({ path: "categoryId", select: "name slug image" })
      .lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const variants = await ProductVariant.find({ productId: product._id }).lean();
    const variantIds = variants.map((variant) => variant._id);
    const inventories = await Inventory.find({ variantId: { $in: variantIds } }).lean();
    const inventoryMap = new Map(inventories.map((inv) => [String(inv.variantId), inv]));

    const variantsWithStock = variants.map((variant) => {
      const inv = inventoryMap.get(String(variant._id));
      return {
        ...variant,
        inventory: inv
          ? { available: inv.available, reserved: inv.reserved, sold: inv.sold }
          : { available: 0, reserved: 0, sold: 0 },
      };
    });

    return res.status(200).json({ product: { ...product, variants: variantsWithStock } });
  } catch (error) {
    console.error("getProductById error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ message: "Slug is required" });

    const product = await Product.findOne({ slug })
      .populate({ path: "brandId", select: "name slug logo" })
      .populate({ path: "categoryId", select: "name slug image" })
      .lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const variants = await ProductVariant.find({ productId: product._id }).lean();
    const variantIds = variants.map((variant) => variant._id);
    const inventories = await Inventory.find({ variantId: { $in: variantIds } }).lean();
    const inventoryMap = new Map(inventories.map((inv) => [String(inv.variantId), inv]));

    const variantsWithStock = variants.map((variant) => {
      const inv = inventoryMap.get(String(variant._id));
      return {
        ...variant,
        inventory: inv
          ? { available: inv.available, reserved: inv.reserved, sold: inv.sold }
          : { available: 0, reserved: 0, sold: 0 },
      };
    });

    return res.status(200).json({ product: { ...product, variants: variantsWithStock } });
  } catch (error) {
    console.error("getProductBySlug error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductFilterStats = async (req, res) => {
  try {
    const { categoryId, brandId, status = "active", q } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    const queryText = normalizeString(q);
    if (queryText) filter.name = { $regex: queryText, $options: "i" };
    if (categoryId) {
      if (!isObjectId(categoryId)) return res.status(400).json({ message: "Invalid categoryId" });
      filter.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    if (brandId) {
      if (!isObjectId(brandId)) return res.status(400).json({ message: "Invalid brandId" });
      filter.brandId = new mongoose.Types.ObjectId(brandId);
    }

    const stats = await Product.aggregate([
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

    const result = stats[0] || { minPrice: 0, maxPrice: 0, minRating: 0, maxRating: 0 };
    return res.status(200).json({ stats: result });
  } catch (error) {
    console.error("getProductFilterStats error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      brandId,
      categoryId,
      description,
      images,
      price,
      salePrice,
      status,
    } = req.body || {};

    const cleanName = normalizeString(name);
    if (!cleanName || !brandId || !categoryId || price === undefined) {
      return res
        .status(400)
        .json({ message: "name, brandId, categoryId, and price are required" });
    }
    if (!isObjectId(brandId)) return res.status(400).json({ message: "Invalid brandId" });
    if (!isObjectId(categoryId)) return res.status(400).json({ message: "Invalid categoryId" });

    const finalSlug = slug ? slugify(slug) : slugify(cleanName);
    if (!finalSlug) return res.status(400).json({ message: "Slug is invalid" });

    const product = await Product.create({
      name: cleanName,
      slug: finalSlug,
      brandId,
      categoryId,
      description: typeof description === "string" ? normalizeString(description) : "",
      images: Array.isArray(images) ? images : [],
      price,
      salePrice,
      status,
    });

    return res.status(201).json({ product });
  } catch (error) {
    console.error("createProduct error", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Slug already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      brandId,
      categoryId,
      description,
      images,
      price,
      salePrice,
      status,
    } = req.body || {};
    if (!isObjectId(id)) return res.status(400).json({ message: "Invalid product id" });

    const update = {};
    if (typeof name === "string") update.name = normalizeString(name);
    if (typeof slug === "string") update.slug = slugify(slug);
    if (typeof description === "string") update.description = normalizeString(description);
    if (Array.isArray(images)) update.images = images;
    if (price !== undefined) update.price = price;
    if (salePrice !== undefined) update.salePrice = salePrice;
    if (typeof status === "string") update.status = status;
    if (brandId !== undefined) {
      if (brandId && !isObjectId(brandId)) return res.status(400).json({ message: "Invalid brandId" });
      update.brandId = brandId;
    }
    if (categoryId !== undefined) {
      if (categoryId && !isObjectId(categoryId)) {
        return res.status(400).json({ message: "Invalid categoryId" });
      }
      update.categoryId = categoryId;
    }

    if (!Object.keys(update).length) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const product = await Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ product });
  } catch (error) {
    console.error("updateProduct error", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Slug already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: "Invalid product id" });

    const result = await Product.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.sendStatus(204);
  } catch (error) {
    console.error("deleteProduct error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
