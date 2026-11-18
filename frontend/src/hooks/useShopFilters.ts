import { useSearchParams } from "react-router-dom";
import type { ShopFilters } from "./useShopQueries";

const id = (value: string | null) => value && /^[a-f\d]{24}$/i.test(value) ? value : "";
const rangeValue = (value: string | null) => value && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : undefined;

export function useShopFilters() {
  const [params, setParams] = useSearchParams();
  const filters: ShopFilters = {
    q: params.get("q") || "",
    categoryId: id(params.get("categoryId")),
    brandId: id(params.get("brandId")),
    minPrice: rangeValue(params.get("minPrice")),
    maxPrice: rangeValue(params.get("maxPrice")),
    minRating: Math.min(5, rangeValue(params.get("minRating")) ?? 0),
    sort: params.get("sort") || "newest",
    page: Math.max(1, Math.floor(rangeValue(params.get("page")) ?? 1)),
    limit: 12,
  };

  function setFilters(patch: Partial<ShopFilters>, replace = false) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === "" || (key === "page" && value === 1)) next.delete(key);
      else next.set(key, String(value));
    }
    setParams(next, { replace, preventScrollReset: true });
  }

  return { filters, setFilters, collection: params.get("collection") || "" };
}
