import { useQuery } from "@tanstack/react-query";
import { collectionService } from "@/services/collectionService";
import type { ListProductsParams } from "@/services/productService";

export const useCollectionsQuery = () =>
  useQuery({
    queryKey: ["collections", { status: "active", sort: "order" }],
    queryFn: () =>
      collectionService.list({
        status: "active",
        sort: "order",
        limit: 50,
      }),
    staleTime: 5 * 60 * 1000,
  });

export const useCollectionBySlugQuery = (slug?: string) =>
  useQuery({
    queryKey: ["collections", "slug", slug],
    queryFn: () => collectionService.getBySlug(slug!),
    enabled: Boolean(slug),
  });

export const useCollectionProductsQuery = (
  slug?: string,
  params?: ListProductsParams,
) =>
  useQuery({
    queryKey: ["collections", "slug", slug, "products", params || {}],
    queryFn: () => collectionService.listProductsBySlug(slug!, params),
    enabled: Boolean(slug),
  });

