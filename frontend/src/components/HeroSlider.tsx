import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import hero1 from '@/assets/hero-1.jpg';
import hero2 from '@/assets/hero-2.jpg';
import hero3 from '@/assets/hero-3.jpg';

const slides = [
  { image: hero1, title: 'NEW COLLECTION', subtitle: "PRE-ORDER 'DIRTY BLONDE' NOW", cta: 'Shop Now', link: '/shop' },
  { image: hero2, title: 'STREET KINGS', subtitle: 'EXCLUSIVE MERCH DROP', cta: 'Explore', link: '/shop' },
  { image: hero3, title: 'SUMMER 2026', subtitle: 'GOLDEN HOUR CAPSULE', cta: 'View Collection', link: '/shop' },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hasMount, setHasMount] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHasMount(true), 100);
    return () => clearTimeout(t);
  }, []);

  const go = useCallback((dir: number) => {
    setDirection(dir);
    setCurrent(c => (c + dir + slides.length) % slides.length);
  }, []);

  const next = useCallback(() => go(1), [go]);
  const prev = useCallback(() => go(-1), [go]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  // Swipe support
  const touchStart = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 1 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 1 }),
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content — animates only on first mount */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 md:pb-32 z-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={hasMount ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="text-center pointer-events-auto"
        >
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-background tracking-wider">
            {slides[current].title}
          </h1>
          <p className="font-display text-xl md:text-2xl text-background/80 mt-2 tracking-widest">
            {slides[current].subtitle}
          </p>
          <Link
            to={slides[current].link}
            className="inline-block mt-8 px-8 py-3 bg-background text-foreground font-body text-sm tracking-wider rounded-full hover:bg-background/90 transition-colors"
          >
            {slides[current].cta}
          </Link>
        </motion.div>
      </div>

      {/* Arrows */}
      <button onClick={prev} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 text-background/70 hover:text-background transition-colors">
        <ChevronLeft size={40} />
      </button>
      <button onClick={next} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 text-background/70 hover:text-background transition-colors">
        <ChevronRight size={40} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === current ? 'bg-background w-6' : 'bg-background/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
