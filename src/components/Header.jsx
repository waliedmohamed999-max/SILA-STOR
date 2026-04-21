import { Bell, ChevronDown, Menu, Monitor, Moon, Search, ShoppingCart, Sun } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import Button from "./Button";
import Dropdown from "./Dropdown";

const titles = {
  "/admin": "الرئيسية",
  "/admin/orders": "الطلبات",
  "/admin/logistics": "اللوجستيات",
  "/admin/customers": "العملاء",
  "/admin/inventory": "المخزون",
  "/admin/marketing": "التسويق",
  "/admin/storefront": "واجهة المتجر",
};

function resolveTitle(pathname) {
  if (pathname.startsWith("/admin/settings")) return "الإعدادات";
  if (pathname.startsWith("/admin/products")) return "المنتجات";
  if (pathname.startsWith("/admin/storefront/editor")) return "محرر الثيم";
  if (pathname.startsWith("/admin/logistics")) return "اللوجستيات";
  return titles[pathname] || "مساحة العمل";
}

export default function Header({ onMenu, onCart }) {
  const { pathname } = useLocation();
  const { count } = useCart();
  const { theme, setTheme } = useTheme();
  const title = resolveTitle(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/80 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center gap-3">
        <Button aria-label="فتح التنقل" variant="secondary" size="icon" onClick={onMenu} className="lg:hidden">
          <Menu size={20} />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-xl font-black text-slate-950 sm:text-2xl dark:text-white">{title}</h1>
          <p className="hidden text-sm text-slate-500 sm:block">العمليات والمبيعات والتشغيل اليومي في مساحة إدارة واحدة.</p>
        </div>
        <label className="hidden min-w-[280px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm lg:flex dark:border-slate-800 dark:bg-slate-950">
          <Search size={18} className="text-slate-400" />
          <input aria-label="بحث عام" placeholder="ابحث في النظام" className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100" />
        </label>
        <Button aria-label="الإشعارات" variant="secondary" size="icon">
          <Bell size={20} />
        </Button>
        <Dropdown
          trigger={
            <Button aria-label="مبدل المظهر" variant="secondary" className="capitalize">
              <Monitor size={18} />
              <span className="hidden sm:inline">{theme === "light" ? "فاتح" : theme === "dark" ? "داكن" : "تلقائي"}</span>
            </Button>
          }
        >
          {[
            ["light", Sun, "فاتح"],
            ["dark", Moon, "داكن"],
            ["auto", Monitor, "تلقائي"],
          ].map(([item, Icon, label]) => (
            <button
              key={item}
              onClick={() => setTheme(item)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold transition hover:bg-slate-100 dark:hover:bg-slate-900 ${
                theme === item ? "text-accent" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </Dropdown>
        <button
          aria-label="فتح السلة"
          onClick={onCart}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-600"
        >
          <ShoppingCart size={20} />
          {count > 0 && (
            <span className="absolute -left-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-xs font-black text-white">
              {count}
            </span>
          )}
        </button>
        <Dropdown
          trigger={
            <button className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 pr-2 transition hover:border-indigo-300 sm:flex dark:border-slate-800 dark:bg-slate-950">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-base text-xs font-black text-white dark:bg-white dark:text-base">MC</span>
              <ChevronDown size={16} className="text-slate-500" />
            </button>
          }
        >
          {["إعدادات الحساب", "مساحة الفريق", "مركز الفواتير"].map((label) => (
            <button key={label} className="w-full rounded-xl px-3 py-2 text-right text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">
              {label}
            </button>
          ))}
        </Dropdown>
      </div>
    </header>
  );
}
