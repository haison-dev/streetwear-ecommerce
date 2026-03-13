import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { products } from '@/lib/mock-data';

const FeaturedProducts = () => {
  const featured = products.slice(0, 4);

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20 xl:px-28 bg-secondary">
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-5xl md:text-7xl mb-12"
        >
          TRENDING NOW
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featured.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
