import { CreditCard, Globe2, KeyRound, ListFilter, RotateCcw, Save, Search, ShieldCheck, Webhook } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import { usePayments } from "../context/PaymentContext";
import { paymentStatuses } from "../data/paymentConfig";

const tabs = [
  ["countries", "الدول والعملات", Globe2],
  ["gateways", "بوابات الدفع", CreditCard],
  ["ordering", "الترتيب والقواعد", ListFilter],
  ["transactions", "العمليات", ShieldCheck],
  ["webhooks", "Logs / Webhooks", Webhook],
];

export default function PaymentsAdmin() {
  const [tab, setTab] = useState("countries");
  const payments = usePayments();

  return (
    <div className="space-y-6" dir="rtl">
      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">Payment & Currency Management</p>
            <h1 className="mt-2 font-heading text-2xl font-black text-slate-950 dark:text-white">إدارة الدفع والدول والعملات</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              بنية جاهزة للربط مع Stripe, Paymob, Moyasar, Tap وأي بوابة جديدة عبر adapters وwebhook placeholders.
            </p>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <Metric label="الدولة النشطة" value={payments.activeCountry?.name} />
            <Metric label="العملة" value={payments.activeCurrency?.code} />
            <Metric label="Test mode" value={payments.settings.testMode ? "مفعل" : "Live"} />
          </div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex gap-2 overflow-x-auto border-b border-slate-200 p-3 dark:border-slate-800">
          {tabs.map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black transition ${
                tab === key ? "bg-accent text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
        <div className="p-4 sm:p-5">
          {tab === "countries" && <CountryCurrencyPanel payments={payments} />}
          {tab === "gateways" && <GatewayPanel payments={payments} />}
          {tab === "ordering" && <RulesPanel payments={payments} />}
          {tab === "transactions" && <TransactionsPanel payments={payments} />}
          {tab === "webhooks" && <WebhookPanel payments={payments} />}
        </div>
      </section>
    </div>
  );
}

function CountryCurrencyPanel({ payments }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {payments.settings.countries.map((country) => (
          <article key={country.code} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-xl font-black text-slate-950 dark:text-white">{country.name}</h3>
                <p className="text-sm text-slate-500">{country.englishName} · {country.currency}</p>
              </div>
              <Toggle checked={country.enabled} onChange={(enabled) => payments.updateCountry(country.code, { enabled })} />
            </div>
            <div className="mt-4 grid gap-3">
              <Select label="العملة" value={country.currency} onChange={(currency) => payments.updateCountry(country.code, { currency })} options={Object.keys(payments.settings.currencies)} />
              <Field label="الأولوية" type="number" value={country.priority} onChange={(priority) => payments.updateCountry(country.code, { priority: Number(priority) })} />
              <Field label="الضريبة %" type="number" value={country.taxRate} onChange={(taxRate) => payments.updateCountry(country.code, { taxRate: Number(taxRate) })} />
              <Field label="رسوم الشحن" type="number" value={country.shippingFee} onChange={(shippingFee) => payments.updateCountry(country.code, { shippingFee: Number(shippingFee) })} />
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
        <div className="mb-4 flex items-center gap-2">
          <Globe2 size={18} className="text-accent" />
          <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">إعدادات العملات والتحويل</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.values(payments.settings.currencies).map((currency) => (
            <article key={currency.code} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
              <h4 className="font-black text-slate-950 dark:text-white">{currency.code}</h4>
              <div className="mt-3 grid gap-3">
                <Field label="الرمز" value={currency.symbol} onChange={(symbol) => payments.updateCurrency(currency.code, { symbol })} />
                <Field label="Manual rate" type="number" value={currency.manualRate} onChange={(manualRate) => payments.updateCurrency(currency.code, { manualRate: Number(manualRate) })} />
                <Field label="Decimals" type="number" value={currency.decimals} onChange={(decimals) => payments.updateCurrency(currency.code, { decimals: Number(decimals) })} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function GatewayPanel({ payments }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {payments.settings.gateways.map((gateway) => (
        <article key={gateway.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-xl font-black text-slate-950 dark:text-white">{gateway.name}</h3>
                <Badge tone={gateway.environment === "live" ? "success" : "warning"}>{gateway.environment}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">{gateway.supportedCountries.join(", ")} · {gateway.supportedCurrencies.join(", ")}</p>
            </div>
            <Toggle checked={gateway.enabled} onChange={(enabled) => payments.updateGateway(gateway.id, { enabled })} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Select label="البيئة" value={gateway.environment} onChange={(environment) => payments.updateGateway(gateway.id, { environment })} options={["sandbox", "live"]} />
            <Field label="Merchant ID" value={gateway.merchantId} onChange={(merchantId) => payments.updateGateway(gateway.id, { merchantId })} />
            <SecretField label="API Key" value={gateway.apiKey} onChange={(apiKey) => payments.updateGateway(gateway.id, { apiKey })} />
            <SecretField label="Secret Key" value={gateway.secretKey} onChange={(secretKey) => payments.updateGateway(gateway.id, { secretKey })} />
            <SecretField label="Webhook Secret" value={gateway.webhookSecret} onChange={(webhookSecret) => payments.updateGateway(gateway.id, { webhookSecret })} />
            <Field label="Callback URL" value={gateway.callbackUrl} onChange={(callbackUrl) => payments.updateGateway(gateway.id, { callbackUrl })} />
          </div>
        </article>
      ))}
    </div>
  );
}

function RulesPanel({ payments }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Select label="الدولة الافتراضية" value={payments.settings.defaultCountry} onChange={(defaultCountry) => payments.updatePaymentSettings({ defaultCountry })} options={payments.settings.countries.map((item) => item.code)} />
        <Select label="Base currency" value={payments.settings.baseCurrency} onChange={(baseCurrency) => payments.updatePaymentSettings({ baseCurrency })} options={Object.keys(payments.settings.currencies)} />
        <ToggleCard label="Auto detection" checked={payments.settings.autoDetection} onChange={(autoDetection) => payments.updatePaymentSettings({ autoDetection })} />
        <ToggleCard label="Test mode" checked={payments.settings.testMode} onChange={(testMode) => payments.updatePaymentSettings({ testMode })} />
      </div>
      <div className="grid gap-3">
        {payments.settings.gateways
          .slice()
          .sort((a, b) => Number(a.order) - Number(b.order))
          .map((gateway) => (
            <div key={gateway.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_120px_1fr] md:items-center dark:border-slate-800">
              <div>
                <p className="font-black text-slate-950 dark:text-white">{gateway.name}</p>
                <p className="text-sm text-slate-500">Countries: {gateway.supportedCountries.join(", ")} · Currencies: {gateway.supportedCurrencies.join(", ")}</p>
              </div>
              <Field label="Order" type="number" value={gateway.order} onChange={(order) => payments.updateGateway(gateway.id, { order: Number(order) })} />
              <p className="text-sm text-slate-500">Drag & drop placeholder: يمكن استبدال الرقم لاحقا بـ dnd-kit بدون تغيير بنية gateway.</p>
            </div>
          ))}
      </div>
    </div>
  );
}

function TransactionsPanel({ payments }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return payments.transactions.filter((transaction) => {
      const matchesQuery = !needle || `${transaction.reference} ${transaction.orderId} ${transaction.customer} ${transaction.gatewayId}`.toLowerCase().includes(needle);
      const matchesStatus = status === "all" || transaction.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [payments.transactions, query, status]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
          <Search size={17} className="text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="بحث برقم الطلب أو العملية أو العميل" className="w-full bg-transparent text-sm outline-none dark:text-white" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="input-like">
          <option value="all">كل الحالات</option>
          {Object.entries(paymentStatuses).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}
        </select>
      </div>

      {filtered.length ? (
        <div className="grid gap-3">
          {filtered.map((transaction) => {
            const meta = paymentStatuses[transaction.status] || paymentStatuses.pending;
            return (
              <article key={transaction.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr_.8fr_auto] xl:items-center">
                  <div>
                    <p className="font-black text-slate-950 dark:text-white">{transaction.reference}</p>
                    <p className="text-sm text-slate-500">{transaction.orderId} · {transaction.customer}</p>
                  </div>
                  <p className="font-black text-slate-950 dark:text-white">{transaction.amount} {transaction.currency}</p>
                  <p className="text-sm font-bold text-slate-500">{transaction.gatewayId} · {transaction.country}</p>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => payments.updateTransaction(transaction.id, { status: "paid", note: "تأكيد يدوي" })}>تأكيد كمدفوع</Button>
                  <Button size="sm" variant="secondary" onClick={() => payments.updateTransaction(transaction.id, { status: "failed", note: "فشل يدوي" })}>تعليم كفاشل</Button>
                  <Button size="sm" variant="secondary" onClick={() => payments.refundTransaction(transaction, transaction.amount)}>Refund placeholder</Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="لا توجد عمليات" text="غيّر الفلاتر أو أنشئ طلبا من checkout لظهور عملية دفع جديدة." />
      )}
    </div>
  );
}

function WebhookPanel({ payments }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-accent" />
          <p className="font-heading text-lg font-black text-slate-950 dark:text-white">Webhook placeholders</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          جهز endpoint لكل gateway مثل `/api/payments/webhooks/:gateway`. يتم التحقق من `webhookSecret` ثم تحديث transaction timeline.
        </p>
      </div>
      <div className="grid gap-3">
        {payments.webhookEvents.map((event) => (
          <div key={event.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="font-black text-slate-950 dark:text-white">{event.type}</p>
            <p className="mt-1 text-sm text-slate-500">{event.gatewayId} · {event.status} · {new Date(event.receivedAt).toLocaleString("ar-SA")}</p>
            <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950 p-3 text-left text-xs text-emerald-300" dir="ltr">{event.payloadPreview}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-black text-slate-500">{label}</span>
      <input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="input-like" />
    </label>
  );
}

function SecretField({ label, value, onChange }) {
  return <Field label={label} value={maskSecret(value)} onChange={onChange} />;
}

function Select({ label, value, onChange, options }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-black text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="input-like">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`h-7 w-12 rounded-full p-1 transition ${checked ? "bg-accent" : "bg-slate-300 dark:bg-slate-700"}`}>
      <span className={`block h-5 w-5 rounded-full bg-white transition ${checked ? "-translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function ToggleCard({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <span className="font-black text-slate-950 dark:text-white">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function maskSecret(value = "") {
  if (!value) return "";
  if (String(value).includes("*")) return value;
  return `${String(value).slice(0, 4)}********`;
}
