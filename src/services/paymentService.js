import { defaultPaymentSettings, seedTransactions } from "../data/paymentConfig";

export const paymentStorageKey = "sila-payment-state";
export const selectedCountryKey = "sila-selected-country";

export function createInitialPaymentState() {
  return {
    settings: defaultPaymentSettings,
    transactions: seedTransactions,
    webhookEvents: [
      {
        id: "evt_demo_001",
        gatewayId: "moyasar",
        type: "payment.paid",
        status: "processed",
        receivedAt: "2026-04-21T09:25:04.000Z",
        payloadPreview: "{ id: 'pay_demo', status: 'paid' }",
      },
    ],
  };
}

export function readPaymentState() {
  try {
    const raw = localStorage.getItem(paymentStorageKey);
    if (!raw) return createInitialPaymentState();
    const parsed = JSON.parse(raw);
    return {
      ...createInitialPaymentState(),
      ...parsed,
      settings: {
        ...defaultPaymentSettings,
        ...(parsed.settings || {}),
        currencies: { ...defaultPaymentSettings.currencies, ...(parsed.settings?.currencies || {}) },
        gateways: mergeGateways(defaultPaymentSettings.gateways, parsed.settings?.gateways),
      },
    };
  } catch {
    return createInitialPaymentState();
  }
}

export function persistPaymentState(state) {
  localStorage.setItem(paymentStorageKey, JSON.stringify(state));
}

export function getEnabledCountries(settings) {
  return [...(settings.countries || [])]
    .filter((country) => country.enabled)
    .sort((left, right) => Number(left.priority || 99) - Number(right.priority || 99));
}

export function resolveCountry(settings, requestedCode) {
  const enabled = getEnabledCountries(settings);
  return (
    enabled.find((country) => country.code === requestedCode) ||
    enabled.find((country) => country.code === settings.defaultCountry) ||
    enabled[0] ||
    settings.countries?.[0]
  );
}

export function getCurrency(settings, currencyCode) {
  return settings.currencies?.[currencyCode] || settings.currencies?.[settings.baseCurrency] || defaultPaymentSettings.currencies.SAR;
}

export function convertFromBase(amount, settings, countryCode) {
  const country = resolveCountry(settings, countryCode);
  const currency = getCurrency(settings, country.currency);
  const converted = Number(amount || 0) * Number(currency.manualRate || 1);
  if (currency.rounding === "ceil") return Math.ceil(converted);
  if (currency.rounding === "floor") return Math.floor(converted);
  return Math.round(converted * 100) / 100;
}

export function formatMoneyForCountry(amount, settings, countryCode) {
  const country = resolveCountry(settings, countryCode);
  const currency = getCurrency(settings, country.currency);
  const converted = convertFromBase(amount, settings, country.code);
  const formatted = new Intl.NumberFormat(currency.locale || country.locale || "ar-SA", {
    minimumFractionDigits: Number(currency.decimals ?? 2),
    maximumFractionDigits: Number(currency.decimals ?? 2),
  }).format(converted);
  return currency.symbolPosition === "before" ? `${currency.symbol} ${formatted}` : `${formatted} ${currency.symbol}`;
}

export function getAvailableGateways(settings, countryCode, total = 0) {
  const country = resolveCountry(settings, countryCode);
  return (settings.gateways || [])
    .filter((gateway) => {
      if (!gateway.enabled) return false;
      if (!gateway.supportedCountries?.includes(country.code)) return false;
      if (!gateway.supportedCurrencies?.includes(country.currency)) return false;
      const convertedTotal = convertFromBase(total, settings, country.code);
      if (gateway.minTotal && convertedTotal < Number(gateway.minTotal)) return false;
      if (gateway.maxTotal && convertedTotal > Number(gateway.maxTotal)) return false;
      return true;
    })
    .sort((left, right) => Number(left.order || 99) - Number(right.order || 99));
}

export async function initializePayment({ order, gateway, country, settings, idempotencyKey }) {
  await delay(500);
  const currency = getCurrency(settings, country.currency);
  const convertedAmount = convertFromBase(order.total, settings, country.code);
  const shouldFail = String(order.note || "").toLowerCase().includes("fail");
  const status = gateway.id === "cod" ? "pending" : shouldFail ? "failed" : settings.checkoutAutoAuthorize ? "authorized" : "paid";
  const now = new Date().toISOString();

  return {
    id: `txn_${Date.now()}`,
    reference: `PAY-${country.code}-${Date.now().toString().slice(-7)}`,
    orderId: order.id,
    customer: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
    country: country.code,
    currency: currency.code,
    gatewayId: gateway.id,
    status,
    amount: convertedAmount,
    idempotencyKey,
    createdAt: now,
    callbackUrl: gateway.callbackUrl || `/payments/callback/${gateway.id}`,
    timeline: [
      { at: now, status: "pending", note: `تم إنشاء العملية عبر ${gateway.name}` },
      { at: now, status, note: status === "failed" ? "فشل mock gateway" : "تم تسجيل نتيجة mock gateway" },
    ],
    notes: `Environment: ${gateway.environment}. Webhook placeholder ready.`,
  };
}

export async function verifyPayment(transaction) {
  await delay(300);
  return {
    ...transaction,
    verifiedAt: new Date().toISOString(),
  };
}

export async function refundPayment(transaction, amount) {
  await delay(400);
  const status = Number(amount) >= Number(transaction.amount) ? "refunded" : "partially_refunded";
  return {
    ...transaction,
    status,
    timeline: [
      ...(transaction.timeline || []),
      { at: new Date().toISOString(), status, note: `تم تسجيل refund placeholder بقيمة ${amount}` },
    ],
  };
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function mergeGateways(defaultGateways, savedGateways = []) {
  const savedById = new Map((savedGateways || []).map((gateway) => [gateway.id, gateway]));
  const mergedDefaults = defaultGateways.map((gateway) => ({
    ...gateway,
    ...(savedById.get(gateway.id) || {}),
  }));
  const customGateways = (savedGateways || []).filter((gateway) => !defaultGateways.some((defaultGateway) => defaultGateway.id === gateway.id));
  return [...mergedDefaults, ...customGateways];
}
