import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  formatMoneyForCountry,
  getAvailableGateways,
  getEnabledCountries,
  initializePayment,
  persistPaymentState,
  readPaymentState,
  refundPayment,
  resolveCountry,
  selectedCountryKey,
} from "../services/paymentService";
import { useToast } from "./ToastContext";

const PaymentContext = createContext(null);

export function PaymentProvider({ children }) {
  const { showToast } = useToast();
  const [state, setState] = useState(() => readPaymentState());
  const [selectedCountryCode, setSelectedCountryCode] = useState(() => localStorage.getItem(selectedCountryKey) || state.settings.defaultCountry);

  useEffect(() => {
    persistPaymentState(state);
  }, [state]);

  useEffect(() => {
    const resolved = resolveCountry(state.settings, selectedCountryCode);
    if (resolved?.code && resolved.code !== selectedCountryCode) {
      localStorage.setItem(selectedCountryKey, resolved.code);
      setSelectedCountryCode(resolved.code);
    }
    if (resolved?.code) localStorage.setItem(selectedCountryKey, resolved.code);
  }, [selectedCountryCode, state.settings]);

  const activeCountry = useMemo(() => resolveCountry(state.settings, selectedCountryCode), [selectedCountryCode, state.settings]);
  const enabledCountries = useMemo(() => getEnabledCountries(state.settings), [state.settings]);
  const activeCurrency = state.settings.currencies?.[activeCountry?.currency] || state.settings.currencies?.SAR;

  const setCountry = useCallback((countryCode) => {
    const country = resolveCountry(state.settings, countryCode);
    if (!country?.enabled) {
      showToast("الدولة غير مفعلة", "تم الرجوع إلى الدولة الافتراضية المتاحة.", "error");
      localStorage.setItem(selectedCountryKey, state.settings.defaultCountry);
      setSelectedCountryCode(state.settings.defaultCountry);
      return;
    }
    localStorage.setItem(selectedCountryKey, country.code);
    setSelectedCountryCode(country.code);
  }, [showToast, state.settings]);

  const updatePaymentSettings = useCallback((updates) => {
    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        ...updates,
      },
    }));
  }, []);

  const updateCountry = useCallback((countryCode, updates) => {
    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        countries: current.settings.countries.map((country) => (country.code === countryCode ? { ...country, ...updates } : country)),
      },
    }));
  }, []);

  const updateGateway = useCallback((gatewayId, updates) => {
    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        gateways: current.settings.gateways.map((gateway) => (gateway.id === gatewayId ? { ...gateway, ...updates } : gateway)),
      },
    }));
  }, []);

  const updateCurrency = useCallback((currencyCode, updates) => {
    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        currencies: {
          ...current.settings.currencies,
          [currencyCode]: {
            ...current.settings.currencies[currencyCode],
            ...updates,
          },
        },
      },
    }));
  }, []);

  const createPayment = useCallback(async ({ order, gatewayId }) => {
    const country = resolveCountry(state.settings, order.country || activeCountry.code);
    const gateway = getAvailableGateways(state.settings, country.code, order.total).find((item) => item.id === gatewayId);
    if (!gateway) throw new Error("بوابة الدفع غير متاحة لهذه الدولة أو العملة.");
    const idempotencyKey = `idem_${order.id}_${gateway.id}`;
    const existing = state.transactions.find((item) => item.idempotencyKey === idempotencyKey && !["failed", "cancelled", "expired"].includes(item.status));
    if (existing && state.settings.preventDuplicatePayments) return existing;

    const transaction = await initializePayment({ order, gateway, country, settings: state.settings, idempotencyKey });
    setState((current) => ({
      ...current,
      transactions: [transaction, ...current.transactions],
    }));
    return transaction;
  }, [activeCountry, state.settings, state.transactions]);

  const updateTransaction = useCallback((transactionId, updates) => {
    setState((current) => ({
      ...current,
      transactions: current.transactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              ...updates,
              timeline: updates.timeline || [
                ...(transaction.timeline || []),
                { at: new Date().toISOString(), status: updates.status || transaction.status, note: updates.note || "تحديث يدوي" },
              ],
            }
          : transaction,
      ),
    }));
  }, []);

  const refundTransaction = useCallback(async (transaction, amount) => {
    const refunded = await refundPayment(transaction, amount);
    setState((current) => ({
      ...current,
      transactions: current.transactions.map((item) => (item.id === transaction.id ? refunded : item)),
    }));
    showToast("تم تسجيل الاسترداد", "تمت إضافة عملية الاسترداد كسجل placeholder.", "success");
  }, [showToast]);

  const money = useCallback((amount, countryCode = activeCountry?.code) => formatMoneyForCountry(amount, state.settings, countryCode), [activeCountry?.code, state.settings]);
  const gatewaysForCountry = useCallback((countryCode = activeCountry?.code, total = 0) => getAvailableGateways(state.settings, countryCode, total), [activeCountry?.code, state.settings]);

  const value = useMemo(() => ({
    settings: state.settings,
    transactions: state.transactions,
    webhookEvents: state.webhookEvents,
    activeCountry,
    activeCurrency,
    enabledCountries,
    selectedCountryCode,
    setCountry,
    money,
    gatewaysForCountry,
    createPayment,
    updatePaymentSettings,
    updateCountry,
    updateCurrency,
    updateGateway,
    updateTransaction,
    refundTransaction,
  }), [activeCountry, activeCurrency, createPayment, enabledCountries, gatewaysForCountry, money, refundTransaction, selectedCountryCode, setCountry, state, updateCountry, updateCurrency, updateGateway, updatePaymentSettings, updateTransaction]);

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export function usePayments() {
  const context = useContext(PaymentContext);
  if (!context) throw new Error("usePayments must be used within PaymentProvider");
  return context;
}
