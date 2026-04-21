import {
  Activity,
  ArrowLeft,
  BellRing,
  Building2,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  Globe2,
  KeyRound,
  LayoutTemplate,
  LifeBuoy,
  ListChecks,
  LockKeyhole,
  Mail,
  MapPinned,
  Network,
  Palette,
  PlugZap,
  Receipt,
  Scale,
  SearchCheck,
  Server,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UserCheck,
  UserPlus,
  Users,
  Webhook,
} from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ToggleSwitch from "../components/ToggleSwitch";
import { useSettings } from "../context/SettingsContext";
import { useTheme } from "../context/ThemeContext";
import { getSettingsItem, settingsSections } from "../data/settingsSections";

const iconMap = {
  "store-profile": Store,
  billing: Receipt,
  team: Users,
  shipping: Truck,
  checkout: CreditCard,
  taxes: Scale,
  domains: Globe2,
  security: ShieldCheck,
  integrations: Webhook,
  localization: MapPinned,
  notifications: BellRing,
  emails: Mail,
  contact: LifeBuoy,
  support: MessageIcon,
  appearance: Palette,
  navigation: LayoutTemplate,
  seo: Network,
  policies: Building2,
  markets: ShoppingBag,
  "storefront-manager": Settings2,
};

export default function Settings() {
  const { sectionKey } = useParams();
  const { settings, updateSectionField, replaceSection, saveSection } = useSettings();
  const { theme, setTheme } = useTheme();

  if (!sectionKey) {
    return <SettingsHome />;
  }

  if (sectionKey === "shipping") {
    return <Navigate to="/admin/logistics" replace />;
  }

  const item = getSettingsItem(sectionKey);

  if (!item || item.to) {
    return (
      <EmptyState
        title="القسم غير موجود"
        text="المسار المطلوب غير متاح داخل إعدادات النظام الحالية."
        action={
          <Link to="/admin/settings">
            <Button>العودة إلى الإعدادات</Button>
          </Link>
        }
      />
    );
  }

  const section = settings[sectionKey];
  const Icon = iconMap[sectionKey] || Settings2;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin/settings" className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-accent">
            <ArrowLeft size={16} />
            العودة إلى مركز الإعدادات
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Icon size={20} />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-black text-slate-950 dark:text-white">{item.title}</h1>
              <p className="text-sm text-slate-500">{item.description}</p>
            </div>
          </div>
        </div>
        <Button onClick={() => saveSection(sectionKey)}>حفظ التعديلات</Button>
      </div>

      <SectionContent
        sectionKey={sectionKey}
        section={section}
        updateSectionField={updateSectionField}
        replaceSection={replaceSection}
        theme={theme}
        setTheme={setTheme}
      />
    </div>
  );
}

function SettingsHome() {
  return (
    <div className="space-y-8">
      {settingsSections.map((group) => (
        <section key={group.group} className="card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-black text-slate-950 dark:text-white">{group.group}</h2>
              <p className="mt-1 text-sm text-slate-500">مسارات فعلية لكل قسم داخل نظام الإعدادات مع حفظ موحد لنفس الداتا.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {group.items.map((item) => {
              const Icon = iconMap[item.key] || Settings2;
              const to = item.to || `/admin/settings/${item.key}`;

              return (
                <Link
                  key={item.key}
                  to={to}
                  className="rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-800 dark:hover:border-indigo-500/40 dark:hover:shadow-black/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      <Icon size={18} />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                      {item.to ? "خارجي" : "داخلي"}
                    </span>
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-black text-slate-950 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
                  <div className="mt-4 text-sm font-black text-accent">{to}</div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function SectionContent({ sectionKey, section, updateSectionField, replaceSection, theme, setTheme }) {
  if (sectionKey === "shipping") {
    return <ShippingSection section={section} updateSectionField={updateSectionField} replaceSection={replaceSection} />;
  }

  switch (sectionKey) {
    case "store-profile":
      return (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <SectionCard title="الهوية الأساسية" description="البيانات المستخدمة في المتجر والفواتير وقنوات التواصل.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="اسم المتجر" value={section.storeName} onChange={(value) => updateSectionField(sectionKey, "storeName", value)} />
              <Field label="اسم الجهة القانونية" value={section.legalName} onChange={(value) => updateSectionField(sectionKey, "legalName", value)} />
              <Field label="بريد الدعم" type="email" value={section.supportEmail} onChange={(value) => updateSectionField(sectionKey, "supportEmail", value)} />
              <Field label="بريد المبيعات" type="email" value={section.salesEmail} onChange={(value) => updateSectionField(sectionKey, "salesEmail", value)} />
              <Field label="الهاتف" value={section.phone} onChange={(value) => updateSectionField(sectionKey, "phone", value)} />
              <Field label="الرقم الضريبي" value={section.vatNumber} onChange={(value) => updateSectionField(sectionKey, "vatNumber", value)} />
              <Field label="السجل التجاري" value={section.registration} onChange={(value) => updateSectionField(sectionKey, "registration", value)} />
              <Field label="اختصار الشعار" value={section.logoText} onChange={(value) => updateSectionField(sectionKey, "logoText", value)} />
              <TextAreaField className="md:col-span-2" label="وصف المتجر" value={section.description} onChange={(value) => updateSectionField(sectionKey, "description", value)} />
            </div>
          </SectionCard>
          <InfoPanel
            title="المسارات المرتبطة"
            rows={[
              ["المتجر العام", "/"],
              ["لوحة الإدارة", "/admin"],
              ["إعدادات المتجر", "/admin/settings/store-profile"],
            ]}
          />
        </div>
      );

    case "billing":
      return (
        <SectionCard title="الفوترة والعملات" description="إعدادات عرض الأسعار وأكواد المستندات والضريبة الافتراضية.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SelectField
              label="العملة"
              value={section.currency}
              options={["SAR", "EGP"]}
              onChange={(value) => {
                updateSectionField(sectionKey, "currency", value);
                updateSectionField(sectionKey, "currencySymbol", value === "EGP" ? "ج.م" : "ر.س");
              }}
            />
            <Field label="رمز العملة" value={section.currencySymbol} onChange={(value) => updateSectionField(sectionKey, "currencySymbol", value)} />
            <Field label="المنطقة الزمنية" value={section.timezone} onChange={(value) => updateSectionField(sectionKey, "timezone", value)} />
            <Field label="نسبة الضريبة" value={section.taxRate} onChange={(value) => updateSectionField(sectionKey, "taxRate", value)} />
            <Field label="بادئة الفاتورة" value={section.invoicePrefix} onChange={(value) => updateSectionField(sectionKey, "invoicePrefix", value)} />
            <Field label="بادئة الطلب" value={section.orderPrefix} onChange={(value) => updateSectionField(sectionKey, "orderPrefix", value)} />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ToggleRow label="تضمين الضريبة داخل السعر" checked={section.includeTax} onChange={(value) => updateSectionField(sectionKey, "includeTax", value)} />
            <ToggleRow label="تقريب الأسعار تلقائياً" checked={section.roundPrices} onChange={(value) => updateSectionField(sectionKey, "roundPrices", value)} />
          </div>
        </SectionCard>
      );

    case "team":
      return (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="card overflow-hidden p-0">
              <div className="border-b border-slate-200 bg-gradient-to-l from-indigo-600 to-violet-600 p-5 text-white dark:border-slate-800 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-white/70">Access Control Center</p>
                    <h2 className="mt-2 font-heading text-2xl font-black sm:text-3xl">الفريق والصلاحيات</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-white/75">إدارة أعضاء الفريق، الدعوات، الأدوار، وسياسات الأمان من مكان واحد قبل ربطها بالباك إند.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" className="border-white/20 bg-white/15 text-white hover:bg-white/20">
                      <UserPlus size={17} />
                      دعوة موظف
                    </Button>
                    <Button type="button" className="bg-white text-accent hover:bg-white/90">
                      <ShieldCheck size={17} />
                      فحص الصلاحيات
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4">
                <TeamMetric icon={Users} label="أعضاء نشطون" value="8" helper="+2 هذا الشهر" tone="accent" />
                <TeamMetric icon={KeyRound} label="أدوار معتمدة" value={String(section.roles.length)} helper="قابلة للتخصيص" tone="info" />
                <TeamMetric icon={ShieldCheck} label="حماية المديرين" value={section.require2FAForManagers ? "مفعلة" : "غير مفعلة"} helper="2FA إلزامي" tone={section.require2FAForManagers ? "success" : "warning"} />
                <TeamMetric icon={Activity} label="تتبع النشاط" value={section.logSensitiveActions ? "نشط" : "متوقف"} helper="سجل تدقيق" tone={section.logSensitiveActions ? "success" : "danger"} />
              </div>
            </section>

            <SectionCard title="بيانات المالك وسياسات الوصول" description="الإعدادات التي تتحكم في هوية الإدارة ومستوى الحماية داخل لوحة التحكم.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="اسم مالك الحساب" value={section.ownerName} onChange={(value) => updateSectionField(sectionKey, "ownerName", value)} />
                <Field label="بريد الإدارة" type="email" value={section.adminEmail} onChange={(value) => updateSectionField(sectionKey, "adminEmail", value)} />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <ToggleRow label="السماح بدعوات الموظفين" checked={section.allowStaffInvites} onChange={(value) => updateSectionField(sectionKey, "allowStaffInvites", value)} />
                <ToggleRow label="إلزام 2FA للمديرين" checked={section.require2FAForManagers} onChange={(value) => updateSectionField(sectionKey, "require2FAForManagers", value)} />
                <ToggleRow label="تسجيل العمليات الحساسة" checked={section.logSensitiveActions} onChange={(value) => updateSectionField(sectionKey, "logSensitiveActions", value)} />
              </div>
            </SectionCard>

            <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <SectionCard title="مصفوفة الأدوار والصلاحيات" description="عرض واضح لما يمكن لكل دور الوصول إليه داخل المتجر.">
                <RoleMatrix roles={section.roles} />
                <ArrayField className="mt-5" label="تعديل الأدوار المعتمدة" values={section.roles} onChange={(value) => updateSectionField(sectionKey, "roles", value)} />
              </SectionCard>

              <SectionCard title="دعوات الفريق" description="دعوات جاهزة للربط لاحقًا بخدمة البريد ونظام المستخدمين.">
                <div className="space-y-3">
                  <TeamInviteCard email="ops@sila.store" role="مدير عمليات" status={section.allowStaffInvites ? "بانتظار القبول" : "الدعوات متوقفة"} />
                  <TeamInviteCard email="support@sila.store" role="دعم العملاء" status={section.allowStaffInvites ? "تم الإرسال" : "الدعوات متوقفة"} />
                  <TeamInviteCard email="finance@sila.store" role="محاسب" status={section.allowStaffInvites ? "تنتهي خلال 48 ساعة" : "الدعوات متوقفة"} />
                </div>
              </SectionCard>
            </section>

            <SectionCard title="أعضاء الفريق" description="قائمة تشغيل تجريبية قابلة للاستبدال لاحقًا ببيانات المستخدمين من الـ API.">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {buildTeamMembers(section).map((member) => (
                  <TeamMemberCard key={member.email} member={member} />
                ))}
              </div>
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <AccessReadiness section={section} />
            <InfoPanel title="مستوى الوصول" rows={[["المسار", "/admin/settings/team"], ["الأدوار الحالية", String(section.roles.length)], ["البريد الإداري", section.adminEmail]]} />
            <SectionCard title="سجل النشاط" description="آخر العمليات الحساسة داخل لوحة التحكم.">
              <div className="space-y-3">
                <TeamActivityItem icon={UserCheck} title="تحديث صلاحيات مدير متجر" time="منذ 12 دقيقة" />
                <TeamActivityItem icon={ShieldCheck} title="تفعيل المصادقة الثنائية" time="منذ 34 دقيقة" />
                <TeamActivityItem icon={Clock3} title="دعوة مستخدم جديد" time="اليوم 11:20 ص" />
                <TeamActivityItem icon={ShieldAlert} title="محاولة دخول مرفوضة" time="أمس 09:15 م" tone="warning" />
              </div>
            </SectionCard>
          </aside>
        </div>
      );

    case "shipping":
      return (
        <SectionCard title="الشحن والتوصيل" description="إعدادات المستودع ورسوم الشحن ومزودات التوصيل.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="مدينة المستودع" value={section.warehouseCity} onChange={(value) => updateSectionField(sectionKey, "warehouseCity", value)} />
            <Field label="زمن التجهيز" value={section.preparationTime} onChange={(value) => updateSectionField(sectionKey, "preparationTime", value)} />
            <Field label="مزود الشحن القياسي" value={section.standardProvider} onChange={(value) => updateSectionField(sectionKey, "standardProvider", value)} />
            <Field label="مزود الشحن السريع" value={section.expressProvider} onChange={(value) => updateSectionField(sectionKey, "expressProvider", value)} />
            <Field label="حد الشحن المجاني" value={section.freeShippingThreshold} onChange={(value) => updateSectionField(sectionKey, "freeShippingThreshold", value)} />
            <Field label="رسوم الشحن القياسي" value={section.standardFee} onChange={(value) => updateSectionField(sectionKey, "standardFee", value)} />
            <Field label="رسوم الشحن السريع" value={section.expressFee} onChange={(value) => updateSectionField(sectionKey, "expressFee", value)} />
          </div>
          <div className="mt-5">
            <ToggleRow label="تفعيل الاستلام من الفرع" checked={section.pickupEnabled} onChange={(value) => updateSectionField(sectionKey, "pickupEnabled", value)} />
          </div>
        </SectionCard>
      );

    case "checkout":
      return (
        <SectionCard title="الدفع وإتمام الطلب" description="الإعدادات المؤثرة على صفحة الدفع ومسار إنشاء الطلب.">
          <div className="grid gap-4 md:grid-cols-2">
            <ToggleRow label="السماح بالشراء كضيف" checked={section.guestCheckout} onChange={(value) => updateSectionField(sectionKey, "guestCheckout", value)} />
            <ToggleRow label="تفعيل الدفع عند الاستلام" checked={section.cashOnDelivery} onChange={(value) => updateSectionField(sectionKey, "cashOnDelivery", value)} />
            <ToggleRow label="التحصيل الفوري للدفعات" checked={section.autoCapture} onChange={(value) => updateSectionField(sectionKey, "autoCapture", value)} />
            <ToggleRow label="إلزام إدخال رقم الجوال" checked={section.requirePhone} onChange={(value) => updateSectionField(sectionKey, "requirePhone", value)} />
            <ToggleRow label="إظهار حقل العنوان الإضافي" checked={section.requireAddressLine2} onChange={(value) => updateSectionField(sectionKey, "requireAddressLine2", value)} />
            <ToggleRow label="السماح بملاحظات الطلب" checked={section.orderNoteEnabled} onChange={(value) => updateSectionField(sectionKey, "orderNoteEnabled", value)} />
            <ToggleRow label="استرجاع السلات المتروكة" checked={section.abandonedCartRecovery} onChange={(value) => updateSectionField(sectionKey, "abandonedCartRecovery", value)} />
          </div>
        </SectionCard>
      );

    case "taxes":
      return (
        <SectionCard title="الضرائب" description="ضبط آلية حساب وعرض الضريبة في الفاتورة والواجهة.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="مسمى الضريبة" value={section.vatLabel} onChange={(value) => updateSectionField(sectionKey, "vatLabel", value)} />
            <Field label="معدل الضريبة" value={section.vatRate} onChange={(value) => updateSectionField(sectionKey, "vatRate", value)} />
            <TextAreaField className="md:col-span-2" label="تذييل الفاتورة" value={section.invoiceFooter} onChange={(value) => updateSectionField(sectionKey, "invoiceFooter", value)} />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <ToggleRow label="تفعيل الضريبة" checked={section.vatEnabled} onChange={(value) => updateSectionField(sectionKey, "vatEnabled", value)} />
            <ToggleRow label="الأسعار تشمل الضريبة" checked={section.pricesIncludeVat} onChange={(value) => updateSectionField(sectionKey, "pricesIncludeVat", value)} />
            <ToggleRow label="عرض تفصيل الضريبة" checked={section.showTaxBreakdown} onChange={(value) => updateSectionField(sectionKey, "showTaxBreakdown", value)} />
          </div>
        </SectionCard>
      );

    case "domains":
      return (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-accent">Domain Operations</p>
                    <h2 className="mt-2 font-heading text-2xl font-black text-slate-950 dark:text-white">مركز النطاقات والـ SSL</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      إدارة نطاق المتجر والدفع والإدارة مع سجلات DNS، حالة الشهادة، وإعدادات التوجيه قبل النشر.
                    </p>
                  </div>
                  <Badge tone={section.forceHttps && section.sslStatus === "نشط" ? "success" : "warning"}>
                    {section.forceHttps && section.sslStatus === "نشط" ? "جاهز للنشر" : "يحتاج مراجعة"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-3">
                <DomainStatusCard title="نطاق المتجر" domain={section.primaryDomain} type="Storefront" active={Boolean(section.primaryDomain)} />
                <DomainStatusCard title="نطاق الدفع" domain={section.checkoutDomain} type="Checkout" active={Boolean(section.checkoutDomain)} />
                <DomainStatusCard title="نطاق الإدارة" domain={section.adminDomain} type="Admin" active={Boolean(section.adminDomain)} />
              </div>
            </section>

            <SectionCard title="بيانات النطاقات" description="النطاقات الأساسية المستخدمة في واجهة المتجر والدفع ولوحة التحكم.">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="النطاق الأساسي" value={section.primaryDomain} onChange={(value) => updateSectionField(sectionKey, "primaryDomain", normalizeDomain(value))} />
                <Field label="نطاق الدفع" value={section.checkoutDomain} onChange={(value) => updateSectionField(sectionKey, "checkoutDomain", normalizeDomain(value))} />
                <Field label="نطاق الإدارة" value={section.adminDomain} onChange={(value) => updateSectionField(sectionKey, "adminDomain", normalizeDomain(value))} />
                <SelectField label="حالة SSL" value={section.sslStatus} options={["نشط", "قيد الإصدار", "منتهي", "غير مفعل"]} onChange={(value) => updateSectionField(sectionKey, "sslStatus", value)} />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <ToggleRow label="فرض HTTPS على كل المسارات" checked={section.forceHttps} onChange={(value) => updateSectionField(sectionKey, "forceHttps", value)} />
                <ToggleRow label="إعادة توجيه www إلى النطاق الأساسي" checked={section.redirectWww} onChange={(value) => updateSectionField(sectionKey, "redirectWww", value)} />
              </div>
            </SectionCard>

            <SectionCard title="سجلات DNS المطلوبة" description="استخدم هذه القيم في مزود النطاق. القيم هنا placeholders مناسبة للاستضافة الحالية ويمكن تعديلها لاحقا من الباك إند.">
              <div className="grid gap-3">
                <DnsRecord type="A" host="@" value="76.76.21.21" />
                <DnsRecord type="CNAME" host="www" value={section.primaryDomain || "sila.store"} />
                <DnsRecord type="CNAME" host="checkout" value="cname.vercel-dns.com" />
                <DnsRecord type="CNAME" host="admin" value="cname.vercel-dns.com" />
              </div>
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <section className="card p-5">
              <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">جاهزية النشر</h2>
              <div className="mt-4 space-y-3">
                <ReadinessItem label="النطاق الأساسي مضبوط" done={Boolean(section.primaryDomain)} />
                <ReadinessItem label="شهادة SSL نشطة" done={section.sslStatus === "نشط"} />
                <ReadinessItem label="فرض HTTPS مفعل" done={section.forceHttps} />
                <ReadinessItem label="توجيه www مفعل" done={section.redirectWww} />
                <ReadinessItem label="نطاق الإدارة منفصل" done={section.adminDomain !== section.primaryDomain} />
              </div>
            </section>

            <section className="card p-5">
              <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">معاينة الروابط</h2>
              <div className="mt-4 grid gap-3">
                <DomainLink label="المتجر" domain={section.primaryDomain} />
                <DomainLink label="الدفع" domain={section.checkoutDomain} />
                <DomainLink label="الإدارة" domain={section.adminDomain} />
              </div>
            </section>

            <InfoPanel
              title="ملاحظات تشغيلية"
              rows={[
                ["HTTPS", section.forceHttps ? "سيتم تحويل كل الزيارات إلى https" : "يفضل تفعيل HTTPS قبل النشر"],
                ["SSL", section.sslStatus],
                ["WWW", section.redirectWww ? "www يعاد توجيهه للنطاق الأساسي" : "www غير موجه حاليا"],
              ]}
            />
          </aside>
        </div>
      );

    case "security":
      return (
        <SectionCard title="الأمان" description="إعدادات الحماية وسلوك الجلسات والتنبيهات.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="مهلة انتهاء الجلسة بالدقائق" value={section.sessionTimeout} onChange={(value) => updateSectionField(sectionKey, "sessionTimeout", value)} />
            <TextAreaField className="md:col-span-2" label="قائمة IP المسموح بها" value={section.ipAllowlist} onChange={(value) => updateSectionField(sectionKey, "ipAllowlist", value)} />
            <ToggleRow label="المصادقة الثنائية" checked={section.twoFactor} onChange={(value) => updateSectionField(sectionKey, "twoFactor", value)} />
            <ToggleRow label="الأجهزة الموثوقة" checked={section.trustedDevices} onChange={(value) => updateSectionField(sectionKey, "trustedDevices", value)} />
            <ToggleRow label="تدوير كلمات المرور" checked={section.passwordRotation} onChange={(value) => updateSectionField(sectionKey, "passwordRotation", value)} />
            <ToggleRow label="تنبيهات تسجيل الدخول" checked={section.loginAlerts} onChange={(value) => updateSectionField(sectionKey, "loginAlerts", value)} />
          </div>
        </SectionCard>
      );

    case "integrations":
      return (
        <SectionCard title="التكاملات" description="مفاتيح الربط والتحليلات وواجهات الويب هوك.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Google Analytics ID" value={section.analyticsId} onChange={(value) => updateSectionField(sectionKey, "analyticsId", value)} />
            <Field label="Meta Pixel ID" value={section.metaPixel} onChange={(value) => updateSectionField(sectionKey, "metaPixel", value)} />
            <TextAreaField className="md:col-span-2" label="Webhook URL" value={section.webhookUrl} onChange={(value) => updateSectionField(sectionKey, "webhookUrl", value)} />
            <ToggleRow label="API Access" checked={section.apiAccess} onChange={(value) => updateSectionField(sectionKey, "apiAccess", value)} />
            <ToggleRow label="مزامنة ERP" checked={section.erpSync} onChange={(value) => updateSectionField(sectionKey, "erpSync", value)} />
            <ToggleRow label="مزامنة التسويق" checked={section.marketingSync} onChange={(value) => updateSectionField(sectionKey, "marketingSync", value)} />
          </div>
        </SectionCard>
      );

    case "localization":
      return (
        <SectionCard title="اللغات والمنطقة" description="لغة العرض، المنطقة الجغرافية، وتنسيقات التاريخ.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SelectField label="اللغة الأساسية" value={section.defaultLanguage} options={["ar", "en"]} onChange={(value) => updateSectionField(sectionKey, "defaultLanguage", value)} />
            <SelectField label="اللغة الثانوية" value={section.secondaryLanguage} options={["en", "ar", "none"]} onChange={(value) => updateSectionField(sectionKey, "secondaryLanguage", value)} />
            <Field label="Locale" value={section.locale} onChange={(value) => updateSectionField(sectionKey, "locale", value)} />
            <Field label="صيغة التاريخ" value={section.dateFormat} onChange={(value) => updateSectionField(sectionKey, "dateFormat", value)} />
            <Field label="بداية الأسبوع" value={section.weekStartsOn} onChange={(value) => updateSectionField(sectionKey, "weekStartsOn", value)} />
            <Field label="الدولة الافتراضية" value={section.defaultCountry} onChange={(value) => updateSectionField(sectionKey, "defaultCountry", value)} />
          </div>
        </SectionCard>
      );

    case "notifications":
      return (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="card overflow-hidden p-0">
              <div className="border-b border-slate-200 bg-slate-950 p-5 text-white dark:border-slate-800 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-300">Notification Operations</p>
                    <h2 className="mt-2 font-heading text-2xl font-black sm:text-3xl">مركز الإشعارات</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">تحكم في تنبيهات الطلبات، الدفع، المخزون، الأمن، رسائل العملاء، والملخصات التشغيلية من لوحة واحدة.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                      <BellRing size={17} />
                      اختبار الإرسال
                    </Button>
                    <Button type="button" className="bg-white text-slate-950 hover:bg-white/90">
                      <Mail size={17} />
                      معاينة القوالب
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4">
                <TeamMetric icon={BellRing} label="تنبيهات مفعلة" value={String(countActiveNotifications(section))} helper="من 6 قواعد" tone="accent" />
                <TeamMetric icon={Mail} label="قنوات جاهزة" value="4" helper="Email / Push / SMS" tone="info" />
                <TeamMetric icon={Activity} label="آخر 24 ساعة" value="1,284" helper="تم الإرسال" tone="success" />
                <TeamMetric icon={ShieldAlert} label="أولوية عالية" value={section.securityAlerts ? "نشطة" : "متوقفة"} helper="أمان ودفع" tone={section.securityAlerts ? "success" : "warning"} />
              </div>
            </section>

            <SectionCard title="قواعد الإشعارات" description="حدد الأحداث التي تستحق إرسال تنبيه فوري للفريق أو العميل.">
              <div className="grid gap-4 md:grid-cols-2">
                <NotificationRuleCard icon={ShoppingBag} title="الطلبات الجديدة" text="تنبيه فوري عند إنشاء طلب جديد من المتجر." checked={section.newOrders} onChange={(value) => updateSectionField(sectionKey, "newOrders", value)} />
                <NotificationRuleCard icon={CreditCard} title="فشل عمليات الدفع" text="إرسال تنبيه للإدارة عند فشل الدفع أو انتهاء الجلسة." checked={section.failedPayments} onChange={(value) => updateSectionField(sectionKey, "failedPayments", value)} />
                <NotificationRuleCard icon={Store} title="المخزون المنخفض" text="إخطار فريق العمليات قبل نفاد المنتجات المهمة." checked={section.lowStock} onChange={(value) => updateSectionField(sectionKey, "lowStock", value)} />
                <NotificationRuleCard icon={ShieldAlert} title="التنبيهات الأمنية" text="محاولات الدخول، تغييرات الصلاحيات، والأحداث الحساسة." checked={section.securityAlerts} onChange={(value) => updateSectionField(sectionKey, "securityAlerts", value)} />
                <NotificationRuleCard icon={ListChecks} title="الملخص الأسبوعي" text="تقرير مختصر للمبيعات، الطلبات، المخزون، وسلوك العملاء." checked={section.weeklyDigest} onChange={(value) => updateSectionField(sectionKey, "weeklyDigest", value)} />
                <NotificationRuleCard icon={Users} title="رسائل العملاء" text="تنبيه الدعم عند وصول محادثة أو طلب مساعدة جديد." checked={section.customerMessages} onChange={(value) => updateSectionField(sectionKey, "customerMessages", value)} />
              </div>
            </SectionCard>

            <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <SectionCard title="قنوات الإرسال" description="بنية جاهزة للربط مع البريد، الرسائل، Push، و Webhooks لاحقا.">
                <div className="grid gap-3">
                  <NotificationChannelCard icon={Mail} title="البريد الإلكتروني" text="قوالب HTML للطلبات والدفع والملخصات." status="متصل" tone="success" />
                  <NotificationChannelCard icon={BellRing} title="Push Notifications" text="تنبيهات فورية للوحة التحكم والمتصفح." status="تجريبي" tone="info" />
                  <NotificationChannelCard icon={Webhook} title="Webhook Events" text="إرسال الأحداث لأنظمة CRM و ERP الخارجية." status="جاهز للربط" tone="accent" />
                  <NotificationChannelCard icon={Server} title="SMS Provider" text="Placeholder لربط مزود رسائل محلي لاحقا." status="غير مفعل" tone="neutral" />
                </div>
              </SectionCard>

              <SectionCard title="جاهزية التشغيل" description="فحص سريع لأهم عناصر مركز الإشعارات.">
                <div className="space-y-3">
                  <ReadinessItem label="تنبيه الطلبات مفعل" done={section.newOrders} />
                  <ReadinessItem label="تنبيه الدفع مفعل" done={section.failedPayments} />
                  <ReadinessItem label="تنبيه الأمان مفعل" done={section.securityAlerts} />
                  <ReadinessItem label="رسائل العملاء مفعلة" done={section.customerMessages} />
                  <ReadinessItem label="ملخص أسبوعي للإدارة" done={section.weeklyDigest} />
                </div>
              </SectionCard>
            </section>

            <SectionCard title="قوالب جاهزة" description="نماذج محتوى قابلة للتخصيص لاحقا من قسم قوالب البريد أو الـ API.">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <NotificationTemplateCard title="طلب جديد" subject="تم استلام طلب جديد #{order_id}" audience="فريق العمليات" enabled={section.newOrders} />
                <NotificationTemplateCard title="فشل الدفع" subject="فشل دفع طلب #{order_id}" audience="الإدارة المالية" enabled={section.failedPayments} />
                <NotificationTemplateCard title="مخزون منخفض" subject="منتج يحتاج إعادة توريد" audience="المخزون" enabled={section.lowStock} />
                <NotificationTemplateCard title="رسالة عميل" subject="محادثة دعم جديدة" audience="الدعم المباشر" enabled={section.customerMessages} />
                <NotificationTemplateCard title="تنبيه أمني" subject="حدث أمني يحتاج مراجعة" audience="مدير النظام" enabled={section.securityAlerts} />
                <NotificationTemplateCard title="ملخص أسبوعي" subject="تقرير أداء المتجر الأسبوعي" audience="الإدارة" enabled={section.weeklyDigest} />
              </div>
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <section className="card p-5">
              <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">تدفق الإرسال</h2>
              <div className="mt-4 space-y-3">
                <NotificationFlowStep number="1" title="التقاط الحدث" text="طلب، دفع، مخزون، أمان، أو رسالة عميل." />
                <NotificationFlowStep number="2" title="تحديد القناة" text="Email / Push / Webhook / SMS حسب القاعدة." />
                <NotificationFlowStep number="3" title="تطبيق القالب" text="دمج المتغيرات مثل رقم الطلب والعميل." />
                <NotificationFlowStep number="4" title="تسجيل النتيجة" text="نجاح، فشل، إعادة محاولة، أو انتظار." />
              </div>
            </section>

            <SectionCard title="آخر الإشعارات" description="سجل تشغيل مختصر قابل للربط لاحقا بجدول Logs.">
              <div className="space-y-3">
                <NotificationLogItem icon={ShoppingBag} title="طلب جديد #SILA-1042" channel="Email + Push" time="منذ 4 دقائق" tone="success" />
                <NotificationLogItem icon={CreditCard} title="فشل دفع #SILA-1039" channel="Email" time="منذ 18 دقيقة" tone="warning" />
                <NotificationLogItem icon={Users} title="رسالة دعم جديدة" channel="Push" time="اليوم 10:40 ص" tone="info" />
                <NotificationLogItem icon={ShieldAlert} title="محاولة دخول مرفوضة" channel="Webhook" time="أمس 08:22 م" tone="danger" />
              </div>
            </SectionCard>

            <InfoPanel
              title="إعدادات تقنية"
              rows={[
                ["Queue", "notifications:default"],
                ["Retry", "3 محاولات ثم فشل"],
                ["Webhook", "جاهز للربط مع REST API"],
              ]}
            />
          </aside>
        </div>
      );

    case "emails":
      return (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="card overflow-hidden p-0">
              <div className="grid gap-5 border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6 lg:grid-cols-[1fr_320px] lg:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Email Automation</p>
                  <h2 className="mt-2 font-heading text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">قوالب البريد</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">إدارة هوية الإرسال، قوالب الطلبات، الشحن، الاسترجاع، والسلة المتروكة مع معاينات جاهزة للتطوير.</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
                  <p className="text-xs font-black text-slate-400">Sender Identity</p>
                  <p className="mt-2 font-heading text-xl font-black text-slate-950 dark:text-white">{section.senderName}</p>
                  <p className="mt-1 break-all text-sm font-bold text-slate-500">{section.senderEmail}</p>
                </div>
              </div>
              <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4">
                <TeamMetric icon={Mail} label="قوالب نشطة" value={String(countEnabledEmailTemplates(section))} helper="من 4 قوالب" tone="accent" />
                <TeamMetric icon={ShoppingBag} label="تأكيد الطلب" value={section.orderConfirmation ? "نشط" : "متوقف"} helper="عميل" tone={section.orderConfirmation ? "success" : "warning"} />
                <TeamMetric icon={Truck} label="تحديث الشحن" value={section.shippingUpdate ? "نشط" : "متوقف"} helper="تتبع" tone={section.shippingUpdate ? "success" : "warning"} />
                <TeamMetric icon={Activity} label="استرداد السلة" value={section.abandonedCartEmail ? "نشط" : "متوقف"} helper="تسويق" tone={section.abandonedCartEmail ? "success" : "warning"} />
              </div>
            </section>

            <SectionCard title="هوية الإرسال" description="الاسم والبريد والتذييل الرسمي الذي يظهر داخل رسائل العملاء.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="اسم المرسل" value={section.senderName} onChange={(value) => updateSectionField(sectionKey, "senderName", value)} />
                <Field label="بريد المرسل" type="email" value={section.senderEmail} onChange={(value) => updateSectionField(sectionKey, "senderEmail", value)} />
                <TextAreaField className="md:col-span-2" label="تذييل القالب" value={section.footerText} onChange={(value) => updateSectionField(sectionKey, "footerText", value)} />
              </div>
            </SectionCard>

            <SectionCard title="سيناريوهات البريد" description="تفعيل الرسائل الأساسية التي تعمل على أحداث الطلبات وخدمة العملاء.">
              <div className="grid gap-4 md:grid-cols-2">
                <EmailScenarioCard icon={ShoppingBag} title="رسالة تأكيد الطلب" text="إرسال تلقائي بعد نجاح إنشاء الطلب." checked={section.orderConfirmation} onChange={(value) => updateSectionField(sectionKey, "orderConfirmation", value)} />
                <EmailScenarioCard icon={Truck} title="تحديثات الشحن" text="إرسال رقم التتبع وتغيرات حالة الشحنة." checked={section.shippingUpdate} onChange={(value) => updateSectionField(sectionKey, "shippingUpdate", value)} />
                <EmailScenarioCard icon={CreditCard} title="إشعارات الاسترجاع" text="تحديث العميل عند قبول أو رفض طلب الاسترجاع." checked={section.refundNotice} onChange={(value) => updateSectionField(sectionKey, "refundNotice", value)} />
                <EmailScenarioCard icon={Activity} title="رسائل السلة المتروكة" text="سلسلة استرجاع تلقائية للعملاء الذين لم يكملوا الشراء." checked={section.abandonedCartEmail} onChange={(value) => updateSectionField(sectionKey, "abandonedCartEmail", value)} />
              </div>
            </SectionCard>

            <SectionCard title="معاينة القوالب" description="عرض مختصر لتجربة العميل قبل ربط محرر القوالب الكامل.">
              <div className="grid gap-4 lg:grid-cols-2">
                <EmailPreviewCard title="تم استلام طلبك" subtitle="رقم الطلب #SILA-1042" body="شكرا لاختيارك سيلا. سنرسل لك تحديثات الشحن فور تجهيز الطلب." footer={section.footerText} />
                <EmailPreviewCard title="لا تنس منتجاتك" subtitle="سلتك محفوظة مؤقتا" body="أكمل طلبك الآن قبل انتهاء العرض أو تغير توفر المنتجات." footer={section.footerText} />
              </div>
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <EmailDeliverabilityCard section={section} />
            <SectionCard title="تسلسل السلة المتروكة" description="مسار جاهز للربط مع Marketing Automation.">
              <div className="space-y-3">
                <NotificationFlowStep number="1" title="بعد 30 دقيقة" text="تذكير لطيف بالمنتجات المتروكة." />
                <NotificationFlowStep number="2" title="بعد 12 ساعة" text="عرض قيمة المنتج أو الشحن السريع." />
                <NotificationFlowStep number="3" title="بعد 24 ساعة" text="كوبون محدود حسب إعدادات التسويق." />
              </div>
            </SectionCard>
            <InfoPanel title="جاهز للربط" rows={[["Provider", "SMTP / API Placeholder"], ["Tracking", "فتح الرسالة والنقرات"], ["Unsubscribe", "جاهز قانونيا"]]} />
          </aside>
        </div>
      );

    case "contact":
      return (
        <SectionCard title="قنوات التواصل" description="قنوات الوصول المباشر للدعم وخدمة ما بعد البيع.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="بريد الدعم" type="email" value={section.supportEmail} onChange={(value) => updateSectionField(sectionKey, "supportEmail", value)} />
            <Field label="الهاتف" value={section.phone} onChange={(value) => updateSectionField(sectionKey, "phone", value)} />
            <Field label="واتساب" value={section.whatsapp} onChange={(value) => updateSectionField(sectionKey, "whatsapp", value)} />
            <Field label="رابط الدردشة" value={section.liveChatUrl} onChange={(value) => updateSectionField(sectionKey, "liveChatUrl", value)} />
            <Field label="ساعات العمل" value={section.businessHours} onChange={(value) => updateSectionField(sectionKey, "businessHours", value)} />
            <Field label="مركز المساعدة" value={section.helpCenter} onChange={(value) => updateSectionField(sectionKey, "helpCenter", value)} />
          </div>
        </SectionCard>
      );

    case "support":
      return (
        <SectionCard title="الدردشة والمراسلة" description="أتمتة المحادثات، زمن الاستجابة ومسارات التصعيد.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="هدف الاستجابة الأولى" value={section.firstResponseTarget} onChange={(value) => updateSectionField(sectionKey, "firstResponseTarget", value)} />
            <Field label="هدف الحل النهائي" value={section.resolutionTarget} onChange={(value) => updateSectionField(sectionKey, "resolutionTarget", value)} />
            <Field className="md:col-span-2" label="بريد التصعيد" type="email" value={section.escalationEmail} onChange={(value) => updateSectionField(sectionKey, "escalationEmail", value)} />
            <ToggleRow label="تفعيل الدردشة الحية" checked={section.liveChatEnabled} onChange={(value) => updateSectionField(sectionKey, "liveChatEnabled", value)} />
            <ToggleRow label="الرد التلقائي" checked={section.autoReply} onChange={(value) => updateSectionField(sectionKey, "autoReply", value)} />
            <ToggleRow label="واتساب بوت" checked={section.whatsappBotEnabled} onChange={(value) => updateSectionField(sectionKey, "whatsappBotEnabled", value)} />
          </div>
        </SectionCard>
      );

    case "appearance":
      return (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <SectionCard title="المظهر والثيم" description="إعدادات العرض العامة في الإدارة وربطها بثيم المتجر.">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["light", "فاتح"],
                ["dark", "داكن"],
                ["auto", "تلقائي"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    updateSectionField(sectionKey, "adminTheme", value);
                    setTheme(value);
                  }}
                  className={`rounded-2xl border p-4 text-center font-black transition ${
                    theme === value ? "border-accent bg-accent text-white" : "border-slate-200 hover:border-indigo-300 dark:border-slate-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="الثيم النشط للمتجر" value={section.storefrontTheme} onChange={(value) => updateSectionField(sectionKey, "storefrontTheme", value)} />
              <Field label="نصف قطر البطاقات" value={section.cardRadius} onChange={(value) => updateSectionField(sectionKey, "cardRadius", value)} />
              <Field label="اللون الأساسي" type="color" value={section.accentColor} onChange={(value) => updateSectionField(sectionKey, "accentColor", value)} />
              <Field label="اللون الثانوي" type="color" value={section.secondaryColor} onChange={(value) => updateSectionField(sectionKey, "secondaryColor", value)} />
            </div>
            <div className="mt-5">
              <ToggleRow label="كثافة عرض مضغوطة" checked={section.compactDensity} onChange={(value) => updateSectionField(sectionKey, "compactDensity", value)} />
            </div>
          </SectionCard>
          <InfoPanel title="المسارات ذات الصلة" rows={[["إعدادات المظهر", "/admin/settings/appearance"], ["مدير واجهة المتجر", "/admin/storefront"], ["المتجر العام", "/"]]} />
        </div>
      );

    case "navigation":
      return (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="card overflow-hidden p-0">
              <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Navigation Manager</p>
                <h2 className="mt-2 font-heading text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">التنقل والقوائم</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">تنظيم روابط الهيدر والفوتر، Mega Menu، البحث، والمفضلة بشكل واضح قابل للربط مع واجهة المتجر.</p>
              </div>
              <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4">
                <TeamMetric icon={LayoutTemplate} label="روابط الهيدر" value={String(section.headerLinks.length)} helper="واجهة المتجر" tone="accent" />
                <TeamMetric icon={ListChecks} label="روابط الفوتر" value={String(section.footerLinks.length)} helper="مساعدة وسياسات" tone="info" />
                <TeamMetric icon={Network} label="Mega Menu" value={section.showMegaMenu ? "ظاهر" : "مخفي"} helper="أقسام" tone={section.showMegaMenu ? "success" : "warning"} />
                <TeamMetric icon={SearchCheck} label="البحث" value={section.showSearch ? "ظاهر" : "مخفي"} helper="كتالوج" tone={section.showSearch ? "success" : "warning"} />
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <SectionCard title="روابط الهيدر" description="العناصر الأساسية في أعلى واجهة المتجر.">
                <NavigationList title="Header" items={section.headerLinks} />
                <ArrayField className="mt-5" label="تعديل روابط الهيدر" values={section.headerLinks} onChange={(value) => updateSectionField(sectionKey, "headerLinks", value)} />
              </SectionCard>

              <SectionCard title="روابط الفوتر" description="روابط المساعدة والسياسات أسفل الموقع.">
                <NavigationList title="Footer" items={section.footerLinks} />
                <ArrayField className="mt-5" label="تعديل روابط الفوتر" values={section.footerLinks} onChange={(value) => updateSectionField(sectionKey, "footerLinks", value)} />
              </SectionCard>
            </section>

            <SectionCard title="مكونات الواجهة" description="تحكم سريع في العناصر الظاهرة في رأس المتجر.">
              <div className="grid gap-4 md:grid-cols-3">
                <FeatureToggleCard icon={Network} title="Mega Menu" text="قائمة أقسام موسعة للهيدر." checked={section.showMegaMenu} onChange={(value) => updateSectionField(sectionKey, "showMegaMenu", value)} />
                <FeatureToggleCard icon={SearchCheck} title="البحث" text="إظهار مربع البحث في المنتجات." checked={section.showSearch} onChange={(value) => updateSectionField(sectionKey, "showSearch", value)} />
                <FeatureToggleCard icon={CheckCircle2} title="المفضلة" text="إظهار قائمة المنتجات المفضلة." checked={section.showWishlist} onChange={(value) => updateSectionField(sectionKey, "showWishlist", value)} />
              </div>
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <NavigationPreview section={section} />
            <SectionCard title="فحص التجربة" description="مراجعة سريعة قبل نشر القائمة.">
              <div className="space-y-3">
                <ReadinessItem label="الهيدر يحتوي 4 روابط أو أكثر" done={section.headerLinks.length >= 4} />
                <ReadinessItem label="الفوتر يحتوي السياسات" done={section.footerLinks.some((item) => item.includes("خصوصية") || item.includes("استرجاع"))} />
                <ReadinessItem label="البحث مفعل للكتالوج" done={section.showSearch} />
                <ReadinessItem label="القوائم مناسبة للجوال" done />
              </div>
            </SectionCard>
            <InfoPanel title="مسارات مقترحة" rows={[["Header", "الرئيسية / المتجر / العروض / الدعم"], ["Footer", "الشحن / الاسترجاع / الخصوصية"], ["Mobile", "قائمة مختصرة مع بحث"]]} />
          </aside>
        </div>
      );

    case "seo":
      return (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_260px] lg:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-accent">SEO Control Center</p>
                  <h2 className="mt-2 font-heading text-2xl font-black text-slate-950 dark:text-white">تحسين ظهور المتجر</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    اضبط عنوان الصفحة، وصف البحث، الكلمات المفتاحية، Open Graph، وقواعد الفهرسة مع معاينة فورية قبل النشر.
                  </p>
                </div>
                <SeoScore section={section} />
              </div>
            </section>

            <SectionCard title="بيانات محركات البحث" description="البيانات الأساسية التي تظهر في نتائج Google ومحركات البحث.">
              <div className="grid gap-4">
                <Field label="عنوان الصفحة الرئيسية" value={section.homeTitle} onChange={(value) => updateSectionField(sectionKey, "homeTitle", value)} />
                <SeoLengthMeter label="طول العنوان" value={section.homeTitle} min={35} max={60} />
                <TextAreaField label="الوصف التعريفي" value={section.metaDescription} onChange={(value) => updateSectionField(sectionKey, "metaDescription", value)} />
                <SeoLengthMeter label="طول الوصف" value={section.metaDescription} min={120} max={160} />
                <TextAreaField label="الكلمات المفتاحية" value={section.keywords} onChange={(value) => updateSectionField(sectionKey, "keywords", value)} />
                <KeywordChips value={section.keywords} />
              </div>
            </SectionCard>

            <SectionCard title="Open Graph والمشاركة" description="البيانات التي تظهر عند مشاركة رابط المتجر في واتساب وفيسبوك ومنصات التواصل.">
              <div className="grid gap-4">
                <Field label="Open Graph Image" value={section.ogImage} onChange={(value) => updateSectionField(sectionKey, "ogImage", value)} />
                <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
                    {section.ogImage ? (
                      <img src={section.ogImage} alt="Open Graph" className="aspect-[1.91/1] w-full object-cover" />
                    ) : (
                      <div className="grid aspect-[1.91/1] place-items-center text-sm font-black text-slate-400">لا توجد صورة</div>
                    )}
                  </div>
                  <div className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Social Preview</p>
                    <h3 className="mt-2 line-clamp-2 font-heading text-lg font-black text-slate-950 dark:text-white">{section.homeTitle}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{section.metaDescription}</p>
                    <p className="mt-3 text-xs font-bold text-slate-400">sila.store</p>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <section className="card p-5">
              <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">معاينة Google</h2>
              <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs text-slate-500">https://sila.store</p>
                <h3 className="mt-1 line-clamp-2 text-xl font-bold text-blue-700 dark:text-blue-400">{section.homeTitle || "عنوان الصفحة"}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{section.metaDescription || "الوصف التعريفي سيظهر هنا."}</p>
              </div>
            </section>

            <section className="card p-5">
              <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">الفهرسة والملفات</h2>
              <div className="mt-4 space-y-3">
                <ToggleRow label="السماح بالفهرسة" checked={section.robotsIndex} onChange={(value) => updateSectionField(sectionKey, "robotsIndex", value)} />
                <SeoChecklistItem label="robots.txt" text={section.robotsIndex ? "يسمح بالفهرسة" : "noindex مفعل"} done={section.robotsIndex} />
                <SeoChecklistItem label="sitemap.xml" text="جاهز للتوليد من المنتجات والأقسام" done />
                <SeoChecklistItem label="Product Schema" text="يوصى بتوليده من بيانات المنتجات" done />
                <SeoChecklistItem label="Open Graph" text={section.ogImage ? "صورة المشاركة مضبوطة" : "أضف صورة مشاركة"} done={Boolean(section.ogImage)} />
              </div>
            </section>

            <section className="card p-5">
              <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">اقتراحات سريعة</h2>
              <div className="mt-4 grid gap-3">
                <SeoTip icon={SearchCheck} title="العنوان" text="الأفضل بين 35 و60 حرفا ويحتوي اسم المتجر والفئة." />
                <SeoTip icon={ListChecks} title="الوصف" text="الأفضل بين 120 و160 حرفا مع قيمة واضحة وشحن/دعم." />
                <SeoTip icon={Network} title="الكلمات" text="استخدم 5 إلى 8 كلمات قوية بدون تكرار زائد." />
              </div>
            </section>
          </aside>
        </div>
      );

    case "policies":
      return (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="card overflow-hidden p-0">
              <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Policy Center</p>
                <h2 className="mt-2 font-heading text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">مركز السياسات</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">إدارة النصوص القانونية والتشغيلية التي تظهر للعميل أثناء الشراء وبعده مع فحص جاهزية النشر.</p>
              </div>
              <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4">
                <PolicySummaryCard title="الشحن" text={section.shippingPolicy} />
                <PolicySummaryCard title="الإرجاع" text={section.returnPolicy} />
                <PolicySummaryCard title="الخصوصية" text={section.privacyPolicy} />
                <PolicySummaryCard title="الضمان" text={section.warrantyPolicy} />
              </div>
            </section>

            <SectionCard title="محرر السياسات" description="عدّل النصوص الرسمية التي تظهر في المتجر وصفحة الدفع ورسائل البريد.">
              <div className="grid gap-4">
                <TextAreaField label="سياسة الشحن" value={section.shippingPolicy} onChange={(value) => updateSectionField(sectionKey, "shippingPolicy", value)} />
                <TextAreaField label="سياسة الإرجاع" value={section.returnPolicy} onChange={(value) => updateSectionField(sectionKey, "returnPolicy", value)} />
                <TextAreaField label="سياسة الخصوصية" value={section.privacyPolicy} onChange={(value) => updateSectionField(sectionKey, "privacyPolicy", value)} />
                <TextAreaField label="سياسة الضمان" value={section.warrantyPolicy} onChange={(value) => updateSectionField(sectionKey, "warrantyPolicy", value)} />
              </div>
            </SectionCard>

            <SectionCard title="معاينة للعميل" description="كيف تظهر السياسات داخل صفحة المنتج أو الدفع.">
              <div className="grid gap-4 lg:grid-cols-2">
                <PolicyPreviewCard title="الشحن والتوصيل" text={section.shippingPolicy} />
                <PolicyPreviewCard title="الإرجاع والاستبدال" text={section.returnPolicy} />
                <PolicyPreviewCard title="حماية البيانات" text={section.privacyPolicy} />
                <PolicyPreviewCard title="الضمان" text={section.warrantyPolicy} />
              </div>
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <SectionCard title="جاهزية قانونية" description="فحص سريع لجودة السياسات قبل النشر.">
              <div className="space-y-3">
                <ReadinessItem label="سياسة الشحن واضحة" done={section.shippingPolicy.length > 40} />
                <ReadinessItem label="سياسة الإرجاع محددة بالمدة" done={/\d/.test(section.returnPolicy)} />
                <ReadinessItem label="الخصوصية تذكر بيانات العميل" done={section.privacyPolicy.includes("بيانات") || section.privacyPolicy.includes("العميل")} />
                <ReadinessItem label="الضمان مرتبط بفئة المنتج" done={section.warrantyPolicy.length > 30} />
              </div>
            </SectionCard>
            <SectionCard title="أماكن الظهور" description="نقاط ظهور السياسة في تجربة العميل.">
              <div className="space-y-3">
                <PolicyPlacement icon={ShoppingBag} title="صفحة الدفع" text="روابط مختصرة قبل تأكيد الطلب." />
                <PolicyPlacement icon={Store} title="صفحة المنتج" text="الشحن والضمان بجانب معلومات المنتج." />
                <PolicyPlacement icon={Mail} title="رسائل البريد" text="تذييل قانوني وروابط المساعدة." />
                <PolicyPlacement icon={ExternalLink} title="صفحات مستقلة" text="روابط SEO قابلة للفهرسة." />
              </div>
            </SectionCard>
          </aside>
        </div>
      );

    case "markets":
      return (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="card overflow-hidden p-0">
              <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Markets & Channels</p>
                <h2 className="mt-2 font-heading text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">الأسواق والقنوات</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">إدارة الدول، القنوات، العملات، وتوفر البيع حسب السوق من مكان واحد.</p>
              </div>
              <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4">
                <TeamMetric icon={Globe2} label="أسواق مفعلة" value={String(section.enabledMarkets.length)} helper={section.primaryMarket} tone="accent" />
                <TeamMetric icon={ShoppingBag} label="قنوات بيع" value={String(section.channels.length)} helper="Omnichannel" tone="info" />
                <TeamMetric icon={CreditCard} label="تعدد العملات" value={section.multiCurrency ? "مفعل" : "متوقف"} helper="Pricing" tone={section.multiCurrency ? "success" : "warning"} />
                <TeamMetric icon={Building2} label="B2B" value={section.b2bChannel ? "متاح" : "مغلق"} helper="Wholesale" tone={section.b2bChannel ? "success" : "neutral"} />
              </div>
            </section>

            <SectionCard title="إعدادات السوق" description="السوق الأساسي والأسواق التي يستطيع العميل الشراء منها.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="السوق الأساسي" value={section.primaryMarket} onChange={(value) => updateSectionField(sectionKey, "primaryMarket", value)} />
                <ArrayField label="الأسواق المفعلة" values={section.enabledMarkets} onChange={(value) => updateSectionField(sectionKey, "enabledMarkets", value)} />
              </div>
            </SectionCard>

            <SectionCard title="خريطة الأسواق" description="عرض سريع للدول المفعلة وقابلية الدفع والشحن لكل سوق.">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.enabledMarkets.map((market, index) => (
                  <MarketCard key={market} market={market} primary={market === section.primaryMarket || index === 0} multiCurrency={section.multiCurrency} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="القنوات البيعية" description="كل قناة بيع تظهر بشكل مستقل ويمكن ربطها لاحقا بالمخزون والأسعار.">
              <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                <div className="grid gap-3">
                  {section.channels.map((channel, index) => (
                    <SalesChannelCard key={channel} channel={channel} index={index} />
                  ))}
                </div>
                <ArrayField label="تعديل القنوات البيعية" values={section.channels} onChange={(value) => updateSectionField(sectionKey, "channels", value)} />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <ToggleRow label="تعدد العملات" checked={section.multiCurrency} onChange={(value) => updateSectionField(sectionKey, "multiCurrency", value)} />
                <ToggleRow label="قناة B2B" checked={section.b2bChannel} onChange={(value) => updateSectionField(sectionKey, "b2bChannel", value)} />
              </div>
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <SectionCard title="جاهزية السوق" description="مراجعة سريعة قبل التوسع في القنوات.">
              <div className="space-y-3">
                <ReadinessItem label="سوق أساسي محدد" done={Boolean(section.primaryMarket)} />
                <ReadinessItem label="أكثر من سوق مفعل" done={section.enabledMarkets.length > 1} />
                <ReadinessItem label="قنوات بيع متعددة" done={section.channels.length >= 2} />
                <ReadinessItem label="منطق العملات جاهز" done={section.multiCurrency} />
                <ReadinessItem label="B2B مضبوط" done={section.b2bChannel} />
              </div>
            </SectionCard>
            <SectionCard title="سيناريوهات التشغيل" description="تأثير إعدادات الأسواق على المتجر.">
              <div className="space-y-3">
                <MarketScenario title="عميل من السوق الأساسي" text={`يرى ${section.primaryMarket} كاختيار افتراضي مع وسائل دفع وشحن محلية.`} />
                <MarketScenario title="عميل من سوق مضاف" text="يظهر السوق في محدد الدولة ويتم تطبيق إعداداته لاحقا من نظام الدفع." />
                <MarketScenario title="قناة B2B" text="يمكن فصل أسعار الجملة والعملاء التجاريين عند ربط الباك إند." />
              </div>
            </SectionCard>
          </aside>
        </div>
      );

    default:
      return (
        <EmptyState
          title="القسم غير متاح"
          text="لم يتم إعداد واجهة لهذا القسم بعد."
          action={
            <Link to="/admin/settings">
              <Button>العودة إلى الإعدادات</Button>
            </Link>
          }
        />
      );
  }
}

function SectionCard({ title, description, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function InfoPanel({ title, rows }) {
  return (
    <aside className="card h-fit p-5">
      <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <p className="text-xs font-bold text-slate-500">{label}</p>
            <p className="mt-2 break-all font-black text-slate-950 dark:text-white">{value}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

function TeamMetric({ icon: Icon, label, value, helper, tone = "accent" }) {
  const toneClass = {
    accent: "bg-indigo-500/10 text-accent",
    info: "bg-sky-500/10 text-sky-600",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    danger: "bg-red-500/10 text-red-600",
  }[tone];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${toneClass}`}>
          <Icon size={20} />
        </span>
        <Badge tone={tone === "danger" ? "danger" : tone === "warning" ? "warning" : tone === "success" ? "success" : "neutral"}>{helper}</Badge>
      </div>
      <p className="mt-4 text-xs font-black text-slate-500">{label}</p>
      <p className="mt-1 font-heading text-2xl font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function RoleMatrix({ roles }) {
  return (
    <div className="space-y-3">
      {roles.map((role, index) => (
        <div key={role} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Badge tone={index === 0 ? "accent" : index === 1 ? "info" : index === 2 ? "success" : "neutral"}>Role {index + 1}</Badge>
              <h3 className="mt-2 font-heading text-lg font-black text-slate-950 dark:text-white">{role}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">{getRoleDescription(role)}</p>
            </div>
            <Badge tone={index === 0 ? "success" : "neutral"}>{index === 0 ? "صلاحيات كاملة" : "صلاحيات محددة"}</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {getRolePermissions(role).map((permission) => (
              <PermissionPill key={permission}>{permission}</PermissionPill>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PermissionPill({ children }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-900 dark:text-slate-300">{children}</span>;
}

function TeamInviteCard({ email, role, status }) {
  const inactive = status.includes("متوقفة");
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-500/10 text-accent">
          <Mail size={18} />
        </span>
        <Badge tone={inactive ? "warning" : "success"}>{status}</Badge>
      </div>
      <p className="mt-3 break-all font-black text-slate-950 dark:text-white">{email}</p>
      <p className="mt-1 text-sm font-bold text-slate-500">{role}</p>
    </div>
  );
}

function TeamMemberCard({ member }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">{member.initials}</div>
          <div>
            <h3 className="font-heading font-black text-slate-950 dark:text-white">{member.name}</h3>
            <p className="text-xs font-bold text-slate-500">{member.email}</p>
          </div>
        </div>
        <Badge tone={member.status === "نشط" ? "success" : "warning"}>{member.status}</Badge>
      </div>
      <div className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-3 text-sm dark:bg-slate-900/60">
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-slate-500">الدور</span>
          <span className="font-black text-slate-950 dark:text-white">{member.role}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-slate-500">آخر دخول</span>
          <span className="font-black text-slate-950 dark:text-white">{member.lastSeen}</span>
        </div>
      </div>
    </article>
  );
}

function AccessReadiness({ section }) {
  const checks = [
    ["بريد إداري صالح", section.adminEmail?.includes("@")],
    ["أكثر من 3 أدوار", section.roles.length >= 3],
    ["دعوات الموظفين مضبوطة", section.allowStaffInvites],
    ["2FA للمديرين", section.require2FAForManagers],
    ["تسجيل العمليات الحساسة", section.logSensitiveActions],
  ];
  const score = Math.round((checks.filter(([, done]) => done).length / checks.length) * 100);

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Security Readiness</p>
          <h2 className="mt-1 font-heading text-xl font-black text-slate-950 dark:text-white">جاهزية الوصول</h2>
        </div>
        <div className="grid h-16 w-16 place-items-center rounded-full border-8 border-indigo-200 text-sm font-black text-accent dark:border-indigo-950">{score}%</div>
      </div>
      <div className="mt-4 space-y-3">
        {checks.map(([label, done]) => (
          <ReadinessItem key={label} label={label} done={done} />
        ))}
      </div>
    </section>
  );
}

function TeamActivityItem({ icon: Icon, title, time, tone = "neutral" }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/60">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${tone === "warning" ? "bg-amber-500/10 text-amber-600" : "bg-indigo-500/10 text-accent"}`}>
        <Icon size={18} />
      </span>
      <span>
        <span className="block text-sm font-black text-slate-950 dark:text-white">{title}</span>
        <span className="mt-1 block text-xs font-bold text-slate-500">{time}</span>
      </span>
    </div>
  );
}

function buildTeamMembers(section) {
  const roles = section.roles.length ? section.roles : ["مدير عام"];
  return [
    { name: section.ownerName || "مالك الحساب", email: section.adminEmail || "admin@sila.store", role: roles[0], initials: "MC", status: "نشط", lastSeen: "الآن" },
    { name: "سارة أحمد", email: "ops@sila.store", role: roles[1] || roles[0], initials: "SA", status: "نشط", lastSeen: "منذ 8 دقائق" },
    { name: "محمد علي", email: "store@sila.store", role: roles[2] || roles[0], initials: "MA", status: "نشط", lastSeen: "اليوم" },
    { name: "ليلى حسن", email: "finance@sila.store", role: roles[3] || roles[0], initials: "LH", status: "معلق", lastSeen: "أمس" },
    { name: "دعم العملاء", email: "support@sila.store", role: "دعم العملاء", initials: "CS", status: "نشط", lastSeen: "منذ ساعة" },
    { name: "فريق التسويق", email: "marketing@sila.store", role: "التسويق", initials: "MK", status: "نشط", lastSeen: "اليوم" },
  ];
}

function getRoleDescription(role) {
  if (role.includes("عام")) return "إدارة كاملة لكل أقسام المتجر، الإعدادات، المدفوعات، والتقارير.";
  if (role.includes("عمليات")) return "متابعة الطلبات، الشحن، المخزون، وسير العمل اليومي.";
  if (role.includes("محاسب")) return "الوصول للفواتير، المدفوعات، الضرائب، والتسويات المالية.";
  if (role.includes("متجر")) return "إدارة المنتجات، التصنيفات، العروض، وواجهة المتجر.";
  return "دور مخصص يمكن ضبط صلاحياته حسب احتياج الفريق.";
}

function getRolePermissions(role) {
  if (role.includes("عام")) return ["كل الصلاحيات", "الإعدادات", "الدفع", "المستخدمين", "التقارير"];
  if (role.includes("عمليات")) return ["الطلبات", "الشحن", "المخزون", "العملاء"];
  if (role.includes("محاسب")) return ["المدفوعات", "الفواتير", "الضرائب", "التقارير"];
  if (role.includes("متجر")) return ["المنتجات", "التصنيفات", "العروض", "الثيمات"];
  return ["قراءة", "تعديل محدود", "سجل النشاط"];
}

function countActiveNotifications(section) {
  return ["newOrders", "failedPayments", "lowStock", "securityAlerts", "weeklyDigest", "customerMessages"].filter((key) => section[key]).length;
}

function NotificationRuleCard({ icon: Icon, title, text, checked, onChange }) {
  return (
    <div className={`rounded-3xl border p-4 transition ${checked ? "border-indigo-200 bg-indigo-500/5 dark:border-indigo-900" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"}`}>
      <div className="flex items-start justify-between gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${checked ? "bg-indigo-500/10 text-accent" : "bg-slate-100 text-slate-500 dark:bg-slate-900"}`}>
          <Icon size={20} />
        </span>
        <ToggleSwitch checked={checked} onChange={onChange} label={title} />
      </div>
      <h3 className="mt-4 font-heading text-lg font-black text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <Badge tone={checked ? "success" : "neutral"}>{checked ? "مفعل" : "متوقف"}</Badge>
        <span className="text-xs font-bold text-slate-400">Real-time ready</span>
      </div>
    </div>
  );
}

function NotificationChannelCard({ icon: Icon, title, text, status, tone }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-accent dark:bg-slate-900">
          <Icon size={19} />
        </span>
        <div className="min-w-0">
          <h3 className="font-heading font-black text-slate-950 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
        </div>
      </div>
      <Badge tone={tone}>{status}</Badge>
    </div>
  );
}

function NotificationTemplateCard({ title, subject, audience, enabled }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-500/10 text-accent">
          <Mail size={18} />
        </span>
        <Badge tone={enabled ? "success" : "neutral"}>{enabled ? "نشط" : "متوقف"}</Badge>
      </div>
      <h3 className="mt-4 font-heading text-lg font-black text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-600 dark:text-slate-300">{subject}</p>
      <p className="mt-3 text-xs font-black text-slate-400">المستلم: {audience}</p>
    </article>
  );
}

function NotificationFlowStep({ number, title, text }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-600 text-sm font-black text-white">{number}</span>
      <span>
        <span className="block font-black text-slate-950 dark:text-white">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-500">{text}</span>
      </span>
    </div>
  );
}

function NotificationLogItem({ icon: Icon, title, channel, time, tone = "neutral" }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${tone === "danger" ? "bg-red-500/10 text-red-600" : tone === "warning" ? "bg-amber-500/10 text-amber-600" : tone === "success" ? "bg-emerald-500/10 text-emerald-600" : "bg-indigo-500/10 text-accent"}`}>
          <Icon size={18} />
        </span>
        <span className="min-w-0">
          <span className="block font-black text-slate-950 dark:text-white">{title}</span>
          <span className="mt-1 block text-xs font-bold text-slate-500">{channel} · {time}</span>
        </span>
      </div>
    </div>
  );
}

function countEnabledEmailTemplates(section) {
  return ["orderConfirmation", "shippingUpdate", "refundNotice", "abandonedCartEmail"].filter((key) => section[key]).length;
}

function EmailScenarioCard({ icon: Icon, title, text, checked, onChange }) {
  return (
    <div className={`rounded-3xl border p-4 transition ${checked ? "border-indigo-200 bg-indigo-500/5 dark:border-indigo-900" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"}`}>
      <div className="flex items-start justify-between gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${checked ? "bg-indigo-500/10 text-accent" : "bg-slate-100 text-slate-500 dark:bg-slate-900"}`}>
          <Icon size={20} />
        </span>
        <ToggleSwitch checked={checked} onChange={onChange} label={title} />
      </div>
      <h3 className="mt-4 font-heading text-lg font-black text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function EmailPreviewCard({ title, subtitle, body, footer }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="bg-gradient-to-l from-indigo-600 to-violet-600 p-4 text-white">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">SILA Mail</p>
        <h3 className="mt-2 font-heading text-xl font-black">{title}</h3>
        <p className="mt-1 text-sm text-white/75">{subtitle}</p>
      </div>
      <div className="p-4">
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{body}</p>
        <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs leading-6 text-slate-500 dark:bg-slate-900/60">{footer}</div>
      </div>
    </article>
  );
}

function EmailDeliverabilityCard({ section }) {
  const ready = section.senderEmail?.includes("@") && section.senderName && countEnabledEmailTemplates(section) >= 2;
  return (
    <section className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Deliverability</p>
          <h2 className="mt-1 font-heading text-xl font-black text-slate-950 dark:text-white">جاهزية البريد</h2>
        </div>
        <Badge tone={ready ? "success" : "warning"}>{ready ? "جاهز" : "راجع"}</Badge>
      </div>
      <div className="mt-4 space-y-3">
        <ReadinessItem label="اسم مرسل واضح" done={Boolean(section.senderName)} />
        <ReadinessItem label="بريد مرسل صالح" done={section.senderEmail?.includes("@")} />
        <ReadinessItem label="قالبين على الأقل مفعلين" done={countEnabledEmailTemplates(section) >= 2} />
        <ReadinessItem label="تذييل قانوني موجود" done={String(section.footerText || "").length > 30} />
      </div>
    </section>
  );
}

function NavigationList({ title, items }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between gap-3">
        <Badge tone="accent">{title}</Badge>
        <span className="text-xs font-black text-slate-400">{items.length} روابط</span>
      </div>
      <div className="mt-4 grid gap-2">
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 dark:bg-slate-950 dark:text-slate-200">
            <span>{item}</span>
            <span className="text-xs text-slate-400">#{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureToggleCard({ icon: Icon, title, text, checked, onChange }) {
  return (
    <div className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500/10 text-accent">
          <Icon size={19} />
        </span>
        <ToggleSwitch checked={checked} onChange={onChange} label={title} />
      </div>
      <h3 className="mt-4 font-heading font-black text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function NavigationPreview({ section }) {
  return (
    <section className="card p-5">
      <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">معاينة المتجر</h2>
      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <span className="font-heading font-black text-slate-950 dark:text-white">SILA</span>
          <span className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
          </span>
        </div>
        <div className="flex flex-wrap gap-2 p-4">
          {section.headerLinks.map((item) => (
            <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-900 dark:text-slate-300">{item}</span>
          ))}
        </div>
        <div className="grid gap-2 bg-slate-50 p-4 dark:bg-slate-900/60">
          {section.showSearch ? <span className="rounded-2xl bg-white px-4 py-2 text-xs font-bold text-slate-400 dark:bg-slate-950">بحث في المنتجات...</span> : null}
          {section.showMegaMenu ? <span className="rounded-2xl border border-indigo-200 px-4 py-2 text-xs font-black text-accent dark:border-indigo-900">Mega Menu جاهز</span> : null}
        </div>
      </div>
    </section>
  );
}

function PolicySummaryCard({ title, text }) {
  const length = String(text || "").trim().length;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-500/10 text-accent">
          <Building2 size={18} />
        </span>
        <Badge tone={length > 40 ? "success" : "warning"}>{length > 40 ? "مكتملة" : "قصيرة"}</Badge>
      </div>
      <h3 className="mt-4 font-heading text-lg font-black text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-xs font-bold text-slate-500">{length} حرف</p>
    </div>
  );
}

function PolicyPreviewCard({ title, text }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-3 line-clamp-4 text-sm leading-7 text-slate-500">{text}</p>
      <button type="button" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-accent">
        عرض الصفحة
        <ExternalLink size={15} />
      </button>
    </article>
  );
}

function PolicyPlacement({ icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-500/10 text-accent">
        <Icon size={18} />
      </span>
      <span>
        <span className="block font-black text-slate-950 dark:text-white">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-500">{text}</span>
      </span>
    </div>
  );
}

function MarketCard({ market, primary, multiCurrency }) {
  const currency = market.includes("السعود") ? "SAR" : market.includes("إمارات") ? "AED" : market.includes("كويت") ? "KWD" : market.includes("بحرين") ? "BHD" : "Local";
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500/10 text-accent">
          <Globe2 size={19} />
        </span>
        <Badge tone={primary ? "accent" : "success"}>{primary ? "أساسي" : "مفعل"}</Badge>
      </div>
      <h3 className="mt-4 font-heading text-lg font-black text-slate-950 dark:text-white">{market}</h3>
      <div className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <span className="font-bold text-slate-500">العملة</span>
          <span className="font-black text-slate-950 dark:text-white">{multiCurrency ? currency : "عملة المتجر"}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="font-bold text-slate-500">الدفع</span>
          <span className="font-black text-emerald-600">جاهز</span>
        </div>
      </div>
    </article>
  );
}

function SalesChannelCard({ channel, index }) {
  const icons = [ShoppingBag, Users, Mail, Store];
  const Icon = icons[index % icons.length];
  return (
    <div className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-500/10 text-accent">
          <Icon size={19} />
        </span>
        <span>
          <span className="block font-heading font-black text-slate-950 dark:text-white">{channel}</span>
          <span className="mt-1 block text-sm text-slate-500">قناة بيع رقم {index + 1}</span>
        </span>
      </div>
      <Badge tone="success">نشطة</Badge>
    </div>
  );
}

function MarketScenario({ title, text }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
      <p className="font-black text-slate-950 dark:text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function DomainStatusCard({ title, domain, type, active }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-white p-3 text-accent dark:bg-slate-950">
          <Globe2 size={20} />
        </div>
        <Badge tone={active ? "success" : "warning"}>{active ? "متصل" : "غير مضبوط"}</Badge>
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{type}</p>
      <h3 className="mt-1 font-heading text-lg font-black text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 break-all text-sm font-bold text-slate-500">{domain || "لم يتم تحديد النطاق"}</p>
    </div>
  );
}

function DnsRecord({ type, host, value }) {
  const record = `${type} ${host} ${value}`;
  const copy = () => navigator.clipboard?.writeText(record);

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:grid-cols-[90px_1fr_1.4fr_auto] sm:items-center">
      <Badge tone="accent">{type}</Badge>
      <div>
        <p className="text-xs font-bold text-slate-500">Host</p>
        <p className="mt-1 break-all font-black text-slate-950 dark:text-white">{host}</p>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500">Value</p>
        <p className="mt-1 break-all font-black text-slate-950 dark:text-white">{value}</p>
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={copy}>
        <Copy size={15} />
        نسخ
      </Button>
    </div>
  );
}

function ReadinessItem({ label, done }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${done ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
        {done ? <CheckCircle2 size={17} /> : <Server size={17} />}
      </span>
    </div>
  );
}

function DomainLink({ label, domain }) {
  const href = domain ? `https://${domain}` : "";
  return (
    <a
      href={href || undefined}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-black transition ${
        domain
          ? "border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-accent dark:border-slate-800 dark:text-slate-200"
          : "pointer-events-none border-slate-200 text-slate-400 dark:border-slate-800"
      }`}
    >
      <span>{label}</span>
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate">{domain || "غير مضبوط"}</span>
        {domain ? <ExternalLink size={15} /> : null}
      </span>
    </a>
  );
}

function SeoScore({ section }) {
  const titleOk = isWithin(section.homeTitle, 35, 60);
  const descriptionOk = isWithin(section.metaDescription, 120, 160);
  const keywordsOk = parseKeywords(section.keywords).length >= 4;
  const imageOk = Boolean(section.ogImage);
  const indexOk = Boolean(section.robotsIndex);
  const score = [titleOk, descriptionOk, keywordsOk, imageOk, indexOk].filter(Boolean).length * 20;

  return (
    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">SEO Score</p>
          <p className="mt-1 font-heading text-4xl font-black text-slate-950 dark:text-white">{score}%</p>
        </div>
        <div className="grid h-20 w-20 place-items-center rounded-full border-8 border-indigo-200 text-lg font-black text-accent dark:border-indigo-950">
          {score}
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        <MiniCheck label="عنوان مناسب" done={titleOk} />
        <MiniCheck label="وصف مناسب" done={descriptionOk} />
        <MiniCheck label="كلمات مفتاحية" done={keywordsOk} />
      </div>
    </div>
  );
}

function SeoLengthMeter({ label, value, min, max }) {
  const length = String(value || "").trim().length;
  const percentage = Math.min(100, Math.round((length / max) * 100));
  const valid = length >= min && length <= max;

  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-black text-slate-700 dark:text-slate-200">{label}</span>
        <span className={valid ? "font-black text-emerald-600" : "font-black text-amber-600"}>
          {length}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className={`h-full rounded-full ${valid ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${percentage}%` }} />
      </div>
      <p className="mt-2 text-xs font-bold text-slate-500">
        النطاق المثالي: {min} - {max} حرف.
      </p>
    </div>
  );
}

function KeywordChips({ value }) {
  const keywords = parseKeywords(value);
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.length ? (
        keywords.map((keyword) => (
          <span key={keyword} className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-black text-accent">
            {keyword}
          </span>
        ))
      ) : (
        <span className="text-sm font-bold text-slate-500">اكتب الكلمات مفصولة بفواصل.</span>
      )}
    </div>
  );
}

function SeoChecklistItem({ label, text, done }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-slate-950 dark:text-white">{label}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
        </div>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${done ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
          {done ? <CheckCircle2 size={17} /> : <Server size={17} />}
        </span>
      </div>
    </div>
  );
}

function SeoTip({ icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
      <span className="rounded-2xl bg-white p-3 text-accent dark:bg-slate-950">
        <Icon size={18} />
      </span>
      <span>
        <span className="block font-black text-slate-950 dark:text-white">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-500">{text}</span>
      </span>
    </div>
  );
}

function MiniCheck({ label, done }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm font-bold">
      <span className="text-slate-500">{label}</span>
      <span className={done ? "text-emerald-600" : "text-amber-600"}>{done ? "مكتمل" : "راجع"}</span>
    </div>
  );
}

function parseKeywords(value) {
  return String(value || "")
    .split(/[,\n،]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isWithin(value, min, max) {
  const length = String(value || "").trim().length;
  return length >= min && length <= max;
}

function Field({ label, value, onChange, type = "text", className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      />
    </label>
  );
}

function normalizeDomain(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({ label, value, onChange, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      />
    </label>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <ToggleSwitch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function ArrayField({ label, values, onChange, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <textarea
        value={values.join("\n")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean)
          )
        }
        className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      />
      <p className="mt-2 text-xs text-slate-500">عنصر واحد في كل سطر.</p>
    </label>
  );
}

function ShippingSection({ section, updateSectionField, replaceSection }) {
  const providers = section.providers || [];
  const zones = section.zones || [];
  const defaultProvider = providers.find((provider) => provider.id === section.defaultProviderId) || providers[0];

  const updateProvider = (providerId, updater) => {
    replaceSection("shipping", {
      ...section,
      providers: providers.map((provider) => (provider.id === providerId ? updater(provider) : provider)),
    });
  };

  const setProviderStatus = (providerId, status) => {
    updateProvider(providerId, (provider) => ({
      ...provider,
      status,
      enabled: status === "connected" ? true : provider.enabled,
    }));
  };

  const updateZone = (zoneId, field, value) => {
    replaceSection("shipping", {
      ...section,
      zones: zones.map((zone) => (zone.id === zoneId ? { ...zone, [field]: value } : zone)),
    });
  };

  return (
    <div className="space-y-6">
      <SectionCard title="إعدادات الشحن والتوصيل" description="تهيئة المستودع، رسوم الشحن، وربط مزودات الشحن من مكان واحد.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="مدينة المستودع" value={section.warehouseCity} onChange={(value) => updateSectionField("shipping", "warehouseCity", value)} />
          <Field label="زمن التجهيز" value={section.preparationTime} onChange={(value) => updateSectionField("shipping", "preparationTime", value)} />
          <Field label="حد الشحن المجاني" value={section.freeShippingThreshold} onChange={(value) => updateSectionField("shipping", "freeShippingThreshold", value)} />
          <Field label="رسوم الشحن القياسي" value={section.standardFee} onChange={(value) => updateSectionField("shipping", "standardFee", value)} />
          <Field label="رسوم الشحن السريع" value={section.expressFee} onChange={(value) => updateSectionField("shipping", "expressFee", value)} />
          <SelectField
            label="المزود الافتراضي"
            value={section.defaultProviderId}
            options={providers.map((provider) => provider.id)}
            onChange={(value) => {
              updateSectionField("shipping", "defaultProviderId", value);
              const provider = providers.find((item) => item.id === value);
              if (provider) {
                updateSectionField("shipping", "standardProvider", provider.name);
              }
            }}
          />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="رابط التتبع الأساسي" value={section.trackingBaseUrl} onChange={(value) => updateSectionField("shipping", "trackingBaseUrl", value)} />
          <ToggleRow label="تفعيل الاستلام من الفرع" checked={section.pickupEnabled} onChange={(value) => updateSectionField("shipping", "pickupEnabled", value)} />
        </div>
      </SectionCard>

      <SectionCard title="شركات الشحن" description="ربط الشركات وتفعيل الخدمات بدون تعقيد في الإعداد أو الصيانة.">
        <div className="grid gap-4 xl:grid-cols-3">
          {providers.map((provider) => (
            <div key={provider.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <PlugZap size={18} />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-black text-slate-950 dark:text-white">{provider.name}</p>
                    <p className="text-xs font-bold text-slate-500">{provider.code}</p>
                  </div>
                </div>
                <Badge tone={provider.status === "connected" ? "success" : provider.status === "pending" ? "warning" : "neutral"}>
                  {provider.status === "connected" ? "مرتبط" : provider.status === "pending" ? "قيد التهيئة" : "غير مرتبط"}
                </Badge>
              </div>

              <div className="mt-4 grid gap-3">
                <Field label="API Key" value={provider.apiKey} onChange={(value) => updateProvider(provider.id, (current) => ({ ...current, apiKey: value }))} />
                <Field label="رقم الحساب" value={provider.accountNumber} onChange={(value) => updateProvider(provider.id, (current) => ({ ...current, accountNumber: value }))} />
                <Field label="Webhook Secret" value={provider.webhookSecret} onChange={(value) => updateProvider(provider.id, (current) => ({ ...current, webhookSecret: value }))} />
                <Field label="رابط التتبع" value={provider.trackingUrl} onChange={(value) => updateProvider(provider.id, (current) => ({ ...current, trackingUrl: value }))} />
              </div>

              <div className="mt-4 grid gap-3">
                {provider.services.map((service) => (
                  <div key={service.key} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-slate-950 dark:text-white">{service.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{service.eta} · {service.fee}</p>
                      </div>
                      <ToggleSwitch
                        checked={service.enabled}
                        onChange={(next) =>
                          updateProvider(provider.id, (current) => ({
                            ...current,
                            services: current.services.map((item) => (item.key === service.key ? { ...item, enabled: next } : item)),
                          }))
                        }
                        label={service.label}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setProviderStatus(provider.id, "pending")}>اختبار الربط</Button>
                <Button onClick={() => setProviderStatus(provider.id, "connected")}>ربط الشركة</Button>
                <Button variant="secondary" onClick={() => updateProvider(provider.id, (current) => ({ ...current, sandbox: !current.sandbox }))}>
                  {provider.sandbox ? "وضع تجريبي" : "وضع حي"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="المناطق والخدمات" description="ربط كل منطقة جغرافية بخدمة شحن محددة ومزود واضح.">
        <div className="grid gap-4">
          {zones.map((zone) => {
            const provider = providers.find((item) => item.id === zone.providerId) || defaultProvider;
            const serviceOptions = (provider?.services || []).map((service) => service.key);

            return (
              <div key={zone.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr_.9fr_.7fr_auto]">
                  <Field label="اسم المنطقة" value={zone.name} onChange={(value) => updateZone(zone.id, "name", value)} />
                  <Field label="المدن" value={zone.cities.join("، ")} onChange={(value) => updateZone(zone.id, "cities", value.split("،").map((item) => item.trim()).filter(Boolean))} />
                  <SelectField label="شركة الشحن" value={zone.providerId} options={providers.map((providerItem) => providerItem.id)} onChange={(value) => updateZone(zone.id, "providerId", value)} />
                  <SelectField label="الخدمة" value={zone.serviceKey} options={serviceOptions.length ? serviceOptions : ["standard"]} onChange={(value) => updateZone(zone.id, "serviceKey", value)} />
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <Field label="الرسوم" value={zone.fee} onChange={(value) => updateZone(zone.id, "fee", value)} />
                    <ToggleRow label="الدفع عند الاستلام" checked={zone.cod} onChange={(value) => updateZone(zone.id, "cod", value)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

function MessageIcon(props) {
  return <LifeBuoy {...props} />;
}
