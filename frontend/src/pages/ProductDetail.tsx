import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Minus, Plus, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getProductBySlug } from '@/lib/mock-data';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || '');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="font-display text-5xl">Product Not Found</h1>
          <Link to="/shop" className="font-body text-sm underline mt-4 inline-block">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const selectedVariantData = product.variants.find(v => v._id === selectedVariant);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Promo bar */}
      <div className="bg-foreground text-background text-center py-2 font-body text-sm tracking-wider mt-16">
        GET 10% OFF
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-body text-xs text-muted-foreground uppercase tracking-wider mb-8">
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <Link to={`/shop?categoryId=${product.categoryId._id}`} className="hover:text-foreground transition-colors">
            {product.categoryId.name}
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {/* Image gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4"
          >
            {/* Thumbnails */}
            <div className="flex flex-col gap-2 w-20">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? 'border-foreground' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full aspect-square object-cover" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1 rounded-lg overflow-hidden bg-secondary">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full aspect-[3/4] object-cover"
              />
            </div>
          </motion.div>

          {/* Product info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">
                {product.brandId.name}
              </p>
              <h1 className="font-display text-4xl md:text-5xl">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              {product.salePrice ? (
                <>
                  <span className="font-body text-2xl font-semibold">${product.salePrice.toFixed(2)}</span>
                  <span className="font-body text-lg text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                </>
              ) : (
                <span className="font-body text-2xl font-semibold">${product.price.toFixed(2)}</span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(r => (
                  <Star
                    key={r}
                    size={16}
                    className={r <= Math.round(product.rating) ? 'fill-foreground' : 'fill-none stroke-muted-foreground'}
                  />
                ))}
              </div>
              <span className="font-body text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Description */}
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Variants / Size */}
            <div>
              <h3 className="font-body text-sm font-semibold mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(variant => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedVariant(variant._id)}
                    disabled={variant.inventory.available === 0}
                    className={`px-5 py-2.5 rounded-lg border font-body text-sm transition-colors ${
                      selectedVariant === variant._id
                        ? 'border-foreground bg-foreground text-background'
                        : variant.inventory.available === 0
                        ? 'border-border text-muted-foreground opacity-40 cursor-not-allowed'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
              {selectedVariantData && (
                <p className="font-body text-xs text-muted-foreground mt-2">
                  {selectedVariantData.inventory.available} in stock
                </p>
              )}
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-secondary transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 font-body text-sm min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-secondary transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                disabled={!selectedVariant}
                className={`flex-1 py-3 rounded-lg font-body text-sm tracking-wider transition-colors ${
                  selectedVariant
                    ? 'bg-foreground text-background hover:bg-foreground/90'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed'
                }`}
              >
                {selectedVariant ? 'Add to Cart' : 'Select Size'}
              </button>
            </div>

            {/* Policies */}
            <div className="border-t border-border pt-6 space-y-4">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer font-body text-sm font-semibold uppercase tracking-wider">
                  Returns
                  <Plus size={16} className="group-open:rotate-45 transition-transform" />
                </summary>
                <p className="font-body text-sm text-muted-foreground mt-3">
                  Returns accepted within 30 days of delivery. Items must be unworn and in original packaging.
                </p>
              </details>
              <details className="group border-t border-border pt-4">
                <summary className="flex items-center justify-between cursor-pointer font-body text-sm font-semibold uppercase tracking-wider">
                  Refunds
                  <Plus size={16} className="group-open:rotate-45 transition-transform" />
                </summary>
                <p className="font-body text-sm text-muted-foreground mt-3">
                  Refunds processed within 5-7 business days after receiving the returned item.
                </p>
              </details>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
