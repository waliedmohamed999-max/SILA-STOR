import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Store, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function Login() {
  return <AuthScreen mode="login" />;
}

export function Register() {
  return <AuthScreen mode="register" />;
}

function AuthScreen({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, register, registrationEnabled, demoAuthEnabled, demoCredentialsAvailable, demoAdminEmail, requiresBackend } = useAuth();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: demoCredentialsAvailable ? demoAdminEmail : "",
    password: "",
    remember: true,
  });

  const redirectTo = useMemo(() => sanitizeRedirect(location.state?.from), [location.state]);

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        if (!registrationEnabled) throw new Error("إنشاء الحسابات متوقف في وضع النشر.");
        await register(form);
        showToast("تم إنشاء الحساب", "تم تسجيل الدخول إلى لوحة التحكم بنجاح.", "success");
      } else {
        await login(form);
        showToast("مرحبًا بك", "تم تسجيل الدخول إلى لوحة التحكم.", "success");
      }
      navigate(redirectTo, { replace: true });
    } catch (error) {
      showToast("تعذر الدخول", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,.35),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(139,92,246,.25),transparent_28%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-8 lg:grid-cols-[1fr_520px]">
        <section className="hidden lg:block">
          <div className="inline-flex items-center gap-3 rounded-3xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-white shadow-lg shadow-indigo-500/30">
              <Store size={24} />
            </span>
            <div>
              <p className="font-heading text-xl font-black">SILA Admin</p>
              <p className="text-sm text-white/60">لوحة تحكم المتجر الذكية</p>
            </div>
          </div>

          <h1 className="mt-10 max-w-2xl font-heading text-5xl font-black leading-tight">
            دخول آمن لإدارة المتجر، الطلبات، الثيمات، والدعم المباشر.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/65">
            شاشة مصادقة كاملة قابلة للربط لاحقًا مع Laravel Sanctum أو JWT، ومجهزة حاليًا ببيانات محلية للتجربة.
          </p>

          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {["جلسة آمنة", "إدارة الصلاحيات", "جاهز للربط API"].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <ShieldCheck size={22} className="text-indigo-200" />
                <p className="mt-3 font-black">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white p-5 text-slate-950 shadow-2xl shadow-black/30 dark:bg-slate-950 dark:text-white">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">
                  {isRegister ? "Create Account" : "Secure Login"}
                </p>
                <h2 className="mt-2 font-heading text-3xl font-black">
                  {isRegister ? "إنشاء حساب جديد" : "تسجيل الدخول"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {isRegister ? "أنشئ مستخدمًا جديدًا للوصول إلى لوحة التحكم." : "ادخل البريد وكلمة المرور للوصول إلى لوحة التحكم."}
                </p>
              </div>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-white">
                <LockKeyhole size={24} />
              </span>
            </div>

            <form onSubmit={submit} className="mt-6 grid gap-4">
              {isRegister && (
                <Field
                  icon={UserRound}
                  label="الاسم"
                  value={form.name}
                  onChange={(value) => update("name", value)}
                  placeholder="اسم المدير"
                />
              )}
              <Field
                icon={Mail}
                label="البريد الإلكتروني"
                value={form.email}
                onChange={(value) => update("email", value)}
                placeholder="admin@sila.test"
                type="email"
              />
              <label>
                <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">كلمة المرور</span>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-950">
                  <LockKeyhole size={18} className="text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) => update("password", event.target.value)}
                    placeholder="••••••••"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none dark:text-white"
                  />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {!isRegister && (
                <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  <span>تذكرني</span>
                  <input type="checkbox" checked={form.remember} onChange={(event) => update("remember", event.target.checked)} className="h-4 w-4 accent-indigo-600" />
                </label>
              )}

              <Button type="submit" disabled={loading} className="w-full py-3.5">
                {loading ? "جاري التحقق..." : isRegister ? "إنشاء الحساب والدخول" : "دخول لوحة التحكم"}
              </Button>

              {demoAuthEnabled && demoCredentialsAvailable ? (
                <div className="rounded-2xl bg-indigo-500/10 p-4 text-sm text-indigo-700 dark:text-indigo-200">
                  <p className="font-black">بيانات تجربة جاهزة</p>
                  <p className="mt-1 font-mono text-xs">{demoAdminEmail} / من ملف البيئة</p>
                </div>
              ) : requiresBackend ? (
                <div className="rounded-2xl bg-emerald-500/10 p-4 text-sm font-bold text-emerald-700 dark:text-emerald-200">
                  تسجيل الدخول مضبوط للعمل عبر باك إند آمن. يجب ضبط VITE_API_BASE_URL قبل النشر.
                </div>
              ) : (
                <div className="rounded-2xl bg-amber-500/10 p-4 text-sm font-bold text-amber-700 dark:text-amber-200">
                  تسجيل الدخول التجريبي متوقف في وضع النشر. اربط المصادقة بباك إند آمن قبل إتاحة لوحة التحكم.
                </div>
              )}
            </form>

            <div className="mt-5 text-center text-sm font-bold text-slate-500">
              {isRegister ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟"}{" "}
              {registrationEnabled || isRegister ? (
                <Link to={isRegister ? "/login" : "/register"} className="text-indigo-600 hover:underline">
                  {isRegister ? "تسجيل الدخول" : "إنشاء حساب جديد"}
                </Link>
              ) : (
                <span className="text-slate-400">إنشاء الحسابات متوقف للنشر</span>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ icon: Icon, label, value, onChange, placeholder, type = "text" }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-950">
        <Icon size={18} className="text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none dark:text-white"
        />
      </div>
    </label>
  );
}

function sanitizeRedirect(value) {
  const path = typeof value === "string" ? value : "/admin";
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/login") || path.startsWith("/register")) return "/admin";
  return path;
}
