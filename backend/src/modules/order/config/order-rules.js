export const ALLOW_PAYMENT_METHODS = ["cod", "momo", "vnpay"];

export const SHIPPING_RULES = {
  baseFee: 30000,
  lowValueSurcharge: 5000,
  lowValueThreshold: 150000,
  freeShippingThreshold: 500000,
  nonMetroSurcharge: 10000,
  metroCities: new Set(["ho chi minh", "hcm", "ha noi", "da nang"]),
};

export const COUPON_RULES = [
  { code: "SAVE5", type: "percent", value: 5, minOrder: 100000, maxDiscount: 30000 },
  { code: "SAVE10", type: "percent", value: 10, minOrder: 200000, maxDiscount: 100000 },
  { code: "SAVE20", type: "percent", value: 20, minOrder: 500000, maxDiscount: 150000 },
  { code: "LESS30K", type: "fixed", value: 30000, minOrder: 300000 },
];

export const MAX_ORDER_NUMBER_RETRIES = 5;
