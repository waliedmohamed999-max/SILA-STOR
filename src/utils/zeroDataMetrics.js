const productMetricKeys = ["price", "rating", "stock", "threshold", "sales", "compareAtPrice", "cost", "compare_at_price"];
const customerMetricKeys = ["totalSpent", "total_spent", "orders", "orders_count"];
const orderMetricKeys = [
  "items",
  "total",
  "subtotal",
  "itemDiscount",
  "couponDiscount",
  "discountAmount",
  "shippingFee",
  "shippingCost",
  "tax",
  "taxAmount",
];
const lineItemMetricKeys = ["unitPrice", "price", "quantity", "discount", "taxRate", "weight"];

export function zeroProductMetrics(product) {
  return zeroKeys(product, productMetricKeys);
}

export function zeroCustomerMetrics(customer) {
  return zeroKeys(customer, customerMetricKeys);
}

export function zeroOrderMetrics(order) {
  const next = zeroKeys(order, orderMetricKeys);
  return {
    ...next,
    lineItems: Array.isArray(next.lineItems) ? next.lineItems.map(zeroLineItemMetrics) : next.lineItems,
    items: Array.isArray(next.items) ? next.items.map(zeroLineItemMetrics) : 0,
    shipping: next.shipping
      ? {
          ...next.shipping,
          packageCount: 0,
          totalWeight: 0,
        }
      : next.shipping,
  };
}

export function zeroLineItemMetrics(item) {
  return zeroKeys(item, lineItemMetricKeys);
}

function zeroKeys(source, keys) {
  if (!source) return source;
  return keys.reduce(
    (next, key) => (Object.prototype.hasOwnProperty.call(next, key) ? { ...next, [key]: 0 } : next),
    { ...source },
  );
}
