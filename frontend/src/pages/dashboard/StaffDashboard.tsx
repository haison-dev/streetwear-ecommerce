import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { staffSidebarData } from "@/components/dashboard/layout/staff-sidebar-data";
import { useOrdersQuery } from "@/hooks/useOrderQueries";
import { getErrorMessage } from "@/lib/apiError";
import { formatVnd } from "@/lib/money";
import { orderService, type CustomerOrder } from "@/services/orderService";

const statusOptions = ["pending", "confirmed", "shipping", "delivered", "cancelled"] as const;

export default function StaffDashboard() {
  const [status, setStatus] = useState<CustomerOrder["status"] | "">("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const orders = useOrdersQuery({ scope: "operations", status: status || undefined, page, limit: 15 });
  const update = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: CustomerOrder["status"] }) => orderService.updateStatus(id, nextStatus),
    onSuccess: () => {
      toast.success("Order updated");
      return queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Could not update order")),
  });

  return (
    <DashboardLayout title="Crownline" section="Order fulfillment" data={staffSidebarData}>
      <section className="w-full space-y-6 p-4 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="store-label mb-2">Operations</p><h1 className="store-title">Order fulfillment.</h1></div>
          <label className="grid gap-1 text-xs font-semibold">
            Order status
            <select value={status} className="store-field capitalize"
              onChange={(event) => { setStatus(event.target.value as typeof status); setPage(1); }}>
              <option value="">All statuses</option>
              {statusOptions.map((option) => <option value={option} key={option}>{option}</option>)}
            </select>
          </label>
        </div>
        {orders.isPending ? <p role="status">Loading orders…</p> : orders.isError ? (
          <p className="store-panel p-4" role="alert">{getErrorMessage(orders.error, "Could not load orders")}</p>
        ) : (
          <div className="space-y-4">
            {orders.data.orders.length === 0 && <p className="store-panel p-4">No orders on this page.</p>}
            <ul className="space-y-3">
              {orders.data.orders.map((order) => (
                <li key={order._id} className="store-panel p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl">{order.orderNumber ?? order._id.slice(-8)}</h2>
                      <p className="text-sm text-muted-foreground capitalize">{order.status} · {order.paymentMethod} / {order.paymentStatus}</p>
                    </div>
                    <p className="font-bold">{formatVnd(order.totalPrice)}</p>
                  </div>
                  <details className="mt-3 border-t border-border pt-3 text-sm">
                    <summary className="cursor-pointer font-semibold">Items and delivery</summary>
                    <ul className="my-2 space-y-1">
                      {order.items.map((item, index) => (
                        <li key={item.variantId + index}>{item.quantity} × {item.name} / {item.color} / {item.size}</li>
                      ))}
                    </ul>
                    {order.shippingAddress && (
                      <p>{[order.shippingAddress.name, order.shippingAddress.phone, order.shippingAddress.address, order.shippingAddress.ward, order.shippingAddress.district, order.shippingAddress.city].filter(Boolean).join(" · ")}</p>
                    )}
                    {order.note && <p className="mt-2 text-muted-foreground">{order.note}</p>}
                  </details>
                  {Boolean(order.nextStatuses?.length) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {order.nextStatuses?.filter((next) => next !== "cancelled").map((next) => (
                        <button className="store-action" type="button" key={next} disabled={update.isPending}
                          onClick={() => update.mutate({ id: order._id, nextStatus: next })}>
                          {next === "confirmed" ? "Confirm order" : next === "shipping" ? "Mark as shipped" : "Mark as delivered"}
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 text-sm">
              <button type="button" className="border border-border px-3 py-2 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page}</span>
              <button type="button" className="border border-border px-3 py-2 disabled:opacity-40" disabled={page * orders.data.meta.limit >= orders.data.meta.total} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
