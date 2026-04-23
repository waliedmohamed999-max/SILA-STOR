import { ArrowLeft, Plus, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useToast } from "../context/ToastContext";
import { orders as seedOrders, orderStatuses, paymentMethods } from "../data/orders";
import { products } from "../data/products";
import { money } from "../utils/formatters";
import { paymentLabel, statusLabel } from "../utils/labels";
import { zeroOrderMetrics, zeroProductMetrics } from "../utils/zeroDataMetrics";

const paymentStatusLabels = {
  paid: "مدفوع",
  pending: "بانتظار الدفع",
  void: "ملغي",
  refunded: "مسترد",
};

export default function CreateOrder() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const zeroedProducts = useMemo(() => products.map(zeroProductMetrics), []);
  const [form, setForm] = useState(() => createInitialOrderForm());
  const [selectedProductId, setSelectedProductId] = useState(String(zeroedProducts[0]?.id || ""));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const existingOrders = useMemo(() => mergeStoredOrders(seedOrders), []);
  const totals = useMemo(() => calculateOrderTotals(form), [form]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const updateItem = (itemId, field, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: field === "quantity" ? Math.max(1, toNumber(value, 1)) : field === "unitPrice" ? Math.max(0, toNumber(value, 0)) : value,
            }
          : item,
      ),
    }));
    setErrors((current) => ({ ...current, items: "" }));
  };

  const addItem = () => {
    const product = zeroedProducts.find((item) => String(item.id) === String(selectedProductId)) || zeroedProducts[0];
    if (!product) return;
    setForm((current) => {
      const exists = current.items.find((item) => item.productId === product.id);
      if (exists) {
        return { ...current, items: current.items.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)) };
      }
      return {
        ...current,
        items: [
          ...current.items,
          {
            id: `item-${Date.now()}`,
            productId: product.id,
            sku: product.sku,
            name: product.name,
            category: product.category,
            image: product.image,
            unitPrice: product.price,
            quantity: 1,
            discount: 0,
            taxRate: 0.15,
            weight: product.category === "Laptops" ? 1.6 : product.category === "Phones" ? 0.22 : 0.65,
          },
        ],
      };
    });
    setErrors((current) => ({ ...current, items: "" }));
  };

  const removeItem = (itemId) => {
    setForm((current) => ({ ...current, items: current.items.filter((item) => item.id !== itemId) }));
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validateOrderForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    window.setTimeout(() => {
      const createdAt = new Date(`${form.orderDate}T${new Date().toTimeString().slice(0, 8)}`).toISOString();
      const orderId = nextOrderId(existingOrders);
      const trackingNumber = `SILA-${Date.now().toString().slice(-8)}`;
      const order = zeroOrderMetrics(buildOrderObject({ form, totals, createdAt, orderId, trackingNumber }));
      persistCreatedOrder(order);
      showToast("تم إنشاء الطلب", `تم إنشاء ${order.id} وإضافته لقائمة الطلبات.`, "success");
      navigate("/admin/orders", { replace: true, state: { createdOrder: order } });
    }, 450);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link to="/admin/orders" className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-accent">
            <ArrowLeft size={16} />
            العودة لقائمة الطلبات
          </Link>
          <h1 className="mt-3 font-heading text-3xl font-black text-slate-950 dark:text-white">إنشاء طلب جديد</h1>
          <p className="mt-1 text-sm text-slate-500">أدخل بيانات العميل، العناصر، الدفع، والشحن ثم احفظ الطلب داخل النظام.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/orders">
            <Button variant="secondary">إلغاء</Button>
          </Link>
          <Button onClick={submit} disabled={submitting}>
            <Save size={17} />
            {submitting ? "جاري الحفظ..." : "حفظ الطلب"}
          </Button>
        </div>
      </section>

      <form onSubmit={submit} className="space-y-6">
        <section className="card p-5 sm:p-6">
          <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">بيانات الطلب والعميل</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FormInput label="اسم العميل" value={form.customerName} onChange={(value) => updateField("customerName", value)} error={errors.customerName} />
            <FormInput label="رقم الجوال" value={form.customerPhone} onChange={(value) => updateField("customerPhone", value)} error={errors.customerPhone} />
            <FormInput label="البريد الإلكتروني" type="email" value={form.customerEmail} onChange={(value) => updateField("customerEmail", value)} error={errors.customerEmail} />
            <FormSelect label="حالة الطلب" value={form.status} options={orderStatuses} onChange={(value) => updateField("status", value)} />
            <FormSelect label="حالة الدفع" value={form.paymentStatus} options={["pending", "paid", "void", "refunded"]} labels={paymentStatusLabels} onChange={(value) => updateField("paymentStatus", value)} />
            <FormSelect label="طريقة الدفع" value={form.paymentMethod} options={paymentMethods} onChange={(value) => updateField("paymentMethod", value)} />
            <FormInput label="تاريخ الطلب" type="date" value={form.orderDate} onChange={(value) => updateField("orderDate", value)} error={errors.orderDate} />
            <FormSelect label="شركة الشحن" value={form.deliveryMethod} options={["SILA Express", "Aramex", "SMSA", "DHL"]} onChange={(value) => updateField("deliveryMethod", value)} />
            <FormInput label="خدمة التوصيل" value={form.deliveryService} onChange={(value) => updateField("deliveryService", value)} error={errors.deliveryService} />
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">عناصر الطلب</h2>
              <p className="mt-1 text-sm text-slate-500">اختر المنتجات وعدل الكميات والأسعار مع احتساب الإجمالي تلقائياً.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {zeroedProducts.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              <Button type="button" variant="secondary" onClick={addItem}>
                <Plus size={16} />
                إضافة منتج
              </Button>
            </div>
          </div>
          {errors.items && <p className="mt-3 text-sm font-bold text-danger">{errors.items}</p>}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="py-2">المنتج</th>
                  <th className="py-2">SKU</th>
                  <th className="py-2">الكمية</th>
                  <th className="py-2">السعر</th>
                  <th className="py-2">الإجمالي</th>
                  <th className="py-2">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {form.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-black text-slate-950 dark:text-white">{item.name}</td>
                    <td className="py-3 text-slate-500">{item.sku}</td>
                    <td className="py-3">
                      <input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", event.target.value)} className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                    </td>
                    <td className="py-3">
                      <input type="number" min="0" value={item.unitPrice} onChange={(event) => updateItem(item.id, "unitPrice", event.target.value)} className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
                    </td>
                    <td className="py-3 font-black text-slate-950 dark:text-white">{money(item.unitPrice * item.quantity)}</td>
                    <td className="py-3">
                      <Button type="button" size="sm" variant="danger" onClick={() => removeItem(item.id)}>حذف</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="card p-5 sm:p-6">
            <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">الشحن والعنوان</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <FormInput label="الدولة" value={form.country} onChange={(value) => updateField("country", value)} />
              <FormInput label="المدينة" value={form.city} onChange={(value) => updateField("city", value)} error={errors.city} />
              <FormInput label="الحي" value={form.district} onChange={(value) => updateField("district", value)} error={errors.district} />
              <FormInput label="الشارع" value={form.street} onChange={(value) => updateField("street", value)} error={errors.street} />
              <FormInput label="المبنى" value={form.building} onChange={(value) => updateField("building", value)} />
              <FormInput label="الشقة" value={form.apartment} onChange={(value) => updateField("apartment", value)} />
              <FormInput label="الرمز البريدي" value={form.postalCode} onChange={(value) => updateField("postalCode", value)} />
              <FormInput label="علامة مميزة" value={form.landmark} onChange={(value) => updateField("landmark", value)} />
              <FormTextarea className="md:col-span-2" label="ملاحظات" value={form.notes} onChange={(value) => updateField("notes", value)} />
            </div>
          </div>

          <aside className="card h-fit p-5">
            <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">ملخص الطلب</h2>
            <div className="mt-4 grid gap-3">
              <FormInput label="الخصم" type="number" value={form.discount} onChange={(value) => updateField("discount", Math.max(0, toNumber(value, 0)))} />
              <FormInput label="الضريبة" type="number" value={form.tax} onChange={(value) => updateField("tax", Math.max(0, toNumber(value, 0)))} />
              <FormInput label="رسوم الشحن" type="number" value={form.shippingFee} onChange={(value) => updateField("shippingFee", Math.max(0, toNumber(value, 0)))} />
            </div>
            <div className="mt-5 space-y-2 text-sm">
              <MoneyRow label="قيمة المنتجات" value={totals.subtotal} />
              <MoneyRow label="الخصم" value={-totals.discount} />
              <MoneyRow label="الشحن" value={totals.shippingFee} />
              <MoneyRow label="الضريبة" value={totals.tax} />
              <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-black text-slate-950 dark:border-slate-800 dark:text-white">
                <span>الإجمالي</span>
                <span>{money(totals.total)}</span>
              </div>
            </div>
          </aside>
        </section>
      </form>
    </div>
  );
}

function buildOrderObject({ form, totals, createdAt, orderId, trackingNumber }) {
  return {
    id: orderId,
    invoiceNumber: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${orderId.replace(/\D/g, "")}`,
    shipmentNumber: `SHP-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`,
    customer: form.customerName.trim(),
    customerId: `manual-${Date.now()}`,
    date: form.orderDate,
    createdAt,
    items: form.items.reduce((sum, item) => sum + item.quantity, 0),
    total: totals.total,
    subtotal: totals.subtotal,
    itemDiscount: 0,
    couponDiscount: totals.discount,
    shippingFee: totals.shippingFee,
    tax: totals.tax,
    currency: "SAR",
    payment: form.paymentMethod,
    paymentStatus: form.paymentStatus,
    transactionId: form.paymentStatus === "paid" ? `TXN-${Date.now().toString().slice(-9)}` : "",
    status: form.status,
    priority: "normal",
    source: "لوحة الإدارة",
    products: form.items.map((item) => item.name),
    lineItems: form.items.map((item) => ({ ...item, discount: 0, taxRate: 0.15 })),
    customerInfo: { name: form.customerName.trim(), email: form.customerEmail.trim() || "غير مسجل", phone: form.customerPhone.trim(), tier: "standard" },
    shippingAddress: {
      recipient: form.customerName.trim(),
      phone: form.customerPhone.trim(),
      country: form.country,
      city: form.city.trim(),
      district: form.district.trim(),
      street: form.street.trim(),
      building: form.building.trim(),
      apartment: form.apartment.trim(),
      postalCode: form.postalCode.trim(),
      landmark: form.landmark.trim(),
    },
    billingAddress: { company: "", taxNumber: "", sameAsShipping: true },
    shipping: {
      provider: form.deliveryMethod,
      service: form.deliveryService,
      trackingNumber,
      trackingUrl: `https://track.sila.store/${trackingNumber}`,
      warehouse: "المركز الرئيسي",
      packageCount: Math.max(1, Math.ceil(form.items.length / 2)),
      totalWeight: Number(form.items.reduce((sum, item) => sum + item.weight * item.quantity, 0).toFixed(2)),
      dimensions: "40 x 30 x 18 سم",
      promisedDelivery: addDays(form.orderDate, form.deliveryMethod === "SILA Express" ? 2 : 4),
    },
    fulfillment: {
      picker: "فريق الإدارة",
      packer: "فريق المستودع",
      packingStatus: form.status === "Pending" ? "قيد التجهيز" : "تم إنشاء الطلب",
      qualityCheck: ["Shipped", "Delivered"].includes(form.status),
      giftWrap: false,
      fragile: form.items.some((item) => item.category === "Cameras"),
    },
    notes: { customer: form.notes.trim() || "لا توجد ملاحظات من العميل.", internal: "تم إنشاء الطلب يدوياً من لوحة الإدارة." },
    timeline: createOrderTimeline(form.status, createdAt, form.deliveryMethod, trackingNumber),
  };
}

function createInitialOrderForm() {
  const product = zeroProductMetrics(products[0]);
  return {
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    status: "Pending",
    paymentStatus: "pending",
    paymentMethod: "Mada",
    orderDate: new Date().toISOString().slice(0, 10),
    deliveryMethod: "SILA Express",
    deliveryService: "توصيل سريع",
    country: "السعودية",
    city: "",
    district: "",
    street: "",
    building: "",
    apartment: "",
    postalCode: "",
    landmark: "",
    notes: "",
    discount: 0,
    tax: 0,
    shippingFee: 18,
    items: product ? [{ id: "item-initial", productId: product.id, sku: product.sku, name: product.name, category: product.category, image: product.image, unitPrice: product.price, quantity: 1, discount: 0, taxRate: 0.15, weight: product.category === "Laptops" ? 1.6 : product.category === "Phones" ? 0.22 : 0.65 }] : [],
  };
}

function calculateOrderTotals(form) {
  const subtotal = form.items.reduce((sum, item) => sum + toNumber(item.unitPrice, 0) * toNumber(item.quantity, 1), 0);
  const discount = Math.min(toNumber(form.discount, 0), subtotal);
  const tax = toNumber(form.tax, 0);
  const shippingFee = toNumber(form.shippingFee, 0);
  return { subtotal, discount, tax, shippingFee, total: Math.max(0, subtotal - discount + tax + shippingFee) };
}

function validateOrderForm(form) {
  const errors = {};
  if (!form.customerName.trim()) errors.customerName = "اسم العميل مطلوب.";
  if (!form.customerPhone.trim()) errors.customerPhone = "رقم الجوال مطلوب.";
  else if (!/^\+?[\d\s-]{8,18}$/.test(form.customerPhone.trim())) errors.customerPhone = "رقم الجوال غير صحيح.";
  if (form.customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) errors.customerEmail = "البريد الإلكتروني غير صحيح.";
  if (!form.orderDate) errors.orderDate = "تاريخ الطلب مطلوب.";
  if (!form.deliveryService.trim()) errors.deliveryService = "خدمة التوصيل مطلوبة.";
  if (!form.city.trim()) errors.city = "المدينة مطلوبة.";
  if (!form.district.trim()) errors.district = "الحي مطلوب.";
  if (!form.street.trim()) errors.street = "الشارع مطلوب.";
  if (!form.items.length) errors.items = "يجب إضافة منتج واحد على الأقل.";
  else if (form.items.some((item) => toNumber(item.quantity, 0) < 1 || toNumber(item.unitPrice, -1) < 0)) errors.items = "تأكد من أن الكمية والسعر لكل منتج صحيحين.";
  return errors;
}

function FormInput({ label, value, onChange, error, type = "text", className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-accent dark:bg-slate-950 dark:text-white ${error ? "border-danger" : "border-slate-200 dark:border-slate-800"}`} />
      {error && <p className="mt-2 text-xs font-bold text-danger">{error}</p>}
    </label>
  );
}

function FormSelect({ label, value, options, labels = {}, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white">
        {options.map((option) => <option key={option} value={option}>{labels[option] || statusLabel(option) || paymentLabel(option) || option}</option>)}
      </select>
    </label>
  );
}

function FormTextarea({ label, value, onChange, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
    </label>
  );
}

function MoneyRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3 text-slate-600 dark:text-slate-300">
      <span>{label}</span>
      <span className={value < 0 ? "text-danger" : ""}>{money(value)}</span>
    </div>
  );
}

function nextOrderId(existingOrders) {
  const max = existingOrders.reduce((highest, order) => {
    const number = Number(String(order.id).replace(/\D/g, ""));
    return Number.isFinite(number) ? Math.max(highest, number) : highest;
  }, 10420);
  return `ORD-${max + 1}`;
}

function createOrderTimeline(status, createdAt, provider, trackingNumber) {
  const created = new Date(createdAt);
  const steps = [
    { key: "created", label: "تم إنشاء الطلب", at: createdAt, done: true },
    { key: "paid", label: "تم تأكيد الدفع", at: addHours(created, 1), done: !["Pending", "Cancelled"].includes(status) },
    { key: "processing", label: "بدأ تجهيز الطلب", at: addHours(created, 3), done: ["Processing", "Shipped", "Delivered"].includes(status) },
    { key: "packed", label: "تم التغليف وفحص الجودة", at: addHours(created, 8), done: ["Shipped", "Delivered"].includes(status) },
    { key: "shipped", label: `تم التسليم إلى ${provider}`, at: addHours(created, 14), done: ["Shipped", "Delivered"].includes(status), meta: trackingNumber },
    { key: "delivered", label: "تم التسليم للعميل", at: addHours(created, 50), done: status === "Delivered" },
  ];
  if (status === "Cancelled") return [steps[0], { key: "cancelled", label: "تم إلغاء الطلب", at: addHours(created, 2), done: true, meta: "إلغاء من الإدارة" }];
  return steps;
}

function persistCreatedOrder(order) {
  const stored = readCreatedOrders();
  localStorage.setItem("sila_created_orders", JSON.stringify([order, ...stored.filter((item) => item.id !== order.id)]));
}

function mergeStoredOrders(baseOrders) {
  const stored = readCreatedOrders();
  return [...stored.filter((storedOrder) => !baseOrders.some((order) => order.id === storedOrder.id)), ...baseOrders];
}

function readCreatedOrders() {
  try {
    const stored = JSON.parse(localStorage.getItem("sila_created_orders") || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString();
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function toNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
