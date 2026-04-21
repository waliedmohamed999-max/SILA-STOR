import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "./ToastContext";

const SettingsContext = createContext(null);
const storageKey = "sila-settings";

const initialSettings = {
  "store-profile": {
    storeName: "سيلا | SILA",
    legalName: "شركة سيلا للتجارة الإلكترونية",
    supportEmail: "support@sila.store",
    salesEmail: "sales@sila.store",
    phone: "+966 55 800 4400",
    vatNumber: "310231845600003",
    registration: "1010923441",
    description: "سوق إلكتروني احترافي لبيع الإلكترونيات والملحقات مع إدارة موحدة للمبيعات والطلبات.",
    logoText: "SILA",
  },
  billing: {
    currency: "SAR",
    currencySymbol: "ر.س",
    timezone: "Asia/Riyadh",
    taxRate: "15",
    invoicePrefix: "INV-SILA",
    orderPrefix: "ORD-SILA",
    includeTax: true,
    roundPrices: true,
  },
  team: {
    ownerName: "مالك الحساب",
    adminEmail: "admin@sila.store",
    allowStaffInvites: true,
    require2FAForManagers: true,
    logSensitiveActions: true,
    roles: ["مدير عام", "مدير عمليات", "مدير متجر", "محاسب"],
  },
  shipping: {
    warehouseCity: "الرياض",
    preparationTime: "1-2 يوم عمل",
    standardProvider: "SILA Express",
    expressProvider: "Fast Track",
    pickupEnabled: true,
    freeShippingThreshold: "500",
    standardFee: "12",
    expressFee: "25",
    defaultProviderId: "sila-express",
    trackingBaseUrl: "https://track.sila.store/{tracking_number}",
    providers: [
      {
        id: "sila-express",
        name: "SILA Express",
        code: "SILA",
        status: "connected",
        enabled: true,
        sandbox: false,
        apiKey: "sk_live_sila_shipping",
        accountNumber: "SILA-200145",
        webhookSecret: "whsec_sila_shipping",
        trackingUrl: "https://track.sila.store/{tracking_number}",
        services: [
          { key: "standard", label: "الشحن القياسي", eta: "2-4 أيام عمل", fee: "12", enabled: true },
          { key: "same_day", label: "في نفس اليوم", eta: "خلال 6 ساعات", fee: "35", enabled: true },
        ],
      },
      {
        id: "fast-track",
        name: "Fast Track",
        code: "FAST",
        status: "connected",
        enabled: true,
        sandbox: true,
        apiKey: "sk_test_fast_track",
        accountNumber: "FAST-44009",
        webhookSecret: "whsec_fast_track",
        trackingUrl: "https://fasttrack.example/track/{tracking_number}",
        services: [
          { key: "express", label: "الشحن السريع", eta: "24-48 ساعة", fee: "25", enabled: true },
        ],
      },
      {
        id: "aramex",
        name: "Aramex",
        code: "ARMX",
        status: "disconnected",
        enabled: false,
        sandbox: true,
        apiKey: "",
        accountNumber: "",
        webhookSecret: "",
        trackingUrl: "https://www.aramex.com/track/shipments/{tracking_number}",
        services: [
          { key: "international", label: "دولي اقتصادي", eta: "4-7 أيام", fee: "65", enabled: false },
        ],
      },
    ],
    zones: [
      { id: "central", name: "المنطقة الوسطى", cities: ["الرياض", "الخرج"], providerId: "sila-express", serviceKey: "same_day", fee: "25", cod: true },
      { id: "west", name: "المنطقة الغربية", cities: ["جدة", "مكة", "المدينة"], providerId: "fast-track", serviceKey: "express", fee: "25", cod: true },
      { id: "gcc", name: "دول الخليج", cities: ["دبي", "الكويت", "المنامة"], providerId: "aramex", serviceKey: "international", fee: "65", cod: false },
    ],
  },
  checkout: {
    guestCheckout: true,
    cashOnDelivery: true,
    autoCapture: false,
    requirePhone: true,
    requireAddressLine2: false,
    orderNoteEnabled: true,
    abandonedCartRecovery: true,
  },
  taxes: {
    vatEnabled: true,
    vatLabel: "ضريبة القيمة المضافة",
    vatRate: "15",
    pricesIncludeVat: true,
    showTaxBreakdown: true,
    invoiceFooter: "الأسعار تشمل ضريبة القيمة المضافة حيث ينطبق ذلك.",
  },
  domains: {
    primaryDomain: "sila.store",
    checkoutDomain: "checkout.sila.store",
    adminDomain: "admin.sila.store",
    forceHttps: true,
    redirectWww: true,
    sslStatus: "نشط",
  },
  security: {
    twoFactor: true,
    sessionTimeout: "30",
    trustedDevices: true,
    passwordRotation: false,
    loginAlerts: true,
    ipAllowlist: "192.168.1.15, 10.10.0.0/24",
  },
  integrations: {
    analyticsId: "G-8SILA54R1",
    metaPixel: "341209884552100",
    webhookUrl: "https://hooks.sila.store/orders",
    apiAccess: true,
    erpSync: false,
    marketingSync: true,
  },
  localization: {
    defaultLanguage: "ar",
    secondaryLanguage: "en",
    locale: "ar-SA",
    dateFormat: "DD/MM/YYYY",
    weekStartsOn: "Saturday",
    defaultCountry: "SA",
  },
  notifications: {
    newOrders: true,
    failedPayments: true,
    lowStock: true,
    securityAlerts: true,
    weeklyDigest: true,
    customerMessages: true,
  },
  emails: {
    senderName: "فريق سيلا",
    senderEmail: "no-reply@sila.store",
    orderConfirmation: true,
    shippingUpdate: true,
    refundNotice: true,
    abandonedCartEmail: true,
    footerText: "شكراً لاختياركم سيلا. لأي استفسار يمكن التواصل مع فريق الدعم.",
  },
  contact: {
    supportEmail: "help@sila.store",
    phone: "+966 11 400 9090",
    whatsapp: "+966558004400",
    liveChatUrl: "https://chat.sila.store",
    businessHours: "الأحد - الخميس | 9 ص - 10 م",
    helpCenter: "https://help.sila.store",
  },
  support: {
    liveChatEnabled: true,
    autoReply: true,
    firstResponseTarget: "15 دقيقة",
    resolutionTarget: "4 ساعات",
    escalationEmail: "care@sila.store",
    whatsappBotEnabled: true,
  },
  appearance: {
    adminTheme: "auto",
    storefrontTheme: "SILA Modern",
    accentColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    cardRadius: "16",
    compactDensity: false,
  },
  navigation: {
    headerLinks: ["الرئيسية", "المتجر", "الأكثر مبيعاً", "العروض", "الدعم"],
    footerLinks: ["من نحن", "الشحن", "الاسترجاع", "الخصوصية", "تواصل معنا"],
    showMegaMenu: true,
    showSearch: true,
    showWishlist: false,
  },
  seo: {
    homeTitle: "سيلا | متجر إلكترونيات احترافي",
    metaDescription: "تسوق أحدث الهواتف واللابتوبات والكاميرات والملحقات من سيلا مع شحن سريع ودعم موثوق.",
    keywords: "سيلا, متجر إلكترونيات, هواتف, لابتوبات, كاميرات, ملحقات",
    ogImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
    robotsIndex: true,
  },
  policies: {
    shippingPolicy: "يتم تجهيز الطلبات خلال 1-2 يوم عمل، وتظهر المدة المتوقعة عند إتمام الشراء.",
    returnPolicy: "يمكن طلب الإرجاع خلال 14 يوماً للمنتجات المؤهلة بحالتها الأصلية.",
    privacyPolicy: "نلتزم بحماية بيانات العميل واستخدامها فقط لخدمة الطلبات وتحسين التجربة.",
    warrantyPolicy: "تطبق الضمانات الرسمية حسب الشركة المصنعة وفئة المنتج.",
  },
  markets: {
    primaryMarket: "السعودية",
    enabledMarkets: ["السعودية", "الإمارات", "الكويت", "البحرين"],
    channels: ["المتجر الإلكتروني", "المبيعات المباشرة", "واتساب بزنس"],
    multiCurrency: false,
    b2bChannel: true,
  },
};

export function SettingsProvider({ children }) {
  const { showToast } = useToast();
  const [settings, setSettings] = useState(() => readStorage(storageKey, initialSettings));

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings]);

  const updateSectionField = (section, field, value) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const replaceSection = (section, nextValue) => {
    setSettings((current) => ({
      ...current,
      [section]: nextValue,
    }));
  };

  const saveSection = (section) => {
    showToast("تم حفظ الإعدادات", `تم تحديث قسم ${sectionLabel(section)} بنجاح.`, "success");
  };

  const value = useMemo(
    () => ({
      settings,
      updateSectionField,
      replaceSection,
      saveSection,
    }),
    [settings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function sectionLabel(section) {
  return (
    {
      "store-profile": "معلومات المتجر",
      billing: "الفوترة والعملات",
      team: "الفريق والصلاحيات",
      shipping: "الشحن والتوصيل",
      checkout: "الدفع وإتمام الطلب",
      taxes: "الضرائب",
      domains: "النطاقات",
      security: "الأمان",
      integrations: "التكاملات",
      localization: "اللغات والمنطقة",
      notifications: "الإشعارات",
      emails: "قوالب البريد",
      contact: "قنوات التواصل",
      support: "الدردشة والمراسلة",
      appearance: "المظهر والثيم",
      navigation: "التنقل والقوائم",
      seo: "تحسين الظهور",
      policies: "السياسات",
      markets: "الأسواق والقنوات",
    }[section] || section
  );
}
