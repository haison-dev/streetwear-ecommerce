import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import { filterProducts, filtersData, categories } from '@/lib/mock-data';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name', label: 'Name' },
];

const Shop = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('categoryId') || '';

  const [q, setQ] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: initialCategory,
    brandId: '',
    minPrice: filtersData.stats.minPrice,
    maxPrice: filtersData.stats.maxPrice,
    minRating: 0,
  });

  const results = useMemo(() => {
    return filterProducts({
      q,
      categoryId: filters.categoryId,
      brandId: filters.brandId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minRating: filters.minRating || undefined,
      sort,
      page,
      limit: 8,
    });
  }, [q, filters, sort, page]);

  const categoryName = filters.categoryId
    ? categories.find(c => c._id === filters.categoryId)?.name
    : 'All Products';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-8">
        {/* Full-width header area */}
        <div className="px-6 lg:px-12">
          {/* Breadcrumb */}
          <div className="font-body text-xs text-muted-foreground mb-4 uppercase tracking-wider">
            Shop {filters.categoryId && `/ ${categoryName}`}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-7xl mb-8"
          >
            Shop {categoryName}
          </motion.h1>

          {/* Search + Sort bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
            <div className="relative flex-1 w-full md:max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={q}
                onChange={e => { setQ(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-full font-body text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="md:hidden flex items-center gap-2 font-body text-sm border border-border rounded-full px-4 py-2"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>

              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-secondary rounded-full font-body text-sm px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <span className="font-body text-sm text-muted-foreground ml-auto md:ml-0">
                {results.meta.total} product{results.meta.total !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-0">
          {/* Desktop sidebar */}
          <div className="hidden md:block w-56 flex-shrink-0 px-6 lg:px-12">
            <FilterSidebar filters={filters} onChange={f => { setFilters(f); setPage(1); }} />
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
                  <button onClick={() => setMobileFiltersOpen(false)} className="absolute top-4 right-4">
                    <X size={20} />
                  </button>
                  <FilterSidebar filters={filters} onChange={f => { setFilters(f); setPage(1); }} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product grid - full width to right edge */}
          <div className="flex-1 px-6 lg:px-0 pr-0 lg:pr-12">
            {results.products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {results.products.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="font-display text-3xl text-muted-foreground">No products found</p>
                <p className="font-body text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
              </div>
            )}

            {/* Pagination */}
            {Math.ceil(results.meta.total / results.meta.limit) > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: Math.ceil(results.meta.total / results.meta.limit) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-full font-body text-sm transition-colors ${
                      page === i + 1 ? 'bg-foreground text-background' : 'bg-secondary hover:bg-border'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
