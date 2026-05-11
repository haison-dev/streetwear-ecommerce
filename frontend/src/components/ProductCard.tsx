import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Product } from '@/types/index';

interface Props {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: Props) => {
  const formatVnd = (value: number) => `${value.toLocaleString('vi-VN')} đ`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-lg bg-secondary mb-3">
          <motion.img
            src={product.images[0]}
            alt={product.name}
            className="w-full aspect-square object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          />
          {/* Category pill */}
          <span className="absolute top-3 left-3 bg-foreground text-background font-body text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            {product.categoryId.name}
          </span>
          {product.salePrice && (
            <span className="absolute top-3 right-3 bg-sale text-background font-body text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Sale
            </span>
          )}
        </div>

        <div className="space-y-1">
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">
            {product.brandId.name}
          </p>
          <h3 className="font-body text-sm font-medium group-hover:opacity-70 transition-opacity">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {product.salePrice ? (
              <>
                <span className="font-body text-sm font-semibold">{formatVnd(product.salePrice)}</span>
                <span className="font-body text-sm text-muted-foreground line-through">{formatVnd(product.price)}</span>
              </>
            ) : (
              <span className="font-body text-sm font-semibold">{formatVnd(product.price)}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-foreground" />
            <span className="font-body text-xs text-muted-foreground">
              {product.rating} ({product.reviewCount})
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
