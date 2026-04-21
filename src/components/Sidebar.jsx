import {
  Boxes,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  MessageSquareText,
  Megaphone,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Users,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import Button from "./Button";
import ProgressBar from "./ProgressBar";

const navItems = [
  { to: "/admin", label: "الرئيسية", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "المنتجات", icon: Package },
  { to: "/admin/orders", label: "الطلبات", icon: ShoppingCart },
  { to: "/admin/logistics", label: "اللوجستيات", icon: Truck },
  { to: "/admin/customers", label: "العملاء", icon: Users },
  { to: "/admin/inventory", label: "المخزون", icon: Boxes },
  { to: "/admin/marketing", label: "التسويق", icon: Megaphone },
  { to: "/admin/payments", label: "الدفع والعملات", icon: CreditCard },
  { to: "/admin/live-chat", label: "الدعم المباشر", icon: MessageSquareText },
  { to: "/admin/storefront", label: "واجهة المتجر", icon: ShoppingBag },
  { to: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const content = (
    <>
      <div className="flex h-16 items-center justify-between px-4">
        <NavLink to="/admin" className="flex items-center gap-3 rounded-xl">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent text-white shadow-lg shadow-indigo-500/30">
            <Store size={22} />
          </div>
          {!collapsed && (
            <div className="text-right">
              <p className="font-heading text-lg font-black text-slate-950 dark:text-white">إدارة سيلا</p>
              <p className="text-xs font-bold text-slate-500">مركز التحكم</p>
            </div>
          )}
        </NavLink>
        <button aria-label="إغلاق القائمة" onClick={() => setMobileOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-900">
          <X size={20} />
        </button>
      </div>

      <nav className="mt-4 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-accent text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto p-3">
        {!collapsed && (
          <a href="/" className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-black text-slate-600 transition hover:border-indigo-300 hover:text-accent dark:border-slate-800 dark:text-slate-300">
            <ExternalLink size={16} />
            عرض المتجر
          </a>
        )}
        <div className={collapsed ? "hidden" : "rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4"}>
          <p className="font-heading text-sm font-black text-slate-950 dark:text-white">مؤشر النمو</p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">سرعة الإيرادات أعلى 18.4% من الربع السابق.</p>
          <div className="mt-3">
            <ProgressBar value={78} tone="bg-accent" />
          </div>
        </div>
        <Button aria-label="طي القائمة الجانبية" variant="secondary" onClick={() => setCollapsed(!collapsed)} className="mt-3 hidden w-full lg:flex">
          {collapsed ? "توسيع" : "طي"}
        </Button>
      </div>
    </>
  );

  return (
    <>
      <aside className={`fixed right-0 top-0 z-30 hidden h-screen border-l border-slate-200 bg-white/90 backdrop-blur-xl transition-all lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-950/90 ${collapsed ? "w-20" : "w-60"}`}>
        {content}
      </aside>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed right-0 top-0 z-50 flex h-screen w-72 flex-col border-l border-slate-200 bg-white transition-transform lg:hidden dark:border-slate-800 dark:bg-slate-950 ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>
        {content}
      </aside>
    </>
  );
}
