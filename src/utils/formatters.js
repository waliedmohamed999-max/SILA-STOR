const settingsStorageKey = "sila-settings";
const paymentStorageKey = "sila-payment-state";
const selectedCountryKey = "sila-selected-country";

const currencyConfig = {
  SAR: { symbol: "ر.س", locale: "ar-SA", rate: 1 },
  EGP: { symbol: "ج.م", locale: "ar-EG", rate: 13.1 },
  AED: { symbol: "د.إ", locale: "ar-AE", rate: 0.98 },
};

export const money = (value) => {
  const { symbol, locale, rate } = getCurrencyMeta();
  const amount = (Number(value) || 0) * Number(rate || 1);
  const minimumFractionDigits = Number.isInteger(amount) ? 0 : 2;
  return `${amount.toLocaleString(locale, { minimumFractionDigits, maximumFractionDigits: 2 })} ${symbol}`;
};

export const compactMoney = (value) => {
  const { symbol, locale, rate } = getCurrencyMeta();
  const amount = (Number(value) || 0) * Number(rate || 1);
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
    const paymentRaw = localStorage.getItem(paymentStorageKey);
    if (paymentRaw) {
      const payment = JSON.parse(paymentRaw);
      const selectedCountry = localStorage.getItem(selectedCountryKey) || payment.settings?.defaultCountry;
      const country = (payment.settings?.countries || []).find((item) => item.code === selectedCountry && item.enabled);
      const currency = payment.settings?.currencies?.[country?.currency];
      if (country && currency) {
        return {
          symbol: currency.symbol || currencyConfig[currency.code]?.symbol,
          locale: currency.locale || country.locale || "ar-SA",
          rate: Number(currency.manualRate || 1),
        };
      }
    }

    const raw = localStorage.getItem(settingsStorageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    const billing = parsed?.billing || {};
    const code = currencyConfig[billing.currency] ? billing.currency : "SAR";
    return {
      ...currencyConfig[code],
      symbol: billing.currencySymbol || currencyConfig[code].symbol,
    };
  } catch {
    return currencyConfig.SAR;
  }
}
