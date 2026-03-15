import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";

export const useProductDetailQuery = (slug?: string) => 
    useQuery({
        queryKey: ["product-detail", slug],
        queryFn: () => productService.getBySlug(slug!),
        enabled: !!slug,
    });