# State Management Convention (Zustand + TanStack Query)

## Goal
Keep responsibilities clear: TanStack Query for server state, Zustand for client/UI state. Avoid duplication.

## Definitions
- Server state: data fetched from API (products, categories, user profile, orders, etc.)
- Client/UI state: local UI interactions (modal open/close, filters, sort, pagination, draft forms, theme, cart local, auth token)

## Rules
1. Do not store API lists/details in Zustand if a query already exists.
2. Use Zustand to store filter/sort/pagination, then pass them to query keys.
3. Mutations should update Query cache (invalidate or setQueryData). Do not manually sync in Zustand.
4. Auth token (and optionally lightweight user info) stays in Zustand. Use Query for `/auth/me` if you want cache.
5. Query keys must be deterministic and serializable.

## Structure
- `src/stores/*` for Zustand stores
- `src/services/*` for API services
- `src/hooks/*` for React Query hooks
- `src/types/*` for types

## Example: filters + products

```ts
// store
const useProductFilterStore = create((set) => ({
  q: "",
  categoryId: undefined,
  brandId: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  minRating: undefined,
  sort: "newest",
  page: 1,
  limit: 20,
  setFilters: (patch) => set(patch),
  reset: () => set({ q: "", categoryId: undefined, brandId: undefined, minPrice: undefined, maxPrice: undefined, minRating: undefined, sort: "newest", page: 1, limit: 20 }),
}));

// query
const filters = useProductFilterStore();
const { data, isLoading } = useQuery({
  queryKey: ["products", filters],
  queryFn: () => productService.list(filters),
});
```

## Example: mutation

```ts
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: productService.create,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
});
```

## Example: auth

```ts
// Zustand for token + user
const useAuthStore = create((set) => ({ token: null, user: null, setToken: (t) => set({ token: t }) }));

// Query for /auth/me when needed
const { data } = useQuery({ queryKey: ["me"], queryFn: authService.me, enabled: !!token });
```

## Pitfalls to avoid
- Duplicating server data in Zustand and Query
- Non-deterministic query keys (functions, class instances)
- Mutations that update Zustand but not Query cache

## Notes
Keep API mapping logic in services or mappers, not in stores.
