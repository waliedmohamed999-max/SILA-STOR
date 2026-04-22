import { CheckCircle2, CreditCard, MapPin, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import { useCart } from "../context/CartContext";
import { usePayments } from "../context/PaymentContext";
import { useSettings } from "../context/SettingsContext";
import { paymentStatuses } from "../data/paymentConfig";
import { categoryLabel } from "../utils/labels";

const steps = ["العميل", "الشحن", "الدفع", "المراجعة"];

export default function Checkout() {
  const [code, setCode] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const {
    items,
    subtotal,
    discount,
    discountAmount,
    shippingCost,
    total,
    checkoutForm,
    updateCheckoutField,
    applyDiscount,
    createOrder,
  } = useCart();
  const { settings } = useSettings();
  const { activeCountry, activeCurrency, enabledCountries, setCountry, gatewaysForCountry, createPayment, money } = usePayments();

  const availableGateways = useMemo(() => gatewaysForCountry(activeCountry?.code, total), [activeCountry?.code, gatewaysForCountry, total]);

  const shippingMethods = useMemo(() => {
    const providers = settings.shipping?.providers || [];
    const configured = providers
      .filter((provider) => provider.enabled && provider.status === "connected")
      .flatMap((provider) =>
        (provider.services || [])
          .filter((service) => service.enabled)
          .map((service) => ({
            value: service.key,
            label: service.label,
            note: `${provider.name} · ${service.eta}`,
            extra: Number(service.fee || 0),
          })),
      );

    return [
      {
        value: `market_${activeCountry?.code || "SA"}`,
        label: `شحن ${activeCountry?.name || "محلي"}`,
        note: `خدمة مرتبطة بسوق ${activeCountry?.name || "المتجر"}`,
        extra: Number(activeCountry?.shippingFee || 0),
      },
      ...configured,
      { value: "pickup", label: "الاستلام من الفرع", note: "استلام بدون رسوم بعد تأكيد الجاهزية", extra: 0 },
    ];
  }, [activeCountry, settings.shipping]);

  const taxableTotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableTotal * (Number(activeCountry?.taxRate || 0) / 100);
  const grandTotal = total + taxAmount;

  useEffect(() => {
    if (availableGateways.length && !availableGateways.some((gateway) => gateway.id === checkoutForm.paymentMethod)) {
      updateCheckoutField("paymentMethod", availableGateways[0].id);
    }
  }, [availableGateways, checkoutForm.paymentMethod, updateCheckoutField]);

  useEffect(() => {
    const marketShipping = `market_${activeCountry?.code || "SA"}`;
    if (!checkoutForm.shippingMethod || checkoutForm.shippingMethod === "standard") {
      updateCheckoutField("shippingMethod", marketShipping);
    }
  }, [activeCountry?.code, checkoutForm.shippingMethod, updateCheckoutField]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (processing) return;
    setProcessing(true);
    try {
      const order = await createOrder();
      if (!order) return;
      const enrichedOrder = {
        ...order,
        country: activeCountry.code,
        currency: activeCurrency.code,
        taxAmount,
        total: grandTotal,
      };
      const transaction = await createPayment({ order: enrichedOrder, gatewayId: checkoutForm.paymentMethod });
      setCreatedOrder({ ...enrichedOrder, transaction });
    } finally {
      setProcessing(false);
    }
  };

  if (!items.length && createdOrder) {
    const status = paymentStatuses[createdOrder.transaction?.status] || paymentStatuses.pending;
    return (
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="card p-6 text-center sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <CheckCircle2 size={30} />
          </div>
          <h1 className="mt-5 font-heading text-3xl font-black text-slate-950 dark:text-white">تم إنشاء الطلب</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            رقم الطلب <span className="font-black text-slate-900 dark:text-white">{createdOrder.id}</span> وتم تسجيل عملية الدفع
            <span className="font-black text-slate-900 dark:text-white"> {createdOrder.transaction?.reference}</span>.
          </p>
          <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-right dark:border-slate-800 dark:bg-slate-900/60 sm:grid-cols-3">
            <SummaryMetric label="الإجمالي" value={money(createdOrder.total, createdOrder.country)} />
            <SummaryMetric label="الدولة / العملة" value={`${activeCountry.name} · ${createdOrder.currency}`} />
            <div>
              <p className="text-xs font-bold text-slate-500">حالة الدفع</p>
              <div className="mt-2"><Badge tone={status.tone}>{status.label}</Badge></div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/">
              <Button><ShoppingBag size={17} />العودة إلى المتجر</Button>
            </Link>
            <Link to="/admin/payments">
              <Button variant="secondary">عرض العمليات</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title="لا توجد عملية دفع نشطة"
        text="أضف منتجات إلى السلة أولا ثم عد إلى صفحة الدفع لاستكمال بيانات الشحن والدفع."
        action={<Link to="/"><Button><ShoppingBag size={17} />العودة إلى المتجر</Button></Link>}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:gap-6 xl:grid-cols-[1fr_400px]">
      <section className="order-2 space-y-4 sm:space-y-6 xl:order-1">
        <div className="card p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-black text-slate-950 dark:text-white">إتمام الطلب</h1>
              <p className="mt-1 text-sm text-slate-500">Checkout متعدد الدول والعملات وجاهز للربط مع بوابات الدفع.</p>
            </div>
            <div className="grid grid-cols-4 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/60">
              {steps.map((step, index) => (
                <span key={step} className="rounded-xl bg-white px-2 py-2 text-center text-[11px] font-black text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  {index + 1}. {step}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Panel icon={MapPin} title="بيانات العميل والدولة" description="اختيار الدولة يغير العملة والضرائب وطرق الدفع المتاحة.">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">الدولة والعملة</span>
              <select value={activeCountry?.code} onChange={(event) => setCountry(event.target.value)} className="input-like">
                {enabledCountries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} · {country.currency}
                  </option>
                ))}
              </select>
            </label>
            <Field label="الاسم الأول" value={checkoutForm.firstName} onChange={(value) => updateCheckoutField("firstName", value)} required />
            <Field label="اسم العائلة" value={checkoutForm.lastName} onChange={(value) => updateCheckoutField("lastName", value)} required />
            <Field label="البريد الإلكتروني" type="email" value={checkoutForm.email} onChange={(value) => updateCheckoutField("email", value)} required />
            <Field label="رقم الجوال" type="tel" value={checkoutForm.phone} onChange={(value) => updateCheckoutField("phone", value)} required />
            <Field label="المدينة" value={checkoutForm.city} onChange={(value) => updateCheckoutField("city", value)} required />
            <Field label="الحي / المنطقة" value={checkoutForm.area} onChange={(value) => updateCheckoutField("area", value)} />
            <Field className="md:col-span-2" label="العنوان التفصيلي" value={checkoutForm.address} onChange={(value) => updateCheckoutField("address", value)} required />
          </div>
        </Panel>

        <Panel icon={Truck} title="وسيلة الشحن" description="رسوم الشحن تتغير حسب الدولة وإعدادات مزودي الشحن.">
          <div className="grid gap-3">
            {shippingMethods.map((option) => (
              <ChoiceCard
                key={option.value}
                active={checkoutForm.shippingMethod === option.value}
                label={option.label}
                note={option.note}
                extra={option.extra === 0 ? "مجاني" : money(option.extra)}
                onClick={() => updateCheckoutField("shippingMethod", option.value)}
              />
            ))}
          </div>
        </Panel>

        <Panel icon={CreditCard} title="وسيلة الدفع" description="تظهر البوابات المتاحة فقط للدولة والعملة وإجمالي الطلب.">
          <div className="grid gap-3">
            {availableGateways.map((gateway) => (
              <ChoiceCard
                key={gateway.id}
                active={checkoutForm.paymentMethod === gateway.id}
                label={gateway.name}
                note={`${gateway.environment === "live" ? "Live" : "Sandbox"} · ${gateway.supportedCurrencies.join(", ")} · ${gateway.callbackUrl || "Webhook placeholder"}`}
                onClick={() => updateCheckoutField("paymentMethod", gateway.id)}
              />
            ))}
            {!availableGateways.length && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-700">
                لا توجد بوابة دفع مفعلة لهذه الدولة أو العملة.
              </div>
            )}
          </div>
        </Panel>
      </section>

      <aside className="order-1 space-y-4 sm:space-y-6 xl:order-2 xl:sticky xl:top-24 xl:self-start">
        <div className="card p-4 sm:p-5">
          <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">مراجعة الطلب</h2>
          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-slate-500">{categoryLabel(item.category)} · {item.quantity}x</p>
                </div>
                <p className="text-sm font-black text-slate-950 dark:text-white">{money(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-2 min-[420px]:flex">
            <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="كود الخصم" className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            <Button type="button" variant="secondary" onClick={() => applyDiscount(code)}>تطبيق</Button>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <PriceRow label="الإجمالي الفرعي" value={money(subtotal)} />
            <PriceRow label={`الخصم${discount.code ? ` (${discount.code})` : ""}`} value={`-${money(discountAmount)}`} />
            <PriceRow label="الشحن" value={shippingCost === 0 ? "مجاني" : money(shippingCost)} />
            <PriceRow label={`الضريبة (${activeCountry?.taxRate || 0}%)`} value={money(taxAmount)} />
            <PriceRow label="الدولة / العملة" value={`${activeCountry?.name} · ${activeCurrency?.code}`} />
            <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
              <PriceRow label="الإجمالي النهائي" value={money(grandTotal)} large />
            </div>
          </div>

          <Button type="submit" className="mt-5 w-full" disabled={processing || !availableGateways.length}>
            <ShieldCheck size={18} />
            {processing ? "جاري إنشاء الدفع..." : "تأكيد الطلب والدفع"}
          </Button>
        </div>

        <div className="card p-4 sm:p-5">
          <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">جاهزية التنفيذ</h2>
          <div className="mt-4 space-y-4">
            <StatusLine label="بيانات العميل" done={Boolean(checkoutForm.firstName && checkoutForm.lastName && checkoutForm.email && checkoutForm.phone)} />
            <StatusLine label="عنوان الشحن" done={Boolean(checkoutForm.city && checkoutForm.address)} />
            <StatusLine label="الدولة والعملة" done={Boolean(activeCountry?.enabled && activeCurrency?.code)} />
            <StatusLine label="بوابة الدفع" done={Boolean(checkoutForm.paymentMethod && availableGateways.length)} />
          </div>
        </div>
      </aside>
    </form>
  );
}

function Panel({ icon: Icon, title, description, children }) {
  return (
    <div className="card p-4 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", className = "", required = false }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">
        {label}
        {required ? <span className="mr-1 text-danger">*</span> : null}
      </span>
      <input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="input-like" />
    </label>
  );
}

function ChoiceCard({ active, label, note, extra, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-right transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        active ? "border-accent bg-accent/5" : "border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-950"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-slate-950 dark:text-white">{label}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{note}</p>
        </div>
        {extra ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 dark:bg-slate-900 dark:text-slate-200">{extra}</span> : null}
      </div>
    </button>
  );
}

function PriceRow({ label, value, large = false }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${large ? "font-heading text-xl font-black text-slate-950 dark:text-white" : "text-slate-500"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function StatusLine({ label, done }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-black ${done ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"}`}>
        {done ? "جاهز" : "ناقص"}
      </span>
    </div>
  );
}

function SummaryMetric({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-2 font-heading text-lg font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
