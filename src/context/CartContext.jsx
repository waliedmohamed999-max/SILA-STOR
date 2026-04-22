import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { markCurrentCartConverted, upsertAbandonedCart } from "../services/abandonedCartService";
import { createBackendOrder } from "../services/storeBackendService";
import { useToast } from "./ToastContext";

const CartContext = createContext(null);
const discounts = { SAVE10: 0.1, VIP15: 0.15, LAUNCH20: 0.2 };
const cartStorageKey = "sila-cart";
const discountStorageKey = "sila-discount";
const orderStorageKey = "sila-orders";
const checkoutDraftStorageKey = "sila-checkout-draft";
const settingsStorageKey = "sila-settings";

const initialCheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  area: "",
  address: "",
  postalCode: "",
  shippingMethod: "standard",
  paymentMethod: "card",
  note: "",
  saveInfo: true,
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStorage(cartStorageKey, []));
  const [discount, setDiscount] = useState(() => readStorage(discountStorageKey, { code: "", rate: 0 }));
  const [orders, setOrders] = useState(() => readStorage(orderStorageKey, []));
  const [checkoutForm, setCheckoutForm] = useState(() => readStorage(checkoutDraftStorageKey, initialCheckoutForm));
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem(cartStorageKey, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(discountStorageKey, JSON.stringify(discount));
  }, [discount]);

  useEffect(() => {
    localStorage.setItem(orderStorageKey, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(checkoutDraftStorageKey, JSON.stringify(checkoutForm));
  }, [checkoutForm]);

  const addItem = (product, quantity = 1) => {
    if (product.stock === 0) {
      showToast("غير متوفر", `لا يمكن إضافة ${product.name} الآن.`, "error");
      return false;
    }

    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      const nextQuantity = (existing?.quantity || 0) + quantity;
      if (nextQuantity > product.stock) {
        showToast("كمية غير متاحة", `الحد الأقصى المتاح من ${product.name} هو ${product.stock}.`, "error");
        return current;
      }
      if (existing) {
        return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item));
      }
      return [...current, { ...product, quantity }];
    });
    showToast("تمت الإضافة للسلة", `تمت إضافة ${product.name} إلى السلة.`, "success");
    return true;
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
    showToast("تم حذف المنتج", "تمت إزالة المنتج من السلة.", "success");
  };

  const updateQuantity = (id, quantity) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item)));
  };

  const clearCart = () => setItems([]);

  const applyDiscount = (code) => {
    const normalized = code.trim().toUpperCase();
    if (!discounts[normalized]) {
      setDiscount({ code: "", rate: 0 });
      showToast("كود غير صحيح", "جرب SAVE10 أو VIP15 أو LAUNCH20.", "error");
      return false;
    }
    setDiscount({ code: normalized, rate: discounts[normalized] });
    showToast("تم تطبيق الخصم", `الكود ${normalized} خفض إجمالي الطلب.`, "success");
    return true;
  };

  const shippingCost = useMemo(() => {
    if (!items.length) return 0;
    const settings = readStorage(settingsStorageKey, {});
    const shipping = settings.shipping || {};
    const threshold = Number(shipping.freeShippingThreshold || 500);
    const subtotalValue = subtotal(items);

    if (checkoutForm.shippingMethod === "pickup") return 0;
    if (checkoutForm.shippingMethod === "standard" && subtotalValue >= threshold) return 0;

    const providers = shipping.providers || [];
    for (const provider of providers) {
      const service = (provider.services || []).find((item) => item.key === checkoutForm.shippingMethod);
      if (service) {
        return Number(service.fee || 0);
      }
    }

    if (checkoutForm.shippingMethod === "express") return Number(shipping.expressFee || 25);
    return Number(shipping.standardFee || 12);
  }, [items, checkoutForm.shippingMethod]);

  const subtotalValue = subtotal(items);
  const discountAmount = subtotalValue * discount.rate;
  const total = subtotalValue - discountAmount + shippingCost;
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    upsertAbandonedCart({
      items,
      checkoutForm,
      subtotal: subtotalValue,
      total,
      discount,
    });
  }, [items, checkoutForm, subtotalValue, total, discount]);

  const updateCheckoutField = (key, value) => {
    setCheckoutForm((current) => ({ ...current, [key]: value }));
  };

  const resetCheckoutForm = () => setCheckoutForm(initialCheckoutForm);

  const createOrder = async () => {
    if (!items.length) {
      showToast("السلة فارغة", "أضف منتجًا واحدًا على الأقل قبل الدفع.", "error");
      return null;
    }

    const requiredFields = ["firstName", "lastName", "email", "phone", "city", "address"];
    const missing = requiredFields.find((field) => !String(checkoutForm[field] || "").trim());
    if (missing) {
      showToast("بيانات ناقصة", "أكمل بيانات الشحن والتواصل قبل إتمام الطلب.", "error");
      return null;
    }

    const order = {
      id: `SILA-${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      items: items.map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.image })),
      customer: {
        firstName: checkoutForm.firstName,
        lastName: checkoutForm.lastName,
        email: checkoutForm.email,
        phone: checkoutForm.phone,
        city: checkoutForm.city,
        area: checkoutForm.area,
        address: checkoutForm.address,
        postalCode: checkoutForm.postalCode,
      },
      paymentMethod: checkoutForm.paymentMethod,
      shippingMethod: checkoutForm.shippingMethod,
      note: checkoutForm.note,
      subtotal: subtotalValue,
      discount,
      discountAmount,
      shippingCost,
      total,
      status: "pending",
    };

    let persistedOrder = order;
    try {
      persistedOrder = await createBackendOrder(order);
    } catch {
      persistedOrder = order;
    }

    setOrders((current) => [persistedOrder, ...current]);
    markCurrentCartConverted(persistedOrder.id);
    clearCart();
    setDiscount({ code: "", rate: 0 });
    if (!checkoutForm.saveInfo) resetCheckoutForm();
    showToast("تم إنشاء الطلب", `تم إنشاء الطلب ${persistedOrder.id} بنجاح.`, "success");
    return persistedOrder;
  };

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal: subtotalValue,
      discount,
      discountAmount,
      shippingCost,
      total,
      orders,
      checkoutForm,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      applyDiscount,
      updateCheckoutField,
      resetCheckoutForm,
      createOrder,
    }),
    [items, count, subtotalValue, discount, discountAmount, shippingCost, total, orders, checkoutForm]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function subtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
