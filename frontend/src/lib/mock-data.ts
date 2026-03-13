import type { Category, Brand, Product, ProductWithVariants, FiltersResponse } from '../types';

import productHoodie1 from '@/assets/product-hoodie-1.jpg';
import productHoodie2 from '@/assets/product-hoodie-2.jpg';
import productHoodie3 from '@/assets/product-hoodie-3.jpg';
import productHoodie4 from '@/assets/product-hoodie-4.jpg';
import productTee1 from '@/assets/product-tee-1.jpg';
import productVinyl1 from '@/assets/product-vinyl-1.jpg';
import productMug1 from '@/assets/product-mug-1.jpg';
import productJersey1 from '@/assets/product-jersey-1.jpg';

export const categories: Category[] = [
  { _id: 'c1', name: 'Clothing', slug: 'clothing' },
  { _id: 'c2', name: 'Music', slug: 'music' },
  { _id: 'c3', name: 'Accessories', slug: 'accessories' },
  { _id: 'c4', name: 'Home & Lifestyle', slug: 'home-lifestyle' },
  { _id: 'c5', name: 'Collab', slug: 'collab' },
];

export const brands: Brand[] = [
  { _id: 'b1', name: 'Rochelle Jordan', slug: 'rochelle-jordan' },
  { _id: 'b2', name: 'OneSpeed', slug: 'onespeed' },
  { _id: 'b3', name: 'Codeine Cowboy', slug: 'codeine-cowboy' },
  { _id: 'b4', name: 'Wavy Navy', slug: 'wavy-navy' },
  { _id: 'b5', name: 'Full Circle', slug: 'full-circle' },
  { _id: 'b6', name: 'Private Label', slug: 'private-label' },
];

export const products: Product[] = [
  {
    _id: 'p1', name: 'Through The Wall Hoodie', slug: 'through-the-wall-hoodie',
    images: [productHoodie1, productHoodie1], price: 80, rating: 4.8, reviewCount: 124,
    brandId: brands[0], categoryId: categories[0],
  },
  {
    _id: 'p2', name: 'Line Art Hoodie', slug: 'line-art-hoodie',
    images: [productHoodie2, productHoodie2], price: 75, salePrice: 59, rating: 4.5, reviewCount: 89,
    brandId: brands[5], categoryId: categories[0],
  },
  {
    _id: 'p3', name: 'Codeine Cowboy Hoodie', slug: 'codeine-cowboy-hoodie',
    images: [productHoodie3, productHoodie3], price: 80, rating: 4.9, reviewCount: 201,
    brandId: brands[2], categoryId: categories[0],
  },
  {
    _id: 'p4', name: 'Script Logo Hoodie', slug: 'script-logo-hoodie',
    images: [productHoodie4, productHoodie4], price: 70, salePrice: 55, rating: 4.3, reviewCount: 67,
    brandId: brands[3], categoryId: categories[0],
  },
  {
    _id: 'p5', name: 'Moto Skull Tee', slug: 'moto-skull-tee',
    images: [productTee1, productTee1], price: 45, rating: 4.6, reviewCount: 156,
    brandId: brands[1], categoryId: categories[0],
  },
  {
    _id: 'p6', name: 'Live Sessions Vinyl', slug: 'live-sessions-vinyl',
    images: [productVinyl1, productVinyl1], price: 35, rating: 4.7, reviewCount: 312,
    brandId: brands[4], categoryId: categories[1],
  },
  {
    _id: 'p7', name: 'Art Collage Mug', slug: 'art-collage-mug',
    images: [productMug1, productMug1], price: 25, rating: 4.4, reviewCount: 98,
    brandId: brands[4], categoryId: categories[3],
  },
  {
    _id: 'p8', name: 'Pinstripe Baseball Jersey', slug: 'pinstripe-baseball-jersey',
    images: [productJersey1, productJersey1], price: 120, rating: 4.8, reviewCount: 45,
    brandId: brands[5], categoryId: categories[4],
  },
  {
    _id: 'p9', name: 'Rochelle Jordan Sweet Sensations Hoodie', slug: 'sweet-sensations-hoodie',
    images: [productHoodie2, productHoodie2], price: 85, rating: 4.7, reviewCount: 178,
    brandId: brands[0], categoryId: categories[0],
  },
  {
    _id: 'p10', name: 'Codeine Cowboy Purple Hoodie', slug: 'purple-cowboy-hoodie',
    images: [productHoodie3, productHoodie3], price: 82, salePrice: 70, rating: 4.9, reviewCount: 234,
    brandId: brands[2], categoryId: categories[0],
  },
  {
    _id: 'p11', name: 'Velvet Note Hoodie', slug: 'velvet-note-hoodie',
    images: [productHoodie4, productHoodie4], price: 78, rating: 4.5, reviewCount: 112,
    brandId: brands[3], categoryId: categories[0],
  },
  {
    _id: 'p12', name: 'Through The Wall Tee', slug: 'through-the-wall-tee',
    images: [productTee1, productTee1], price: 42, rating: 4.6, reviewCount: 143,
    brandId: brands[0], categoryId: categories[0],
  },
  {
    _id: 'p13', name: 'Limited Edition Vinyl Box Set', slug: 'vinyl-box-set',
    images: [productVinyl1, productVinyl1], price: 55, rating: 4.8, reviewCount: 89,
    brandId: brands[4], categoryId: categories[1],
  },
  {
    _id: 'p14', name: 'Wavy Navy Hoodie', slug: 'wavy-navy-hoodie',
    images: [productHoodie1, productHoodie1], price: 88, rating: 4.4, reviewCount: 76,
    brandId: brands[3], categoryId: categories[0],
  },
  {
    _id: 'p15', name: 'Full Circle Logo Hoodie', slug: 'full-circle-hoodie',
    images: [productHoodie2, productHoodie2], price: 72, rating: 4.6, reviewCount: 98,
    brandId: brands[4], categoryId: categories[0],
  },
  {
    _id: 'p16', name: 'Private Label Essentials Tee', slug: 'private-label-tee',
    images: [productTee1, productTee1], price: 40, salePrice: 32, rating: 4.3, reviewCount: 167,
    brandId: brands[5], categoryId: categories[0],
  },
];

export const filtersData: FiltersResponse = {
  stats: {
    minPrice: 25,
    maxPrice: 120,
    minRating: 1,
    maxRating: 5,
  },
};

export function getProductBySlug(slug: string): ProductWithVariants | undefined {
  const p = products.find(pr => pr.slug === slug);
  if (!p) return undefined;
  return {
    ...p,
    description: 'Premium quality merchandise. Heavyweight fabric with screenprinted graphics. Fits true to size.',
    variants: [
      { _id: 'v1', productId: p._id, size: 38, color: 'Black', sku: `${p.slug}-S-BLK`, stock: 12, inventory: { available: 12, reserved: 2, sold: 45 } },
      { _id: 'v2', productId: p._id, size: 39, color: 'Black', sku: `${p.slug}-M-BLK`, stock: 8, inventory: { available: 8, reserved: 1, sold: 67 } },
      { _id: 'v3', productId: p._id, size: 40, color: 'Black', sku: `${p.slug}-L-BLK`, stock: 15, inventory: { available: 15, reserved: 3, sold: 89 } },
      { _id: 'v4', productId: p._id, size: 41, color: 'Black', sku: `${p.slug}-XL-BLK`, stock: 5, inventory: { available: 5, reserved: 0, sold: 34 } },
      { _id: 'v5', productId: p._id, size: 42, color: 'Black', sku: `${p.slug}-2XL-BLK`, stock: 3, inventory: { available: 3, reserved: 1, sold: 12 } },
    ],
  };
}

export function filterProducts(params: {
  q?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  let filtered = [...products];
  if (params.q) {
    const q = params.q.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.brandId.name.toLowerCase().includes(q));
  }
  if (params.categoryId) filtered = filtered.filter(p => p.categoryId._id === params.categoryId);
  if (params.brandId) filtered = filtered.filter(p => p.brandId._id === params.brandId);
  if (params.minPrice !== undefined) filtered = filtered.filter(p => (p.salePrice || p.price) >= params.minPrice!);
  if (params.maxPrice !== undefined) filtered = filtered.filter(p => (p.salePrice || p.price) <= params.maxPrice!);
  if (params.minRating !== undefined) filtered = filtered.filter(p => p.rating >= params.minRating!);

  if (params.sort) {
    switch (params.sort) {
      case 'price': filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)); break;
      case 'price:desc': filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
  }

  const page = params.page || 1;
  const limit = params.limit || 8;
  const total = filtered.length;
  const start = (page - 1) * limit;
  return {
    products: filtered.slice(start, start + limit),
    meta: { page, limit, total },
  };
}
