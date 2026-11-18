import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import { useShopFilters } from '@/hooks/useShopFilters';
import { useShopQueries } from '@/hooks/useShopQueries';
import { useCollectionBySlugQuery, useCollectionProductsQuery } from '@/hooks/useCollectionQueries';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name', label: 'Name' },
];

const Shop = () => {
  const { filters, setFilters, collection: collectionSlug } = useShopFilters();
  const { q, categoryId, brandId, minPrice, maxPrice, minRating, sort, page } = filters;
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { categories, brands, stats, productsQuery } = useShopQueries(filters, !collectionSlug);
  const collectionQuery = useCollectionBySlugQuery(collectionSlug || undefined);
  const collectionProductsQuery = useCollectionProductsQuery(collectionSlug || undefined, filters);
  const isCollectionView = Boolean(collectionSlug);
  const effectiveProductsQuery = isCollectionView ? collectionProductsQuery : productsQuery;
  const meta = effectiveProductsQuery.data?.meta;
  const totalPages = Math.ceil((meta?.total ?? 0) / (meta?.limit || 1));

  const categoryName = isCollectionView
    ? collectionQuery.data?.name || 'Collection'
    : categoryId
      ? categories.find(c => c._id === categoryId)?.name
      : 'All Products';

  return (
    <div className="bg-background">


      <div className="store-container pt-28 pb-16">
        {/* Full-width header area */}
        <div>
          {/* Breadcrumb */}
          <div className="font-body text-xs text-muted-foreground mb-4 uppercase tracking-wider">
            Shop {categoryId && `/ ${categoryName}`}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="store-title mb-8"
          >
            Shop {categoryName}
          </motion.h1>

          {/* Search + Sort bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
            <div className="relative flex-1 w-full md:max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products…" aria-label="Search products"
                value={q}
                onChange={e => { setFilters({ q: e.target.value, page: 1 }, true); }}
                className="w-full pl-10 pr-4 py-2.5 border border-border bg-secondary font-body text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="md:hidden flex items-center gap-2 font-body text-sm border border-border rounded-none px-4 py-2"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>

              <select
                aria-label="Sort products" value={sort}
                onChange={e => setFilters({ sort: e.target.value, page: 1 })}
                className="border border-border bg-secondary font-body text-sm px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <span className="font-body text-sm text-muted-foreground ml-auto md:ml-0">
                {effectiveProductsQuery.data?.meta.total || 0} product{(effectiveProductsQuery.data?.meta.total || 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[13rem_minmax(0,1fr)]">
          {/* Desktop sidebar */}
          <div className="hidden md:block store-panel p-5 self-start">
            <FilterSidebar
              filters={{ categoryId, brandId, minPrice: minPrice ?? stats.minPrice, maxPrice: maxPrice ?? stats.maxPrice, minRating }}
              categories={categories}
              brands={brands}
              stats={stats}
              onChange={f => { setFilters({ ...f, minPrice: f.minPrice === stats.minPrice ? undefined : f.minPrice, maxPrice: f.maxPrice === stats.maxPrice ? undefined : f.maxPrice, page: 1 }); }}
            />
          </div>

          {/* Mobile sidebar */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-foreground/50 md:hidden"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  transition={{ type: 'spring', damping: 25 }}
                  className="absolute left-0 top-0 bottom-0 w-72 bg-background p-6 overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="absolute top-4 right-4">
                    <X size={20} />
                  </button>
                  <FilterSidebar
                    filters={{ categoryId, brandId, minPrice: minPrice ?? stats.minPrice, maxPrice: maxPrice ?? stats.maxPrice, minRating }}
                    categories={categories}
                    brands={brands}
                    stats={stats}
                    onChange={f => { setFilters({ ...f, minPrice: f.minPrice === stats.minPrice ? undefined : f.minPrice, maxPrice: f.maxPrice === stats.maxPrice ? undefined : f.maxPrice, page: 1 }); }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product grid - full width to right edge */}
          <div className="min-w-0">
            {effectiveProductsQuery.isLoading ? (
              <div className="text-center py-20">
                <p className="font-body text-sm text-muted-foreground">Loading products...</p>
              </div>
            ) : effectiveProductsQuery.isError ? (
              <div className="text-center py-20">
                <p className="font-display text-3xl text-muted-foreground">Unable to load products</p>
                <button type="button" className="store-action mt-4" onClick={() => void effectiveProductsQuery.refetch()}>Retry</button>
              </div>
            ) : (effectiveProductsQuery.data?.products?.length || 0) > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5">
                {effectiveProductsQuery.data!.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="font-display text-3xl text-muted-foreground">No products found</p>
                <Link to="/shop" className="store-action mt-4">Browse all products</Link>
              </div>
            )}

            {totalPages > 1 && (
              <nav aria-label="Product pages" className="mt-8 flex justify-center items-center gap-3 text-sm">
                <button type="button" className="border border-border px-3 py-2 disabled:opacity-40" disabled={page <= 1}
                  onClick={() => setFilters({ page: page - 1 })}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button type="button" className="border border-border px-3 py-2 disabled:opacity-40" disabled={page >= totalPages}
                  onClick={() => setFilters({ page: page + 1 })}>Next</button>
              </nav>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Shop;
