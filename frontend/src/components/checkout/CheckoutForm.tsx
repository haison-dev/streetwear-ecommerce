import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatVnd } from "@/lib/money";
import { getErrorMessage } from "@/lib/apiError";
import { useCreateOrderMutation } from "@/hooks/useOrderQueries";
import { useCreateVnpayCheckoutMutation } from "@/hooks/usePaymentQueries";
import { orderService, type OrderShippingAddress } from "@/services/orderService";
import { useAuthStore } from "@/stores/useAuthStore";

const fields = [
  { key: "name", label: "Full name", autoComplete: "shipping name" },
  { key: "phone", label: "Phone", autoComplete: "shipping tel" },
  { key: "address", label: "Street address", autoComplete: "shipping street-address" },
  { key: "city", label: "City or province", autoComplete: "shipping address-level1" },
  { key: "district", label: "District", autoComplete: "shipping address-level2" },
  { key: "ward", label: "Ward (optional)", autoComplete: "shipping address-level3" },
] as const;

export default function CheckoutForm({ cartUpdatedAt, hasInvalidItems, cartBusy, refreshCart }: {
  cartUpdatedAt: number;
  hasInvalidItems: boolean;
  cartBusy: boolean;
  refreshCart: () => void;
}) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [address, setAddress] = useState<OrderShippingAddress>({
    name: user?.displayName ?? "", phone: "", address: "", city: "", district: "", ward: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vnpay">("cod");
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [note, setNote] = useState("");
  const [quoteCity, setQuoteCity] = useState("");
  const transaction = useRef(false);
  const orders = useCreateOrderMutation();
  const payment = useCreateVnpayCheckoutMutation();
  const city = address.city.trim();

  useEffect(() => {
    const timer = window.setTimeout(() => setQuoteCity(city), 300);
    return () => window.clearTimeout(timer);
  }, [city]);

  const quote = useQuery({
    queryKey: ["checkout-quote", user?.id, cartUpdatedAt, quoteCity, couponCode],
    queryFn: () => orderService.quote(quoteCity, couponCode),
    enabled: !hasInvalidItems && !cartBusy && Boolean(user) && Boolean(quoteCity),
    retry: false,
  });
  const price = quote.data;
  const submitting = orders.isPending || payment.isPending;
  const canSubmit = !hasInvalidItems && !cartBusy && !submitting && !quote.isFetching && !quote.isError
    && city === quoteCity && Boolean(price) && couponInput.trim().toUpperCase() === couponCode;

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !price || transaction.current) return;
    transaction.current = true;
    try {
      const result = await orders.mutateAsync({
        shippingAddress: { ...address, city }, paymentMethod, note, couponCode, expectedTotal: price.totalPrice,
      });
      const orderPath = `/account/orders/${result.order._id}`;
      if (paymentMethod === "cod") {
        toast.success("Order placed");
        navigate(orderPath);
        return;
      }
      try {
        const checkout = await payment.mutateAsync({ paymentId: result.payment._id, locale: "vn" });
        const checkoutUrl = checkout?.checkoutUrl || checkout?.nextAction?.checkoutUrl;
        if (!checkoutUrl) throw new Error("Checkout URL missing");
        window.location.assign(checkoutUrl);
      } catch {
        toast.error("Order saved. You can complete payment from My orders.");
        navigate("/account/orders");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not place order"));
      refreshCart();
    } finally {
      transaction.current = false;
    }
  }

  return (
    <form className="store-panel space-y-6 p-5 sm:p-6" onSubmit={placeOrder}>
      <div>
        <p className="store-label mb-2">Delivery and payment</p>
        <h2 className="font-display text-3xl">Checkout.</h2>
      </div>
      <fieldset className="grid gap-3 sm:grid-cols-2" disabled={submitting}>
        <legend className="mb-3 text-sm font-bold">Shipping address</legend>
        {fields.map(({ key, label, autoComplete }) => (
          <label key={key} className={`grid gap-1 text-xs font-semibold ${key === "address" ? "sm:col-span-2" : ""}`}>
            {label}
            <input className="store-field" name={key} value={address[key]} autoComplete={autoComplete} type={key === "phone" ? "tel" : "text"}
              required={key !== "ward"} maxLength={160}
              onChange={(event) => setAddress((previous) => ({ ...previous, [key]: event.target.value }))} />
          </label>
        ))}
        <label className="grid gap-1 text-xs font-semibold sm:col-span-2">
          Delivery note (optional)
          <textarea className="store-field" rows={2} maxLength={300} value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
      </fieldset>
      <fieldset disabled={submitting} className="space-y-2">
        <legend className="text-sm font-bold">Payment method</legend>
        {([{ id: "cod", label: "Cash on delivery" }, { id: "vnpay", label: "VNPay" }] as const).map(({ id, label }) => (
          <label key={id} className="flex items-center gap-3 border border-border bg-background p-3 text-sm">
            <input type="radio" name="paymentMethod" checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} />
            {label}
          </label>
        ))}
      </fieldset>
      <div>
        <label className="mb-1 block text-xs font-semibold" htmlFor="checkout-coupon">Promo code</label>
        <div className="flex gap-2">
          <input id="checkout-coupon" className="store-field min-w-0" value={couponInput} maxLength={40}
            disabled={submitting} onChange={(event) => setCouponInput(event.target.value)} />
          <button className="shrink-0 border border-border bg-background px-3 text-sm font-semibold" type="button" disabled={submitting}
            onClick={() => setCouponCode(couponInput.trim().toUpperCase())}>Apply</button>
          {couponCode && <button className="text-sm underline" type="button" disabled={submitting}
            onClick={() => { setCouponInput(""); setCouponCode(""); }}>Clear</button>}
        </div>
      </div>
      {hasInvalidItems ? <p className="text-sm text-destructive">Update unavailable items in your bag before checking out.</p>
        : quote.isError ? <p role="alert" className="text-sm text-destructive">{getErrorMessage(quote.error, "Could not calculate total.")} <button type="button" className="underline" onClick={() => void quote.refetch()}>Retry</button></p>
        : !city ? <p className="text-sm text-muted-foreground">Enter your city or province to calculate delivery.</p>
        : cartBusy || quote.isFetching || city !== quoteCity ? <p role="status" className="text-sm">Updating total…</p>
        : price && (
          <dl className="space-y-2 border-t border-border pt-4 text-sm" aria-live="polite">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatVnd(price.itemsPrice)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd>{formatVnd(price.shippingFee)}</dd></div>
            {price.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>−{formatVnd(price.discount)}</dd></div>}
            <div className="flex justify-between border-t border-border pt-3 text-lg font-bold"><dt>Total</dt><dd>{formatVnd(price.totalPrice)}</dd></div>
          </dl>
        )}
      <button type="submit" className="store-action w-full" disabled={!canSubmit}>
        {submitting ? "Processing…" : paymentMethod === "cod" ? "Place order" : "Continue to VNPay"}
      </button>
    </form>
  );
}
