import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import productHoodie1 from '@/assets/product-hoodie-1.jpg';
import productTee1 from '@/assets/product-tee-1.jpg';
import productAccessory1 from '@/assets/product-accessory-1.jpg';
import productJersey1 from '@/assets/product-jersey-1.jpg';
import productMug1 from '@/assets/product-mug-1.jpg';

const cats = [
  { name: 'MUSIC', image: productHoodie1, slug: 'vinyls' },
  { name: 'CLOTHING', image: productTee1, slug: 'hoodies-sweatshirts' },
  { name: 'ACCESSORIES', image: productAccessory1, slug: 'accessories' },
  { name: 'COLLAB', image: productJersey1, slug: 'crownline-private-label' },
  { name: 'HOME & LIFESTYLE', image: productMug1, slug: '2025-all-star-collection' },
];

const ShopCategories = () => {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-20 xl:px-28">
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-5xl md:text-7xl mb-12"
        >
          SHOP
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {cats.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/shop?collection=${cat.slug}`}
                className="group relative block aspect-[3/4] rounded-lg overflow-hidden bg-foreground"
              >
                <motion.img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                <span className="absolute bottom-4 left-0 right-0 text-center font-display text-lg md:text-xl text-background tracking-widest">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopCategories;
  
