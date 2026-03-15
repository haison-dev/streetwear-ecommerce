import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";

export const useFeaturedProductsQuery = () =>
  useQuery({
    queryKey: ["products", "featured", "newest"],
    queryFn: () =>
      productService.list({
        sort: "newest",
        limit: 4,
        status: "active",
      }),
    staleTime: 5 * 60 * 1000,
  });
