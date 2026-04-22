import { apiGet, apiPatch, apiPost } from "./apiClient";

export async function fetchCustomers() {
  const payload = await apiGet("/customers");
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function saveCustomer(customer) {
  const payload = customer.id ? await apiPatch(`/customers/${customer.id}`, customer) : await apiPost("/customers", customer);
  return payload?.data;
}

export async function fetchOrders() {
  const payload = await apiGet("/orders");
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function createBackendOrder(order) {
  const payload = await apiPost("/checkout/orders", order);
  return payload?.data;
}

export async function updateBackendOrderStatus(orderId, status) {
  const payload = await apiPatch(`/orders/${encodeURIComponent(orderId)}/status`, { status });
  return payload?.data;
}
