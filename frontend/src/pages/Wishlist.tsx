import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRemoveWishlistItemMutation, useWishlistQuery } from "@/hooks/useWishlistQueries";
import { useStorefront } from "@/hooks/useStorefront";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatVnd } from "@/lib/money";
import { getErrorMessage } from "@/lib/apiError";

export default function Wishlist() {
  const user = useAuthStore((state) => state.user);
  const { openLogin } = useStorefront();
  const wishlist = useWishlistQuery();
  const remove = useRemoveWishlistItemMutation();
  const items = wishlist.data?.items ?? [];

  return (
    <section className="store-container pt-28 pb-16">
      <p className="store-label mb-3">Account</p>
      <h1 className="store-title mb-8">Saved items.</h1>
      {!user ? (
        <div className="store-panel p-6">
          <p className="mb-4">Sign in to see your saved styles.</p>
          <button className="store-action" type="button" onClick={openLogin}>Sign in</button>
        </div>
      ) : wishlist.isPending ? (
        <p role="status">Loading saved items…</p>
      ) : wishlist.isError ? (
        <button type="button" className="store-action" onClick={() => void wishlist.refetch()}>Retry loading saved items</button>
      ) : items.length === 0 ? (
        <div className="store-panel p-6">
          <Heart aria-hidden="true" className="mb-3" />
          <p className="mb-4">Save styles you want to come back to.</p>
          <Link className="store-action" to="/shop">Explore the shop</Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ productId, variantId }) => {
            const product = typeof productId === "string" ? undefined : productId;
            const id = typeof productId === "string" ? productId : productId._id;
            const available = product?.status === "active";
            const image = product?.images?.[0];
            return (
              <li key={id + (variantId ?? "")} className="store-panel overflow-hidden">
                {image && <img className="aspect-[4/3] w-full object-cover" src={image} alt="" loading="lazy" />}
                <div className="flex items-start justify-between gap-3 border-t border-border p-4">
                  <div>
                    {available ? <Link className="font-bold hover:underline" to={`/product/${product.slug}`}>{product.name}</Link> : <p className="font-bold">{product?.name ?? "Unavailable product"}</p>}
                    <p className="mt-1 text-sm text-muted-foreground">{available ? formatVnd(product.salePrice ?? product.price) : "Currently unavailable"}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${product?.name ?? "item"} from saved items`}
                    className="p-2 hover:bg-background"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(id, { onError: (error) => toast.error(getErrorMessage(error, "Could not remove item")) })}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
