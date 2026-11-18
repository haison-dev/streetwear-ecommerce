import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Minus, Plus, ChevronRight, Heart } from "lucide-react";
import { toast } from "sonner";
import { useStorefront } from "@/hooks/useStorefront";
import { useAddWishlistItemMutation, useRemoveWishlistItemMutation, useWishlistQuery } from "@/hooks/useWishlistQueries";
import { formatVnd } from "@/lib/money";
import { getErrorMessage } from "@/lib/apiError";
import type { Variant } from "@/types";
import { useProductDetailQuery } from "@/hooks/useProductDetailQuery";
import { useAddToCartMutation } from "@/hooks/useCartQueries";
import { useCreateReviewMutation, useProductReviewsQuery } from "@/hooks/useReviewQueries";
import { useAuthStore } from "@/stores/useAuthStore";

const stockOf = (variant: Variant) => variant.inventory?.available ?? variant.stock ?? 0;

const ProductDetail = () => {
  const { slug } = useParams();
  const { data: product, isLoading, isError } = useProductDetailQuery(slug);
  const addToCartMutation = useAddToCartMutation();
  const createReviewMutation = useCreateReviewMutation();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { openLogin } = useStorefront();
  const wishlist = useWishlistQuery();
  const addSaved = useAddWishlistItemMutation();
  const removeSaved = useRemoveWishlistItemMutation();
  const saved = wishlist.data?.items.some(({ productId }) =>
    (typeof productId === "string" ? productId : productId._id) === product?._id
  ) ?? false;
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const variants = useMemo(() => product?.variants || [], [product]);
  const selectedVariantData = variants.find((variant) => variant._id === selectedVariant)
    ?? variants.find((variant) => stockOf(variant) > 0)
    ?? variants[0];
  const available = selectedVariantData ? stockOf(selectedVariantData) : 0;
  const colors = [...new Set(variants.map((variant) => variant.color))];
  const sizes = variants.filter((variant) => variant.color === selectedVariantData?.color);
  const reviewsQuery = useProductReviewsQuery(product?._id, {
    page: 1,
    limit: 6,
    sort: "newest",
  });

  useEffect(() => {
    if (available <= 0) return;
    setQuantity((q) => Math.max(1, Math.min(q, available)));
  }, [available]);

  if (isLoading) return <p className="store-container py-28" role="status">Loading product…</p>;

  if (!product || isError) {
    return (
      <div className="bg-background">

        <div className="pt-32 text-center">
          <h1 className="font-display text-5xl">Product Not Found</h1>
          <Link to="/shop" className="font-body text-sm underline mt-4 inline-block">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const price = selectedVariantData?.price ?? product.salePrice ?? product.price;
  const chooseColor = (color: string) => {
    const matching = variants.filter((variant) => variant.color === color);
    const next = matching.find((variant) => variant.size === selectedVariantData?.size && stockOf(variant) > 0)
      ?? matching.find((variant) => stockOf(variant) > 0)
      ?? matching[0];
    if (next) setSelectedVariant(next._id);
  };

  const toggleSaved = async () => {
    if (!token) { openLogin(); return; }
    try {
      await (saved ? removeSaved : addSaved).mutateAsync(product._id);
      toast.success(saved ? "Removed from saved items" : "Saved to your wishlist");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update saved items"));
    }
  };

  const increaseQty = () => {
    setQuantity((q) => Math.min(q + 1, available || 1));
  };

  const decreaseQty = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleAddToCart = async () => {
    if (!token) {
      openLogin();
      return;
    }
    if (!selectedVariantData) {
      toast.error("Please select a variant");
      return;
    }
    if (available <= 0) {
      toast.error("Selected variant is out of stock");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: product._id,
        variantId: selectedVariantData._id,
        quantity,
      });
      toast.success("Added to cart");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Add to cart failed";
      toast.error(message);
    }
  };

  const handleSubmitReview = async () => {
    if (!token) {
      openLogin();
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        productId: product._id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewComment("");
      toast.success("Review saved");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Save review failed";
      toast.error(message);
    }
  };

  return (
    <div className="bg-background">


      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8 pt-28 pb-12">
        <div className="flex items-center gap-2 font-body text-xs text-muted-foreground uppercase tracking-wider mb-8">
          <Link to="/shop" className="hover:text-foreground transition-colors">
            Shop
          </Link>
          <ChevronRight size={12} />
          <Link
            to={`/shop?categoryId=${product.categoryId._id}`}
            className="hover:text-foreground transition-colors"
          >
            {product.categoryId.name}
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4"
          >
            <div className="flex flex-col gap-2 w-20">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? "border-foreground" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full aspect-square object-cover" />
                </button>
              ))}
            </div>

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

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-widest mb-1">
                {product.brandId?.name}
              </p>
              <h1 className="store-title">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{formatVnd(price)}</span>
              {price < product.price && <span className="text-muted-foreground line-through">{formatVnd(product.price)}</span>}
              <button type="button" className="ml-auto border border-border p-3 hover:bg-secondary"
                aria-label={saved ? "Remove from saved items" : "Save item"} aria-pressed={saved}
                disabled={addSaved.isPending || removeSaved.isPending || Boolean(token && wishlist.isFetching)}
                onClick={() => void toggleSaved()}>
                <Heart size={19} className={saved ? "fill-current" : ""} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((r) => (
                  <Star
                    key={r}
                    size={16}
                    className={
                      r <= Math.round(product.rating)
                        ? "fill-foreground"
                        : "fill-none stroke-muted-foreground"
                    }
                  />
                ))}
              </div>
              <span className="font-body text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            <p className="font-body text-sm text-muted-foreground leading-relaxed">{product.description}</p>

            {colors.length > 0 && (
              <fieldset className="space-y-2">
                <legend className="store-label">Color</legend>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button type="button" key={color} aria-pressed={selectedVariantData?.color === color}
                      onClick={() => chooseColor(color)}
                      className="min-h-11 border border-border px-4 text-sm hover:border-foreground aria-pressed:border-foreground aria-pressed:bg-primary">
                      {color || "Default"}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset className="space-y-2">
              <legend className="store-label">Size</legend>
              <div className="flex flex-wrap gap-2">
                {sizes.map((variant) => (
                  <button type="button" key={variant._id} aria-pressed={selectedVariantData?._id === variant._id}
                    disabled={stockOf(variant) <= 0} onClick={() => setSelectedVariant(variant._id)}
                    className="min-h-11 min-w-11 border border-border px-3 text-sm hover:border-foreground disabled:opacity-45 aria-pressed:border-foreground aria-pressed:bg-primary">
                    {variant.size}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{available > 0 ? `${available} in stock` : "Out of stock"}</p>
            </fieldset>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={decreaseQty} aria-label="Decrease quantity" className="p-3 hover:bg-secondary transition-colors">
                  <Minus size={16} />
                </button>
                <span className="px-4 font-body text-sm min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={increaseQty} aria-label="Increase quantity"
                  disabled={!!selectedVariantData && quantity >= available}
                  className="p-3 hover:bg-secondary transition-colors disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                disabled={addToCartMutation.isPending || available <= 0}
                onClick={handleAddToCart}
                className={`flex-1 py-3 rounded-lg font-body text-sm tracking-wider transition-colors ${
                  available > 0
                    ? "bg-primary text-primary-foreground hover:bg-foreground hover:text-background"
                    : "bg-secondary text-muted-foreground cursor-not-allowed"
                }`}
              >
                {addToCartMutation.isPending
                  ? "Adding..."
                  : available > 0 ? "Add to bag" : "Out of stock"}
              </button>
            </div>
          </motion.div>
        </div>

        <section className="mt-14 border-t border-border pt-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl">Customer Reviews</h2>
                  <p className="font-body text-sm text-muted-foreground">
                    {reviewsQuery.data?.meta.total ?? product.reviewCount} reviews for this product
                  </p>
                </div>
              </div>

              {reviewsQuery.isLoading ? (
                <p className="font-body text-sm text-muted-foreground">Loading reviews...</p>
              ) : reviewsQuery.isError ? (
                <p className="font-body text-sm text-destructive">Failed to load reviews.</p>
              ) : (reviewsQuery.data?.reviews || []).length === 0 ? (
                <p className="font-body text-sm text-muted-foreground">
                  No reviews yet. Be the first to leave feedback.
                </p>
              ) : (
                <div className="grid gap-3">
                  {(reviewsQuery.data?.reviews || []).map((review) => {
                    const reviewer =
                      typeof review.userId === "object"
                        ? review.userId.displayName || review.userId.email || "Customer"
                        : "Customer";
                    return (
                      <article key={review._id} className="rounded-lg border border-border p-4">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-body text-sm font-semibold">{reviewer}</p>
                            {review.createdAt && (
                              <p className="font-body text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                              </p>
                            )}
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((ratingValue) => (
                              <Star
                                key={ratingValue}
                                size={15}
                                className={
                                  ratingValue <= review.rating
                                    ? "fill-foreground"
                                    : "fill-none stroke-muted-foreground"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment ? (
                          <p className="font-body text-sm leading-relaxed text-muted-foreground">
                            {review.comment}
                          </p>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border p-5">
              <h3 className="font-body text-sm font-semibold">Write a review</h3>
              <p className="mt-1 font-body text-xs text-muted-foreground">
                {user ? user.email : "Login to save your rating."}
              </p>
              <div className="mt-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((ratingValue) => (
                  <button
                    key={ratingValue}
                    type="button"
                    onClick={() => setReviewRating(ratingValue)}
                    className="rounded p-1 hover:bg-secondary"
                    aria-label={`${ratingValue} star`}
                  >
                    <Star
                      size={20}
                      className={
                        ratingValue <= reviewRating
                          ? "fill-foreground"
                          : "fill-none stroke-muted-foreground"
                      }
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Share fit, quality, or delivery feedback"
                className="mt-4 min-h-28 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-body text-sm outline-none focus:border-foreground"
              />
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={createReviewMutation.isPending}
                className="mt-3 w-full rounded-lg bg-foreground py-2.5 font-body text-sm text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
              >
                {createReviewMutation.isPending ? "Saving..." : token ? "Save Review" : "Login to Review"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
