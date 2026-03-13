import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import productVinyl1 from '@/assets/product-vinyl-1.jpg';
import productTee1 from '@/assets/product-tee-1.jpg';
import productAccessory1 from '@/assets/product-accessory-1.jpg';
import productJersey1 from '@/assets/product-jersey-1.jpg';
import productMug1 from '@/assets/product-mug-1.jpg';

const shopCategoryCards = [
  { name: 'MUSIC', image: productVinyl1, id: 'c2' },
  { name: 'CLOTHING', image: productTee1, id: 'c1' },
  { name: 'ACCESSORIES', image: productAccessory1, id: 'c3' },
  { name: 'COLLAB', image: productJersey1, id: 'c5' },
  { name: 'HOME AND LIFESTYLE', image: productMug1, id: 'c4' },
];

const shopLinks = [
  { label: 'All Products', to: '/shop' },
  { label: 'Vinyls', to: '/shop?categoryId=c2' },
  { label: 'Hoodies & Sweatshirts', to: '/shop?categoryId=c1' },
  { label: 'CROWNLINE Private Label', to: '/shop?brandId=b6' },
  { label: '2025 All-Star Collection', to: '/shop' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleShopEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShopOpen(true);
  };

  const handleShopLeave = () => {
    timeoutRef.current = setTimeout(() => setShopOpen(false), 200);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-16 px-6 lg:px-12">
        {/* Left nav */}
        <div className="hidden md:flex items-center gap-8 font-body text-sm tracking-wide">
          <Link to="/" className="hover:opacity-60 transition-opacity">Home</Link>
          <div
            className="relative"
            onMouseEnter={handleShopEnter}
            onMouseLeave={handleShopLeave}
          >
            <Link
              to="/shop"
              className={`hover:opacity-60 transition-opacity ${shopOpen ? 'underline underline-offset-4' : ''}`}
            >
              Shop
            </Link>
          </div>
          <span className="hover:opacity-60 transition-opacity cursor-pointer">News</span>
          <span className="hover:opacity-60 transition-opacity cursor-pointer">Contact</span>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Center logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 font-display text-3xl tracking-wider">
          CROWNLINE
        </Link>

        {/* Right icons */}
        <div className="flex items-center gap-5">
          <Link to="/shop" className="hover:opacity-60 transition-opacity">
            <Search size={20} />
          </Link>
          <button className="relative hover:opacity-60 transition-opacity">
            <ShoppingBag size={20} />
            <span className="absolute -top-1.5 -right-1.5 bg-foreground text-background text-[10px] font-body font-semibold rounded-full w-4 h-4 flex items-center justify-center">
              0
            </span>
          </button>
        </div>
      </div>

      {/* Shop mega menu dropdown */}
      <AnimatePresence>
        {shopOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="hidden md:block absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg z-50"
            onMouseEnter={handleShopEnter}
            onMouseLeave={handleShopLeave}
          >
            {/* Close button */}
            <button
              onClick={() => setShopOpen(false)}
              className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-secondary hover:bg-border transition-colors"
            >
              <X size={16} />
            </button>

            <div className="px-6 lg:px-12 pt-10 pb-8 flex gap-10">
              {/* Left links */}
              <div className="w-48 flex-shrink-0">
                <h4 className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-4">
                  SHOP
                </h4>
                <ul className="space-y-3">
                  {shopLinks.map(link => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        onClick={() => setShopOpen(false)}
                        className="font-body text-sm hover:opacity-60 transition-opacity"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right category cards */}
              <div className="flex-1 grid grid-cols-5 gap-3">
                {shopCategoryCards.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/shop?categoryId=${cat.id}`}
                    onClick={() => setShopOpen(false)}
                    className="group relative block rounded-lg overflow-hidden bg-foreground aspect-[3/4]"
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                    <span className="absolute bottom-3 left-0 right-0 text-center font-display text-xs lg:text-sm text-background tracking-widest">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-background border-b border-border"
          >
            <div className="flex flex-col gap-4 p-6 font-body text-sm">
              <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link to="/shop" onClick={() => setMobileOpen(false)}>Shop</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
