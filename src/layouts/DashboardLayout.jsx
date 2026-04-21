import { useState } from "react";
import { Outlet } from "react-router-dom";
import CartDrawer from "../components/CartDrawer";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className={`transition-all duration-300 ${collapsed ? "lg:pr-20" : "lg:pr-60"}`}>
        <Header onMenu={() => setMobileOpen(true)} onCart={() => setCartOpen(true)} />
        <main className="p-4 sm:p-6">
          <div className="animate-[fadeIn_.2s_ease-out]">
            <Outlet />
          </div>
        </main>
      </div>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
