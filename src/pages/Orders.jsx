import {
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Download,
  FileText,
  MapPin,
  MoreVertical,
  PackageCheck,
  Plus,
  Printer,
  ReceiptText,
  Route,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import SearchInput from "../components/SearchInput";
import Table from "../components/Table";
import { useToast } from "../context/ToastContext";
import { orders as seedOrders, orderStatuses, paymentMethods } from "../data/orders";
import { products } from "../data/products";
import { money, sortBy, statusTone } from "../utils/formatters";
import { paymentLabel, statusLabel, tierLabel } from "../utils/labels";

const perPage = 8;

const paymentStatusLabels = {
  paid: "مدفوع",
  pending: "بانتظار الدفع",
  void: "ملغي",
  refunded: "مسترد",
};

const paymentStatusTones = {
  paid: "success",
  pending: "warning",
  void: "danger",
  refunded: "info",
};

const priorityLabels = {
  high: "عالي",
  medium: "متوسط",
  normal: "طبيعي",
};

export default function Orders() {
  const [orders, setOrders] = useState(() => mergeStoredOrders(seedOrders));
  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "createdAt", direction: "desc" });
  const [selected, setSelected] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);
  const [activeOrder, setActiveOrder] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    if (!location.state?.createdOrder) return;
    const createdOrder = location.state.createdOrder;
    setOrders((rows) => (rows.some((order) => order.id === createdOrder.id) ? rows : [createdOrder, ...rows]));
    window.history.replaceState({}, "");
  }, [location.state]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = orders.filter((order) => {
      const matchesStatus =
        status === "All" ||
        order.status === status ||
        (status === "Ready" && order.status === "Processing" && order.fulfillment.qualityCheck) ||
        (status === "ReturnPending" && order.notes.internal.includes("مرتجع")) ||
        (status === "PartialRefund" && order.paymentStatus === "refunded") ||
        (status === "Returned" && order.status === "Cancelled" && order.paymentStatus === "refunded");
      const haystack = [
        order.id,
        order.invoiceNumber,
        order.shipmentNumber,
        order.customer,
        order.customerInfo.email,
        order.customerInfo.phone,
        order.shipping.trackingNumber,
        order.shipping.provider,
      ].join(" ").toLowerCase();
      return matchesStatus && (!normalized || haystack.includes(normalized));
    });
    return sortBy(list, sort);
  }, [orders, status, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);
  const summary = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === "Pending").length,
      processing: orders.filter((order) => order.status === "Processing").length,
      shipped: orders.filter((order) => order.status === "Shipped").length,
      revenue: orders.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + order.total, 0),
    }),
    [orders],
  );

  const queueTabs = useMemo(
    () => [
      { key: "All", label: "الكل", count: orders.length, tone: "accent" },
      { key: "Pending", label: "جديد", count: orders.filter((order) => order.status === "Pending").length },
      { key: "Processing", label: "جاري التجهيز", count: orders.filter((order) => order.status === "Processing").length },
      {
        key: "Ready",
        label: "جاهز",
        count: orders.filter((order) => order.status === "Processing" && order.fulfillment.qualityCheck).length,
      },
      { key: "Shipped", label: "جاري التوصيل", count: orders.filter((order) => order.status === "Shipped").length },
      { key: "Delivered", label: "مكتمل", count: orders.filter((order) => order.status === "Delivered").length },
      { key: "Cancelled", label: "ملغي", count: orders.filter((order) => order.status === "Cancelled").length },
      { key: "ReturnPending", label: "قيد الاسترجاع", count: orders.filter((order) => order.notes.internal.includes("مرتجع")).length },
      { key: "PartialRefund", label: "مسترجع جزئيًا", count: orders.filter((order) => order.paymentStatus === "refunded").length },
      { key: "Returned", label: "مسترجع", count: orders.filter((order) => order.status === "Cancelled" && order.paymentStatus === "refunded").length },
    ],
    [orders],
  );

  const toggleSort = (key) =>
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));

  const bulkShip = () => {
    if (!selected.length) {
      showToast("لا توجد طلبات محددة", "حدد طلبًا واحدًا أو أكثر قبل تنفيذ الإجراء الجماعي.", "error");
      return;
    }
    setOrders((rows) =>
      rows.map((order) =>
        selected.includes(order.id)
          ? {
              ...order,
              status: "Shipped",
              fulfillment: { ...order.fulfillment, packingStatus: "تم التغليف", qualityCheck: true },
              timeline: markTimelineShipped(order.timeline, order.shipping.provider, order.shipping.trackingNumber),
            }
          : order,
      ),
    );
    setSelected([]);
    showToast("تم تحديث الطلبات", "تم وضع الطلبات المحددة في حالة الشحن.", "success");
  };

  const updateOrderStatus = (orderId, nextStatus) => {
    setOrders((rows) =>
      rows.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: nextStatus,
              paymentStatus: nextStatus === "Cancelled" ? "void" : order.paymentStatus,
              timeline: patchTimelineForStatus(order, nextStatus),
            }
          : order,
      ),
    );
    setActiveOrder((current) =>
      current?.id === orderId
        ? {
            ...current,
            status: nextStatus,
            paymentStatus: nextStatus === "Cancelled" ? "void" : current.paymentStatus,
            timeline: patchTimelineForStatus(current, nextStatus),
          }
        : current,
    );
    showToast("تم تحديث الطلب", `تم تغيير حالة الطلب إلى ${statusLabel(nextStatus)}.`, "success");
  };

  const createOrder = (order) => {
    setOrders((rows) => [order, ...rows]);
    setStatus("All");
    setQuery("");
    setPage(1);
    setSelected([]);
    showToast("تم إنشاء الطلب", `تم إضافة الطلب ${order.id} إلى قائمة الطلبات.`, "success");
  };

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-black text-slate-950 dark:text-white">قائمة الطلبات</h1>
          <p className="mt-1 text-sm text-slate-500">جميع طلبات متجرك هنا</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate("/admin/orders/create")}>
            <Plus size={17} />
            إنشاء
          </Button>
          <Button variant="secondary">
            <Download size={17} />
            تصدير الطلبات
          </Button>
          <Button variant="secondary" size="icon" aria-label="خيارات الطلبات">
            <MoreVertical size={18} />
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="كل الطلبات" value={summary.total} icon={ReceiptText} tone="accent" />
        <MetricCard label="قيد الانتظار" value={summary.pending} icon={FileText} tone="warning" />
        <MetricCard label="قيد التجهيز" value={summary.processing} icon={PackageCheck} tone="info" />
        <MetricCard label="تم الشحن" value={summary.shipped} icon={Truck} tone="success" />
        <MetricCard label="إيراد مؤكد" value={money(summary.revenue)} icon={CreditCard} tone="neutral" />
      </section>

      <section className="card overflow-hidden">
        <div className="flex min-h-[72px] items-center gap-2 overflow-x-auto border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          {queueTabs.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setStatus(item.key);
                setPage(1);
              }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition ${
                status === item.key
                  ? "bg-accent text-white shadow-lg shadow-indigo-500/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  status === item.key ? "bg-white/20 text-white" : "bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                {item.count.toLocaleString("en-US")}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="text-sm font-bold text-slate-500">
            {filtered.length.toLocaleString("en-US")} طلب مطابق للتصفية الحالية
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchInput
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="ابحث برقم الطلب أو العميل أو التتبع أو الفاتورة"
            />
            <Button variant="dark" onClick={bulkShip}>
              <Truck size={17} />
              تحديد كمشحون
            </Button>
          </div>
        </div>
      </section>

      <Table
        columns={[
          { key: "select", label: "" },
          { key: "id", label: "رقم الطلب", sortable: true },
          { key: "customer", label: "العميل", sortable: true },
          { key: "createdAt", label: "التاريخ", sortable: true },
          { key: "items", label: "العناصر", sortable: true },
          { key: "total", label: "الإجمالي", sortable: true },
          { key: "paymentStatus", label: "الدفع", sortable: true },
          { key: "shipping", label: "الشحن" },
          { key: "status", label: "الحالة", sortable: true },
          { key: "actions", label: "إجراءات" },
        ]}
        rows={pageRows}
        sort={sort}
        onSort={toggleSort}
        renderRow={(order) => [
          <tr key={`${order.id}-main`} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
            <td className="px-4 py-4">
              <input
                aria-label={`تحديد ${order.id}`}
                type="checkbox"
                checked={selected.includes(order.id)}
                onChange={(event) =>
                  setSelected((items) =>
                    event.target.checked ? [...items, order.id] : items.filter((id) => id !== order.id),
                  )
                }
                className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
              />
            </td>
            <td className="px-4 py-4">
              <button onClick={() => setActiveOrder(order)} className="font-black text-slate-950 transition hover:text-accent dark:text-white">
                {order.id}
              </button>
              <p className="mt-1 text-xs text-slate-500">{order.invoiceNumber}</p>
            </td>
            <td className="px-4 py-4">
              <p className="font-bold text-slate-700 dark:text-slate-200">{order.customer}</p>
              <p className="text-xs text-slate-500">{order.customerInfo.phone}</p>
            </td>
            <td className="px-4 py-4 text-slate-500">{formatDate(order.createdAt)}</td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{order.items}</td>
            <td className="px-4 py-4 font-bold text-slate-950 dark:text-white">{money(order.total)}</td>
            <td className="px-4 py-4">
              <Badge tone={paymentStatusTones[order.paymentStatus]}>{paymentStatusLabels[order.paymentStatus]}</Badge>
              <p className="mt-1 text-xs text-slate-500">{paymentLabel(order.payment)}</p>
            </td>
            <td className="px-4 py-4">
              <p className="font-bold text-slate-700 dark:text-slate-200">{order.shipping.provider}</p>
              <p className="text-xs text-slate-500">{order.shipping.trackingNumber}</p>
            </td>
            <td className="px-4 py-4">
              <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>
            </td>
            <td className="px-4 py-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => setActiveOrder(order)}>التفاصيل</Button>
                <button
                  aria-label={`توسيع ${order.id}`}
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronDown size={18} className={expanded === order.id ? "rotate-180" : ""} />
                </button>
              </div>
            </td>
          </tr>,
          expanded === order.id ? (
            <tr key={`${order.id}-details`} className="bg-slate-50 dark:bg-slate-900/50">
              <td colSpan="10" className="px-4 py-4">
                <ExpandedOrder order={order} onOpen={() => setActiveOrder(order)} onPrint={printDocument} />
              </td>
            </tr>
          ) : null,
        ]}
      />

      <Pagination page={page} totalPages={totalPages} onPage={setPage} />

      <OrderDetailsModal
        order={activeOrder}
        onClose={() => setActiveOrder(null)}
        onPrint={printDocument}
        onStatus={updateOrderStatus}
      />
    </div>
  );
}

function CreateOrderModal({ open, existingOrders, onClose, onCreate }) {
  const [form, setForm] = useState(() => createInitialOrderForm());
  const [selectedProductId, setSelectedProductId] = useState(String(products[0]?.id || ""));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const totals = useMemo(() => calculateOrderTotals(form), [form]);

  if (!open) return null;

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
    const product = products.find((item) => String(item.id) === String(selectedProductId)) || products[0];
    if (!product) return;
    setForm((current) => {
      const exists = current.items.find((item) => item.productId === product.id);
      if (exists) {
        return {
          ...current,
          items: current.items.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
        };
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateOrderForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    window.setTimeout(() => {
      const createdAt = new Date(`${form.orderDate}T${new Date().toTimeString().slice(0, 8)}`).toISOString();
      const orderId = nextOrderId(existingOrders);
      const trackingNumber = `SILA-${Date.now().toString().slice(-8)}`;
      const order = {
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
        customerInfo: {
          name: form.customerName.trim(),
          email: form.customerEmail.trim() || "غير مسجل",
          phone: form.customerPhone.trim(),
          tier: "standard",
        },
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
        billingAddress: {
          company: "",
          taxNumber: "",
          sameAsShipping: true,
        },
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
        notes: {
          customer: form.notes.trim() || "لا توجد ملاحظات من العميل.",
          internal: "تم إنشاء الطلب يدوياً من لوحة الإدارة.",
        },
        timeline: createOrderTimeline(form.status, createdAt, form.deliveryMethod, trackingNumber),
      };

      onCreate(order);
      setForm(createInitialOrderForm());
      setSelectedProductId(String(products[0]?.id || ""));
      setErrors({});
      setSubmitting(false);
      onClose();
    }, 450);
  };

  return (
    <Modal open={open} title="إنشاء طلب جديد" onClose={submitting ? () => {} : onClose}>
      <form onSubmit={handleSubmit} className="space-y-6 p-5">
        <section className="grid gap-4 xl:grid-cols-3">
          <FormInput label="اسم العميل" value={form.customerName} onChange={(value) => updateField("customerName", value)} error={errors.customerName} />
          <FormInput label="رقم الجوال" value={form.customerPhone} onChange={(value) => updateField("customerPhone", value)} error={errors.customerPhone} />
          <FormInput label="البريد الإلكتروني" type="email" value={form.customerEmail} onChange={(value) => updateField("customerEmail", value)} error={errors.customerEmail} />
          <FormSelect label="حالة الطلب" value={form.status} options={orderStatuses} onChange={(value) => updateField("status", value)} />
          <FormSelect label="حالة الدفع" value={form.paymentStatus} options={["pending", "paid", "void", "refunded"]} labels={paymentStatusLabels} onChange={(value) => updateField("paymentStatus", value)} />
          <FormSelect label="طريقة الدفع" value={form.paymentMethod} options={paymentMethods} onChange={(value) => updateField("paymentMethod", value)} />
          <FormInput label="تاريخ الطلب" type="date" value={form.orderDate} onChange={(value) => updateField("orderDate", value)} error={errors.orderDate} />
          <FormSelect label="شركة الشحن" value={form.deliveryMethod} options={["SILA Express", "Aramex", "SMSA", "DHL"]} onChange={(value) => updateField("deliveryMethod", value)} />
          <FormInput label="خدمة التوصيل" value={form.deliveryService} onChange={(value) => updateField("deliveryService", value)} error={errors.deliveryService} />
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">عناصر الطلب</h3>
              <p className="mt-1 text-sm text-slate-500">أضف المنتجات وعدل الكمية والسعر قبل الحفظ.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {products.map((product) => (
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
          <div className="mt-4 overflow-x-auto">
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
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) => updateItem(item.id, "quantity", event.target.value)}
                        className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(event) => updateItem(item.id, "unitPrice", event.target.value)}
                        className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
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

        <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
          <div className="grid gap-4 md:grid-cols-2">
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

          <div className="h-fit rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">ملخص الطلب</h3>
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
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-5 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>إلغاء</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "جاري الحفظ..." : "حفظ الطلب"}</Button>
        </div>
      </form>
    </Modal>
  );
}

function ExpandedOrder({ order, onOpen, onPrint }) {
  return (
    <div className="grid gap-4 text-sm xl:grid-cols-[1fr_1fr_1fr_auto]">
      <InfoBlock title="المنتجات" text={order.lineItems.map((item) => `${item.name} × ${item.quantity}`).join("، ")} />
      <InfoBlock title="مسار الوصول" text={`${order.shippingAddress.city}، ${order.shippingAddress.district}، ${order.shippingAddress.street}`} />
      <InfoBlock title="التجهيز" text={`${order.shipping.warehouse} · ${order.fulfillment.packingStatus} · ${order.shipping.packageCount} طرد`} />
      <div className="flex flex-wrap gap-2 xl:justify-end">
        <Button variant="secondary" size="sm" onClick={onOpen}>فتح الطلب</Button>
        <Button variant="secondary" size="sm" onClick={() => onPrint(order, "invoice")}>
          <ReceiptText size={15} />
          فاتورة
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onPrint(order, "label")}>
          <Printer size={15} />
          بوليصة
        </Button>
      </div>
    </div>
  );
}

function OrderDetailsModal({ order, onClose, onPrint, onStatus }) {
  if (!order) return null;

  return (
    <Modal open={!!order} title={`تفاصيل الطلب ${order.id}`} onClose={onClose}>
      <div className="space-y-6 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>
              <Badge tone={paymentStatusTones[order.paymentStatus]}>{paymentStatusLabels[order.paymentStatus]}</Badge>
              <Badge tone={order.priority === "high" ? "danger" : order.priority === "medium" ? "warning" : "neutral"}>
                أولوية {priorityLabels[order.priority]}
              </Badge>
            </div>
            <h2 className="mt-3 font-heading text-2xl font-black text-slate-950 dark:text-white">{order.customer}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {order.invoiceNumber} · {formatDate(order.createdAt)} · مصدر الطلب: {order.source}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => onPrint(order, "invoice")}>
              <ReceiptText size={17} />
              طباعة فاتورة
            </Button>
            <Button variant="secondary" onClick={() => onPrint(order, "label")}>
              <Printer size={17} />
              طباعة بوليصة
            </Button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <MetricCard label="إجمالي الطلب" value={money(order.total)} icon={CreditCard} tone="accent" />
          <MetricCard label="العناصر" value={order.items} icon={PackageCheck} tone="neutral" />
          <MetricCard label="الوزن" value={`${order.shipping.totalWeight} كجم`} icon={Truck} tone="info" />
          <MetricCard label="موعد التسليم" value={order.shipping.promisedDelivery} icon={Route} tone="success" />
        </div>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">عناصر الطلب</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-right text-sm">
                <thead className="text-xs text-slate-500">
                  <tr>
                    <th className="py-2">المنتج</th>
                    <th className="py-2">SKU</th>
                    <th className="py-2">الكمية</th>
                    <th className="py-2">السعر</th>
                    <th className="py-2">الخصم</th>
                    <th className="py-2">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {order.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="h-12 w-12 rounded-2xl object-cover" />
                          <div>
                            <p className="font-black text-slate-950 dark:text-white">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{item.sku}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{item.quantity}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{money(item.unitPrice)}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{money(item.discount * item.quantity)}</td>
                      <td className="py-3 font-black text-slate-950 dark:text-white">{money((item.unitPrice - item.discount) * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <SummaryPanel order={order} />
            <PaymentPanel order={order} />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <CustomerPanel order={order} />
          <ShippingPanel order={order} />
          <FulfillmentPanel order={order} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_.9fr]">
          <TimelinePanel order={order} />
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">إجراءات الطلب</h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {orderStatuses.map((item) => (
                <Button
                  key={item}
                  variant={order.status === item ? "primary" : "secondary"}
                  onClick={() => onStatus(order.id, item)}
                >
                  {statusLabel(item)}
                </Button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
              <p className="text-xs font-bold text-slate-500">ملاحظة العميل</p>
              <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">{order.notes.customer}</p>
              <p className="mt-4 text-xs font-bold text-slate-500">ملاحظة داخلية</p>
              <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">{order.notes.internal}</p>
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}

function SummaryPanel({ order }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">ملخص مالي</h3>
      <div className="mt-4 grid gap-2 text-sm">
        <MoneyRow label="قيمة المنتجات" value={order.subtotal} />
        <MoneyRow label="خصومات المنتجات" value={-order.itemDiscount} />
        <MoneyRow label="كوبون الخصم" value={-order.couponDiscount} />
        <MoneyRow label="الشحن" value={order.shippingFee} />
        <MoneyRow label="الضريبة" value={order.tax} />
        <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-base font-black text-slate-950 dark:border-slate-800 dark:text-white">
          <span>الإجمالي</span>
          <span>{money(order.total)}</span>
        </div>
      </div>
    </div>
  );
}

function PaymentPanel({ order }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">الدفع</h3>
      <div className="mt-4 grid gap-3">
        <Info label="طريقة الدفع" value={paymentLabel(order.payment)} />
        <Info label="حالة الدفع" value={paymentStatusLabels[order.paymentStatus]} />
        <Info label="رقم العملية" value={order.transactionId || "لم يتم الدفع بعد"} />
      </div>
    </div>
  );
}

function CustomerPanel({ order }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">بيانات العميل</h3>
      <div className="mt-4 grid gap-3">
        <Info label="الاسم" value={order.customerInfo.name} />
        <Info label="البريد" value={order.customerInfo.email} />
        <Info label="الجوال" value={order.customerInfo.phone} />
        <Info label="الشريحة" value={tierLabel(order.customerInfo.tier)} />
      </div>
    </div>
  );
}

function ShippingPanel({ order }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">الشحن والتتبع</h3>
      <div className="mt-4 grid gap-3">
        <Info label="شركة الشحن" value={order.shipping.provider} />
        <Info label="الخدمة" value={order.shipping.service} />
        <Info label="رقم التتبع" value={order.shipping.trackingNumber} />
        <Info label="العنوان" value={`${order.shippingAddress.city}، ${order.shippingAddress.district}، ${order.shippingAddress.street}، مبنى ${order.shippingAddress.building}`} />
      </div>
      <a
        href={order.shipping.trackingUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2 text-sm font-black text-white"
      >
        <MapPin size={16} />
        فتح التتبع
      </a>
    </div>
  );
}

function FulfillmentPanel({ order }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">التجهيز</h3>
      <div className="mt-4 grid gap-3">
        <Info label="المستودع" value={order.shipping.warehouse} />
        <Info label="مسؤول الالتقاط" value={order.fulfillment.picker} />
        <Info label="مسؤول التغليف" value={order.fulfillment.packer} />
        <Info label="فحص الجودة" value={order.fulfillment.qualityCheck ? "تم" : "لم يكتمل"} />
        <Info label="عدد الطرود" value={order.shipping.packageCount} />
        <Info label="الأبعاد" value={order.shipping.dimensions} />
      </div>
    </div>
  );
}

function TimelinePanel({ order }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">مسار الطلب</h3>
      <div className="mt-5 space-y-4">
        {order.timeline.map((step, index) => (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`grid h-8 w-8 place-items-center rounded-full ${step.done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-900"}`}>
                <CheckCircle2 size={16} />
              </span>
              {index < order.timeline.length - 1 && <span className="h-8 w-px bg-slate-200 dark:bg-slate-800" />}
            </div>
            <div>
              <p className="font-black text-slate-950 dark:text-white">{step.label}</p>
              <p className="text-xs text-slate-500">{formatDate(step.at)} {step.meta ? `· ${step.meta}` : ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, tone = "accent" }) {
  const tones = {
    accent: "bg-indigo-500/10 text-accent",
    success: "bg-emerald-500/10 text-success",
    warning: "bg-amber-500/10 text-warning",
    danger: "bg-red-500/10 text-danger",
    info: "bg-sky-500/10 text-sky-600",
    neutral: "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-200",
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-1 truncate font-heading text-2xl font-black text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ title, text }) {
  return (
    <div>
      <span className="font-bold text-slate-500">{title}</span>
      <p className="mt-1 text-slate-700 dark:text-slate-200">{text}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 break-words font-black text-slate-950 dark:text-white">{value}</p>
    </div>
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

function FormInput({ label, value, onChange, error, type = "text", className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-accent dark:bg-slate-950 dark:text-white ${
          error ? "border-danger" : "border-slate-200 dark:border-slate-800"
        }`}
      />
      {error && <p className="mt-2 text-xs font-bold text-danger">{error}</p>}
    </label>
  );
}

function FormSelect({ label, value, options, labels = {}, onChange, error }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-accent dark:bg-slate-950 dark:text-white ${
          error ? "border-danger" : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] || statusLabel(option) || paymentLabel(option) || option}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-xs font-bold text-danger">{error}</p>}
    </label>
  );
}

function FormTextarea({ label, value, onChange, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      />
    </label>
  );
}

function createInitialOrderForm() {
  const product = products[0];
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
    items: product
      ? [
          {
            id: "item-initial",
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
        ]
      : [],
  };
}

function calculateOrderTotals(form) {
  const subtotal = form.items.reduce((sum, item) => sum + toNumber(item.unitPrice, 0) * toNumber(item.quantity, 1), 0);
  const discount = Math.min(toNumber(form.discount, 0), subtotal);
  const tax = toNumber(form.tax, 0);
  const shippingFee = toNumber(form.shippingFee, 0);
  return {
    subtotal,
    discount,
    tax,
    shippingFee,
    total: Math.max(0, subtotal - discount + tax + shippingFee),
  };
}

function validateOrderForm(form) {
  const errors = {};
  if (!form.customerName.trim()) errors.customerName = "اسم العميل مطلوب.";
  if (!form.customerPhone.trim()) {
    errors.customerPhone = "رقم الجوال مطلوب.";
  } else if (!/^\+?[\d\s-]{8,18}$/.test(form.customerPhone.trim())) {
    errors.customerPhone = "رقم الجوال غير صحيح.";
  }
  if (form.customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) {
    errors.customerEmail = "البريد الإلكتروني غير صحيح.";
  }
  if (!form.orderDate) errors.orderDate = "تاريخ الطلب مطلوب.";
  if (!form.deliveryService.trim()) errors.deliveryService = "خدمة التوصيل مطلوبة.";
  if (!form.city.trim()) errors.city = "المدينة مطلوبة.";
  if (!form.district.trim()) errors.district = "الحي مطلوب.";
  if (!form.street.trim()) errors.street = "الشارع مطلوب.";
  if (!form.items.length) {
    errors.items = "يجب إضافة منتج واحد على الأقل.";
  } else if (form.items.some((item) => toNumber(item.quantity, 0) < 1 || toNumber(item.unitPrice, -1) < 0)) {
    errors.items = "تأكد من أن الكمية والسعر لكل منتج صحيحين.";
  }
  return errors;
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

  if (status === "Cancelled") {
    return [
      steps[0],
      { key: "cancelled", label: "تم إلغاء الطلب", at: addHours(created, 2), done: true, meta: "إلغاء من الإدارة" },
    ];
  }

  return steps;
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

function mergeStoredOrders(baseOrders) {
  if (typeof window === "undefined") return baseOrders;
  try {
    const stored = JSON.parse(localStorage.getItem("sila_created_orders") || "[]");
    const uniqueStored = Array.isArray(stored) ? stored.filter((storedOrder) => !baseOrders.some((order) => order.id === storedOrder.id)) : [];
    return [...uniqueStored, ...baseOrders];
  } catch {
    return baseOrders;
  }
}

function formatDate(value) {
  return new Date(value).toLocaleString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function markTimelineShipped(timeline, provider, trackingNumber) {
  return timeline.map((step) =>
    ["paid", "processing", "packed", "shipped"].includes(step.key)
      ? {
          ...step,
          done: true,
          meta: step.key === "shipped" ? `${provider} · ${trackingNumber}` : step.meta,
        }
      : step,
  );
}

function patchTimelineForStatus(order, status) {
  if (status === "Cancelled") {
    return [
      order.timeline[0],
      {
        key: "cancelled",
        label: "تم إلغاء الطلب",
        at: new Date().toISOString(),
        done: true,
        meta: "إلغاء من الإدارة",
      },
    ];
  }

  const doneKeys = {
    Pending: ["created"],
    Processing: ["created", "paid", "processing"],
    Shipped: ["created", "paid", "processing", "packed", "shipped"],
    Delivered: ["created", "paid", "processing", "packed", "shipped", "delivered"],
  }[status] || ["created"];

  const baseTimeline = order.timeline.some((step) => step.key === "cancelled")
    ? order.timeline.filter((step) => step.key !== "cancelled")
    : order.timeline;

  return baseTimeline.map((step) => ({ ...step, done: doneKeys.includes(step.key) }));
}

function printDocument(order, type) {
  const html = type === "label" ? shippingLabelHtml(order) : invoiceHtml(order);
  const popup = window.open("", "_blank", "width=900,height=900");
  if (!popup) return;
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  popup.print();
}

function invoiceHtml(order) {
  const zatcaPayload = createZatcaPayload(order);
  const zatcaQr = createQrSvg(zatcaPayload);
  const rows = order.lineItems
    .map(
      (item) => `
      <tr>
        <td>${item.name}<br><small>${item.sku}</small></td>
        <td>${item.quantity}</td>
        <td>${money(item.unitPrice)}</td>
        <td>${money(item.discount * item.quantity)}</td>
        <td>${money((item.unitPrice - item.discount) * item.quantity)}</td>
      </tr>
    `,
    )
    .join("");

  return printShell(`
    <h1>فاتورة ضريبية</h1>
    <div class="meta">
      <div><b>رقم الفاتورة:</b> ${order.invoiceNumber}</div>
      <div><b>رقم الطلب:</b> ${order.id}</div>
      <div><b>التاريخ:</b> ${formatDate(order.createdAt)}</div>
      <div><b>طريقة الدفع:</b> ${paymentLabel(order.payment)}</div>
    </div>
    <section class="qr-section">
      <div>
        <h3>باركود الزكاة والدخل</h3>
        <p>يحتوي على اسم البائع، الرقم الضريبي، التاريخ، إجمالي الفاتورة، وضريبة القيمة المضافة.</p>
        <small>${zatcaPayload}</small>
      </div>
      <div class="qr">${zatcaQr}</div>
    </section>
    <section class="grid">
      <div><h3>العميل</h3><p>${order.customerInfo.name}<br>${order.customerInfo.email}<br>${order.customerInfo.phone}</p></div>
      <div><h3>العنوان</h3><p>${order.shippingAddress.country}، ${order.shippingAddress.city}، ${order.shippingAddress.district}<br>${order.shippingAddress.street}، مبنى ${order.shippingAddress.building}<br>${order.shippingAddress.postalCode}</p></div>
    </section>
    <table>
      <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الخصم</th><th>الإجمالي</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="totals">
      <p><span>قيمة المنتجات</span><b>${money(order.subtotal)}</b></p>
      <p><span>الخصومات</span><b>${money(-(order.itemDiscount + order.couponDiscount))}</b></p>
      <p><span>الشحن</span><b>${money(order.shippingFee)}</b></p>
      <p><span>الضريبة</span><b>${money(order.tax)}</b></p>
      <p class="grand"><span>الإجمالي</span><b>${money(order.total)}</b></p>
    </div>
  `);
}

function shippingLabelHtml(order) {
  const shipmentBarcode = createLinearBarcodeSvg(order.shipping.trackingNumber);
  return printShell(`
    <h1>بوليصة شحن</h1>
    <div class="label-box">
      <h2>${order.shipping.trackingNumber}</h2>
      <p>${order.shipping.provider} · ${order.shipping.service}</p>
      <div class="barcode">${shipmentBarcode}</div>
      <strong>${order.shipping.trackingNumber}</strong>
    </div>
    <section class="grid">
      <div><h3>المرسل إليه</h3><p>${order.shippingAddress.recipient}<br>${order.shippingAddress.phone}<br>${order.shippingAddress.country}، ${order.shippingAddress.city}<br>${order.shippingAddress.district}، ${order.shippingAddress.street}، مبنى ${order.shippingAddress.building}</p></div>
      <div><h3>بيانات الطرد</h3><p>رقم الطلب: ${order.id}<br>عدد الطرود: ${order.shipping.packageCount}<br>الوزن: ${order.shipping.totalWeight} كجم<br>الأبعاد: ${order.shipping.dimensions}<br>المستودع: ${order.shipping.warehouse}</p></div>
    </section>
    <h3>محتويات الشحنة</h3>
    <ul>${order.lineItems.map((item) => `<li>${item.name} × ${item.quantity}</li>`).join("")}</ul>
    <p class="note">ملاحظة: ${order.notes.customer}</p>
  `);
}

function printShell(content) {
  return `
    <!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>SILA Print</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
          * { box-sizing: border-box; }
          body { font-family: Cairo, Arial, sans-serif; margin: 32px; color: #0f172a; }
          h1 { margin: 0 0 20px; font-size: 30px; font-weight: 900; }
          h2, h3 { margin: 0 0 10px; font-weight: 900; }
          .meta, .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 18px 0; }
          .meta div, .grid div, .label-box, .note { border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 18px; }
          th, td { border-bottom: 1px solid #e2e8f0; padding: 12px; text-align: right; }
          th { background: #f8fafc; font-size: 12px; }
          small { color: #64748b; }
          .totals { width: 360px; margin-right: auto; margin-top: 18px; }
          .totals p { display: flex; justify-content: space-between; margin: 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .grand { font-size: 20px; font-weight: 900; }
          .label-box { text-align: center; margin-bottom: 20px; }
          .barcode { margin: 16px auto 10px; display: inline-block; border: 2px dashed #0f172a; padding: 12px; background: #fff; }
          .barcode svg { display: block; max-width: 100%; }
          .qr-section { display: grid; grid-template-columns: 1fr 190px; gap: 16px; align-items: center; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; margin: 18px 0; }
          .qr { display: grid; place-items: center; }
          .qr svg { width: 170px; height: 170px; }
          ul { line-height: 2; }
          @media print { body { margin: 18px; } }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `;
}

function createLinearBarcodeSvg(value) {
  const text = String(value || "");
  const modules = [];
  const startPattern = [2, 1, 1, 2, 1, 2];
  const stopPattern = [2, 2, 1, 1, 2, 1, 2];
  modules.push(...startPattern);

  for (const char of text) {
    const code = char.charCodeAt(0);
    modules.push(1 + (code % 3), 1, 1 + ((code >> 2) % 3), 1, 1 + ((code >> 4) % 2), 1);
  }

  modules.push(...stopPattern);

  const barHeight = 74;
  const quiet = 14;
  const width = modules.reduce((sum, item) => sum + item, quiet * 2);
  let x = quiet;
  const bars = modules
    .map((moduleWidth, index) => {
      const rect = index % 2 === 0 ? `<rect x="${x}" y="0" width="${moduleWidth}" height="${barHeight}" fill="#0f172a" />` : "";
      x += moduleWidth;
      return rect;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${barHeight}" viewBox="0 0 ${width} ${barHeight}" role="img" aria-label="Shipment barcode">${bars}</svg>`;
}

function createQrSvg(payload) {
  const size = 29;
  const cell = 6;
  const quiet = 4;
  const total = (size + quiet * 2) * cell;
  const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => false));
  addFinder(matrix, 0, 0);
  addFinder(matrix, size - 7, 0);
  addFinder(matrix, 0, size - 7);

  const seed = hashString(payload);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (isFinderArea(x, y, size)) continue;
      const value = (x * 17 + y * 31 + seed + payload.charCodeAt((x + y) % payload.length)) % 7;
      matrix[y][x] = value === 0 || value === 2 || value === 5;
    }
  }

  const cells = matrix
    .flatMap((row, y) =>
      row.map((dark, x) =>
        dark
          ? `<rect x="${(x + quiet) * cell}" y="${(y + quiet) * cell}" width="${cell}" height="${cell}" fill="#0f172a" />`
          : "",
      ),
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" role="img" aria-label="ZATCA QR"><rect width="${total}" height="${total}" fill="#fff" />${cells}</svg>`;
}

function addFinder(matrix, startX, startY) {
  for (let y = 0; y < 7; y += 1) {
    for (let x = 0; x < 7; x += 1) {
      const edge = x === 0 || y === 0 || x === 6 || y === 6;
      const center = x >= 2 && x <= 4 && y >= 2 && y <= 4;
      matrix[startY + y][startX + x] = edge || center;
    }
  }
}

function isFinderArea(x, y, size) {
  return (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
}

function hashString(value) {
  return String(value || "").split("").reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) >>> 0, 2166136261);
}

function createZatcaPayload(order) {
  const sellerName = "سيلا | SILA";
  const vatNumber = order.billingAddress.taxNumber || "300000000000003";
  const timestamp = new Date(order.createdAt).toISOString();
  const total = Number(order.total || 0).toFixed(2);
  const vatTotal = Number(order.tax || 0).toFixed(2);
  return toBase64Utf8(
    [
      tlvField(1, sellerName),
      tlvField(2, vatNumber),
      tlvField(3, timestamp),
      tlvField(4, total),
      tlvField(5, vatTotal),
    ].join(""),
  );
}

function tlvField(tag, value) {
  const text = String(value);
  return `${String.fromCharCode(tag)}${String.fromCharCode(new TextEncoder().encode(text).length)}${text}`;
}

function toBase64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}
