import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgePercent,
  Boxes,
  CreditCard,
  LifeBuoy,
  Megaphone,
  PackagePlus,
  Plus,
  ShoppingCart,
  Store,
  Target,
  Truck,
  Users,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import StatCard from "../components/StatCard";
import { categorySales, revenueData, trafficSources } from "../data/analytics";
import { orders } from "../data/orders";
import { products } from "../data/products";
import { readAbandonedCarts } from "../services/abandonedCartService";
import { compactMoney, money, statusTone, stockState } from "../utils/formatters";
import { categoryLabel, dayLabel, monthLabel, statusLabel, trafficLabel } from "../utils/labels";
import { zeroOrderMetrics, zeroProductMetrics } from "../utils/zeroDataMetrics";

const chartColors = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
const zeroRevenueData = revenueData.map((item) => ({ ...item, revenue: 0, orders: 0 }));
const zeroCategorySales = categorySales.map((item) => ({ ...item, Laptops: 0, Phones: 0, Audio: 0, Cameras: 0 }));
const zeroTrafficSources = trafficSources.map((item) => ({ ...item, value: 0 }));

export default function Dashboard() {
  const zeroProducts = products.map(zeroProductMetrics);
  const zeroOrders = orders.map(zeroOrderMetrics);
  const topProducts = [...zeroProducts].sort((a, b) => b.sales - a.sales).slice(0, 5);
  const lowStockProducts = zeroProducts.filter((product) => product.stock <= product.threshold).slice(0, 5);
  const urgentOrders = zeroOrders.filter((order) => ["Pending", "Processing", "Shipped"].includes(order.status)).slice(0, 6);
  const abandonedCarts = readAbandonedCarts().filter((cart) => cart.status !== "converted").map((cart) => ({ ...cart, total: 0, subtotal: 0, itemsCount: 0 }));
  const recoverableCarts = abandonedCarts.filter((cart) => cart.customer?.email || cart.customer?.phone);
  const totalRevenue = zeroRevenueData.at(-1)?.revenue || 0;
  const totalOrders = zeroRevenueData.at(-1)?.orders || 0;
  const averageOrder = Math.round(totalRevenue / Math.max(totalOrders, 1));
  const abandonedValue = abandonedCarts.reduce((sum, cart) => sum + Number(cart.total || cart.subtotal || 0), 0);
  const fulfillmentProgress = 0;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1fr_360px] xl:items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-accent">
              Control Center
            </div>
            <h1 className="mt-4 font-heading text-2xl font-black text-slate-950 sm:text-4xl dark:text-white">
              مركز تشغيل سيلا اليومي
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
              متابعة موحدة للمبيعات والطلبات والمخزون والتسويق والسلات المتروكة، مع إجراءات مباشرة لتشغيل المتجر بدون تنقل زائد.
            </p>
            <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
              <Link to="/admin/orders/create">
                <Button className="w-full justify-center sm:w-auto">
                  <Plus size={17} />
                  إنشاء طلب
                </Button>
              </Link>
              <Link to="/admin/products">
                <Button variant="secondary" className="w-full justify-center sm:w-auto">
                  <PackagePlus size={17} />
                  إدارة المنتجات
                </Button>
              </Link>
              <Link to="/admin/marketing">
                <Button variant="secondary" className="w-full justify-center sm:w-auto">
                  <Target size={17} />
                  السلات المتروكة
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <QuickHealth label="جاهزية الشحن" value={`${fulfillmentProgress}%`} tone="success" />
            <QuickHealth label="سلات قابلة للاستهداف" value={String(recoverableCarts.length)} tone="warning" />
            <QuickHealth label="تنبيهات المخزون" value={String(lowStockProducts.length)} tone="danger" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="الإيرادات الشهرية" value={compactMoney(totalRevenue)} delta="0%" icon={CreditCard} strip={[0, 0, 0, 0, 0, 0, 0]} />
        <StatCard title="طلبات الشهر" value={totalOrders.toLocaleString("ar-SA")} delta="0%" icon={ShoppingCart} strip={[0, 0, 0, 0, 0, 0, 0]} />
        <StatCard title="متوسط الطلب" value={money(averageOrder)} delta="0%" icon={WalletCards} strip={[0, 0, 0, 0, 0, 0, 0]} />
        <StatCard title="قيمة السلات المتروكة" value={compactMoney(abandonedValue)} delta="0%" icon={BadgePercent} strip={[0, 0, 0, 0, 0, 0, 0]} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_.9fr]">
        <section className="card p-4 sm:p-5">
          <PanelHeader
            title="اتجاه الإيرادات والطلبات"
            text="قراءة شهرية لحركة الإيرادات مع حجم الطلبات"
            badge="مباشر"
          />
          <div className="mt-5 h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={zeroRevenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickFormatter={monthLabel} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => compactMoney(value)} width={70} />
                <Tooltip formatter={(value, name) => [name === "orders" ? value : money(value), name === "orders" ? "الطلبات" : "الإيرادات"]} contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0" }} />
                <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="#6366f1" strokeWidth={3} fill="url(#revenueGradient)" />
                <Area type="monotone" dataKey="orders" name="الطلبات" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-4 sm:p-5">
          <PanelHeader title="قنوات الزيارات" text="مصادر الاستحواذ الحالية" badge="Marketing" />
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={zeroTrafficSources.map((source) => ({ ...source, name: trafficLabel(source.name) }))} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={4}>
                  {zeroTrafficSources.map((source, index) => <Cell key={source.name} fill={chartColors[index]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid gap-2">
            {zeroTrafficSources.map((source, index) => (
              <div key={source.name} className="flex items-center justify-between gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: chartColors[index] }} />
                  {trafficLabel(source.name)}
                </span>
                <span>{source.value}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="card p-4 sm:p-5">
          <PanelHeader title="سلات متروكة تحتاج استهداف" text="أحدث العملاء الذين تركوا منتجات قبل الدفع" badge={`${abandonedCarts.length} سلة`} />
          <div className="mt-5 grid gap-3">
            {abandonedCarts.slice(0, 5).length ? (
              abandonedCarts.slice(0, 5).map((cart) => (
                <div key={cart.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-950 dark:text-white">{cart.customer?.name || cart.customer?.email || cart.customer?.phone || "زائر بدون بيانات"}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">{cart.itemsCount} منتجات · {formatRelative(cart.lastActivityAt)}</p>
                    </div>
                    <p className="font-heading text-lg font-black text-slate-950 dark:text-white">{money(cart.total || cart.subtotal || 0)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Badge tone={cart.customer?.email || cart.customer?.phone ? "success" : "warning"}>
                      {cart.customer?.email || cart.customer?.phone ? "قابل للاستهداف" : "ناقص بيانات"}
                    </Badge>
                    <Link to="/admin/marketing" className="text-sm font-black text-accent hover:underline">فتح التسويق</Link>
                  </div>
                </div>
              ))
            ) : (
              <EmptyStateLite icon={ShoppingCart} title="لا توجد سلات متروكة الآن" text="ستظهر هنا تلقائيا عند إضافة منتجات للسلة." />
            )}
          </div>
        </section>

        <section className="card p-4 sm:p-5">
          <PanelHeader title="طلبات تحتاج متابعة" text="طلبات مفتوحة أو قيد التجهيز والشحن" badge={`${urgentOrders.length} طلب`} />
          <div className="mt-5 grid gap-3">
            {urgentOrders.map((order) => (
              <div key={order.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-slate-950 dark:text-white">{order.id}</p>
                    <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500">{order.customer} · {order.items} عناصر · {order.source}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-lg font-black text-slate-950 dark:text-white">{money(order.total)}</p>
                  <p className="text-xs font-bold text-slate-500">{order.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-4 sm:p-5 xl:col-span-2">
          <PanelHeader title="المبيعات الأسبوعية حسب التصنيف" text="أداء التصنيفات خلال الأسبوع الحالي" badge="Catalog" />
          <div className="mt-5 h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zeroCategorySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickFormatter={dayLabel} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="Laptops" name="لابتوبات" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Phones" name="هواتف" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Audio" name="صوتيات" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Cameras" name="كاميرات" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-4 sm:p-5">
          <PanelHeader title="أفضل المنتجات" text="حسب عدد المبيعات" badge="Top 5" />
          <div className="mt-5 space-y-5">
            {topProducts.map((product) => (
              <div key={product.id}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950 dark:text-white">{product.name}</p>
                    <p className="text-xs text-slate-500">{categoryLabel(product.category)}</p>
                  </div>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">{product.sales}</span>
                </div>
                <ProgressBar value={(product.sales / Math.max(topProducts[0]?.sales || 1, 1)) * 100} tone="bg-gradient-to-r from-accent to-violetAccent" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
        <section className="card p-4 sm:p-5">
          <PanelHeader title="تنبيهات المخزون" text="منتجات اقتربت من حد إعادة الطلب" badge={`${lowStockProducts.length} تنبيه`} />
          <div className="mt-5 space-y-3">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate font-bold text-slate-950 dark:text-white">{product.name}</p>
                  <Badge tone={statusTone(stockState(product))}>{product.stock} متبقي</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">حد التنبيه: {product.threshold}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-4 sm:p-5">
          <PanelHeader title="إجراءات سريعة" text="اختصارات تشغيلية لأكثر المهام تكرارا" badge="Actions" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ActionLink to="/admin/orders/create" icon={Plus} title="طلب جديد" text="إنشاء طلب يدوي للعميل" />
            <ActionLink to="/admin/products" icon={Boxes} title="تحديث المخزون" text="متابعة المنتجات والكميات" />
            <ActionLink to="/admin/logistics" icon={Truck} title="الشحن" text="مزودي الشحن والتتبع" />
            <ActionLink to="/admin/payments" icon={WalletCards} title="الدفع والعملات" text="البوابات والدول والعملات" />
            <ActionLink to="/admin/live-chat" icon={LifeBuoy} title="الدعم المباشر" text="المحادثات والوكيل الذكي" />
            <ActionLink to="/admin/storefront" icon={Store} title="واجهة المتجر" text="الثيمات وتجربة المتجر" />
          </div>
        </section>
      </div>
    </div>
  );
}

function PanelHeader({ title, text, badge }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{text}</p>
      </div>
      {badge ? <Badge tone="accent">{badge}</Badge> : null}
    </div>
  );
}

function QuickHealth({ label, value, tone }) {
  const tones = {
    success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    danger: "bg-red-500/10 text-red-700 dark:text-red-300",
  };
  return (
    <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${tones[tone]}`}>
      <span className="text-sm font-black">{label}</span>
      <span className="font-heading text-xl font-black">{value}</span>
    </div>
  );
}

function ActionLink({ to, icon: Icon, title, text }) {
  return (
    <Link to={to} className="group rounded-2xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-500/5 dark:border-slate-800">
      <div className="flex items-start gap-3">
        <span className="rounded-2xl bg-slate-100 p-3 text-accent transition group-hover:bg-accent group-hover:text-white dark:bg-slate-900">
          <Icon size={19} />
        </span>
        <span className="min-w-0">
          <span className="block font-heading font-black text-slate-950 dark:text-white">{title}</span>
          <span className="mt-1 block text-sm leading-6 text-slate-500">{text}</span>
        </span>
        <ArrowUpRight className="mr-auto shrink-0 text-slate-300 transition group-hover:text-accent" size={18} />
      </div>
    </Link>
  );
}

function EmptyStateLite({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
      <Icon className="mx-auto text-slate-400" size={32} />
      <p className="mt-3 font-heading font-black text-slate-950 dark:text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}

function formatRelative(value) {
  if (!value) return "غير معروف";
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return new Date(value).toLocaleDateString("ar-SA");
}
