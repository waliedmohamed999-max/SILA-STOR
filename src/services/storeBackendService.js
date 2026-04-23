import { apiGet, apiPatch, apiPost } from "./apiClient";
import { zeroCustomerMetrics, zeroOrderMetrics } from "../utils/zeroDataMetrics";

export async function fetchCustomers() {
  const payload = await apiGet("/customers");
  return Array.isArray(payload?.data) ? payload.data.map(zeroCustomerMetrics) : [];
}

export async function saveCustomer(customer) {
  const payload = customer.id ? await apiPatch(`/customers/${customer.id}`, customer) : await apiPost("/customers", customer);
  return zeroCustomerMetrics(payload?.data);
}

export async function fetchOrders() {
  const payload = await apiGet("/orders");
  return Array.isArray(payload?.data) ? payload.data.map(zeroOrderMetrics) : [];
}

export async function createBackendOrder(order) {
  const payload = await apiPost("/checkout/orders", order);
  return zeroOrderMetrics(payload?.data);
}

export async function updateBackendOrderStatus(orderId, status) {
  const payload = await apiPatch(`/orders/${encodeURIComponent(orderId)}/status`, { status });
  return zeroOrderMetrics(payload?.data);
}
