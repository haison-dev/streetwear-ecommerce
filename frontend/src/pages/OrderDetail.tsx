import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { useOrderDetailQuery } from "@/hooks/useOrderQueries";
import { useStorefront } from "@/hooks/useStorefront";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatVnd } from "@/lib/money";

const stages = [
  { id: "pending", label: "Order placed" },
  { id: "confirmed", label: "Confirmed" },
  { id: "shipping", label: "On the way" },
  { id: "delivered", label: "Delivered" },
] as const;

export default function OrderDetail() {
  const { orderId } = useParams();
  const user = useAuthStore((state) => state.user);
  const { openLogin } = useStorefront();
  const query = useOrderDetailQuery(orderId);
  const order = query.data?.order;
  const stage = stages.findIndex(({ id }) => id === order?.status);

  return (
    <section className="store-container pt-28 pb-16">
      <Link to="/account/orders" className="mb-6 inline-flex items-center gap-2 text-sm hover:underline">
        <ArrowLeft size={16} aria-hidden="true" /> My orders
      </Link>
      <h1 className="store-title mb-8">{order ? `Order ${order.orderNumber || order._id.slice(-8)}` : "Order details."}</h1>
      {!user ? (
        <button type="button" onClick={openLogin} className="store-action">Sign in to view order</button>
      ) : query.isPending ? <p role="status">Loading order…</p>
        : !order ? <p role="alert">Order could not be loaded.</p>
        : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
            <div className="space-y-6">
              <section className="store-panel p-5">
                <h2 className="font-display mb-4 text-xl">Delivery status</h2>
                {order.status === "cancelled" ? <p className="text-destructive">Cancelled</p> : (
                  <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {stages.map(({ id, label }, index) => (
                      <li key={id} aria-current={index === stage ? "step" : undefined}
                        className={`flex items-center gap-1.5 border p-2 text-xs font-semibold ${index <= stage ? "border-foreground bg-primary" : "border-border text-muted-foreground"}`}>
                        {index < stage && <Check size={13} aria-hidden="true" />}{label}
                      </li>
                    ))}
                  </ol>
                )}
                {order.createdAt && <p className="mt-3 text-xs text-muted-foreground">Placed {new Date(order.createdAt).toLocaleDateString()}</p>}
              </section>
              <section className="border border-border">
                <h2 className="font-display border-b border-border p-4 text-xl">Items</h2>
                <ul className="divide-y divide-border">
                  {order.items.map((item, index) => (
                    <li key={item.variantId + index} className="flex items-center gap-3 p-4">
                      {item.image && <img className="size-14 object-cover" src={item.image} alt="" />}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{[item.color, item.size, `Qty ${item.quantity}`].filter(Boolean).join(" / ")}</p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold">{formatVnd(item.price * item.quantity)}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            <aside className="store-panel space-y-5 p-5">
              <div>
                <h2 className="font-display mb-2 text-xl">Shipping address</h2>
                <address className="text-sm not-italic leading-6">
                  <strong>{order.shippingAddress.name}</strong><br />
                  {order.shippingAddress.phone}<br />
                  {[order.shippingAddress.address, order.shippingAddress.ward, order.shippingAddress.district, order.shippingAddress.city].filter(Boolean).join(", ")}
                </address>
                {order.note && <p className="mt-2 text-sm text-muted-foreground">Delivery note: {order.note}</p>}
              </div>
              <div className="border-t border-border pt-4">
                <h2 className="font-display mb-2 text-xl">Payment</h2>
                <p className="text-sm capitalize">{order.paymentMethod === "cod" ? "Cash on delivery" : order.paymentMethod.toUpperCase()} / {order.paymentStatus}</p>
                <dl className="mt-4 grid grid-cols-[1fr_auto] gap-2 text-sm">
                  <dt>Delivery</dt><dd>{formatVnd(order.shippingFee ?? 0)}</dd>
                  <dt>Discount</dt><dd>{formatVnd(order.discount ?? 0)}</dd>
                  <dt className="font-bold">Total</dt><dd className="font-bold">{formatVnd(order.totalPrice)}</dd>
                </dl>
              </div>
            </aside>
          </div>
        )}
    </section>
  );
}
