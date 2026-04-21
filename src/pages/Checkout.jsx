import { CheckCircle2, CreditCard, MapPin, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { money } from "../utils/formatters";
import { categoryLabel } from "../utils/labels";

const paymentMethods = [
  {
    value: "card",
    label: "بطاقة مدى / فيزا / ماستركارد",
    note: "دفع آمن ومباشر عبر بوابة سيلا.",
  },
  {
    value: "cash",
    label: "الدفع عند الاستلام",
    note: "متاح للمدن المدعومة على الطلبات المؤهلة.",
  },
  {
    value: "bank",
    label: "تحويل بنكي",
    note: "يتم تجهيز الطلب بعد تأكيد التحويل.",
  },
];

export default function Checkout() {
  const [code, setCode] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);
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

  const shippingMethods = useMemo(() => {
    const shipping = settings.shipping;
    const services = (shipping.providers || [])
      .filter((provider) => provider.enabled && provider.status === "connected")
      .flatMap((provider) =>
        (provider.services || [])
          .filter((service) => service.enabled)
          .map((service) => ({
            value: service.key,
            label: service.label,
            note: `${provider.name} · ${service.eta}`,
            extra: Number(service.fee || 0),
          }))
      );

    const unique = services.filter((service, index, array) => array.findIndex((item) => item.value === service.value) === index);

    if (shipping.pickupEnabled) {
      unique.push({
        value: "pickup",
        label: "الاستلام من الفرع",
        note: `استلام من ${shipping.warehouseCity} بدون رسوم شحن بعد تأكيد الجاهزية.`,
        extra: 0,
      });
    }

    return unique;
  }, [settings.shipping]);

  const customerName = useMemo(
    () => `${checkoutForm.firstName} ${checkoutForm.lastName}`.trim(),
    [checkoutForm.firstName, checkoutForm.lastName]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const order = createOrder();
    if (order) {
      setCreatedOrder(order);
    }
  };

  if (!items.length && createdOrder) {
    return (
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="card p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <CheckCircle2 size={30} />
          </div>
          <h1 className="mt-5 font-heading text-3xl font-black text-slate-950 dark:text-white">تم استلام طلبك بنجاح</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            رقم الطلب <span className="font-black text-slate-900 dark:text-white">{createdOrder.id}</span> وتم تسجيله في النظام.
            سيتم إرسال التحديثات إلى {createdOrder.customer.email}.
          </p>
          <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-right dark:border-slate-800 dark:bg-slate-900/60 sm:grid-cols-3">
            <SummaryMetric label="إجمالي الطلب" value={money(createdOrder.total)} />
            <SummaryMetric
              label="طريقة الدفع"
              value={paymentMethods.find((item) => item.value === createdOrder.paymentMethod)?.label || createdOrder.paymentMethod}
            />
            <SummaryMetric
              label="طريقة الشحن"
              value={shippingMethods.find((item) => item.value === createdOrder.shippingMethod)?.label || createdOrder.shippingMethod}
            />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/">
              <Button><ShoppingBag size={17} />العودة إلى المتجر</Button>
            </Link>
            <Link to={`/products/${createdOrder.items[0]?.id || 1}`}>
              <Button variant="secondary">متابعة التصفح</Button>
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
        text="أضف منتجات إلى السلة أولاً ثم عد إلى صفحة الدفع لاستكمال بيانات الشحن والدفع."
        action={
          <Link to="/">
            <Button><ShoppingBag size={17} />العودة إلى المتجر</Button>
          </Link>
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_400px]">
      <section className="space-y-6">
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-black text-slate-950 dark:text-white">إتمام الطلب</h1>
              <p className="mt-1 text-sm text-slate-500">أدخل بيانات العميل والشحن والدفع لإرسال الطلب مباشرة إلى نظام سيلا.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/60">
              <p className="font-black text-slate-950 dark:text-white">تجهيز سريع</p>
              <p className="mt-1 text-slate-500">تأكيد تلقائي وربط مباشر بالسلة الحالية.</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">بيانات العميل والشحن</h2>
              <p className="text-sm text-slate-500">هذه البيانات ستستخدم في الفاتورة وإشعارات الطلب والتسليم.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="الاسم الأول" value={checkoutForm.firstName} onChange={(value) => updateCheckoutField("firstName", value)} required />
            <Field label="اسم العائلة" value={checkoutForm.lastName} onChange={(value) => updateCheckoutField("lastName", value)} required />
            <Field label="البريد الإلكتروني" type="email" value={checkoutForm.email} onChange={(value) => updateCheckoutField("email", value)} required />
            <Field label="رقم الجوال" type="tel" value={checkoutForm.phone} onChange={(value) => updateCheckoutField("phone", value)} required />
            <Field label="المدينة" value={checkoutForm.city} onChange={(value) => updateCheckoutField("city", value)} required />
            <Field label="الحي / المنطقة" value={checkoutForm.area} onChange={(value) => updateCheckoutField("area", value)} />
            <Field className="md:col-span-2" label="العنوان التفصيلي" value={checkoutForm.address} onChange={(value) => updateCheckoutField("address", value)} required />
            <Field label="الرمز البريدي" value={checkoutForm.postalCode} onChange={(value) => updateCheckoutField("postalCode", value)} />
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 dark:border-slate-800 dark:text-slate-300">
              <input
                type="checkbox"
                checked={checkoutForm.saveInfo}
                onChange={(event) => updateCheckoutField("saveInfo", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
              />
              حفظ البيانات لاستخدامها في الطلبات القادمة
            </label>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <Truck size={20} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">خيارات الشحن</h2>
              <p className="text-sm text-slate-500">تم سحب هذه الخدمات من مزودات الشحن المفعلة داخل إعدادات سيلا.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
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
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">طريقة الدفع</h2>
              <p className="text-sm text-slate-500">اختر قناة الدفع التي سيتم بها تأكيد الطلب.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {paymentMethods.map((option) => (
              <ChoiceCard
                key={option.value}
                active={checkoutForm.paymentMethod === option.value}
                label={option.label}
                note={option.note}
                onClick={() => updateCheckoutField("paymentMethod", option.value)}
              />
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <div className="card p-5">
          <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">ملخص الطلب</h2>
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

          <div className="mt-5 flex gap-2">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="كود الخصم"
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            <Button type="button" variant="secondary" onClick={() => applyDiscount(code)}>تطبيق</Button>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <PriceRow label="الإجمالي الفرعي" value={money(subtotal)} />
            <PriceRow label={`الخصم${discount.code ? ` (${discount.code})` : ""}`} value={`-${money(discountAmount)}`} />
            <PriceRow label="الشحن" value={shippingCost === 0 ? "مجاني" : money(shippingCost)} />
            <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
              <PriceRow label="الإجمالي النهائي" value={money(total)} large />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <Button type="submit" className="w-full"><ShieldCheck size={18} />تأكيد الطلب وإرساله</Button>
            <Link to="/cart" className="block">
              <Button type="button" variant="secondary" className="w-full">العودة إلى السلة</Button>
            </Link>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">جاهزية التنفيذ</h2>
          <div className="mt-4 space-y-4">
            <StatusLine label="بيانات العميل" done={Boolean(checkoutForm.firstName && checkoutForm.lastName && checkoutForm.email && checkoutForm.phone)} />
            <StatusLine label="عنوان الشحن" done={Boolean(checkoutForm.city && checkoutForm.address)} />
            <StatusLine label="طريقة الشحن" done={Boolean(checkoutForm.shippingMethod)} />
            <StatusLine label="طريقة الدفع" done={Boolean(checkoutForm.paymentMethod)} />
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
            <p className="font-black text-slate-900 dark:text-white">{customerName || "العميل الحالي"}</p>
            <p className="mt-1">سيتم إنشاء الطلب مباشرة داخل النظام وربطه بالسلة الحالية والبيانات المدخلة.</p>
          </div>
        </div>
      </aside>
    </form>
  );
}

function Field({ label, value, onChange, type = "text", className = "", required = false }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">
        {label}
        {required ? <span className="mr-1 text-danger">*</span> : null}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      />
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
