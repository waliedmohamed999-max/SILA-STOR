import { BadgePercent, BarChart3, Clock3, Gift, Link2, Mail, Megaphone, Percent, Phone, Plus, ShoppingCart, Target, Ticket, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import { deleteAbandonedCart, readAbandonedCarts, updateAbandonedCart } from "../services/abandonedCartService";
import { money } from "../utils/formatters";

const sections = [
  { key: "abandoned", label: "السلات المتروكة", icon: ShoppingCart },
  { key: "affiliate", label: "التسويق بالعمولة", icon: Link2 },
  { key: "packages", label: "الحزم التسويقية", icon: Gift },
  { key: "campaigns", label: "الحملات التسويقية", icon: Megaphone },
  { key: "discounts", label: "الخصومات", icon: Percent },
];

const affiliates = [
  { id: 1, name: "Tech Arabia", channel: "محتوى تقني", rate: 8, sales: 128, revenue: 84200, commission: 6736, status: "active" },
  { id: 2, name: "Deal Hunter", channel: "عروض ومنتجات", rate: 10, sales: 94, revenue: 51740, commission: 5174, status: "active" },
  { id: 3, name: "Studio Market", channel: "إنفلونسر", rate: 6, sales: 51, revenue: 23400, commission: 1404, status: "review" },
];

const packages = [
  { id: 1, name: "حزمة الإطلاق", target: "منتجات جديدة", budget: 12000, channels: ["Meta", "Google", "Email"], roi: 3.8, status: "active" },
  { id: 2, name: "حزمة العودة للمدرسة", target: "اللابتوبات", budget: 18000, channels: ["Snap", "Influencers", "WhatsApp"], roi: 4.4, status: "scheduled" },
  { id: 3, name: "حزمة إعادة الاستهداف", target: "السلات المتروكة", budget: 6000, channels: ["Meta", "Email"], roi: 5.1, status: "active" },
];

const campaigns = [
  { id: 1, name: "أجهزة الكمبيوتر للأعمال", channel: "Google Ads", spend: 9200, revenue: 31800, ctr: 4.8, progress: 82, status: "active" },
  { id: 2, name: "موسم السماعات", channel: "Meta Ads", spend: 4100, revenue: 12600, ctr: 5.6, progress: 64, status: "active" },
  { id: 3, name: "خصومات نهاية الأسبوع", channel: "SMS + Email", spend: 1700, revenue: 9800, ctr: 9.4, progress: 100, status: "finished" },
];

const discounts = [
  { id: 1, code: "SAVE10", type: "نسبة", value: "10%", usage: 124, limit: 300, scope: "كل المتجر", status: "active" },
  { id: 2, code: "LAPTOP120", type: "قيمة", value: "120", usage: 48, limit: 80, scope: "اللابتوبات", status: "active" },
  { id: 3, code: "WELCOME15", type: "نسبة", value: "15%", usage: 300, limit: 300, scope: "عملاء جدد", status: "finished" },
];

export default function Marketing() {
  const [activeSection, setActiveSection] = useState("abandoned");
  const [abandonedCarts, setAbandonedCarts] = useState(() => readAbandonedCarts());

  useEffect(() => {
    const refresh = () => setAbandonedCarts(readAbandonedCarts());
    window.addEventListener("storage", refresh);
    window.addEventListener("sila:abandoned-carts-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("sila:abandoned-carts-updated", refresh);
    };
  }, []);

  const summary = useMemo(
    () => ({
      affiliateRevenue: affiliates.reduce((sum, item) => sum + item.revenue, 0),
      campaignRevenue: campaigns.reduce((sum, item) => sum + item.revenue, 0),
      activeDiscounts: discounts.filter((item) => item.status === "active").length,
      activeCampaigns: campaigns.filter((item) => item.status === "active").length,
      abandonedCount: abandonedCarts.filter((item) => item.status !== "converted").length,
      abandonedValue: abandonedCarts.filter((item) => item.status !== "converted").reduce((sum, item) => sum + Number(item.total || 0), 0),
      recoverableContacts: abandonedCarts.filter((item) => item.status !== "converted" && (item.customer?.email || item.customer?.phone)).length,
    }),
    [abandonedCarts]
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <section className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">التسويق</h2>
              <p className="text-sm text-slate-500">إدارة القنوات والحملات والعروض.</p>
            </div>
          </div>
        </section>

        <section className="card p-3">
          <div className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-right text-sm font-black transition ${
                    activeSection === section.key
                      ? "bg-accent text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                  }`}
                >
                  <Icon size={18} />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="card p-5">
          <p className="font-heading text-lg font-black text-slate-950 dark:text-white">ملخص التسويق</p>
          <div className="mt-4 space-y-4">
            <MiniMetric label="إيراد العمولة" value={money(summary.affiliateRevenue)} />
            <MiniMetric label="إيراد الحملات" value={money(summary.campaignRevenue)} />
            <MiniMetric label="السلات المتروكة" value={String(summary.abandonedCount)} />
            <MiniMetric label="قيمة السلات" value={money(summary.abandonedValue)} />
            <MiniMetric label="الحملات النشطة" value={String(summary.activeCampaigns)} />
            <MiniMetric label="الخصومات الفعالة" value={String(summary.activeDiscounts)} />
          </div>
        </section>
      </aside>

      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="إيراد العمولة" value={money(summary.affiliateRevenue)} icon={Users} tone="accent" />
          <SummaryCard title="إيراد الحملات" value={money(summary.campaignRevenue)} icon={BarChart3} tone="success" />
          <SummaryCard title="السلات المتروكة" value={String(summary.abandonedCount)} icon={ShoppingCart} tone="warning" />
          <SummaryCard title="جهات قابلة للاستهداف" value={String(summary.recoverableContacts)} icon={Target} tone="danger" />
        </div>

        {activeSection === "abandoned" && <AbandonedCartsSection carts={abandonedCarts} onRefresh={() => setAbandonedCarts(readAbandonedCarts())} />}
        {activeSection === "affiliate" && <AffiliateSection />}
        {activeSection === "packages" && <PackagesSection />}
        {activeSection === "campaigns" && <CampaignsSection />}
        {activeSection === "discounts" && <DiscountsSection />}
      </section>
    </div>
  );
}

function AbandonedCartsSection({ carts, onRefresh }) {
  const [status, setStatus] = useState("open");
  const filtered = carts.filter((cart) => status === "all" || cart.status === status);

  const updateStatus = (cart, nextStatus) => {
    updateAbandonedCart(cart.id, { status: nextStatus });
    onRefresh();
  };

  const removeCart = (cart) => {
    deleteAbandonedCart(cart.id);
    onRefresh();
  };

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black text-slate-950 dark:text-white">السلات المتروكة</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            يتم تسجيل أي زائر يضيف منتجات للسلة، وتظهر بياناته بمجرد كتابتها في صفحة الدفع. عند إتمام الشراء تتحول السلة تلقائيا إلى مسترجعة.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["open", "مفتوحة"],
            ["targeted", "تم استهدافها"],
            ["converted", "مسترجعة"],
            ["all", "الكل"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatus(key)}
              className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                status === key ? "border-accent bg-accent text-white" : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {filtered.length ? (
          filtered.map((cart) => (
            <article key={cart.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:p-5">
              <div className="grid gap-4 xl:grid-cols-[1.1fr_.8fr_.8fr_auto] xl:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-lg font-black text-slate-950 dark:text-white">
                      {cart.customer?.name || cart.customer?.email || cart.customer?.phone || "زائر بدون بيانات"}
                    </p>
                    <Badge tone={cart.status === "converted" ? "success" : cart.status === "targeted" ? "warning" : "accent"}>
                      {cart.status === "converted" ? "مسترجعة" : cart.status === "targeted" ? "تم استهدافها" : "مفتوحة"}
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm font-bold text-slate-500">
                    <ContactLine icon={Mail} value={cart.customer?.email || "لا يوجد بريد"} />
                    <ContactLine icon={Phone} value={cart.customer?.phone || "لا يوجد رقم"} />
                    <ContactLine icon={Clock3} value={`آخر نشاط: ${formatDate(cart.lastActivityAt)}`} />
                  </div>
                </div>

                <Metric label="قيمة السلة" value={money(cart.total || cart.subtotal || 0)} />
                <Metric label="عدد المنتجات" value={String(cart.itemsCount || cart.items?.length || 0)} />

                <div className="grid gap-2">
                  {cart.customer?.phone ? (
                    <a href={`https://wa.me/${normalizePhone(cart.customer.phone)}`} target="_blank" rel="noreferrer">
                      <Button className="w-full justify-center" size="sm">واتساب</Button>
                    </a>
                  ) : null}
                  {cart.customer?.email ? (
                    <a href={`mailto:${cart.customer.email}?subject=إكمال طلبك من SILA`}>
                      <Button className="w-full justify-center" variant="secondary" size="sm">إيميل</Button>
                    </a>
                  ) : null}
                  {cart.status !== "converted" ? (
                    <Button className="w-full justify-center" variant="secondary" size="sm" onClick={() => updateStatus(cart, "targeted")}>
                      تحديد كمستهدف
                    </Button>
                  ) : null}
                  <Button className="w-full justify-center" variant="danger" size="sm" onClick={() => removeCart(cart)}>
                    <Trash2 size={15} />
                    حذف
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {(cart.items || []).map((item) => (
                  <div key={`${cart.id}-${item.id}`} className="flex min-w-52 items-center gap-3 rounded-2xl bg-slate-50 p-2 dark:bg-slate-900">
                    <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950 dark:text-white">{item.name}</p>
                      <p className="text-xs font-bold text-slate-500">{item.quantity}x · {money(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
            <ShoppingCart className="mx-auto text-slate-400" size={34} />
            <p className="mt-3 font-heading text-lg font-black text-slate-950 dark:text-white">لا توجد سلات بهذه الحالة</p>
            <p className="mt-1 text-sm text-slate-500">أضف منتجا للسلة من المتجر ثم افتح صفحة الدفع لتسجيل بيانات العميل.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function AffiliateSection() {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black text-slate-950 dark:text-white">التسويق بالعمولة</h2>
          <p className="mt-1 text-sm text-slate-500">تتبع الشركاء ونسب العمولة والمبيعات الناتجة عن كل قناة.</p>
        </div>
        <Button><Plus size={17} />إضافة شريك</Button>
      </div>

      <div className="mt-6 grid gap-4">
        {affiliates.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <div className="grid gap-4 xl:grid-cols-[1.1fr_.7fr_.7fr_.7fr_auto] xl:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-heading text-lg font-black text-slate-950 dark:text-white">{item.name}</p>
                  <Badge tone={item.status === "active" ? "success" : "warning"}>{item.status === "active" ? "نشط" : "مراجعة"}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{item.channel}</p>
              </div>
              <Metric label="نسبة العمولة" value={`${item.rate}%`} />
              <Metric label="المبيعات" value={String(item.sales)} />
              <Metric label="الإيراد" value={money(item.revenue)} />
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500">المستحق</p>
                <p className="mt-1 font-heading text-lg font-black text-slate-950 dark:text-white">{money(item.commission)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PackagesSection() {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black text-slate-950 dark:text-white">الحزم التسويقية</h2>
          <p className="mt-1 text-sm text-slate-500">باقات جاهزة تجمع قنوات متعددة وفق هدف واضح وميزانية قابلة للقياس.</p>
        </div>
        <Button><Gift size={17} />إنشاء حزمة</Button>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {packages.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <p className="font-heading text-lg font-black text-slate-950 dark:text-white">{item.name}</p>
              <Badge tone={item.status === "active" ? "success" : "warning"}>{item.status === "active" ? "نشطة" : "مجدولة"}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-500">الهدف: {item.target}</p>
            <div className="mt-4 grid gap-3">
              <Metric label="الميزانية" value={money(item.budget)} />
              <Metric label="العائد المتوقع" value={`${item.roi}x`} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.channels.map((channel) => (
                <span key={channel} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  {channel}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CampaignsSection() {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black text-slate-950 dark:text-white">الحملات التسويقية</h2>
          <p className="mt-1 text-sm text-slate-500">مراقبة الإنفاق والعائد ومعدل التفاعل لكل حملة تسويقية.</p>
        </div>
        <Button><Megaphone size={17} />إطلاق حملة</Button>
      </div>

      <div className="mt-6 space-y-4">
        {campaigns.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-heading text-lg font-black text-slate-950 dark:text-white">{item.name}</p>
                  <Badge tone={item.status === "active" ? "success" : "neutral"}>{item.status === "active" ? "نشطة" : "منتهية"}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{item.channel}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="الإنفاق" value={money(item.spend)} />
                <Metric label="الإيراد" value={money(item.revenue)} />
                <Metric label="CTR" value={`${item.ctr}%`} />
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-500">تقدم الحملة</span>
                <span className="font-black text-slate-950 dark:text-white">{item.progress}%</span>
              </div>
              <ProgressBar value={item.progress} tone="bg-accent" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DiscountsSection() {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black text-slate-950 dark:text-white">الخصومات</h2>
          <p className="mt-1 text-sm text-slate-500">إدارة كوبونات المتجر والخصومات المحددة حسب الفئة أو الشريحة.</p>
        </div>
        <Button><BadgePercent size={17} />إنشاء خصم</Button>
      </div>

      <div className="mt-6 grid gap-4">
        {discounts.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <div className="grid gap-4 xl:grid-cols-[1fr_.8fr_.8fr_.8fr_auto] xl:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-heading text-lg font-black text-slate-950 dark:text-white">{item.code}</p>
                  <Badge tone={item.status === "active" ? "success" : "neutral"}>{item.status === "active" ? "فعال" : "منتهٍ"}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{item.scope}</p>
              </div>
              <Metric label="النوع" value={item.type} />
              <Metric label="القيمة" value={item.value} />
              <Metric label="الاستخدام" value={`${item.usage}/${item.limit}`} />
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500">الأداء</p>
                <p className="mt-1 font-heading text-lg font-black text-slate-950 dark:text-white">{Math.round((item.usage / item.limit) * 100)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryCard({ title, value, icon: Icon, tone }) {
  const tones = {
    accent: "bg-indigo-500/10 text-accent",
    success: "bg-emerald-500/10 text-success",
    warning: "bg-amber-500/10 text-warning",
    danger: "bg-red-500/10 text-danger",
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <p className="mt-1 font-heading text-3xl font-black text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${tones[tone]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function ContactLine({ icon: Icon, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon size={15} className="shrink-0 text-slate-400" />
      <span className="min-w-0 truncate">{value}</span>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "غير معروف";
  return new Date(value).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" });
}

function normalizePhone(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-2 font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
