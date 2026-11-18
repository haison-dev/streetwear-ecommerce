import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { queryKeys } from "@/lib/queryKeys";

export const useFeaturedProductsQuery = () =>
  useQuery({
    queryKey: queryKeys.products({ featured: true, sort: "newest", limit: 8 }),
    queryFn: () =>
      productService.list({
        sort: "newest",
        limit: 8,
        status: "active",
      }),
    staleTime: 5 * 60 * 1000,
  });
