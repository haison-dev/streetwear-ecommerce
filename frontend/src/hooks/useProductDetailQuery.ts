import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { queryKeys } from "@/lib/queryKeys";

export const useProductDetailQuery = (slug?: string) => 
    useQuery({
        queryKey: queryKeys.productDetail(slug || ""),
        queryFn: () => productService.getBySlug(slug!),
        enabled: !!slug,
    });
