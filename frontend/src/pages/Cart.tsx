import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  useCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/hooks/useCartQueries";
import { useCreateOrderMutation } from "@/hooks/useOrderQueries";
import { useCreateVnpayCheckoutMutation } from "@/hooks/usePaymentQueries";
import { useAuthStore } from "@/stores/useAuthStore";

const CartPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = useAuthStore((state) => state.token);

  const cartQuery = useCartQuery(Boolean(token));
  const updateItemMutation = useUpdateCartItemMutation();
  const removeItemMutation = useRemoveCartItemMutation();
  const createOrderMutation = useCreateOrderMutation();
  const createVnpayCheckoutMutation = useCreateVnpayCheckoutMutation();

  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vnpay">("cod");

  const items = cartQuery.data?.items || [];
  const summary = cartQuery.data?.summary;
  const hasInvalidItems = (summary?.invalidItems || 0) > 0;
  const canCheckout = items.length > 0 && !hasInvalidItems;

  const total = useMemo(
    () =>
      items.reduce((acc, item) => {
        if (!item.isAvailable) return acc;
        return acc + item.lineTotal;
      }, 0),
    [items],
  );

  useEffect(() => {
    const paymentStatus = searchParams.get("paymentStatus");
    if (!paymentStatus) return;

    if (paymentStatus === "success" || paymentStatus === "paid") {
      toast.success("Payment successful");
      navigate("/dashboard", { replace: true });
      return;
    }

    if (paymentStatus === "failed") {
      toast.error("Payment failed");
    } else if (paymentStatus === "invalid_signature") {
      toast.error("Payment verification failed");
    } else if (paymentStatus === "pending") {
      toast.message("Payment is pending");
    } else {
      toast.message(`Payment status: ${paymentStatus}`);
    }

    const next = new URLSearchParams(searchParams);
    next.delete("paymentStatus");
    next.delete("txnRef");
    next.delete("provider");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, navigate]);

  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      await updateItemMutation.mutateAsync({ cartItemId, quantity });
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Update cart failed";
      toast.error(message);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await removeItemMutation.mutateAsync(cartItemId);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Remove item failed";
      toast.error(message);
    }
  };

  const handleCreateOrder = async () => {
    if (!canCheckout) return;
    const requiredFields = [
      shippingAddress.name,
      shippingAddress.phone,
      shippingAddress.address,
      shippingAddress.city,
      shippingAddress.district,
    ].every((value) => value.trim());
    if (!requiredFields) {
      toast.error("Please fill full shipping address");
      return;
    }

    try {
      const result = await createOrderMutation.mutateAsync({
        shippingAddress,
        paymentMethod,
      });

      if (paymentMethod === "vnpay") {
        const paymentId = result?.payment?._id;
        if (!paymentId) {
          toast.error("Cannot initialize VNPAY payment");
          return;
        }

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
        return;
      }

      toast.success("Order created successfully");
      const orderId = result?.order?._id;
      if (orderId) {
        navigate(`/dashboard?orderId=${orderId}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Create order failed";
      toast.error(message);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 max-w-4xl mx-auto px-4 md:px-8">
          <h1 className="font-display text-4xl mb-4">Your Cart</h1>
          <p className="text-muted-foreground mb-6">Please login to view your cart.</p>
          <Link to="/" className="underline">
            Back to home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16 max-w-6xl mx-auto px-4 md:px-8">
        <h1 className="font-display text-4xl mb-8">Your Cart</h1>

        {cartQuery.isLoading ? (
          <p>Loading cart...</p>
        ) : cartQuery.isError ? (
          <p className="text-destructive">Failed to load cart.</p>
        ) : items.length === 0 ? (
          <div>
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Link to="/shop" className="underline">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const product = item.product as { name?: string; images?: string[]; slug?: string } | null;
                const variant = item.variant as { _id?: string; size?: string; color?: string } | null;
                return (
                  <div
                    key={item._id}
                    className={`border rounded-lg p-4 ${item.isAvailable ? "" : "border-destructive/50 bg-destructive/5"}`}
                  >
                    <div className="flex gap-4">
                      <img
                        src={product?.images?.[0] || ""}
                        alt={product?.name || "product"}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <Link to={product?.slug ? `/product/${product.slug}` : "#"} className="font-semibold">
                          {product?.name || "Unknown product"}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Size: {variant?.size || "-"} | Color: {variant?.color || "-"}
                        </p>
                        {!item.isAvailable && (
                          <p className="text-sm text-destructive mt-1">
                            This item is not available now (stock: {item.availableStock})
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.lineTotal.toLocaleString("vi-VN")} đ</p>
                        <div className="flex items-center border rounded mt-2">
                          <button
                            onClick={() => handleUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
                            className="p-2"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                            className="p-2"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-destructive text-sm mt-2 inline-flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border rounded-lg p-5 h-fit space-y-4">
              <h2 className="font-display text-2xl">Checkout</h2>
              <div className="space-y-2">
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Full name"
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Phone"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress((prev) => ({ ...prev, phone: e.target.value }))}
                />
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Address"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress((prev) => ({ ...prev, address: e.target.value }))}
                />
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress((prev) => ({ ...prev, city: e.target.value }))}
                />
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="District"
                  value={shippingAddress.district}
                  onChange={(e) => setShippingAddress((prev) => ({ ...prev, district: e.target.value }))}
                />
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Ward (optional)"
                  value={shippingAddress.ward}
                  onChange={(e) => setShippingAddress((prev) => ({ ...prev, ward: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Payment method</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`rounded border px-3 py-2 text-sm transition-colors ${
                      paymentMethod === "cod"
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    COD
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("vnpay")}
                    className={`rounded border px-3 py-2 text-sm transition-colors ${
                      paymentMethod === "vnpay"
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    VNPAY
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{total.toLocaleString("vi-VN")} đ</span>
              </div>
              {hasInvalidItems && (
                <p className="text-sm text-destructive">Please remove unavailable items before checkout.</p>
              )}
              <button
                onClick={handleCreateOrder}
                disabled={
                  !canCheckout ||
                  createOrderMutation.isPending ||
                  createVnpayCheckoutMutation.isPending
                }
                className="w-full bg-foreground text-background py-2.5 rounded disabled:opacity-50"
              >
                {createOrderMutation.isPending || createVnpayCheckoutMutation.isPending
                  ? paymentMethod === "vnpay"
                    ? "Redirecting to VNPAY..."
                    : "Placing order..."
                  : paymentMethod === "vnpay"
                    ? "Pay with VNPAY"
                    : "Place Order (COD)"}
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
