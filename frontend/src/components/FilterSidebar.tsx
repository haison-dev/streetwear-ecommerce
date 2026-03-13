import { motion } from 'framer-motion';
import { categories, brands, filtersData } from '@/lib/mock-data';
import { Star } from 'lucide-react';

interface FilterState {
  categoryId: string;
  brandId: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const FilterSidebar = ({ filters, onChange }: Props) => {
  const activeCount = [
    filters.categoryId,
    filters.brandId,
    filters.minPrice > filtersData.stats.minPrice ? 'price' : '',
    filters.maxPrice < filtersData.stats.maxPrice ? 'price2' : '',
    filters.minRating > 0 ? 'rating' : '',
  ].filter(Boolean).length;

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-2">
        <h3 className="font-display text-2xl">Filters</h3>
        {activeCount > 0 && (
          <span className="bg-foreground text-background text-xs font-body rounded-full w-5 h-5 flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-3">Category</h4>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onChange({ ...filters, categoryId: '' })}
              className={`font-body text-sm transition-opacity ${!filters.categoryId ? 'font-semibold' : 'opacity-60 hover:opacity-100'}`}
            >
              All Products
            </button>
          </li>
          {categories.map(cat => (
            <li key={cat._id}>
              <button
                onClick={() => onChange({ ...filters, categoryId: cat._id })}
                className={`font-body text-sm transition-opacity ${filters.categoryId === cat._id ? 'font-semibold' : 'opacity-60 hover:opacity-100'}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      <div>
        <h4 className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-3">Brand</h4>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onChange({ ...filters, brandId: '' })}
              className={`font-body text-sm transition-opacity ${!filters.brandId ? 'font-semibold' : 'opacity-60 hover:opacity-100'}`}
            >
              All Brands
            </button>
          </li>
          {brands.map(brand => (
            <li key={brand._id}>
              <button
                onClick={() => onChange({ ...filters, brandId: brand._id })}
                className={`font-body text-sm transition-opacity ${filters.brandId === brand._id ? 'font-semibold' : 'opacity-60 hover:opacity-100'}`}
              >
                {brand.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h4 className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-3">Price</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-body text-sm">
            <span>${filters.minPrice}</span>
            <span className="text-muted-foreground">—</span>
            <span>${filters.maxPrice}</span>
          </div>
          <input
            type="range"
            min={filtersData.stats.minPrice}
            max={filtersData.stats.maxPrice}
            value={filters.maxPrice}
            onChange={e => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            className="w-full accent-foreground"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-3">Minimum Rating</h4>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(r => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? 0 : r })}
              className="transition-opacity"
            >
              <Star
                size={18}
                className={r <= filters.minRating ? 'fill-foreground' : 'fill-none stroke-muted-foreground'}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {activeCount > 0 && (
        <button
          onClick={() => onChange({ categoryId: '', brandId: '', minPrice: filtersData.stats.minPrice, maxPrice: filtersData.stats.maxPrice, minRating: 0 })}
          className="font-body text-xs underline text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear all filters
        </button>
      )}
    </motion.aside>
  );
};

export default FilterSidebar;
