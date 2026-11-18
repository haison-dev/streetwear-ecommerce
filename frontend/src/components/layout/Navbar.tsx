import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Search, ShoppingBag, Menu, X, User, ChevronDown, LogOut, UserRound, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/useAuthStore';
import { getRoleNames } from '@/lib/roles';
import { useCartQuery } from '@/hooks/useCartQueries';
import { useCollectionsQuery } from '@/hooks/useCollectionQueries';
import { queryKeys } from '@/lib/queryKeys';

const fallbackCollectionImages = [
  '/lookbook/boxy-tee-bone.jpg',
  '/lookbook/heavyweight-hoodie-charcoal.jpg',
  '/lookbook/utility-cargo-olive.jpg',
  '/lookbook/work-jacket-rust.jpg',
];

const Navbar = ({ onLogin }: { onLogin: () => void }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();
  const { token, user, logout } = useAuthStore();
  const cartQuery = useCartQuery(Boolean(token));
  const collectionsQuery = useCollectionsQuery();

  const isLoggedIn = Boolean(token && user);
  const displayName = user?.displayName || user?.email || 'Account';
  const roleNames =
    Array.isArray(user?.roleNames) && user.roleNames.length
      ? user.roleNames.map((role) => String(role).toLowerCase())
      : getRoleNames(user?.roles);
  const isStaff = roleNames.includes("staff");
  const isAdmin = roleNames.includes("admin");
  const profilePath = isStaff
    ? "/dashboard/staff/account"
    : isAdmin
      ? "/dashboard/admin/account"
      : "/account/orders";
  const cartCount = cartQuery.data?.summary?.totalItems || 0;
  const collections = collectionsQuery.data || [];
  const shopLinks = [
    { label: "All Products", to: "/shop" },
    ...collections.map((collection) => ({
      label: collection.name,
      to: `/shop?collection=${encodeURIComponent(collection.slug)}`,
    })),
  ];
  const shopCategoryCards = collections.slice(0, 5).map((collection, index) => ({
    name: collection.name.toUpperCase(),
    image: collection.heroImage || fallbackCollectionImages[index % fallbackCollectionImages.length],
    slug: collection.slug,
  }));

  const handleShopEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShopOpen(true);
  };

  const handleShopLeave = () => {
    timeoutRef.current = setTimeout(() => setShopOpen(false), 200);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center h-16 px-6 lg:px-12">
        {/* Left nav */}
        <div className="hidden md:flex items-center gap-8 font-body text-sm tracking-wide flex-1">
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
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" type="button" aria-label="Menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Center logo */}
        <div className="flex-1 flex justify-center">
          <Link to="/" className="font-brand text-3xl tracking-wider">
            CROWNLINE
          </Link>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3 sm:gap-5 flex-1 justify-end">
          <Link to="/shop" aria-label="Search products" className="hidden min-[390px]:block hover:opacity-60 transition-opacity">
            <Search size={20} />
          </Link>
          <Link to="/account/wishlist" aria-label="Saved items" className="hidden min-[390px]:block hover:opacity-60 transition-opacity">
            <Heart size={20} />
          </Link>
          <Link to="/cart" aria-label={`Shopping bag, ${cartCount} items`} className="relative hover:opacity-60 transition-opacity">
            <ShoppingBag size={20} />
            <span className="absolute -top-1.5 -right-1.5 bg-foreground text-background text-[10px] font-body font-semibold rounded-full w-4 h-4 flex items-center justify-center">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          </Link>
          {isLoggedIn ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-body hover:bg-secondary transition-colors"
                  aria-label="Open user menu"
                >
                  <UserRound size={18} className="sm:hidden" aria-hidden="true" />
                  <span className="hidden max-w-32 truncate sm:inline">{displayName}</span>
                  <ChevronDown size={16} className="hidden sm:block" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-44">
                <DropdownMenuItem
                  onSelect={() => {
                    navigate(profilePath);
                  }}
                >
                  <UserRound className="size-4" />
                  {isAdmin || isStaff ? "Profile" : "My Orders"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                    onSelect={() => {
                      void (async () => {
                        await logout();
                        for (const queryKey of [queryKeys.cart, queryKeys.wishlist, ["orders"], ["payments"], ["admin"]]) {
                          await queryClient.cancelQueries({ queryKey });
                          queryClient.removeQueries({ queryKey });
                        }
                        navigate('/', { replace: true });
                      })();
                    }}
                >
                  <LogOut className="size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={onLogin}
              className="hover:opacity-60 transition-opacity"
              aria-label="Open login panel"
            >
              <User size={20} />
            </button>
          )}
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
                    key={cat.slug}
                    to={`/shop?collection=${encodeURIComponent(cat.slug)}`}
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
              <Link to="/account/wishlist" onClick={() => setMobileOpen(false)}>Saved items</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  );
};

export default Navbar;
