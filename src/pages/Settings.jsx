import {
  ArrowLeft,
  BellRing,
  Building2,
  CreditCard,
  Globe2,
  LayoutTemplate,
  LifeBuoy,
  LockKeyhole,
  Mail,
  MapPinned,
  Network,
  Palette,
  PlugZap,
  Receipt,
  Scale,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Users,
  Webhook,
} from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
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
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <SectionCard title="الفريق والصلاحيات" description="إدارة المستخدمين ذوي الصلاحية داخل النظام.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="اسم مالك الحساب" value={section.ownerName} onChange={(value) => updateSectionField(sectionKey, "ownerName", value)} />
              <Field label="بريد الإدارة" type="email" value={section.adminEmail} onChange={(value) => updateSectionField(sectionKey, "adminEmail", value)} />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ToggleRow label="السماح بدعوات الموظفين" checked={section.allowStaffInvites} onChange={(value) => updateSectionField(sectionKey, "allowStaffInvites", value)} />
              <ToggleRow label="إلزام 2FA للمديرين" checked={section.require2FAForManagers} onChange={(value) => updateSectionField(sectionKey, "require2FAForManagers", value)} />
              <ToggleRow label="تسجيل العمليات الحساسة" checked={section.logSensitiveActions} onChange={(value) => updateSectionField(sectionKey, "logSensitiveActions", value)} />
            </div>
            <ArrayField label="الأدوار المعتمدة" values={section.roles} onChange={(value) => updateSectionField(sectionKey, "roles", value)} />
          </SectionCard>
          <InfoPanel title="مستوى الوصول" rows={[["المسار", "/admin/settings/team"], ["الأدوار الحالية", String(section.roles.length)], ["البريد الإداري", section.adminEmail]]} />
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
        <SectionCard title="النطاقات" description="إدارة النطاقات الخاصة بالمتجر والدفع والإدارة.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="النطاق الأساسي" value={section.primaryDomain} onChange={(value) => updateSectionField(sectionKey, "primaryDomain", value)} />
            <Field label="نطاق الدفع" value={section.checkoutDomain} onChange={(value) => updateSectionField(sectionKey, "checkoutDomain", value)} />
            <Field label="نطاق الإدارة" value={section.adminDomain} onChange={(value) => updateSectionField(sectionKey, "adminDomain", value)} />
            <Field label="حالة SSL" value={section.sslStatus} onChange={(value) => updateSectionField(sectionKey, "sslStatus", value)} />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ToggleRow label="فرض HTTPS" checked={section.forceHttps} onChange={(value) => updateSectionField(sectionKey, "forceHttps", value)} />
            <ToggleRow label="إعادة توجيه www" checked={section.redirectWww} onChange={(value) => updateSectionField(sectionKey, "redirectWww", value)} />
          </div>
        </SectionCard>
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
        <SectionCard title="الإشعارات" description="الرسائل والتنبيهات المرتبطة بالطلبات والمخزون والحماية.">
          <div className="grid gap-4 md:grid-cols-2">
            <ToggleRow label="تنبيهات الطلبات الجديدة" checked={section.newOrders} onChange={(value) => updateSectionField(sectionKey, "newOrders", value)} />
            <ToggleRow label="فشل عمليات الدفع" checked={section.failedPayments} onChange={(value) => updateSectionField(sectionKey, "failedPayments", value)} />
            <ToggleRow label="تنبيهات المخزون المنخفض" checked={section.lowStock} onChange={(value) => updateSectionField(sectionKey, "lowStock", value)} />
            <ToggleRow label="التنبيهات الأمنية" checked={section.securityAlerts} onChange={(value) => updateSectionField(sectionKey, "securityAlerts", value)} />
            <ToggleRow label="ملخص أسبوعي" checked={section.weeklyDigest} onChange={(value) => updateSectionField(sectionKey, "weeklyDigest", value)} />
            <ToggleRow label="رسائل العملاء" checked={section.customerMessages} onChange={(value) => updateSectionField(sectionKey, "customerMessages", value)} />
          </div>
        </SectionCard>
      );

    case "emails":
      return (
        <SectionCard title="قوالب البريد" description="إعدادات الإرسال وسيناريوهات الرسائل الأساسية.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="اسم المرسل" value={section.senderName} onChange={(value) => updateSectionField(sectionKey, "senderName", value)} />
            <Field label="بريد المرسل" type="email" value={section.senderEmail} onChange={(value) => updateSectionField(sectionKey, "senderEmail", value)} />
            <TextAreaField className="md:col-span-2" label="تذييل القالب" value={section.footerText} onChange={(value) => updateSectionField(sectionKey, "footerText", value)} />
            <ToggleRow label="رسالة تأكيد الطلب" checked={section.orderConfirmation} onChange={(value) => updateSectionField(sectionKey, "orderConfirmation", value)} />
            <ToggleRow label="تحديثات الشحن" checked={section.shippingUpdate} onChange={(value) => updateSectionField(sectionKey, "shippingUpdate", value)} />
            <ToggleRow label="إشعارات الاسترجاع" checked={section.refundNotice} onChange={(value) => updateSectionField(sectionKey, "refundNotice", value)} />
            <ToggleRow label="رسائل السلة المتروكة" checked={section.abandonedCartEmail} onChange={(value) => updateSectionField(sectionKey, "abandonedCartEmail", value)} />
          </div>
        </SectionCard>
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
        <SectionCard title="التنقل والقوائم" description="روابط الهيدر والفوتر والعناصر الظاهرة في واجهة المتجر.">
          <ArrayField label="روابط الهيدر" values={section.headerLinks} onChange={(value) => updateSectionField(sectionKey, "headerLinks", value)} />
          <ArrayField label="روابط الفوتر" values={section.footerLinks} onChange={(value) => updateSectionField(sectionKey, "footerLinks", value)} />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <ToggleRow label="إظهار Mega Menu" checked={section.showMegaMenu} onChange={(value) => updateSectionField(sectionKey, "showMegaMenu", value)} />
            <ToggleRow label="إظهار البحث" checked={section.showSearch} onChange={(value) => updateSectionField(sectionKey, "showSearch", value)} />
            <ToggleRow label="إظهار المفضلة" checked={section.showWishlist} onChange={(value) => updateSectionField(sectionKey, "showWishlist", value)} />
          </div>
        </SectionCard>
      );

    case "seo":
      return (
        <SectionCard title="تحسين الظهور" description="بيانات العنوان والوصف والفهرسة الافتراضية للمتجر.">
          <div className="grid gap-4">
            <Field label="عنوان الصفحة الرئيسية" value={section.homeTitle} onChange={(value) => updateSectionField(sectionKey, "homeTitle", value)} />
            <TextAreaField label="الوصف التعريفي" value={section.metaDescription} onChange={(value) => updateSectionField(sectionKey, "metaDescription", value)} />
            <TextAreaField label="الكلمات المفتاحية" value={section.keywords} onChange={(value) => updateSectionField(sectionKey, "keywords", value)} />
            <Field label="Open Graph Image" value={section.ogImage} onChange={(value) => updateSectionField(sectionKey, "ogImage", value)} />
            <ToggleRow label="السماح بالفهرسة" checked={section.robotsIndex} onChange={(value) => updateSectionField(sectionKey, "robotsIndex", value)} />
          </div>
        </SectionCard>
      );

    case "policies":
      return (
        <SectionCard title="السياسات" description="النصوص الرسمية الظاهرة للعملاء أثناء الشراء وبعده.">
          <div className="grid gap-4">
            <TextAreaField label="سياسة الشحن" value={section.shippingPolicy} onChange={(value) => updateSectionField(sectionKey, "shippingPolicy", value)} />
            <TextAreaField label="سياسة الإرجاع" value={section.returnPolicy} onChange={(value) => updateSectionField(sectionKey, "returnPolicy", value)} />
            <TextAreaField label="سياسة الخصوصية" value={section.privacyPolicy} onChange={(value) => updateSectionField(sectionKey, "privacyPolicy", value)} />
            <TextAreaField label="سياسة الضمان" value={section.warrantyPolicy} onChange={(value) => updateSectionField(sectionKey, "warrantyPolicy", value)} />
          </div>
        </SectionCard>
      );

    case "markets":
      return (
        <SectionCard title="الأسواق والقنوات" description="الدول والقنوات والعملة المتاحة لعمليات البيع.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="السوق الأساسي" value={section.primaryMarket} onChange={(value) => updateSectionField(sectionKey, "primaryMarket", value)} />
            <ArrayField label="الأسواق المفعلة" values={section.enabledMarkets} onChange={(value) => updateSectionField(sectionKey, "enabledMarkets", value)} />
            <ArrayField className="md:col-span-2" label="القنوات البيعية" values={section.channels} onChange={(value) => updateSectionField(sectionKey, "channels", value)} />
            <ToggleRow label="تعدد العملات" checked={section.multiCurrency} onChange={(value) => updateSectionField(sectionKey, "multiCurrency", value)} />
            <ToggleRow label="قناة B2B" checked={section.b2bChannel} onChange={(value) => updateSectionField(sectionKey, "b2bChannel", value)} />
          </div>
        </SectionCard>
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
