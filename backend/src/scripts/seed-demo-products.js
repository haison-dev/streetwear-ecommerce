import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../libs/db.js";
import Brand from "../models/Brand.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import Inventory from "../models/Inventory.js";

dotenv.config();

const CATEGORY_SEEDS = [
  { name: "Áo nam", slug: "o-nam" },
  { name: "Hoodie", slug: "hoodie" },
  { name: "Accessories", slug: "accessories" },
  { name: "Vinyls", slug: "vinyls" },
];

const BRAND_SEEDS = [
  { name: "BasicWear", slug: "basicwear" },
  { name: "Crownline", slug: "crownline" },
];

const DEMO_PRODUCTS = [
  {
    name: "Áo hoodie basic đen",
    slug: "ao-hoodie-basic-den",
    categorySlug: "hoodie",
    brandSlug: "basicwear",
    price: 399000,
    salePrice: 349000,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1400",
      "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=1400",
    ],
  },
  {
    name: "Áo hoodie basic kem",
    slug: "ao-hoodie-basic-kem",
    categorySlug: "hoodie",
    brandSlug: "basicwear",
    price: 399000,
    salePrice: 359000,
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1400",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1400",
    ],
  },
  {
    name: "Áo thun graphic street",
    slug: "ao-thun-graphic-street",
    categorySlug: "o-nam",
    brandSlug: "crownline",
    price: 269000,
    salePrice: 219000,
    images: [
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1400",
      "https://images.unsplash.com/photo-1618354691551-44de113f0164?w=1400",
    ],
  },
  {
    name: "Áo thun logo basic trắng",
    slug: "ao-thun-logo-basic-trang",
    categorySlug: "o-nam",
    brandSlug: "basicwear",
    price: 229000,
    salePrice: 189000,
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1400",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1400",
    ],
  },
  {
    name: "Khuyên tai vòng ánh kim",
    slug: "khuyen-tai-vong-anh-kim",
    categorySlug: "accessories",
    brandSlug: "crownline",
    price: 189000,
    salePrice: 149000,
    images: [
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1400",
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1400",
    ],
  },
  {
    name: "Mug Party Wave",
    slug: "mug-party-wave",
    categorySlug: "accessories",
    brandSlug: "basicwear",
    price: 159000,
    salePrice: 129000,
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=1400",
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1400",
    ],
  },
  {
    name: "Vinyl Live Session Vol.1",
    slug: "vinyl-live-session-vol-1",
    categorySlug: "vinyls",
    brandSlug: "crownline",
    price: 499000,
    salePrice: 429000,
    images: [
      "https://images.unsplash.com/photo-1461784180009-21121b2f204c?w=1400",
      "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=1400",
    ],
  },
  {
    name: "Music Vinyl Golden Classics",
    slug: "music-vinyl-golden-classics",
    categorySlug: "vinyls",
    brandSlug: "basicwear",
    price: 539000,
    salePrice: 459000,
    images: [
      "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=1400",
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1400",
    ],
  },
  {
    name: "Crownline Private Label Tee",
    slug: "crownline-private-label-tee",
    categorySlug: "o-nam",
    brandSlug: "crownline",
    price: 299000,
    salePrice: 249000,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1400",
      "https://images.unsplash.com/photo-1618354691321-8ab7f0e6f8f4?w=1400",
    ],
  },
  {
    name: "2025 All-Star Jersey Black",
    slug: "2025-all-star-jersey-black",
    categorySlug: "o-nam",
    brandSlug: "crownline",
    price: 459000,
    salePrice: 399000,
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1400",
      "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=1400",
    ],
  },
];

const VARIANT_COLORS = ["Black", "White"];
const VARIANT_SIZES = ["M", "L"];

const makeSku = (slug, color, size) =>
  `${slug.replace(/-/g, "").slice(0, 8).toUpperCase()}-${color[0]}${size}`;

const run = async () => {
  await connectDB();

  const categoryMap = new Map();
  const brandMap = new Map();

  for (const categorySeed of CATEGORY_SEEDS) {
    const category = await Category.findOneAndUpdate(
      { slug: categorySeed.slug },
      {
        $set: {
          name: categorySeed.name,
          slug: categorySeed.slug,
          status: "active",
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    categoryMap.set(categorySeed.slug, category);
  }

  for (const brandSeed of BRAND_SEEDS) {
    const brand = await Brand.findOneAndUpdate(
      { slug: brandSeed.slug },
      {
        $set: {
          name: brandSeed.name,
          slug: brandSeed.slug,
          status: "active",
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    brandMap.set(brandSeed.slug, brand);
  }

  let productsUpserted = 0;
  let variantsUpserted = 0;

  for (const item of DEMO_PRODUCTS) {
    const category = categoryMap.get(item.categorySlug);
    const brand = brandMap.get(item.brandSlug);
    if (!category || !brand) continue;

    const product = await Product.findOneAndUpdate(
      { slug: item.slug },
      {
        $set: {
          name: item.name,
          slug: item.slug,
          brandId: brand._id,
          categoryId: category._id,
          description: `${item.name} - demo product seeded automatically.`,
          images: item.images,
          price: item.price,
          salePrice: item.salePrice,
          status: "active",
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    productsUpserted += 1;

    for (const color of VARIANT_COLORS) {
      for (const size of VARIANT_SIZES) {
        const sku = makeSku(item.slug, color, size);
        const variant = await ProductVariant.findOneAndUpdate(
          { sku },
          {
            $set: {
              productId: product._id,
              size,
              color,
              sku,
              stock: 25,
              price: item.salePrice,
            },
          },
          { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
        );
        variantsUpserted += 1;

        await Inventory.findOneAndUpdate(
          { variantId: variant._id },
          {
            $set: {
              available: 25,
              reserved: 0,
              sold: 0,
            },
          },
          { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
        );
      }
    }
  }

  console.log(
    `[seed-demo-products] categories=${CATEGORY_SEEDS.length}, brands=${BRAND_SEEDS.length}, products=${productsUpserted}, variants=${variantsUpserted}`,
  );
};

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("seed-demo-products failed", err);
    await mongoose.disconnect();
    process.exit(1);
  });

