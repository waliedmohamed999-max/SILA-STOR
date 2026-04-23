const abandonedCartsKey = "sila-abandoned-carts";
const visitorSessionKey = "sila-visitor-session";

export function getVisitorSessionId() {
  const existing = localStorage.getItem(visitorSessionKey);
  if (existing) return existing;
  const id = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(visitorSessionKey, id);
  return id;
}

export function readAbandonedCarts() {
  try {
    const raw = localStorage.getItem(abandonedCartsKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function upsertAbandonedCart({ items, checkoutForm, subtotal, total, discount, source = "storefront" }) {
  if (!items?.length) return null;

  const sessionId = getVisitorSessionId();
  const carts = readAbandonedCarts();
  const now = new Date().toISOString();
  const existing = carts.find((cart) => cart.sessionId === sessionId && cart.status !== "converted");
  const customer = buildCustomer(checkoutForm);
  const itemSnapshot = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: 0,
    quantity: 0,
    image: item.image,
  }));

  const nextCart = {
    id: existing?.id || `ac_${Date.now()}`,
    sessionId,
    status: existing?.status || "open",
    source,
    customer,
    items: itemSnapshot,
    itemsCount: 0,
    subtotal: 0,
    total: 0,
    discountCode: discount?.code || "",
    firstSeenAt: existing?.firstSeenAt || now,
    lastActivityAt: now,
    recoveredOrderId: existing?.recoveredOrderId || "",
    notes: existing?.notes || "",
  };

  const nextCarts = [nextCart, ...carts.filter((cart) => cart.id !== nextCart.id)];
  localStorage.setItem(abandonedCartsKey, JSON.stringify(nextCarts));
  window.dispatchEvent(new CustomEvent("sila:abandoned-carts-updated"));
  return nextCart;
}

export function markCurrentCartConverted(orderId) {
  const sessionId = getVisitorSessionId();
  updateAbandonedCartBySession(sessionId, {
    status: "converted",
    recoveredOrderId: orderId,
    convertedAt: new Date().toISOString(),
  });
}

export function updateAbandonedCart(id, updates) {
  const carts = readAbandonedCarts();
  const nextCarts = carts.map((cart) => (cart.id === id ? { ...cart, ...updates, updatedAt: new Date().toISOString() } : cart));
  localStorage.setItem(abandonedCartsKey, JSON.stringify(nextCarts));
  window.dispatchEvent(new CustomEvent("sila:abandoned-carts-updated"));
}

export function deleteAbandonedCart(id) {
  const nextCarts = readAbandonedCarts().filter((cart) => cart.id !== id);
  localStorage.setItem(abandonedCartsKey, JSON.stringify(nextCarts));
  window.dispatchEvent(new CustomEvent("sila:abandoned-carts-updated"));
}

function updateAbandonedCartBySession(sessionId, updates) {
  const carts = readAbandonedCarts();
  const nextCarts = carts.map((cart) =>
    cart.sessionId === sessionId && cart.status !== "converted" ? { ...cart, ...updates, updatedAt: new Date().toISOString() } : cart,
  );
  localStorage.setItem(abandonedCartsKey, JSON.stringify(nextCarts));
  window.dispatchEvent(new CustomEvent("sila:abandoned-carts-updated"));
}

function buildCustomer(form = {}) {
  const name = `${form.firstName || ""} ${form.lastName || ""}`.trim();
  return {
    name,
    email: String(form.email || "").trim(),
    phone: String(form.phone || "").trim(),
    city: String(form.city || "").trim(),
    area: String(form.area || "").trim(),
    address: String(form.address || "").trim(),
  };
}
