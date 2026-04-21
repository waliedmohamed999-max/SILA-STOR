import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const usersKey = "sila-auth-users";
const sessionKey = "sila-auth-session";

const defaultUsers = [
  {
    id: "user-admin",
    name: "مدير سيلا",
    email: "admin@sila.test",
    password: "admin123",
    role: "admin",
    createdAt: "2026-04-21",
  },
];

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => readUsers());
  const [session, setSession] = useState(() => readSession());

  const currentUser = useMemo(() => {
    if (!session?.userId) return null;
    return users.find((user) => user.id === session.userId) || null;
  }, [session, users]);

  const persistUsers = useCallback((nextUsers) => {
    setUsers(nextUsers);
    localStorage.setItem(usersKey, JSON.stringify(nextUsers));
  }, []);

  const persistSession = useCallback((nextSession) => {
    setSession(nextSession);
    if (nextSession) {
      localStorage.setItem(sessionKey, JSON.stringify(nextSession));
      return;
    }
    localStorage.removeItem(sessionKey);
  }, []);

  const login = useCallback(({ email, password, remember = true }) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);
    if (!user || user.password !== password) {
      throw new Error("بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور.");
    }
    persistSession({
      userId: user.id,
      remember,
      signedInAt: Date.now(),
    });
    return user;
  }, [persistSession, users]);

  const register = useCallback(({ name, email, password }) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!name?.trim()) throw new Error("اكتب اسم المستخدم.");
    if (!normalizedEmail.includes("@")) throw new Error("اكتب بريد إلكتروني صحيح.");
    if (String(password || "").length < 6) throw new Error("كلمة المرور يجب ألا تقل عن 6 أحرف.");
    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      throw new Error("هذا البريد مسجل بالفعل. استخدم تسجيل الدخول.");
    }

    const user = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "admin",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    persistUsers([user, ...users]);
    persistSession({ userId: user.id, remember: true, signedInAt: Date.now() });
    return user;
  }, [persistSession, persistUsers, users]);

  const logout = useCallback(() => {
    persistSession(null);
  }, [persistSession]);

  const value = useMemo(() => ({
    currentUser,
    isAuthenticated: Boolean(currentUser),
    login,
    logout,
    register,
    users,
  }), [currentUser, login, logout, register, users]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

function readUsers() {
  try {
    const raw = localStorage.getItem(usersKey);
    const parsed = raw ? JSON.parse(raw) : defaultUsers;
    return Array.isArray(parsed) && parsed.length ? parsed : defaultUsers;
  } catch {
    return defaultUsers;
  }
}

function readSession() {
  try {
    const raw = localStorage.getItem(sessionKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
