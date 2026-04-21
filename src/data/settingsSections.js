export const settingsSections = [
  {
    group: "عام",
    items: [
      { key: "store-profile", title: "معلومات المتجر", description: "الاسم التجاري، الهوية، بيانات النشاط ونبذة المتجر." },
      { key: "billing", title: "الفوترة والعملات", description: "العملة الأساسية، الضرائب الافتراضية، صيغة الأسعار والمناطق الزمنية." },
      { key: "team", title: "الفريق والصلاحيات", description: "حسابات الإدارة، الأدوار، صلاحيات الوصول وسجلات النشاط." },
      { key: "checkout", title: "الدفع وإتمام الطلب", description: "إعدادات الدفع، مراجعة الطلب، وسياسات التأكيد والاحتجاز." },
      { key: "taxes", title: "الضرائب", description: "ضريبة القيمة المضافة، تضمين الضريبة في السعر، وأكواد الفواتير." },
      { key: "domains", title: "النطاقات", description: "النطاق الأساسي، نطاق الدفع، وإدارة التوجيه وشهادات SSL." },
      { key: "security", title: "الأمان", description: "المصادقة الثنائية، الجلسات، التنبيهات الأمنية وسياسات كلمات المرور." },
      { key: "integrations", title: "التكاملات", description: "Meta Pixel، Analytics، Webhooks، ومفاتيح التكامل الخارجية." },
      { key: "localization", title: "اللغات والمنطقة", description: "اللغة الافتراضية، تنسيق التاريخ، المنطقة والسوق الأساسي." },
    ],
  },
  {
    group: "التواصل",
    items: [
      { key: "notifications", title: "الإشعارات", description: "تنبيهات الطلبات، المخزون، الحماية، والتقارير البريدية." },
      { key: "emails", title: "قوالب البريد", description: "رسائل تأكيد الطلب، الشحن، الاسترجاع، وسيناريوهات المتابعة." },
      { key: "contact", title: "قنوات التواصل", description: "البريد، الهاتف، واتساب، ساعات العمل وصفحات المساعدة." },
      { key: "support", title: "الدردشة والمراسلة", description: "الدردشة الفورية، الرسائل التلقائية، SLA ومسارات التصعيد." },
    ],
  },
  {
    group: "المتجر",
    items: [
      { key: "appearance", title: "المظهر والثيم", description: "الثيم النشط، الألوان، الأزرار ووضع الإضاءة في الإدارة والمتجر." },
      { key: "navigation", title: "التنقل والقوائم", description: "القوائم الرئيسية، الفوتر، روابط التصنيفات وروابط الحساب." },
      { key: "seo", title: "تحسين الظهور", description: "عناوين SEO، الوصف، الروابط المفتاحية وبيانات Open Graph." },
      { key: "policies", title: "السياسات", description: "سياسة الشحن، الاسترجاع، الخصوصية، الضمان وشروط الاستخدام." },
      { key: "markets", title: "الأسواق والقنوات", description: "القنوات البيعية، الأسواق المستهدفة والعملات المفعلة." },
      { key: "storefront-manager", title: "واجهة المتجر", description: "إدارة الواجهة والأقسام والثيمات ومسارات العرض العامة.", to: "/admin/storefront" },
    ],
  },
];

export function getSettingsItem(sectionKey) {
  for (const group of settingsSections) {
    const item = group.items.find((entry) => entry.key === sectionKey);
    if (item) return item;
  }
  return null;
}
