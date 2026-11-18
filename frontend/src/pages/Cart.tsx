import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { useCartQuery, useRemoveCartItemMutation, useUpdateCartItemMutation } from "@/hooks/useCartQueries";
import { useStorefront } from "@/hooks/useStorefront";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatVnd } from "@/lib/money";
import { getErrorMessage } from "@/lib/apiError";

export default function CartPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = useAuthStore((state) => state.token);
  const { openLogin } = useStorefront();
  const cart = useCartQuery(Boolean(token));
  const update = useUpdateCartItemMutation();
  const remove = useRemoveCartItemMutation();
  const items = cart.data?.items ?? [];
  const busy = update.isPending || remove.isPending || cart.isFetching;

  useEffect(() => {
    const status = searchParams.get("paymentStatus");
    if (!status) return;
    if (status === "success" || status === "paid") toast.success("Payment successful");
    else if (status === "pending") toast.message("Payment is pending");
    else toast.error("Payment could not be confirmed");
    if (token) navigate("/account/orders", { replace: true });
    else {
      const next = new URLSearchParams(searchParams);
      for (const key of ["paymentStatus", "txnRef", "provider"]) next.delete(key);
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, navigate, token]);

  return (
    <section className="store-container pt-28 pb-16">
      <p className="store-label mb-3">Crownline / Shop</p>
      <h1 className="store-title mb-8">Shopping bag.</h1>
      {!token ? (
        <div className="store-panel space-y-4 p-6">
          <p>Sign in to see your bag and check out.</p>
          <button type="button" onClick={openLogin} className="store-action">Sign in</button>
        </div>
      ) : cart.isPending ? <p role="status">Loading your bag…</p>
        : cart.isError ? <button className="store-action" type="button" onClick={() => void cart.refetch()}>Retry loading bag</button>
        : items.length === 0 ? (
          <div className="store-panel space-y-4 p-6">
            <p>Your bag is empty.</p>
            <Link to="/shop" className="store-action">Explore the shop</Link>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(360px,1fr)]">
            <ul className="divide-y divide-border border border-border">
              {items.map((item) => {
                const { product, variant } = item;
                const changeQuantity = (quantity: number) => update.mutate({ cartItemId: item._id, quantity }, {
                  onError: (error) => toast.error(getErrorMessage(error, "Could not update quantity")),
                });
                const name = product?.name ?? "Unavailable product";
                return (
                  <li key={item._id} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3 p-4 sm:grid-cols-[6rem_minmax(0,1fr)_auto]">
                    <div className="aspect-square bg-secondary">
                      {product?.images?.[0] && <img className="size-full object-cover" src={product.images[0]} alt="" />}
                    </div>
                    <div>
                      {product?.slug ? <Link className="font-bold hover:underline" to={`/product/${product.slug}`}>{name}</Link> : <p className="font-bold">{name}</p>}
                      <p className="text-sm text-muted-foreground">{[variant?.color, variant?.size].filter(Boolean).join(" / ")}</p>
                      <p className="mt-1 text-sm font-semibold">{formatVnd(item.lineTotal)}</p>
                      {!item.isAvailable && <p className="mt-1 text-xs text-destructive">Available stock: {item.availableStock}</p>}
                    </div>
                    <div className="col-start-2 flex flex-wrap items-center gap-2 sm:col-start-auto">
                      <div className="inline-flex items-center border border-border">
                        <button className="p-2 hover:bg-secondary disabled:opacity-40" type="button" aria-label={`Decrease ${name} quantity`} onClick={() => changeQuantity(item.quantity - 1)} disabled={busy || item.quantity <= 1}><Minus size={14} /></button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <button className="p-2 hover:bg-secondary disabled:opacity-40" type="button" aria-label={`Increase ${name} quantity`} onClick={() => changeQuantity(item.quantity + 1)} disabled={busy || !item.isAvailable || item.quantity >= item.availableStock}><Plus size={14} /></button>
                      </div>
                      <button className="p-2 text-muted-foreground hover:text-destructive" type="button" aria-label={`Remove ${name}`} disabled={busy}
                        onClick={() => remove.mutate(item._id, { onError: (error) => toast.error(getErrorMessage(error, "Could not remove item")) })}><Trash2 size={16} /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <CheckoutForm cartUpdatedAt={cart.dataUpdatedAt} cartBusy={busy}
              hasInvalidItems={Boolean(cart.data?.summary.invalidItems)} refreshCart={() => void cart.refetch()} />
          </div>
        )}
    </section>
  );
}
