const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export function hasApi() {
  return Boolean(apiBaseUrl);
}

export async function apiGet(path) {
  return apiRequest(path);
}

export async function apiPost(path, body) {
  return apiRequest(path, { method: "POST", body });
}

export async function apiPatch(path, body) {
  return apiRequest(path, { method: "PATCH", body });
}

export async function apiPut(path, body) {
  return apiRequest(path, { method: "PUT", body });
}

export async function apiDelete(path) {
  return apiRequest(path, { method: "DELETE" });
}

async function apiRequest(path, { method = "GET", body } = {}) {
  if (!apiBaseUrl) throw new Error("API base URL is not configured.");

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await parseJson(response);
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "API request failed.");
  }
  return payload;
}

async function parseJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
