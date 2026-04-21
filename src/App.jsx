import { Navigate, Route, Routes } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { SettingsProvider } from "./context/SettingsContext";
import { StorefrontThemeProvider } from "./context/StorefrontThemeContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import DashboardLayout from "./layouts/DashboardLayout";
import StoreLayout from "./layouts/StoreLayout";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import Customers from "./pages/Customers";
import CreateOrder from "./pages/CreateOrder";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Logistics from "./pages/Logistics";
import Marketing from "./pages/Marketing";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Settings from "./pages/Settings";
import Storefront from "./pages/Storefront";
import StorefrontManager from "./pages/StorefrontManager";
import StorefrontThemeEditor from "./pages/StorefrontThemeEditor";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SettingsProvider>
          <StorefrontThemeProvider>
            <CartProvider>
              <Routes>
                <Route element={<StoreLayout />}>
                  <Route index element={<Storefront />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="products/:productId" element={<ProductDetails />} />
                  <Route path="checkout" element={<Checkout />} />
                </Route>
                <Route path="admin" element={<DashboardLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Navigate to="/admin" replace />} />
                  <Route path="products/*" element={<Products />} />
                  <Route path="orders/create" element={<CreateOrder />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="logistics/*" element={<Logistics />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="marketing" element={<Marketing />} />
                  <Route path="storefront" element={<StorefrontManager />} />
                  <Route path="storefront/editor/:themeId" element={<StorefrontThemeEditor />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="settings/:sectionKey" element={<Settings />} />
                </Route>
                <Route path="storefront" element={<Navigate to="/" replace />} />
                <Route path="dashboard" element={<Navigate to="/admin" replace />} />
                <Route element={<StoreLayout />}>
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </CartProvider>
          </StorefrontThemeProvider>
        </SettingsProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
