const settingsStorageKey = "sila-settings";

const currencyConfig = {
  SAR: { symbol: "ر.س", locale: "en-SA" },
  EGP: { symbol: "ج.م", locale: "en-EG" },
};

export const money = (value) => {
  const amount = Number(value) || 0;
  const { symbol, locale } = getCurrencyMeta();
  const minimumFractionDigits = Number.isInteger(amount) ? 0 : 2;
  return `${amount.toLocaleString(locale, { minimumFractionDigits, maximumFractionDigits: 2 })} ${symbol}`;
};

export const compactMoney = (value) => {
  const amount = Number(value) || 0;
  const { symbol, locale } = getCurrencyMeta();
  const formatted = new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
  return `${formatted} ${symbol}`;
};

export const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const stockState = (product) => {
  if (product.stock === 0) return "Out of stock";
  if (product.stock <= product.threshold) return "Low stock";
  return "In stock";
};

export const statusTone = (value) =>
  ({
    Pending: "warning",
    Processing: "accent",
    Shipped: "info",
    Delivered: "success",
    Cancelled: "danger",
    "In stock": "success",
    "Low stock": "warning",
    "Out of stock": "danger",
    Platinum: "accent",
    Gold: "warning",
    Silver: "neutral",
    Bronze: "neutral",
  })[value] || "neutral";

export const sortBy = (items, sort) =>
  [...items].sort((a, b) => {
    const left = a[sort.key];
    const right = b[sort.key];
    const result = left > right ? 1 : left < right ? -1 : 0;
    return sort.direction === "asc" ? result : -result;
  });

function getCurrencyMeta() {
  try {
    const raw = localStorage.getItem(settingsStorageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    const billing = parsed?.billing || {};
    const code = billing.currency === "EGP" ? "EGP" : "SAR";
    return {
      ...currencyConfig[code],
      symbol: billing.currencySymbol || currencyConfig[code].symbol,
    };
  } catch {
    return currencyConfig.SAR;
  }
}
