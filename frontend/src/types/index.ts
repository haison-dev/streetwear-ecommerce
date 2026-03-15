export interface Category {
  _id: string;
  name: string;
  slug: string;
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
