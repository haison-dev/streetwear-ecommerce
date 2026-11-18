import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrdersQuery } from "@/hooks/useOrderQueries";
import { useCreateVnpayCheckoutMutation } from "@/hooks/usePaymentQueries";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { useStorefront } from "@/hooks/useStorefront";
import { formatVnd } from "@/lib/money";

type OrderStatus = "all" | "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
const badgeVariant = (value?: string) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "paid" || normalized === "delivered") return "default" as const;
  if (normalized === "pending" || normalized === "confirmed" || normalized === "shipping")
    return "secondary" as const;
  if (normalized === "failed" || normalized === "cancelled") return "destructive" as const;
  return "outline" as const;
};

const MyOrdersPage = () => {
  const { openLogin } = useStorefront();
  const token = useAuthStore((state) => state.token);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus>("all");
  const createVnpayCheckoutMutation = useCreateVnpayCheckoutMutation();

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      sort: "newest" as const,
      ...(status !== "all" ? { status } : {}),
    }),
    [page, status],
  );
  const ordersQuery = useOrdersQuery(params);

  if (!token) {
    return (
      <div className="bg-background">

        <div className="pt-28 pb-16 max-w-4xl mx-auto px-4 md:px-8">
          <h1 className="store-title mb-4">My Orders</h1>
          <p className="text-muted-foreground mb-6">Please login to view your orders.</p>
          <button type="button" className="store-action" onClick={openLogin}>Sign in</button>
        </div>

      </div>
    );
  }

  const orders = ordersQuery.data?.orders || [];
  const meta = ordersQuery.data?.meta;

  const handlePayNow = async (paymentId?: string | null) => {
    if (!paymentId) {
      toast.error("Payment id not found");
      return;
    }
    try {
      const checkout = await createVnpayCheckoutMutation.mutateAsync({
        paymentId,
        locale: "vn",
      });
      const checkoutUrl = checkout?.checkoutUrl || checkout?.nextAction?.checkoutUrl;
      if (!checkoutUrl) {
        toast.error("VNPAY checkout URL not found");
        return;
      }
      window.location.href = checkoutUrl;
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Cannot continue payment";
      toast.error(message);
    }
  };

  return (
    <div className="bg-background">

      <div className="store-container pt-28 pb-16">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="store-title">My Orders</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status</span>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as OrderStatus);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipping">Shipping</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {ordersQuery.isLoading ? (
          <p>Loading orders...</p>
        ) : ordersQuery.isError ? (
          <p className="text-destructive">Failed to load orders.</p>
        ) : orders.length === 0 ? (
          <div>
            <p className="text-muted-foreground mb-4">You have no orders yet.</p>
            <Link to="/shop" className="underline">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">
                      <Link className="font-bold hover:underline" to={`/account/orders/${order._id}`}>{order.orderNumber || order._id.slice(-8)}</Link>
                    </TableCell>
                    <TableCell>
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell>{formatVnd(order.totalPrice ?? 0)}</TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant(order.paymentStatus)}>
                        {order.paymentStatus || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant(order.status)}>{order.status || "pending"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {String(order.paymentMethod || "").toLowerCase() === "vnpay" &&
                      ["pending", "failed"].includes(order.paymentStatus) &&
                      String(order.status || "").toLowerCase() !== "cancelled" ? (
                        <Button
                          size="sm"
                          onClick={() => handlePayNow(order.paymentId)}
                          disabled={createVnpayCheckoutMutation.isPending}
                        >
                          Pay now
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-end gap-2 p-4">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
              >
                Prev
              </Button>
              <span className="text-sm">Page {meta?.page || page}</span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={meta ? page * (meta.limit || 10) >= (meta.total || 0) : false}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default MyOrdersPage;
