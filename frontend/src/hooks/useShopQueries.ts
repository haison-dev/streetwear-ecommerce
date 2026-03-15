import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { brandService } from "@/services/brandService";
import { categoryService } from "@/services/categoryService";

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

export const useCategoriesQuery = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.list(),
    staleTime: 5 * 60 * 1000,
  });

export const useBrandsQuery = () =>
  useQuery({
    queryKey: ["brands"],
    queryFn: () => brandService.list(),
    staleTime: 5 * 60 * 1000,
  });

export const useProductStatsQuery = (q: string, categoryId: string, brandId: string) =>
  useQuery({
    queryKey: ["product-stats", q, categoryId, brandId],
    queryFn: () =>
      productService.getFilterStats({
        q: q || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        status: "active",
      }),
  });

export const useProductsQuery = (filters: ShopFilters) =>
  useQuery({
    queryKey: [
      "products",
      filters.q,
      filters.categoryId,
      filters.brandId,
      filters.minPrice,
      filters.maxPrice,
      filters.minRating,
      filters.sort,
      filters.page,
      filters.limit,
    ],
    queryFn: () =>
      productService.list({
        q: filters.q || undefined,
        categoryId: filters.categoryId || undefined,
        brandId: filters.brandId || undefined,
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
