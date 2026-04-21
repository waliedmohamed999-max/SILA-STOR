import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const usersKey = "sila-auth-users";
const sessionKey = "sila-auth-session";

const authMode = import.meta.env.VITE_AUTH_MODE || (import.meta.env.DEV ? "local" : "api");
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const demoAuthEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_AUTH !== "false";
const publicRegistrationEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_PUBLIC_REGISTRATION === "true";
const sessionMinutes = Number(import.meta.env.VITE_AUTH_SESSION_MINUTES || 60);
const sessionTtlMs = Math.max(5, sessionMinutes) * 60 * 1000;
const demoAdminEmail = import.meta.env.VITE_DEMO_ADMIN_EMAIL || "";
const demoAdminPassword = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || "";
const demoCredentialsAvailable = Boolean(demoAdminEmail && demoAdminPassword);
const isApiAuth = authMode === "api";

const defaultUsers =
  demoAuthEnabled && demoCredentialsAvailable
    ? [
        {
          id: "user-admin",
          name: "مدير سيلا",
          email: demoAdminEmail,
          password: demoAdminPassword,
          role: "admin",
          createdAt: "2026-04-21",
        },
      ]
    : [];

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => (isApiAuth ? [] : readUsers()));
  const [session, setSession] = useState(() => (isApiAuth ? null : readLocalSession()));
  const [apiUser, setApiUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(isApiAuth);

  useEffect(() => {
    if (!isApiAuth) return;

    let cancelled = false;
    setIsAuthLoading(true);
    apiRequest("/auth/me", { method: "GET" })
      .then((user) => {
        if (!cancelled) setApiUser(normalizeApiUser(user));
      })
      .catch(() => {
        if (!cancelled) setApiUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsAuthLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const currentUser = useMemo(() => {
    if (isApiAuth) return apiUser;
    if (!session?.userId) return null;
    if (Number(session.expiresAt || 0) <= Date.now()) {
      clearLocalSession();
      return null;
    }
    return users.find((user) => user.id === session.userId && user.role === "admin") || null;
  }, [apiUser, session, users]);

  const persistUsers = useCallback((nextUsers) => {
    if (isApiAuth) return;
    setUsers(nextUsers);
    localStorage.setItem(usersKey, JSON.stringify(nextUsers));
  }, []);

  const persistLocalSession = useCallback((nextSession) => {
    if (isApiAuth) return;
    setSession(nextSession);
    clearLocalSession();
    if (!nextSession) return;
    const targetStorage = nextSession.remember ? localStorage : sessionStorage;
    targetStorage.setItem(sessionKey, JSON.stringify(nextSession));
  }, []);

  const login = useCallback(
    async ({ email, password, remember = true }) => {
      if (isApiAuth) {
        const user = await apiRequest("/auth/login", {
          method: "POST",
          body: { email: String(email || "").trim().toLowerCase(), password, remember },
        });
        const normalized = normalizeApiUser(user);
        if (normalized?.role !== "admin") throw new Error("هذا الحساب لا يملك صلاحية دخول لوحة التحكم.");
        setApiUser(normalized);
        return normalized;
      }

      const normalizedEmail = String(email || "").trim().toLowerCase();
      const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);
      if (!user || user.password !== password || user.role !== "admin") {
        throw new Error("بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور.");
      }
      persistLocalSession({
        userId: user.id,
        remember,
        signedInAt: Date.now(),
        expiresAt: Date.now() + sessionTtlMs,
      });
      return stripSensitiveUser(user);
    },
    [persistLocalSession, users],
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      if (!publicRegistrationEnabled) {
        throw new Error("إنشاء الحسابات من الواجهة متوقف في وضع النشر. استخدم دعوات المستخدمين من الباك إند.");
      }

      if (isApiAuth) {
        const user = await apiRequest("/auth/register", {
          method: "POST",
          body: { name, email: String(email || "").trim().toLowerCase(), password },
        });
        const normalized = normalizeApiUser(user);
        setApiUser(normalized);
        return normalized;
      }

      const normalizedEmail = String(email || "").trim().toLowerCase();
      validateLocalRegistration({ name, email: normalizedEmail, password }, users);
      const user = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: "admin",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      persistUsers([user, ...users]);
      persistLocalSession({ userId: user.id, remember: true, signedInAt: Date.now(), expiresAt: Date.now() + sessionTtlMs });
      return stripSensitiveUser(user);
    },
    [persistLocalSession, persistUsers, users],
  );

  const logout = useCallback(async () => {
    if (isApiAuth) {
      try {
        await apiRequest("/auth/logout", { method: "POST" });
      } catch {
        // The client must still clear its view even if the network request fails.
      }
      setApiUser(null);
      return;
    }
    persistLocalSession(null);
  }, [persistLocalSession]);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isAuthLoading,
      login,
      logout,
      register,
      users: users.map(stripSensitiveUser),
      authMode,
      requiresBackend: isApiAuth,
      demoAuthEnabled,
      demoCredentialsAvailable,
      demoAdminEmail,
      registrationEnabled: publicRegistrationEnabled,
      sessionExpiresAt: session?.expiresAt,
    }),
    [apiUser, currentUser, isAuthLoading, login, logout, register, session?.expiresAt, users],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

function validateLocalRegistration({ name, email, password }, users) {
  if (!name?.trim()) throw new Error("اكتب اسم المستخدم.");
  if (!email.includes("@")) throw new Error("اكتب بريد إلكتروني صحيح.");
  if (String(password || "").length < 8) throw new Error("كلمة المرور يجب ألا تقل عن 8 أحرف.");
  if (users.some((user) => user.email.toLowerCase() === email)) {
    throw new Error("هذا البريد مسجل بالفعل. استخدم تسجيل الدخول.");
  }
}

function readUsers() {
  try {
    const raw = localStorage.getItem(usersKey);
    const parsed = raw ? JSON.parse(raw) : defaultUsers;
    return Array.isArray(parsed) ? parsed : defaultUsers;
  } catch {
    return defaultUsers;
  }
}

function readLocalSession() {
  try {
    const raw = sessionStorage.getItem(sessionKey) || localStorage.getItem(sessionKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.userId || Number(parsed.expiresAt || 0) <= Date.now()) {
      clearLocalSession();
      return null;
    }
    return parsed;
  } catch {
    clearLocalSession();
    return null;
  }
}

function clearLocalSession() {
  sessionStorage.removeItem(sessionKey);
  localStorage.removeItem(sessionKey);
}

function stripSensitiveUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function normalizeApiUser(payload) {
  const user = payload?.user || payload?.data || payload;
  if (!user) return null;
  return {
    id: String(user.id || user.userId || user.email),
    name: user.name || user.fullName || "Admin",
    email: user.email,
    role: user.role || "admin",
  };
}

async function apiRequest(path, { method = "GET", body } = {}) {
  if (!apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL غير مضبوط. لا يمكن تشغيل مصادقة الإنتاج بدون باك إند.");
  }

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
    throw new Error(payload?.message || payload?.error || "تعذر تنفيذ الطلب. حاول مرة أخرى.");
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
