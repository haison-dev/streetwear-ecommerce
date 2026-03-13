import { motion } from 'framer-motion';

import hero1 from '@/assets/hero-1.jpg';
import hero2 from '@/assets/hero-2.jpg';
import hero3 from '@/assets/hero-3.jpg';
import productHoodie2 from '@/assets/product-hoodie-2.jpg';
import productHoodie3 from '@/assets/product-hoodie-3.jpg';
import productVinyl1 from '@/assets/product-vinyl-1.jpg';
import productMug1 from '@/assets/product-mug-1.jpg';

const images = [hero1, hero2, productHoodie2, hero3, productHoodie3, productVinyl1, productMug1];

const SocialsSection = () => {
  return (
    <section className="py-20 px-4 md:px-8 overflow-hidden">
      <div className="container">
        <div className="flex items-center justify-between mb-10">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-display text-5xl md:text-7xl"
          >
            SOCIALS
          </motion.h2>
          <motion.a
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            href="#"
            className="font-body text-sm border border-foreground rounded-full px-6 py-2 hover:bg-foreground hover:text-background transition-colors"
          >
            Follow Us
          </motion.a>
        </div>
      </div>

      {/* Scrolling image strip */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
        {images.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex-shrink-0 w-48 md:w-56 aspect-square rounded-lg overflow-hidden"
          >
            <img src={img} alt="Social post" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SocialsSection;
