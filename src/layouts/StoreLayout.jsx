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
  const storeVariant = getStoreThemeVariant(activeTheme);

  const openMessages = () => {
    if (!activeConversation) startConversation();
    setMinimized(false);
    setWidgetOpen(true);
  };

  return (
    <div className="min-h-screen" style={{ background: activeTheme.background, color: activeTheme.text, fontFamily: activeTheme.font }}>
      <header className={getStoreHeaderClass(storeVariant)}>
        <div className={getStoreHeaderInnerClass(storeVariant)}>
          <Link to="/" className={getStoreBrandClass(storeVariant)}>
            <span className={getStoreLogoClass(storeVariant)} style={getStoreLogoStyle(activeTheme, storeVariant)}>
              <Store size={20} />
            </span>
            <span>
              <span className="block whitespace-nowrap font-heading text-sm font-black text-slate-950 sm:text-lg dark:text-white">سيلا | SILA</span>
              <span className="block whitespace-nowrap text-[10px] font-bold text-slate-500 sm:text-xs">{activeTheme.name}</span>
            </span>
          </Link>

          <nav className={getStoreNavClass(storeVariant)}>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => getStoreNavItemClass(isActive, storeVariant)}
                style={({ isActive }) => (isActive ? getStoreActiveNavStyle(activeTheme, storeVariant) : undefined)}
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

function getStoreThemeVariant(theme) {
  const slug = `${theme?.slug || ""} ${theme?.name || ""} ${theme?.layout || ""}`.toLowerCase();
  if (slug.includes("dark") || slug.includes("neo") || slug.includes("radar") || slug.includes("gaming") || slug.includes("creative-tech")) return "tech";
  if (slug.includes("royale") || slug.includes("luxury") || slug.includes("gold") || slug.includes("elegance")) return "luxury";
  if (slug.includes("fashion") || slug.includes("stylix") || slug.includes("luna") || slug.includes("style-red")) return "fashion";
  if (slug.includes("campaign") || slug.includes("rush") || slug.includes("glowy") || slug.includes("kids") || slug.includes("dynamic")) return "dynamic";
  return "marketplace";
}

function getStoreHeaderClass(variant) {
  if (variant === "tech") return "sticky top-0 z-30 border-b border-cyan-300/20 bg-slate-950/90 text-white shadow-[0_18px_60px_rgba(34,211,238,.12)] backdrop-blur-xl";
  if (variant === "luxury") return "sticky top-0 z-30 border-b border-[#d9c08a]/45 bg-[#fbfaf6]/95 text-slate-950 backdrop-blur-xl";
  if (variant === "fashion") return "sticky top-0 z-30 border-b border-slate-200 bg-white/95 text-slate-950 backdrop-blur-xl";
  if (variant === "dynamic") return "sticky top-0 z-30 border-b border-white/40 bg-white/80 shadow-lg shadow-indigo-100/60 backdrop-blur-xl";
  return "sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90";
}

function getStoreHeaderInnerClass(variant) {
  if (variant === "luxury") return "mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-8";
  if (variant === "fashion") return "mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-5 sm:px-6";
  return "mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-3";
}

function getStoreBrandClass(variant) {
  if (variant === "fashion") return "flex shrink-0 items-center gap-3 rounded-none";
  return "flex shrink-0 items-center gap-2 rounded-xl sm:gap-3";
}

function getStoreLogoClass(variant) {
  if (variant === "luxury") return "grid h-11 w-11 place-items-center border border-[#b9974d] text-[#8a6a22]";
  if (variant === "fashion") return "grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-white";
  return "grid h-9 w-9 place-items-center rounded-xl text-white shadow-lg sm:h-10 sm:w-10 sm:rounded-2xl";
}

function getStoreLogoStyle(theme, variant) {
  if (variant === "luxury" || variant === "fashion") return undefined;
  if (variant === "tech") return { background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", boxShadow: "0 0 35px rgba(34,211,238,.28)" };
  return { background: theme.primary, boxShadow: `0 18px 40px -20px ${theme.primary}` };
}

function getStoreBrandTitleClass(variant) {
  if (variant === "luxury") return "block whitespace-nowrap font-serif text-base font-bold tracking-wide text-slate-950 sm:text-xl";
  if (variant === "tech") return "block whitespace-nowrap font-heading text-sm font-black text-white sm:text-lg";
  return "block whitespace-nowrap font-heading text-sm font-black text-slate-950 sm:text-lg dark:text-white";
}

function getStoreBrandSubClass(variant) {
  if (variant === "tech") return "block whitespace-nowrap text-[10px] font-bold text-cyan-100/70 sm:text-xs";
  if (variant === "luxury") return "block whitespace-nowrap text-[10px] font-bold text-[#8a6a22] sm:text-xs";
  return "block whitespace-nowrap text-[10px] font-bold text-slate-500 sm:text-xs";
}

function getStoreNavClass(variant) {
  if (variant === "luxury") return "mr-auto flex min-w-0 flex-1 items-center justify-center gap-2 overflow-x-auto px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
  if (variant === "fashion") return "mr-auto flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
  return "mr-auto flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
}

function getStoreNavItemClass(isActive, variant) {
  if (variant === "luxury") return `shrink-0 px-4 py-2 font-serif text-sm font-bold transition ${isActive ? "text-white" : "text-slate-600 hover:text-[#8a6a22]"}`;
  if (variant === "tech") return `shrink-0 rounded-2xl px-3 py-2 text-xs font-black transition sm:px-4 sm:text-sm ${isActive ? "text-slate-950" : "text-cyan-50/70 hover:bg-cyan-300/10 hover:text-white"}`;
  if (variant === "fashion") return `shrink-0 rounded-full px-3 py-2 text-xs font-black transition sm:px-4 sm:text-sm ${isActive ? "text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`;
  return `shrink-0 rounded-xl px-3 py-2 text-xs font-black transition sm:rounded-2xl sm:px-4 sm:text-sm ${isActive ? "text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"}`;
}

function getStoreActiveNavStyle(theme, variant) {
  if (variant === "luxury") return { background: "#8a6a22" };
  if (variant === "tech") return { background: "#67e8f9", boxShadow: "0 0 24px rgba(103,232,249,.28)" };
  if (variant === "fashion") return { background: "#020617" };
  return { background: theme.primary };
}
