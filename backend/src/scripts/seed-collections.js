import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../libs/db.js";
import Brand from "../models/Brand.js";
import Category from "../models/Category.js";
import Collection from "../models/Collection.js";

dotenv.config();

const BASE_COLLECTIONS = [
  {
    name: "All Products",
    slug: "all-products",
    description: "Browse all active products.",
    sortOrder: 1,
    criteria: { sort: "newest" },
  },
  {
    name: "Vinyls",
    slug: "vinyls",
    description: "Music records and related merchandise.",
    sortOrder: 10,
    categoryKeywords: ["vinyl", "music"],
    queryKeywords: ["vinyl"],
  },
  {
    name: "Hoodies & Sweatshirts",
    slug: "hoodies-sweatshirts",
    description: "Hoodies and sweatshirts collection.",
    sortOrder: 20,
    categoryKeywords: ["hoodie", "sweatshirt"],
    queryKeywords: ["hoodie"],
  },
  {
    name: "CROWNLINE Private Label",
    slug: "crownline-private-label",
    description: "Core products under private label.",
    sortOrder: 30,
    brandKeywords: ["crownline", "private-label", "basicwear"],
  },
  {
    name: "2025 All-Star Collection",
    slug: "2025-all-star-collection",
    description: "Seasonal all-star campaign collection.",
    sortOrder: 40,
    queryKeywords: ["all-star", "2025"],
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Accessories collection.",
    sortOrder: 50,
    categoryKeywords: ["accessories"],
  },
];

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const matchesAnyKeyword = (text, keywords = []) => {
  const normalizedText = normalize(text);
  return keywords.some((keyword) => normalizedText.includes(normalize(keyword)));
};

const pickCategoryIds = ({ activeCategories, keywords }) => {
  if (!keywords?.length) return [];
  const matched = activeCategories.filter(
    (category) =>
      matchesAnyKeyword(category.slug, keywords) ||
      matchesAnyKeyword(category.name, keywords),
  );
  return matched.map((item) => item._id);
};

const pickBrandIds = ({ activeBrands, keywords }) => {
  if (!keywords?.length) return [];
  const matched = activeBrands.filter(
    (brand) =>
      matchesAnyKeyword(brand.slug, keywords) ||
      matchesAnyKeyword(brand.name, keywords),
  );
  return matched.map((item) => item._id);
};

const joinKeywords = (keywords = []) => {
  const normalized = keywords.map(normalize).filter(Boolean);
  return normalized.length ? normalized.join(" ") : "";
};

const run = async () => {
  await connectDB();

  const [activeCategories, activeBrands] = await Promise.all([
    Category.find({ status: "active" }).select("_id slug name").lean(),
    Brand.find({ status: "active" }).select("_id slug name").lean(),
  ]);

  const allActiveCategoryIds = activeCategories.map((item) => item._id);
  const allActiveBrandIds = activeBrands.map((item) => item._id);

  let upserted = 0;
  for (const item of BASE_COLLECTIONS) {
    let categoryIds = pickCategoryIds({
      activeCategories,
      keywords: item.categoryKeywords,
    });
    let brandIds = pickBrandIds({
      activeBrands,
      keywords: item.brandKeywords,
    });

    const q = item.criteria?.q || joinKeywords(item.queryKeywords);
    const sort = item.criteria?.sort || "newest";

    // Fallback strategy: keep collections non-empty on sparse datasets.
    if (
      item.slug !== "all-products" &&
      !categoryIds.length &&
      !brandIds.length &&
      !q &&
      allActiveCategoryIds.length
    ) {
      categoryIds = allActiveCategoryIds;
    }

    // If category/brand matching fails but q exists, still allow q-only collection.
    // For "private label", prefer all active brands when none matched.
    if (item.slug === "crownline-private-label" && !brandIds.length && allActiveBrandIds.length) {
      brandIds = allActiveBrandIds;
    }

    const update = {
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      heroImage: item.heroImage || "",
      status: "active",
      sortOrder: item.sortOrder ?? 0,
      criteria: {
        categoryIds,
        brandIds,
        q,
        sort,
      },
    };

    await Collection.findOneAndUpdate({ slug: item.slug }, { $set: update }, { upsert: true });
    upserted += 1;
    console.log(
      `[seed-collections] ${item.slug}: categories=${categoryIds.length}, brands=${brandIds.length}, q="${q}"`,
    );
  }

  console.log(`[seed-collections] upserted ${upserted} collections`);
};

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("seed-collections failed", err);
    await mongoose.disconnect();
    process.exit(1);
  });
