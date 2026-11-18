const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export const formatVnd = (amount: number) => vnd.format(amount);
