import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, BadgePercent, CreditCard, ShoppingCart, Users } from "lucide-react";
import Badge from "../components/Badge";
import ProgressBar from "../components/ProgressBar";
import StatCard from "../components/StatCard";
import { categorySales, revenueData, trafficSources } from "../data/analytics";
import { orders } from "../data/orders";
import { products } from "../data/products";
import { compactMoney, money, statusTone, stockState } from "../utils/formatters";
import { categoryLabel, dayLabel, monthLabel, statusLabel, trafficLabel } from "../utils/labels";

const chartColors = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

export default function Dashboard() {
  const topProducts = [...products].sort((a, b) => b.sales - a.sales).slice(0, 5);
  const alerts = products.filter((product) => product.stock <= product.threshold).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="الإيرادات" value={compactMoney(214200)} delta="+18.4%" icon={CreditCard} />
        <StatCard title="الطلبات" value="2,240" delta="+12.1%" icon={ShoppingCart} strip={[30, 44, 55, 50, 69, 72, 86]} />
        <StatCard title="العملاء" value="18,420" delta="+9.7%" icon={Users} strip={[38, 50, 47, 62, 68, 79, 90]} />
        <StatCard title="معدل التحويل" value="6.84%" delta="-1.2%" icon={BadgePercent} positive={false} strip={[70, 64, 58, 61, 49, 45, 42]} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-5 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">اتجاه الإيرادات</h2>
              <p className="text-sm text-slate-500">إجمالي الإيرادات وحركة الطلبات خلال 12 شهرًا</p>
            </div>
            <Badge tone="accent">مباشر</Badge>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickFormatter={monthLabel} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => compactMoney(value)} />
                <Tooltip formatter={(value) => money(value)} contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0" }} />
                <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="#6366f1" strokeWidth={3} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">مصادر الزيارات</h2>
          <p className="mb-4 text-sm text-slate-500">الجلسات حسب قناة الاستحواذ</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={trafficSources.map((source) => ({ ...source, name: trafficLabel(source.name) }))} dataKey="value" nameKey="name" innerRadius={64} outerRadius={94} paddingAngle={4}>
                  {trafficSources.map((source, index) => <Cell key={source.name} fill={chartColors[index]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-5 xl:col-span-2">
          <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">المبيعات الأسبوعية حسب التصنيف</h2>
          <p className="mb-4 text-sm text-slate-500">أداء التصنيفات خلال الأسبوع الحالي</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickFormatter={dayLabel} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0" }} />
                <Legend />
                <Bar dataKey="Laptops" name="لابتوبات" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Phones" name="هواتف" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Audio" name="صوتيات" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Cameras" name="كاميرات" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">أفضل المنتجات</h2>
          <div className="mt-5 space-y-5">
            {topProducts.map((product) => (
              <div key={product.id}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950 dark:text-white">{product.name}</p>
                    <p className="text-xs text-slate-500">{categoryLabel(product.category)}</p>
                  </div>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">{product.sales}</span>
                </div>
                <ProgressBar value={(product.sales / 242) * 100} tone="bg-gradient-to-r from-accent to-violetAccent" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card overflow-hidden xl:col-span-2">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">أحدث الطلبات</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                    <td className="px-5 py-4 font-black text-slate-950 dark:text-white">{order.id}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{order.customer}</td>
                    <td className="px-5 py-4 text-slate-500">{order.items} عناصر</td>
                    <td className="px-5 py-4 font-bold text-slate-950 dark:text-white">{money(order.total)}</td>
                    <td className="px-5 py-4"><Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-amber-500/10 p-3 text-warning"><AlertTriangle size={22} /></div>
            <div>
              <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">تنبيهات المخزون</h2>
              <p className="text-sm text-slate-500">تحتاج متابعة تشغيلية</p>
            </div>
          </div>
          <div className="space-y-3">
            {alerts.map((product) => (
              <div key={product.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-slate-950 dark:text-white">{product.name}</p>
                  <Badge tone={statusTone(stockState(product))}>{product.stock} متبقي</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">حد التنبيه: {product.threshold}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
