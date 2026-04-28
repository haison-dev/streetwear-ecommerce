import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { brandService } from "@/services/brandService";
import { categoryService } from "@/services/categoryService";
import { queryKeys } from "@/lib/queryKeys";

export interface ShopFilters {
  q: string;
  categoryId: string;
  brandId: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  minRating: number;
  sort: string;
  page: number;
  limit: number;
}

const isObjectId = (value?: string) => /^[a-fA-F0-9]{24}$/.test(String(value || ""));

export const useCategoriesQuery = () =>
  useQuery({
    queryKey: [...queryKeys.categories, { status: "active" }],
    queryFn: () => categoryService.list({ status: "active", limit: 200 }),
    staleTime: 5 * 60 * 1000,
  });

export const useBrandsQuery = () =>
  useQuery({
    queryKey: [...queryKeys.brands, { status: "active" }],
    queryFn: () => brandService.list({ status: "active", limit: 200 }),
    staleTime: 5 * 60 * 1000,
  });

export const useProductStatsQuery = (q: string, categoryId: string, brandId: string) =>
  useQuery({
    queryKey: queryKeys.productFilters({ q, categoryId, brandId, status: "active" }),
    queryFn: () =>
      productService.getFilterStats({
        q: q || undefined,
        categoryId: isObjectId(categoryId) ? categoryId : undefined,
        brandId: isObjectId(brandId) ? brandId : undefined,
        status: "active",
      }),
  });

export const useProductsQuery = (filters: ShopFilters) =>
  useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () =>
      productService.list({
        q: filters.q || undefined,
        categoryId: isObjectId(filters.categoryId) ? filters.categoryId : undefined,
        brandId: isObjectId(filters.brandId) ? filters.brandId : undefined,
        minPrice: filters.minPrice !== undefined ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice !== undefined ? filters.maxPrice : undefined,
        minRating: filters.minRating || undefined,
        sort: filters.sort,
        page: filters.page,
        limit: filters.limit,
        status: "active",
      }),
    placeholderData: keepPreviousData,
  });

export const useShopQueries = (filters: ShopFilters) => {
  const categoriesQuery = useCategoriesQuery();
  const brandsQuery = useBrandsQuery();
  const statsQuery = useProductStatsQuery(filters.q, filters.categoryId, filters.brandId);
  const productsQuery = useProductsQuery(filters);

  const stats = useMemo(() => {
    if (!statsQuery.data) return { minPrice: 0, maxPrice: 0 };
    return {
      minPrice: statsQuery.data.stats.minPrice,
      maxPrice: statsQuery.data.stats.maxPrice,
    };
  }, [statsQuery.data]);

  return {
    categories: categoriesQuery.data || [],
    brands: brandsQuery.data || [],
    stats,
    productsQuery,
    categoriesQuery,
    brandsQuery,
    statsQuery,
  };
};
