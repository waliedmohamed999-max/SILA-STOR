import { categories as fallbackCategories, products as fallbackProducts } from "../data/products";
import { apiGet } from "./apiClient";
import { zeroProductMetrics } from "../utils/zeroDataMetrics";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function fetchProducts() {
  if (!apiBaseUrl) return fallbackProducts;

  const payload = await apiGet("/products");
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return rows.length ? rows.map(normalizeProduct).map(zeroProductMetrics) : fallbackProducts.map(zeroProductMetrics);
}

export function getCategories(products = fallbackProducts) {
  const values = products.map((product) => product.category).filter(Boolean);
  return values.length ? [...new Set(values)] : fallbackCategories;
}

function normalizeProduct(product) {
  return {
    ...product,
    id: Number(product.id),
    price: Number(product.price) || 0,
    rating: Number(product.rating) || 0,
    stock: Number(product.stock) || 0,
    threshold: Number(product.threshold) || 0,
    sales: Number(product.sales) || 0,
  };
}
