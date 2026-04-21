import { useState, useEffect, useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { LayoutDashboard, Package, ShoppingCart, Users, Boxes, Settings, Search, Bell, ChevronDown, Menu, X, Moon, Sun, Monitor, Star, ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle2, Clock3, Truck, XCircle, Eye, Plus, Minus, Trash2, Filter, SlidersHorizontal, ChevronRight, ChevronLeft, Store, CreditCard, BadgePercent } from "lucide-react";

const products = [
  ["AstraBook Pro 14", "Laptops", 1899, 4.9, 42, 8, "LAP-ABP14", 168],
  ["AstraBook Air 13", "Laptops", 1399, 4.7, 21, 7, "LAP-ABA13", 134],
  ["AstraBook Max 16", "Laptops", 2499, 4.9, 16, 5, "LAP-ABM16", 91],
  ["Nexus One X", "Phones", 999, 4.8, 56, 12, "PHN-NOX", 212],
  ["Nexus Mini", "Phones", 699, 4.6, 18, 10, "PHN-NMI", 116],
  ["Nexus Fold", "Phones", 1599, 4.5, 9, 6, "PHN-NFD", 63],
  ["Pulse Max Headphones", "Headphones", 349, 4.9, 7, 12, "AUD-PMX", 189],
  ["Pulse Buds Pro", "Headphones", 199, 4.7, 74, 20, "AUD-PBP", 242],
  ["Pulse Gaming Set", "Headphones", 279, 4.4, 4, 10, "AUD-PGS", 69],
  ["FrameShot Z6", "Cameras", 1499, 4.8, 13, 6, "CAM-FZ6", 84],
  ["FrameShot Mini", "Cameras", 799, 4.5, 0, 5, "CAM-FMI", 49],
  ["FrameShot Lens 35", "Cameras", 499, 4.7, 22, 6, "CAM-L35", 58],
  ["FrameShot Action 4K", "Cameras", 399, 4.6, 44, 12, "CAM-A4K", 119],
  ["SlatePad Ultra", "Tablets", 1099, 4.8, 29, 9, "TAB-SPU", 147],
  ["SlatePad Mini", "Tablets", 579, 4.6, 31, 8, "TAB-SPM", 102],
  ["MagDock Studio", "Accessories", 149, 4.7, 94, 18, "ACC-MDS", 198],
  ["VoltHub 100W", "Accessories", 129, 4.6, 11, 15, "ACC-VH100", 156],
  ["Pulse Studio Mic", "Accessories", 229, 4.8, 26, 8, "ACC-PSM", 77],
  ["Slate Pencil Pro", "Accessories", 119, 4.6, 61, 15, "ACC-SPP", 131],
  ["SlatePad Keyboard", "Accessories", 239, 4.5, 35, 10, "ACC-SPK", 96],
].map((p, i) => ({
  id: i + 1,
  name: p[0],
  category: p[1],
  price: p[2],
  rating: p[3],
  stock: p[4],
  threshold: p[5],
  sku: p[6],
  sales: p[7],
  description: `${p[0]} is a premium commerce-ready electronics product with refined build quality, strong margins, and reliable fulfillment performance.`,
}));

const customerNames = [
  "Maya Chen", "Omar Khalid", "Lina Santos", "Noah Brooks", "Ava Morgan", "Yousef Nasser", "Sofia Rossi", "Ethan Clark", "Nora Haddad", "Leo Bennett",
  "Amal Hassan", "Mila Evans", "Adam Reed", "Zara Ali", "Ivy Carter", "Ryan Stone", "Hana Park", "Theo Gray", "Layla Mansour", "Eli Cooper",
  "Sara Novak", "Jonah Price", "Mira Khan", "Aria Blake", "Samir Saleh", "Nina Ford", "Kai Turner", "Leen Faris", "Jude Wilson", "Raya Kim",
];

const customers = customerNames.map((name, i) => ({
  id: i + 1,
  name,
  email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
  totalSpent: 640 + ((i * 421) % 9200),
  orders: 2 + ((i * 3) % 24),
  tier: ["Platinum", "Gold", "Silver", "Bronze"][i % 4],
  favoriteCategory: ["Laptops", "Phones", "Headphones", "Cameras", "Tablets", "Accessories"][(i * 2) % 6],
  city: ["New York", "Riyadh", "London", "Dubai", "Berlin", "Toronto"][i % 6],
  phone: `+1 555 ${1200 + i * 37}`,
}));

const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const payments = ["Visa", "Mastercard", "Apple Pay", "PayPal", "Amex"];
const ordersSeed = Array.from({ length: 50 }, (_, i) => ({
  id: `ORD-${10420 + i}`,
  customer: customers[i % customers.length].name,
  customerId: customers[i % customers.length].id,
  date: new Date(2026, 3, 20 - (i % 28)).toISOString().slice(0, 10),
  items: 1 + ((i * 5) % 6),
  total: 129 + ((i * 313) % 5200),
  payment: payments[i % payments.length],
  status: statuses[(i * 2 + 1) % statuses.length],
  products: products.slice(i % 14, (i % 14) + 3).map((p) => p.name),
}));

const revenueData = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"].map((m, i) => ({
  month: m,
  revenue: [82000, 91000, 96000, 103000, 118000, 126000, 142000, 168000, 151000, 173000, 191000, 214000][i],
  orders: [980, 1080, 1125, 1190, 1310, 1390, 1510, 1804, 1602, 1840, 2018, 2240][i],
}));
const categorySales = [
  { day: "Mon", Laptops: 42, Phones: 54, Audio: 33, Cameras: 21 },
  { day: "Tue", Laptops: 36, Phones: 61, Audio: 44, Cameras: 25 },
  { day: "Wed", Laptops: 52, Phones: 70, Audio: 39, Cameras: 30 },
  { day: "Thu", Laptops: 47, Phones: 64, Audio: 48, Cameras: 27 },
  { day: "Fri", Laptops: 63, Phones: 84, Audio: 57, Cameras: 36 },
  { day: "Sat", Laptops: 71, Phones: 92, Audio: 62, Cameras: 43 },
  { day: "Sun", Laptops: 58, Phones: 76, Audio: 51, Cameras: 34 },
];
const trafficSources = [{ name: "Organic", value: 42 }, { name: "Paid Search", value: 24 }, { name: "Social", value: 18 }, { name: "Email", value: 10 }, { name: "Referral", value: 6 }];
const tabs = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["products", "Products", Package],
  ["orders", "Orders", ShoppingCart],
  ["customers", "Customers", Users],
  ["inventory", "Inventory", Boxes],
  ["settings", "Settings", Settings],
].map(([id, label, icon]) => ({ id, label, icon }));

const money = (v) => `$${Number(v).toLocaleString()}`;
const initials = (name) => name.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
const stockState = (p) => (p.stock === 0 ? "Out of stock" : p.stock <= p.threshold ? "Low stock" : "In stock");
const badgeClass = (v) => ({
  Pending: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300",
  Processing: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:text-indigo-300",
  Shipped: "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-300",
  Delivered: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
  Cancelled: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-300",
  "In stock": "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
  "Low stock": "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300",
  "Out of stock": "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-300",
}[v] || "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800");

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20 ${className}`}>{children}</div>;
}

function IconButton({ children, label, onClick, className = "" }) {
  return <button aria-label={label} onClick={onClick} className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 ${className}`}>{children}</button>;
}

function Badge({ children, tone = "" }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${tone || "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"}`}>{children}</span>;
}

function ProgressBar({ value, tone = "bg-indigo-500" }) {
  return <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full transition-all duration-700 ${tone}`} style={{ width: `${Math.max(4, Math.min(100, value))}%` }} /></div>;
}

function Toggle({ checked, onChange, label }) {
  return <button aria-label={label} onClick={() => onChange(!checked)} className={`relative h-7 w-12 rounded-full transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${checked ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} /></button>;
}

function EmptyState({ title, text }) {
  return <Card className="flex min-h-56 flex-col items-center justify-center p-8 text-center"><div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-500 dark:bg-slate-900 dark:text-slate-400"><Search size={26} /></div><h3 className="font-heading text-lg font-bold text-slate-950 dark:text-white">{title}</h3><p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{text}</p></Card>;
}

function SkeletonLoader() {
  return <div className="animate-pulse space-y-6"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div><div className="grid gap-4 xl:grid-cols-3"><div className="h-96 rounded-2xl bg-slate-200 xl:col-span-2 dark:bg-slate-800" /><div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" /></div></div>;
}

function Dropdown({ button, children }) {
  const [open, setOpen] = useState(false);
  const [node, setNode] = useState(null);
  useEffect(() => {
    const close = (e) => node && !node.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [node]);
  return <div ref={setNode} className="relative"><div onClick={() => setOpen((v) => !v)}>{button}</div>{open && <div className="absolute right-0 z-40 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-300/30 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30">{children}</div>}</div>;
}

function Modal({ open, onClose, children }) {
  const [box, setBox] = useState(null);
  useEffect(() => {
    const key = (e) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open, onClose]);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(e) => box && !box.contains(e.target) && onClose()}><div ref={setBox} className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">{children}</div></div>;
}

function Pagination({ page, totalPages, onPage }) {
  return <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800"><button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300"><ChevronLeft size={16} />Previous</button><span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span><button onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300">Next<ChevronRight size={16} /></button></div>;
}

function DataTable({ columns, rows, sort, onSort, renderRow }) {
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/80 dark:text-slate-400"><tr>{columns.map((c) => <th key={c.key} className="px-4 py-3 font-black">{c.sortable ? <button onClick={() => onSort(c.key)} className="inline-flex items-center gap-1 rounded-lg transition hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">{c.label}<ChevronDown size={14} className={sort.key === c.key && sort.direction === "asc" ? "rotate-180" : ""} /></button> : c.label}</th>)}</tr></thead><tbody className="divide-y divide-slate-200 dark:divide-slate-800">{rows.length ? rows.map(renderRow) : <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">No rows found.</td></tr>}</tbody></table></div></div>;
}

function Toasts({ toasts, removeToast }) {
  return <div className="fixed bottom-5 right-5 z-[70] flex w-[calc(100%-40px)] max-w-sm flex-col gap-3">{toasts.map((t) => <div key={t.id} className="animate-[toastIn_.22s_ease-out] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-300/30 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30"><div className="flex gap-3"><div className={t.type === "success" ? "text-emerald-500" : t.type === "error" ? "text-red-500" : "text-indigo-500"}>{t.type === "success" ? <CheckCircle2 size={20} /> : t.type === "error" ? <XCircle size={20} /> : <Bell size={20} />}</div><div className="min-w-0 flex-1"><p className="font-bold text-slate-950 dark:text-white">{t.title}</p><p className="text-sm text-slate-500 dark:text-slate-400">{t.message}</p></div><button aria-label="Close toast" onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"><X size={16} /></button></div></div>)}</div>;
}

function SidebarNav({ activeTab, setActiveTab, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const content = <><div className="flex h-16 items-center justify-between px-4"><button onClick={() => setActiveTab("dashboard")} className="flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"><Store size={22} /></div>{!collapsed && <div className="text-left"><p className="font-heading text-lg font-black text-slate-950 dark:text-white">CommerceOS</p><p className="text-xs font-bold text-slate-500">Control center</p></div>}</button><button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-900"><X size={20} /></button></div><nav className="mt-4 space-y-1 px-3">{tabs.map((t) => { const Icon = t.icon; const active = activeTab === t.id; return <button key={t.id} onClick={() => { setActiveTab(t.id); setMobileOpen(false); }} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${active ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"}`}><Icon size={20} />{!collapsed && <span>{t.label}</span>}</button>; })}</nav><div className="mt-auto p-3"><div className={collapsed ? "hidden" : "rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4"}><p className="font-heading text-sm font-black text-slate-950 dark:text-white">Growth pulse</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Revenue velocity is 18.4% above last quarter.</p><ProgressBar value={78} tone="bg-indigo-500" /></div><button aria-label="Collapse sidebar" onClick={() => setCollapsed(!collapsed)} className="mt-3 hidden w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 lg:flex dark:border-slate-800 dark:text-slate-300">{collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}{!collapsed && "Collapse"}</button></div></>;
  return <><aside className={`fixed left-0 top-0 z-40 hidden h-screen border-r border-slate-200 bg-white/90 backdrop-blur-xl transition-all lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-950/90 ${collapsed ? "w-20" : "w-60"}`}>{content}</aside>{mobileOpen && <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}<aside className={`fixed left-0 top-0 z-[60] flex h-screen w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:hidden dark:border-slate-800 dark:bg-slate-950 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>{content}</aside></>;
}

function Header({ setMobileOpen, title, theme, setTheme, cartCount, openCart }) {
  return <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/80 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80"><div className="flex items-center gap-3"><IconButton label="Open navigation" onClick={() => setMobileOpen(true)} className="lg:hidden"><Menu size={20} /></IconButton><div className="min-w-0 flex-1"><h1 className="truncate font-heading text-xl font-black text-slate-950 sm:text-2xl dark:text-white">{title}</h1><p className="hidden text-sm text-slate-500 sm:block">Live operations, merchandising, and fulfillment in one workspace.</p></div><div className="hidden min-w-[280px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm lg:flex dark:border-slate-800 dark:bg-slate-950"><Search size={18} className="text-slate-400" /><input aria-label="Global search" placeholder="Search orders, products, customers" className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100" /></div><IconButton label="Notifications" onClick={() => {}}><Bell size={20} /></IconButton><Dropdown button={<button aria-label="Theme switcher" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"><Monitor size={18} /><span className="hidden sm:inline">{theme}</span></button>}>{[["light", Sun], ["dark", Moon], ["auto", Monitor]].map(([item, Icon]) => <button key={item} onClick={() => setTheme(item)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold capitalize transition hover:bg-slate-100 dark:hover:bg-slate-900 ${theme === item ? "text-indigo-600" : "text-slate-600 dark:text-slate-300"}`}><Icon size={16} />{item}</button>)}</Dropdown><button aria-label="Open cart" onClick={openCart} className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"><ShoppingCart size={20} />{cartCount > 0 && <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-black text-white">{cartCount}</span>}</button><Dropdown button={<button className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 pr-2 transition hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:flex dark:border-slate-800 dark:bg-slate-950"><span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-950 text-xs font-black text-white dark:bg-white dark:text-slate-950">MC</span><ChevronDown size={16} className="text-slate-500" /></button>}><button className="w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">Account settings</button><button className="w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">Team workspace</button><button className="w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">Sign out</button></Dropdown></div></header>;
}

function StatCard({ title, value, delta, icon: Icon, positive = true, strip = [35, 55, 42, 76, 60, 88, 74] }) {
  return <Card className="group overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/30"><div className="flex items-start justify-between"><div className="rounded-2xl bg-slate-100 p-3 text-indigo-600 transition group-hover:bg-indigo-500 group-hover:text-white dark:bg-slate-900"><Icon size={22} /></div><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${positive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{delta}</span></div><p className="mt-5 text-sm font-bold text-slate-500">{title}</p><h3 className="mt-1 font-heading text-3xl font-black text-slate-950 dark:text-white">{value}</h3><div className="mt-5 flex h-10 items-end gap-1.5">{strip.map((h, i) => <span key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-indigo-500 to-violet-500 opacity-80 transition-all group-hover:opacity-100" style={{ height: `${h}%` }} />)}</div></Card>;
}

function DashboardView({ orders, addToCart }) {
  const topProducts = [...products].sort((a, b) => b.sales - a.sales).slice(0, 5);
  const alerts = products.filter((p) => p.stock <= p.threshold).slice(0, 6);
  const colors = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
  return <div className="space-y-6"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard title="Revenue" value="$214.2K" delta="+18.4%" icon={CreditCard} /><StatCard title="Orders" value="2,240" delta="+12.1%" icon={ShoppingCart} strip={[30, 44, 55, 50, 69, 72, 86]} /><StatCard title="Customers" value="18,420" delta="+9.7%" icon={Users} strip={[38, 50, 47, 62, 68, 79, 90]} /><StatCard title="Conversion Rate" value="6.84%" delta="-1.2%" icon={BadgePercent} positive={false} strip={[70, 64, 58, 61, 49, 45, 42]} /></div><div className="grid gap-6 xl:grid-cols-3"><Card className="p-5 xl:col-span-2"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">Revenue trend</h2><p className="text-sm text-slate-500">12 month gross revenue and order flow</p></div><Badge tone="bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:text-indigo-300">Live</Badge></div><div className="h-80"><ResponsiveContainer width="100%" height="100%"><AreaChart data={revenueData}><defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}K`} /><Tooltip formatter={(v) => money(v)} contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0" }} /><Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#rev)" /></AreaChart></ResponsiveContainer></div></Card><Card className="p-5"><h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">Traffic sources</h2><p className="mb-4 text-sm text-slate-500">Sessions by acquisition channel</p><div className="h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={trafficSources} dataKey="value" nameKey="name" innerRadius={64} outerRadius={94} paddingAngle={4}>{trafficSources.map((_, i) => <Cell key={i} fill={colors[i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></Card></div><div className="grid gap-6 xl:grid-cols-3"><Card className="p-5 xl:col-span-2"><h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">Weekly sales by category</h2><p className="mb-4 text-sm text-slate-500">Category momentum across the current week</p><div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={categorySales}><CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" /><XAxis dataKey="day" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0" }} /><Legend /><Bar dataKey="Laptops" fill="#6366f1" radius={[8, 8, 0, 0]} /><Bar dataKey="Phones" fill="#8b5cf6" radius={[8, 8, 0, 0]} /><Bar dataKey="Audio" fill="#10b981" radius={[8, 8, 0, 0]} /><Bar dataKey="Cameras" fill="#f59e0b" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></Card><Card className="p-5"><h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">Top products</h2><div className="mt-5 space-y-5">{topProducts.map((p) => <button key={p.id} onClick={() => addToCart(p, 1)} className="w-full rounded-2xl text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-slate-900"><div className="mb-2 flex items-center justify-between gap-3"><div><p className="font-bold text-slate-950 dark:text-white">{p.name}</p><p className="text-xs text-slate-500">{p.category}</p></div><span className="text-sm font-black text-slate-700 dark:text-slate-200">{p.sales}</span></div><ProgressBar value={(p.sales / 242) * 100} tone="bg-gradient-to-r from-indigo-500 to-violet-500" /></button>)}</div></Card></div><div className="grid gap-6 xl:grid-cols-3"><Card className="overflow-hidden xl:col-span-2"><div className="border-b border-slate-200 p-5 dark:border-slate-800"><h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">Recent orders</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><tbody className="divide-y divide-slate-200 dark:divide-slate-800">{orders.slice(0, 5).map((o) => <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60"><td className="px-5 py-4 font-black text-slate-950 dark:text-white">{o.id}</td><td className="px-5 py-4 text-slate-600 dark:text-slate-300">{o.customer}</td><td className="px-5 py-4 text-slate-500">{o.items} items</td><td className="px-5 py-4 font-bold text-slate-950 dark:text-white">{money(o.total)}</td><td className="px-5 py-4"><Badge tone={badgeClass(o.status)}>{o.status}</Badge></td></tr>)}</tbody></table></div></Card><Card className="p-5"><div className="mb-4 flex items-center gap-3"><div className="rounded-2xl bg-amber-500/10 p-3 text-amber-500"><AlertTriangle size={22} /></div><div><h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">Stock alerts</h2><p className="text-sm text-slate-500">Needs operational attention</p></div></div><div className="space-y-3">{alerts.map((p) => <div key={p.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800"><div className="flex items-center justify-between gap-2"><p className="font-bold text-slate-950 dark:text-white">{p.name}</p><Badge tone={p.stock === 0 ? badgeClass("Out of stock") : badgeClass("Low stock")}>{p.stock} left</Badge></div><p className="mt-1 text-xs text-slate-500">Threshold: {p.threshold}</p></div>)}</div></Card></div></div>;
}

function ProductsView({ addToCart, showToast }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [quick, setQuick] = useState(null);
  const [qty, setQty] = useState(1);
  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const filtered = useMemo(() => {
    let list = products.filter((p) => (category === "All" || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase()));
    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "stock") list = [...list].sort((a, b) => b.stock - a.stock);
    return list;
  }, [query, category, sort]);
  const add = (p, amount = 1) => p.stock === 0 ? showToast("Out of stock", `${p.name} cannot be added right now.`, "error") : addToCart(p, amount);
  return <div className="grid gap-6 xl:grid-cols-[260px_1fr]"><Card className="h-fit p-4"><div className="mb-4 flex items-center gap-2"><Filter size={18} className="text-indigo-500" /><h2 className="font-heading font-black text-slate-950 dark:text-white">Categories</h2></div><div className="space-y-1">{categories.map((c) => <button key={c} onClick={() => setCategory(c)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${category === c ? "bg-indigo-500 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"}`}><span>{c}</span><span>{c === "All" ? products.length : products.filter((p) => p.category === c).length}</span></button>)}</div></Card><div className="space-y-5"><Card className="p-4"><div className="flex flex-col gap-3 lg:flex-row"><div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-800"><Search size={18} className="text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm outline-none dark:text-white" /></div><select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"><option value="featured">Featured</option><option value="price-low">Price low to high</option><option value="price-high">Price high to low</option><option value="rating">Highest rating</option><option value="stock">Most stock</option></select></div></Card>{filtered.length ? <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{filtered.map((p) => <Card key={p.id} className="group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/30"><button onClick={() => { setQuick(p); setQty(1); }} className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"><div className="grid h-44 place-items-center bg-gradient-to-br from-slate-100 via-indigo-50 to-violet-100 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950"><Package size={54} className="text-indigo-400 transition group-hover:scale-110" /></div><div className="p-5"><div className="mb-3 flex items-start justify-between gap-3"><div><h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">{p.name}</h3><p className="text-sm text-slate-500">{p.category}</p></div><p className="font-heading text-lg font-black text-slate-950 dark:text-white">{money(p.price)}</p></div><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-1 text-amber-400">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} fill={i < Math.round(p.rating) ? "currentColor" : "none"} />)}<span className="ml-1 text-xs font-bold text-slate-500">{p.rating}</span></div><Badge tone={badgeClass(stockState(p))}>{stockState(p)}</Badge></div></div></button><div className="flex gap-2 px-5 pb-5"><button onClick={() => add(p, 1)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"><ShoppingCart size={17} />Add</button><button aria-label={`Quick view ${p.name}`} onClick={() => { setQuick(p); setQty(1); }} className="rounded-xl border border-slate-200 px-3 text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:text-slate-300"><Eye size={18} /></button></div></Card>)}</div> : <EmptyState title="No matching products" text="Adjust search, category, or sort settings to find more catalog items." />}<Modal open={!!quick} onClose={() => setQuick(null)}>{quick && <div className="grid md:grid-cols-2"><div className="grid min-h-80 place-items-center bg-gradient-to-br from-slate-100 via-indigo-50 to-violet-100 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950"><Package size={92} className="text-indigo-400" /></div><div className="p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-indigo-600">{quick.category}</p><h2 className="mt-1 font-heading text-2xl font-black text-slate-950 dark:text-white">{quick.name}</h2></div><button aria-label="Close quick view" onClick={() => setQuick(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900"><X size={20} /></button></div><p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{quick.description}</p><div className="mt-5 flex items-center gap-1 text-amber-400">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={17} fill={i < Math.round(quick.rating) ? "currentColor" : "none"} />)}<span className="ml-2 text-sm font-bold text-slate-500">{quick.rating} rating</span></div><div className="mt-6 flex items-center justify-between"><p className="font-heading text-3xl font-black text-slate-950 dark:text-white">{money(quick.price)}</p><Badge tone={badgeClass(stockState(quick))}>{stockState(quick)} - {quick.stock}</Badge></div><div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 p-3 dark:border-slate-800"><span className="text-sm font-bold text-slate-600 dark:text-slate-300">Quantity</span><div className="flex items-center gap-3"><button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} className="rounded-xl border border-slate-200 p-2 hover:border-indigo-300 dark:border-slate-800"><Minus size={16} /></button><span className="w-8 text-center font-black dark:text-white">{qty}</span><button aria-label="Increase quantity" onClick={() => setQty(qty + 1)} className="rounded-xl border border-slate-200 p-2 hover:border-indigo-300 dark:border-slate-800"><Plus size={16} /></button></div></div><button onClick={() => { add(quick, qty); setQuick(null); }} className="mt-6 w-full rounded-2xl bg-indigo-500 px-5 py-3 font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">Add to cart</button></div></div>}</Modal></div></div>;
}

function OrdersView({ orders, setOrders, showToast }) {
  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "date", direction: "desc" });
  const [selected, setSelected] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 8;
  const filtered = useMemo(() => {
    let list = orders.filter((o) => (status === "All" || o.status === status) && (o.id.toLowerCase().includes(query.toLowerCase()) || o.customer.toLowerCase().includes(query.toLowerCase())));
    return [...list].sort((a, b) => { const r = a[sort.key] > b[sort.key] ? 1 : a[sort.key] < b[sort.key] ? -1 : 0; return sort.direction === "asc" ? r : -r; });
  }, [orders, status, query, sort]);
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const toggleSort = (key) => setSort((s) => ({ key, direction: s.key === key && s.direction === "asc" ? "desc" : "asc" }));
  const bulkShip = () => { if (!selected.length) return showToast("No orders selected", "Select one or more orders before running a bulk action.", "error"); setOrders((rows) => rows.map((o) => selected.includes(o.id) ? { ...o, status: "Shipped" } : o)); setSelected([]); showToast("Orders updated", "Selected orders were marked as shipped.", "success"); };
  return <div className="space-y-5"><Card className="p-4"><div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div className="flex flex-wrap gap-2">{["All", ...statuses].map((s) => <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`rounded-xl px-3 py-2 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${status === s ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"}`}>{s}</button>)}</div><div className="flex flex-col gap-3 sm:flex-row"><div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-800"><Search size={18} className="text-slate-400" /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search order or customer" className="w-full bg-transparent text-sm outline-none dark:text-white" /></div><button onClick={bulkShip} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-white dark:text-slate-950"><Truck size={17} />Mark as shipped</button></div></div></Card><DataTable columns={[{ key: "select", label: "" }, { key: "id", label: "Order ID", sortable: true }, { key: "customer", label: "Customer", sortable: true }, { key: "date", label: "Date", sortable: true }, { key: "items", label: "Items", sortable: true }, { key: "total", label: "Total", sortable: true }, { key: "payment", label: "Payment", sortable: true }, { key: "status", label: "Status", sortable: true }, { key: "details", label: "" }]} rows={pageRows} sort={sort} onSort={toggleSort} renderRow={(o) => [<tr key={`${o.id}-main`} className="hover:bg-slate-50 dark:hover:bg-slate-900/60"><td className="px-4 py-4"><input aria-label={`Select ${o.id}`} type="checkbox" checked={selected.includes(o.id)} onChange={(e) => setSelected((s) => e.target.checked ? [...s, o.id] : s.filter((id) => id !== o.id))} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /></td><td className="px-4 py-4 font-black text-slate-950 dark:text-white">{o.id}</td><td className="px-4 py-4 text-slate-600 dark:text-slate-300">{o.customer}</td><td className="px-4 py-4 text-slate-500">{o.date}</td><td className="px-4 py-4 text-slate-600 dark:text-slate-300">{o.items}</td><td className="px-4 py-4 font-bold text-slate-950 dark:text-white">{money(o.total)}</td><td className="px-4 py-4 text-slate-600 dark:text-slate-300">{o.payment}</td><td className="px-4 py-4"><Badge tone={badgeClass(o.status)}>{o.status}</Badge></td><td className="px-4 py-4"><button aria-label={`Expand ${o.id}`} onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronDown size={18} className={expanded === o.id ? "rotate-180" : ""} /></button></td></tr>, expanded === o.id ? <tr key={`${o.id}-details`} className="bg-slate-50 dark:bg-slate-900/50"><td colSpan="9" className="px-4 py-4"><div className="grid gap-3 text-sm md:grid-cols-3"><div><span className="font-bold text-slate-500">Products</span><p className="mt-1 text-slate-700 dark:text-slate-200">{o.products.join(", ")}</p></div><div><span className="font-bold text-slate-500">Fulfillment</span><p className="mt-1 text-slate-700 dark:text-slate-200">Priority warehouse - Zone {o.items + 2}</p></div><div><span className="font-bold text-slate-500">Customer note</span><p className="mt-1 text-slate-700 dark:text-slate-200">Send tracking when available.</p></div></div></td></tr> : null]} /><Pagination page={page} totalPages={totalPages} onPage={setPage} /></div>;
}

function CustomersView() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("spent");
  const [selected, setSelected] = useState(customers[0]);
  const filtered = useMemo(() => { let list = customers.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase())); if (sort === "spent") list = [...list].sort((a, b) => b.totalSpent - a.totalSpent); if (sort === "orders") list = [...list].sort((a, b) => b.orders - a.orders); if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name)); return list; }, [query, sort]);
  const recent = ordersSeed.filter((o) => o.customerId === selected.id).slice(0, 4);
  return <div className="grid gap-6 xl:grid-cols-[1fr_360px]"><div className="space-y-5"><Card className="p-4"><div className="flex flex-col gap-3 sm:flex-row"><div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-800"><Search size={18} className="text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers" className="w-full bg-transparent text-sm outline-none dark:text-white" /></div><select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"><option value="spent">Total spent</option><option value="orders">Orders count</option><option value="name">Name</option></select></div></Card><div className="grid gap-3">{filtered.map((c) => <button key={c.id} onClick={() => setSelected(c)} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${selected.id === c.id ? "border-indigo-300 bg-indigo-500/5 dark:border-indigo-700" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"}`}><div className="grid gap-4 md:grid-cols-[1fr_140px_100px_100px] md:items-center"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">{initials(c.name)}</div><div><p className="font-black text-slate-950 dark:text-white">{c.name}</p><p className="text-sm text-slate-500">{c.email}</p></div></div><p className="font-bold text-slate-950 dark:text-white">{money(c.totalSpent)}</p><p className="text-sm font-bold text-slate-500">{c.orders} orders</p><Badge tone={c.tier === "Platinum" || c.tier === "Gold" ? "bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:text-indigo-300" : ""}>{c.tier}</Badge></div></button>)}</div></div><Card className="h-fit p-5 xl:sticky xl:top-24"><div className="flex items-center gap-3"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 font-heading text-lg font-black text-white">{initials(selected.name)}</div><div><h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">{selected.name}</h2><p className="text-sm text-slate-500">{selected.email}</p></div></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900"><p className="text-xs font-bold text-slate-500">Total spent</p><p className="mt-1 font-heading text-xl font-black text-slate-950 dark:text-white">{money(selected.totalSpent)}</p></div><div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900"><p className="text-xs font-bold text-slate-500">Orders</p><p className="mt-1 font-heading text-xl font-black text-slate-950 dark:text-white">{selected.orders}</p></div></div><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-3"><span className="text-slate-500">Phone</span><span className="font-bold text-slate-800 dark:text-slate-200">{selected.phone}</span></div><div className="flex justify-between gap-3"><span className="text-slate-500">City</span><span className="font-bold text-slate-800 dark:text-slate-200">{selected.city}</span></div><div className="flex justify-between gap-3"><span className="text-slate-500">Favorite category</span><span className="font-bold text-slate-800 dark:text-slate-200">{selected.favoriteCategory}</span></div></div><h3 className="mt-6 font-heading font-black text-slate-950 dark:text-white">Recent orders</h3><div className="mt-3 space-y-2">{(recent.length ? recent : ordersSeed.slice(0, 3)).map((o) => <div key={o.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 dark:border-slate-800"><div><p className="font-bold text-slate-950 dark:text-white">{o.id}</p><p className="text-xs text-slate-500">{o.date}</p></div><p className="font-black text-slate-950 dark:text-white">{money(o.total)}</p></div>)}</div></Card></div>;
}

function InventoryView() {
  const [sort, setSort] = useState({ key: "stock", direction: "asc" });
  const sorted = useMemo(() => [...products].sort((a, b) => { const r = a[sort.key] > b[sort.key] ? 1 : a[sort.key] < b[sort.key] ? -1 : 0; return sort.direction === "asc" ? r : -r; }), [sort]);
  const summary = { inStock: products.filter((p) => p.stock > p.threshold).length, lowStock: products.filter((p) => p.stock > 0 && p.stock <= p.threshold).length, out: products.filter((p) => p.stock === 0).length };
  const toggleSort = (key) => setSort((s) => ({ key, direction: s.key === key && s.direction === "asc" ? "desc" : "asc" }));
  return <div className="space-y-6"><div className="grid gap-4 md:grid-cols-3"><Card className="p-5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500"><CheckCircle2 size={23} /></div><div><p className="text-sm font-bold text-slate-500">In stock</p><p className="font-heading text-2xl font-black text-slate-950 dark:text-white">{summary.inStock}</p></div></div></Card><Card className="p-5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-amber-500/10 p-3 text-amber-500"><AlertTriangle size={23} /></div><div><p className="text-sm font-bold text-slate-500">Low stock</p><p className="font-heading text-2xl font-black text-slate-950 dark:text-white">{summary.lowStock}</p></div></div></Card><Card className="p-5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-red-500/10 p-3 text-red-500"><XCircle size={23} /></div><div><p className="text-sm font-bold text-slate-500">Out of stock</p><p className="font-heading text-2xl font-black text-slate-950 dark:text-white">{summary.out}</p></div></div></Card></div><DataTable columns={[{ key: "name", label: "Product", sortable: true }, { key: "sku", label: "SKU", sortable: true }, { key: "category", label: "Category", sortable: true }, { key: "stock", label: "Stock", sortable: true }, { key: "threshold", label: "Threshold", sortable: true }, { key: "price", label: "Price", sortable: true }, { key: "bar", label: "Stock health" }]} rows={sorted} sort={sort} onSort={toggleSort} renderRow={(p) => { const low = p.stock <= p.threshold; return <tr key={p.id} className={low ? "bg-amber-50/70 dark:bg-amber-950/10" : "hover:bg-slate-50 dark:hover:bg-slate-900/60"}><td className="px-4 py-4 font-black text-slate-950 dark:text-white">{p.name}</td><td className="px-4 py-4 text-slate-500">{p.sku}</td><td className="px-4 py-4 text-slate-600 dark:text-slate-300">{p.category}</td><td className="px-4 py-4"><Badge tone={badgeClass(stockState(p))}>{p.stock}</Badge></td><td className="px-4 py-4 text-slate-600 dark:text-slate-300">{p.threshold}</td><td className="px-4 py-4 font-bold text-slate-950 dark:text-white">{money(p.price)}</td><td className="w-56 px-4 py-4"><ProgressBar value={(p.stock / Math.max(1, p.threshold * 4)) * 100} tone={p.stock === 0 ? "bg-red-500" : low ? "bg-amber-500" : "bg-emerald-500"} /></td></tr>; }} /></div>;
}

function SettingsView({ theme, setTheme, showToast }) {
  const [form, setForm] = useState({ name: "CommerceOS Flagship Store", email: "support@commerceos.example", currency: "USD", timezone: "Asia/Riyadh", tax: "8.5" });
  const [prefs, setPrefs] = useState({ orders: true, inventory: true, marketing: false, security: true });
  const [saving, setSaving] = useState(false);
  const save = () => { setSaving(true); setTimeout(() => { setSaving(false); showToast("Settings saved", "Store configuration and preferences were updated.", "success"); }, 700); };
  return <div className="grid gap-6 xl:grid-cols-[1fr_380px]"><Card className="p-5"><h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">Store settings</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{[["name", "Store name"], ["email", "Support email"], ["currency", "Currency"], ["timezone", "Timezone"], ["tax", "Tax rate"]].map(([key, label]) => <label key={key} className={key === "name" || key === "email" ? "md:col-span-2" : ""}><span className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span><input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" /></label>)}</div><button onClick={save} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-5 py-3 font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">{saving ? <Clock3 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}{saving ? "Saving" : "Save settings"}</button></Card><div className="space-y-6"><Card className="p-5"><h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">Notifications</h2><div className="mt-5 space-y-4">{[["orders", "New orders"], ["inventory", "Inventory alerts"], ["marketing", "Campaign performance"], ["security", "Security notices"]].map(([key, label]) => <div key={key} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900"><span className="font-bold text-slate-700 dark:text-slate-200">{label}</span><Toggle checked={prefs[key]} onChange={(v) => setPrefs({ ...prefs, [key]: v })} label={label} /></div>)}</div></Card><Card className="p-5"><h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">Appearance</h2><div className="mt-5 grid grid-cols-3 gap-2">{[["light", Sun], ["dark", Moon], ["auto", Monitor]].map(([item, Icon]) => <button key={item} onClick={() => setTheme(item)} className={`rounded-2xl border p-4 text-center transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === item ? "border-indigo-400 bg-indigo-500 text-white" : "border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-800 dark:text-slate-300"}`}><Icon size={22} className="mx-auto" /><span className="mt-2 block text-sm font-black capitalize">{item}</span></button>)}</div></Card></div></div>;
}

function CartDrawer({ open, onClose, cart, setCart, showToast }) {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState({ code: "", rate: 0 });
  useEffect(() => {
    const key = (e) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open, onClose]);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmount = subtotal * discount.rate;
  const updateQty = (id, delta) => setCart((items) => items.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const applyDiscount = () => { const rules = { SAVE10: 0.1, VIP15: 0.15, LAUNCH20: 0.2 }; const clean = code.trim().toUpperCase(); if (rules[clean]) { setDiscount({ code: clean, rate: rules[clean] }); showToast("Discount applied", `${clean} reduced this cart total.`, "success"); } else { setDiscount({ code: "", rate: 0 }); showToast("Invalid code", "Try SAVE10, VIP15, or LAUNCH20.", "error"); } };
  const checkout = () => { if (!cart.length) return showToast("Cart is empty", "Add at least one product before checkout.", "error"); setCart([]); setDiscount({ code: "", rate: 0 }); setCode(""); onClose(); showToast("Checkout complete", "Demo checkout succeeded and the cart was cleared.", "success"); };
  return <>{open && <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />}<aside className={`fixed right-0 top-0 z-[60] flex h-screen w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform dark:border-slate-800 dark:bg-slate-950 ${open ? "translate-x-0" : "translate-x-full"}`}><div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800"><div><h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">Cart</h2><p className="text-sm text-slate-500">{cart.length} unique items</p></div><IconButton label="Close cart" onClick={onClose}><X size={20} /></IconButton></div><div className="flex-1 overflow-auto p-5">{cart.length ? <div className="space-y-3">{cart.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex gap-3"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-500"><Package size={26} /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><p className="font-black text-slate-950 dark:text-white">{item.name}</p><p className="text-sm text-slate-500">{money(item.price)}</p></div><button aria-label={`Remove ${item.name}`} onClick={() => setCart((items) => items.filter((i) => i.id !== item.id))} className="rounded-xl p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-500"><Trash2 size={17} /></button></div><div className="mt-3 flex items-center justify-between"><div className="flex items-center gap-2"><button aria-label="Decrease quantity" onClick={() => updateQty(item.id, -1)} className="rounded-lg border border-slate-200 p-1.5 dark:border-slate-800"><Minus size={14} /></button><span className="w-8 text-center text-sm font-black dark:text-white">{item.qty}</span><button aria-label="Increase quantity" onClick={() => updateQty(item.id, 1)} className="rounded-lg border border-slate-200 p-1.5 dark:border-slate-800"><Plus size={14} /></button></div><p className="font-black text-slate-950 dark:text-white">{money(item.price * item.qty)}</p></div></div></div></div>)}</div> : <EmptyState title="Your cart is empty" text="Add catalog products to create a draft checkout." />}</div><div className="border-t border-slate-200 p-5 dark:border-slate-800"><div className="mb-4 flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Discount code" className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" /><button onClick={applyDiscount} className="rounded-2xl border border-slate-200 px-4 font-black text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-200">Apply</button></div><div className="space-y-2 text-sm"><div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="flex justify-between text-slate-500"><span>Discount {discount.code && `(${discount.code})`}</span><span>-{money(discountAmount)}</span></div><div className="flex justify-between border-t border-slate-200 pt-3 font-heading text-xl font-black text-slate-950 dark:border-slate-800 dark:text-white"><span>Total</span><span>{money(subtotal - discountAmount)}</span></div></div><button onClick={checkout} className="mt-5 w-full rounded-2xl bg-indigo-500 px-5 py-3 font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">Checkout</button></div></aside></>;
}

export default function CommerceAdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState("auto");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(ordersSeed);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("commerce-theme") : null;
    if (saved) setThemeState(saved);
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = theme === "dark" || (theme === "auto" && prefersDark);
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("commerce-theme", theme);
  }, [theme]);

  const setTheme = (value) => setThemeState(value);
  const showToast = (title, message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, title, message, type }]);
    setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3600);
  };
  const addToCart = (product, qty = 1) => {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      return existing ? items.map((item) => item.id === product.id ? { ...item, qty: item.qty + qty } : item) : [...items, { ...product, qty }];
    });
    showToast("Added to cart", `${product.name} was added to the cart.`, "success");
  };
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const title = tabs.find((tab) => tab.id === activeTab)?.label || "Dashboard";

  return <div className="min-h-screen bg-slate-50 font-body text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100"><style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=Space+Grotesk:wght@600;700&display=swap');.font-body{font-family:'DM Sans',system-ui,sans-serif}.font-heading{font-family:'Space Grotesk','DM Sans',system-ui,sans-serif}@keyframes toastIn{from{opacity:0;transform:translate3d(18px,18px,0)}to{opacity:1;transform:translate3d(0,0,0)}}@keyframes fadeIn{from{opacity:.35;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style><SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} /><div className={`transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-60"}`}><Header setMobileOpen={setMobileOpen} title={title} theme={theme} setTheme={setTheme} cartCount={cartCount} openCart={() => setCartOpen(true)} /><main className="p-4 sm:p-6"><div key={`${activeTab}${loading}`} className="animate-[fadeIn_.2s_ease-out]">{loading ? <SkeletonLoader /> : <>{activeTab === "dashboard" && <DashboardView orders={orders} addToCart={addToCart} />}{activeTab === "products" && <ProductsView addToCart={addToCart} showToast={showToast} />}{activeTab === "orders" && <OrdersView orders={orders} setOrders={setOrders} showToast={showToast} />}{activeTab === "customers" && <CustomersView />}{activeTab === "inventory" && <InventoryView />}{activeTab === "settings" && <SettingsView theme={theme} setTheme={setTheme} showToast={showToast} />}</>}</div></main></div><CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} showToast={showToast} /><Toasts toasts={toasts} removeToast={(id) => setToasts((items) => items.filter((item) => item.id !== id))} /></div>;
}
