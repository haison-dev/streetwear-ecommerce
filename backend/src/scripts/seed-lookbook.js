import "dotenv/config";
import { access } from "node:fs/promises";
import mongoose from "mongoose";
import Brand from "../models/Brand.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import Inventory from "../models/Inventory.js";

const looks = [
  { slug: "boxy-tee-bone", name: "Boxy Tee", category: "T-Shirts", categorySlug: "t-shirts", color: "Bone", price: 340000, description: "Boxy crew-neck tee with dropped shoulders and a relaxed sleeve." },
  { slug: "heavyweight-hoodie-charcoal", name: "Heavyweight Hoodie", category: "Hoodies", categorySlug: "hoodies", color: "Charcoal", price: 650000, description: "Relaxed pullover hoodie with a drawstring hood and a kangaroo pocket." },
  { slug: "utility-cargo-olive", name: "Utility Cargo", category: "Pants", categorySlug: "pants", color: "Olive", price: 720000, description: "Loose straight-leg cargo trousers with utility pockets." },
  { slug: "work-jacket-rust", name: "Work Jacket", category: "Jackets", categorySlug: "jackets", color: "Rust", price: 890000, description: "Button-front work jacket with a relaxed fit and two chest pockets." },
  { slug: "oversized-tee-washed-black", name: "Oversized Tee", category: "T-Shirts", categorySlug: "t-shirts", color: "Washed Black", price: 360000, description: "Washed black crew-neck tee with an oversized fit." },
  { slug: "zip-hoodie-heather-grey", name: "Zip Hoodie", category: "Hoodies", categorySlug: "hoodies", color: "Heather Grey", price: 690000, description: "Heather grey hoodie with a full-length zip and split front pockets." },
  { slug: "carpenter-jeans-indigo", name: "Carpenter Jeans", category: "Pants", categorySlug: "pants", color: "Indigo", price: 760000, description: "Washed indigo jeans with a loose carpenter fit." },
  { slug: "coach-jacket-sand", name: "Coach Jacket", category: "Jackets", categorySlug: "jackets", color: "Sand", price: 820000, description: "Sand-colored coach jacket with a fold-down collar." },
  { slug: "rugby-polo-forest", name: "Rugby Polo", category: "Polos", categorySlug: "polos", color: "Forest Green", price: 490000, description: "Forest green rugby polo with a contrasting cream collar." },
  { slug: "bomber-jacket-navy", name: "Bomber Jacket", category: "Jackets", categorySlug: "jackets", color: "Navy", price: 940000, description: "Matte navy bomber with a full zip and ribbed trim." },
  { slug: "crewneck-sweatshirt-burgundy", name: "Crewneck Sweatshirt", category: "Sweatshirts", categorySlug: "sweatshirts", color: "Burgundy", price: 560000, description: "Burgundy crewneck sweatshirt with ribbed cuffs and a relaxed fit." },
  { slug: "trucker-jacket-faded-blue", name: "Denim Trucker Jacket", category: "Jackets", categorySlug: "jackets", color: "Faded Blue", price: 920000, description: "Faded blue denim trucker with a button front and chest pockets." },
  { slug: "pleated-trousers-sand", name: "Pleated Trousers", category: "Pants", categorySlug: "pants", color: "Sand", price: 740000, description: "Sand trousers with front pleats and a wide leg." },
  { slug: "textured-overshirt-olive", name: "Textured Overshirt", category: "Shirts", categorySlug: "shirts", color: "Olive", price: 670000, description: "Textured olive overshirt for layering over a tee." },
  { slug: "waffle-long-sleeve-charcoal", name: "Waffle Long Sleeve", category: "Shirts", categorySlug: "shirts", color: "Charcoal", price: 480000, description: "Charcoal long-sleeve top with a waffle-knit texture." },
];

const uri = process.env.MONGODB_CONNECTIONSTRING ?? "";
if (!/^mongodb:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\//i.test(uri)) {
  throw new Error("The lookbook demo seed requires a local MongoDB connection.");
}

await Promise.all(looks.map(({ slug }) => access(new URL(`../../../frontend/public/lookbook/${slug}.jpg`, import.meta.url))));
await mongoose.connect(uri);
try {
  await Promise.all([Brand.init(), Category.init(), Product.init(), ProductVariant.init(), Inventory.init()]);
  const brand = await Brand.findOneAndUpdate(
    { slug: "crownline" },
    { $setOnInsert: { name: "Crownline", status: "active" } },
    { upsert: true, returnDocument: "after" },
  );

  for (const look of looks) {
    const category = await Category.findOneAndUpdate(
      { slug: look.categorySlug },
      { $setOnInsert: { name: look.category, status: "active" } },
      { upsert: true, returnDocument: "after" },
    );
    const product = await Product.findOneAndUpdate(
      { slug: `crownline-${look.slug}` },
      {
        $setOnInsert: {
          name: look.name, categoryId: category._id, brandId: brand._id, price: look.price,
          description: look.description, status: "active", images: [`/lookbook/${look.slug}.jpg`],
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    for (const size of ["S", "M", "L", "XL"]) {
      const variant = await ProductVariant.findOneAndUpdate(
        { productId: product._id, color: look.color, size },
        { $setOnInsert: { sku: `CL-DEMO-${look.slug.toUpperCase()}-${size}-${product.id}`, stock: 12 } },
        { upsert: true, returnDocument: "after" },
      );
      await Inventory.updateOne({ variantId: variant._id }, { $setOnInsert: { available: 12 } }, { upsert: true });
    }
  }
  console.log(`Seeded or found ${looks.length} Crownline lookbook products.`);
} finally {
  await mongoose.disconnect();
}
