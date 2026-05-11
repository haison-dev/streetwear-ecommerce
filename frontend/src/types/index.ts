export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  status?: "active" | "draft" | "archived";
  brandId: Brand;
  categoryId: Category;
}

export interface Variant {
  _id: string;
  productId: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  price?: number;
  inventory: {
    available: number;
    reserved: number;
    sold: number;
  };
}

export interface ProductWithVariants extends Product {
  description?: string;
  variants: Variant[];
}

export interface FiltersResponse {
  stats: {
    minPrice: number;
    maxPrice: number;
    minRating: number;
    maxRating: number;
  };
}

export interface Review {
  _id: string;
  userId?: string | { _id: string; displayName?: string; email?: string };
  productId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CollectionCriteria {
  categoryIds?: string[];
  brandIds?: string[];
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: string;
}

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  heroImage?: string;
  status: "active" | "inactive";
  sortOrder: number;
  criteria?: CollectionCriteria;
}

export * from "@/types/admin";
