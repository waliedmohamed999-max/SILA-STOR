import { LayoutDashboard, MessageCircle, Monitor, Moon, ShoppingCart, Store, Sun } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import Button from "../components/Button";
import CartDrawer from "../components/CartDrawer";
import Dropdown from "../components/Dropdown";
import { useCart } from "../context/CartContext";
import { useLiveChat } from "../context/LiveChatContext";
import { usePayments } from "../context/PaymentContext";
import { useStorefrontThemes } from "../context/StorefrontThemeContext";
import { useTheme } from "../context/ThemeContext";

const links = [
  { to: "/", label: "المتجر" },
  { to: "/cart", label: "السلة" },
  { to: "/checkout", label: "الدفع" },
  { to: "/admin", label: "لوحة الإدارة" },
];

const mobileLinks = [
  { to: "/", label: "المتجر", icon: Store, end: true },
  { to: "/cart", label: "السلة", icon: ShoppingCart },
  { to: "/admin", label: "التحكم", icon: LayoutDashboard },
];

export default function StoreLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const { count } = useCart();
  const { activeConversation, startConversation, setWidgetOpen, setMinimized, unreadCount, widgetOpen } = useLiveChat();
  const { activeCountry, activeCurrency, enabledCountries, setCountry } = usePayments();
  const { theme, setTheme } = useTheme();
  const { activeTheme } = useStorefrontThemes();

  const openMessages = () => {
    if (!activeConversation) startConversation();
    setMinimized(false);
    setWidgetOpen(true);
  };

  return (
    <div className="min-h-screen" style={{ background: activeTheme.background, color: activeTheme.text, fontFamily: activeTheme.font }}>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-3">
          <Link to="/" className="flex shrink-0 items-center gap-2 rounded-xl sm:gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-lg sm:h-10 sm:w-10 sm:rounded-2xl" style={{ background: activeTheme.primary, boxShadow: `0 18px 40px -20px ${activeTheme.primary}` }}>
              <Store size={20} />
            </span>
            <span>
              <span className="block whitespace-nowrap font-heading text-sm font-black text-slate-950 sm:text-lg dark:text-white">سيلا | SILA</span>
              <span className="block whitespace-nowrap text-[10px] font-bold text-slate-500 sm:text-xs">{activeTheme.name}</span>
            </span>
          </Link>

          <nav className="mr-auto flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `shrink-0 rounded-xl px-3 py-2 text-xs font-black transition sm:rounded-2xl sm:px-4 sm:text-sm ${
                    isActive
                      ? "text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                  }`
                }
                style={({ isActive }) => (isActive ? { background: activeTheme.primary } : undefined)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <Dropdown
            trigger={
              <Button aria-label="مبدل المظهر" variant="secondary" className="h-9 shrink-0 rounded-xl px-2 text-xs capitalize sm:h-10 sm:rounded-2xl sm:px-4 sm:text-sm">
                <Monitor size={16} />
                <span className="hidden min-[420px]:inline">{theme === "light" ? "فاتح" : theme === "dark" ? "داكن" : "تلقائي"}</span>
              </Button>
            }
          >
            {[
              ["light", Sun, "فاتح"],
              ["dark", Moon, "داكن"],
              ["auto", Monitor, "تلقائي"],
            ].map(([item, Icon, label]) => (
              <button key={item} onClick={() => setTheme(item)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold transition hover:bg-slate-100 dark:hover:bg-slate-900 ${theme === item ? "text-accent" : "text-slate-600 dark:text-slate-300"}`}>
                <Icon size={16} />
                {label}
              </button>
            ))}
          </Dropdown>

          <select
            aria-label="اختيار الدولة"
            value={activeCountry?.code}
            onChange={(event) => setCountry(event.target.value)}
            className="hidden h-10 shrink-0 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 outline-none sm:block dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
          >
            {enabledCountries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} · {country.currency}
              </option>
            ))}
          </select>

          <button aria-label="فتح السلة" onClick={() => setCartOpen(true)} className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-lg transition sm:h-10 sm:w-10" style={{ background: activeTheme.primary, boxShadow: `0 18px 40px -20px ${activeTheme.primary}` }}>
            <ShoppingCart size={18} />
            {count > 0 && <span className="absolute -left-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-xs font-black text-white">{count}</span>}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-5 pb-24 sm:px-6 md:pb-5 lg:py-8">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-black text-slate-600 shadow-sm sm:hidden dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300">
          <span>{activeCountry?.name}</span>
          <select
            aria-label="اختيار الدولة"
            value={activeCountry?.code}
            onChange={(event) => setCountry(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-black outline-none dark:border-slate-800 dark:bg-slate-950"
          >
            {enabledCountries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} · {country.currency}
              </option>
            ))}
          </select>
        </div>
        <div key={activeCountry?.code} className="animate-[fadeIn_.2s_ease-out]">
          <Outlet />
        </div>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-3xl border border-slate-200 bg-white/95 p-2 shadow-2xl shadow-slate-900/15 backdrop-blur-xl md:hidden dark:border-slate-800 dark:bg-slate-950/95">
        {mobileLinks.slice(0, 2).map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-black transition ${
                  isActive ? "text-white" : "text-slate-500 dark:text-slate-300"
                }`
              }
              style={({ isActive }) => (isActive ? { background: activeTheme.primary } : undefined)}
            >
              <span className="relative">
                <Icon size={18} />
                {link.to === "/cart" && count > 0 ? (
                  <span className="absolute -left-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] text-white">
                    {count}
                  </span>
                ) : null}
              </span>
              <span className="truncate">{link.label}</span>
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={openMessages}
          className={`relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-black transition ${
            widgetOpen ? "text-white" : "text-slate-500 dark:text-slate-300"
          }`}
          style={widgetOpen ? { background: activeTheme.primary } : undefined}
        >
          <span className="relative">
            <MessageCircle size={18} />
            {unreadCount > 0 ? (
              <span className="absolute -left-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] text-white">
                {unreadCount}
              </span>
            ) : null}
          </span>
          <span className="truncate">الرسائل</span>
        </button>
        {mobileLinks.slice(2).map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-black transition ${
                  isActive ? "text-white" : "text-slate-500 dark:text-slate-300"
                }`
              }
              style={({ isActive }) => (isActive ? { background: activeTheme.primary } : undefined)}
            >
              <span className="relative">
                <Icon size={18} />
              </span>
              <span className="truncate">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <footer className="mt-10 border-t border-slate-200/80 bg-white/70 pb-24 dark:border-slate-800 dark:bg-slate-950/70 md:pb-0">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl text-white" style={{ background: activeTheme.primary }}>
                <Store size={21} />
              </span>
              <span className="font-heading text-lg font-black text-slate-950 dark:text-white">سيلا | SILA</span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{activeTheme.heroSubtitle}</p>
          </div>
          <div>
            <p className="font-heading font-black text-slate-950 dark:text-white">التصفح</p>
            <div className="mt-3 grid gap-2 text-sm font-bold text-slate-500">
              <Link to="/" className="hover:text-accent">الكتالوج</Link>
              <Link to="/cart" className="hover:text-accent">السلة</Link>
              <Link to="/checkout" className="hover:text-accent">الدفع</Link>
            </div>
          </div>
          <div>
            <p className="font-heading font-black text-slate-950 dark:text-white">الثيم النشط</p>
            <div className="mt-3 grid gap-2 text-sm font-bold text-slate-500">
              <span>{activeTheme.name}</span>
              <span>{activeTheme.layout}</span>
              <span>{activeCountry?.name} · {activeCurrency?.code}</span>
              <span>{activeTheme.updatedAt}</span>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
