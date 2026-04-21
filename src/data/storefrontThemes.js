const now = "2026-04-21 10:00";

const sectionTemplates = {
  announcement: () => ({
    id: createSectionId(),
    type: "announcement",
    enabled: true,
    title: "شريط الإعلان",
    text: "شحن مجاني للطلبات فوق 500 ر.س",
    offers: [
      { id: createItemId(), text: "شحن مجاني للطلبات فوق 500 ر.س" },
      { id: createItemId(), text: "خصومات اليوم حتى 25% على الأجهزة المختارة" },
      { id: createItemId(), text: "استبدال واسترجاع خلال 14 يوم" },
      { id: createItemId(), text: "ادفع بأمان واستلم خلال 24 ساعة" },
    ],
  }),
  hero: () => ({
    id: createSectionId(),
    type: "hero",
    enabled: true,
    title: "إلكترونيات مختارة بعناية لمساحات العمل الحديثة",
    subtitle: "واجهة متوازنة تعرض الأكثر مبيعًا والعروض والتصنيفات بترتيب يركز على التحويل وسرعة الوصول.",
    badge: "الثيم الحالي",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80",
    primaryActionLabel: "تسوق الآن",
    primaryActionTarget: "#catalog",
    secondaryActionLabel: "استعراض الأقسام",
    secondaryActionTarget: "#categories",
    slides: [
      {
        id: createItemId(),
        title: "إلكترونيات مختارة بعناية لمساحات العمل الحديثة",
        subtitle: "واجهة متوازنة تعرض الأكثر مبيعا والعروض والتصنيفات بترتيب يركز على التحويل وسرعة الوصول.",
        badge: "خصم اليوم",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80",
        primaryActionLabel: "تسوق الآن",
        primaryActionTarget: "#catalog",
        secondaryActionLabel: "استعراض الأقسام",
        secondaryActionTarget: "#categories",
      },
      {
        id: createItemId(),
        title: "عروض نهاية الأسبوع على اللابتوبات والأجهزة الذكية",
        subtitle: "خصومات محدودة على أجهزة العمل والدراسة مع شحن سريع وتجهيز خلال 24 ساعة.",
        badge: "عروض حتى 25%",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1400&q=80",
        primaryActionLabel: "شاهد العروض",
        primaryActionTarget: "#catalog",
        secondaryActionLabel: "الأكثر مبيعا",
        secondaryActionTarget: "#catalog",
      },
      {
        id: createItemId(),
        title: "باقات المكتب الذكي بسعر أقل لفترة محدودة",
        subtitle: "اختيارات جاهزة تجمع السماعات والملحقات والشواحن لتجربة عمل أسرع وأكثر تنظيما.",
        badge: "باقة الشريك",
        image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1400&q=80",
        primaryActionLabel: "اطلب الباقة",
        primaryActionTarget: "#catalog",
        secondaryActionLabel: "كل الملحقات",
        secondaryActionTarget: "#catalog",
      },
    ],
    stats: [
      { id: "s1", label: "جاهز للشحن", value: "24 ساعة" },
      { id: "s2", label: "أجهزة متاحة", value: "20+" },
      { id: "s3", label: "الدفع", value: "آمن ومرن" },
    ],
  }),
  categoryList: () => ({
    id: createSectionId(),
    type: "categoryList",
    enabled: true,
    title: "التصنيفات",
    subtitle: "اختصارات سريعة للوصول إلى مجموعات المنتجات الرئيسية.",
    categories: [],
  }),
  bannerGrid: () => ({
    id: createSectionId(),
    type: "bannerGrid",
    enabled: true,
    title: "الشريك الإعلاني",
    subtitle: "عروض متحركة من الشركاء والفئات الرئيسية مثل نون مع تبديل تلقائي بين الحملات.",
    items: [
      {
        id: createItemId(),
        badge: "شريك الأسبوع",
        title: "تجهيزات العمل المكتبي",
        subtitle: "مختارات للأداء والإنتاجية اليومية بخصومات خاصة من الشريك الإعلاني.",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80",
        ctaLabel: "استعرض الآن",
        ctaTarget: "#catalog",
      },
      {
        id: createItemId(),
        badge: "خصم محدود",
        title: "هواتف وأجهزة ذكية",
        subtitle: "خيارات سريعة للمستخدمين اليوميين والمحترفين مع عروض متغيرة يوميا.",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
        ctaLabel: "عرض الهواتف",
        ctaTarget: "#catalog",
      },
      {
        id: createItemId(),
        badge: "وفر أكثر",
        title: "سماعات وملحقات الألعاب",
        subtitle: "عروض على السماعات والمايكروفونات والملحقات المختارة لفترة قصيرة.",
        image: "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=1200&q=80",
        ctaLabel: "تسوق العرض",
        ctaTarget: "#catalog",
      },
    ],
  }),
  videoFeature: () => ({
    id: createSectionId(),
    type: "videoFeature",
    enabled: false,
    title: "فيديو تعريفي",
    subtitle: "أضف فيديو يشرح قيمة المتجر أو حملة موسمية أو مراجعة منتج بارز.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    poster: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    bullets: ["شحن سريع", "دفع آمن", "منتجات أصلية"],
    ctaLabel: "استكشف الكتالوج",
    ctaTarget: "#catalog",
  }),
  featuredProducts: () => ({
    id: createSectionId(),
    type: "featuredProducts",
    enabled: true,
    title: "الأكثر مبيعًا",
    subtitle: "منتجات عالية الحركة في واجهة المتجر الحالية.",
    mode: "top-sales",
    category: "All",
    limit: 8,
    manualIds: [],
  }),
  trust: () => ({
    id: createSectionId(),
    type: "trust",
    enabled: true,
    title: "مزايا الثقة",
    items: [
      { id: createItemId(), icon: "Truck", title: "شحن سريع", text: "تجهيز مرن وشحن يومي من المخزن الرئيسي." },
      { id: createItemId(), icon: "ShieldCheck", title: "دفع آمن", text: "مراجعة آمنة لعمليات الدفع وربط مباشر بالطلبات." },
      { id: createItemId(), icon: "Star", title: "منتجات موثوقة", text: "اختيارات عالية التقييم وجاهزة للبيع المباشر." },
    ],
  }),
  newsletter: () => ({
    id: createSectionId(),
    type: "newsletter",
    enabled: true,
    title: "النشرة البريدية",
    subtitle: "اجمع الاشتراكات وأعلن عن العروض والحملات الجديدة.",
    placeholder: "البريد الإلكتروني",
    buttonLabel: "اشتراك",
  }),
  catalog: () => ({
    id: createSectionId(),
    type: "catalog",
    enabled: true,
    title: "الكتالوج",
    subtitle: "بحث وفلاتر وفرز مع عرض كل المنتجات.",
    allowSearch: true,
    allowCategoryFilter: true,
    allowSort: true,
    columns: 4,
  }),
};

export const sectionTypeOptions = [
  ["announcement", "شريط الإعلان"],
  ["hero", "الهيرو"],
  ["categoryList", "التصنيفات"],
  ["bannerGrid", "البنرات"],
  ["videoFeature", "الفيديو"],
  ["featuredProducts", "منتجات مختارة"],
  ["trust", "مزايا الثقة"],
  ["newsletter", "النشرة البريدية"],
  ["catalog", "الكتالوج"],
];

export const storefrontLayoutOptions = [
  ["premium-grid", "Premium Grid"],
  ["dark-showcase", "Dark Showcase"],
  ["campaign", "Campaign"],
];

export const storefrontFontOptions = [
  ["Cairo", "Cairo"],
  ["IBM Plex Sans Arabic", "IBM Plex Sans Arabic"],
];

export const storefrontSectionLabels = {
  announcement: "شريط الإعلان",
  hero: "الهيرو",
  categoryList: "التصنيفات",
  bannerGrid: "البنرات",
  videoFeature: "الفيديو",
  featuredProducts: "منتجات مختارة",
  trust: "مزايا الثقة",
  newsletter: "النشرة البريدية",
  catalog: "الكتالوج",
};

export function createThemeSection(type) {
  const factory = sectionTemplates[type];
  return factory ? factory() : sectionTemplates.catalog();
}

export function createDefaultPageSections() {
  return [
    createThemeSection("announcement"),
    createThemeSection("hero"),
    createThemeSection("categoryList"),
    createThemeSection("bannerGrid"),
    createThemeSection("featuredProducts"),
    createThemeSection("trust"),
    createThemeSection("newsletter"),
    createThemeSection("catalog"),
  ];
}

export const emptyStorefrontTheme = normalizeStorefrontTheme({
  name: "ثيم جديد",
  slug: "new-theme",
  version: "1.0.0",
  layout: "premium-grid",
  primary: "#6366f1",
  secondary: "#8b5cf6",
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#0f172a",
  mutedText: "#64748b",
  font: "Cairo",
  badge: "مخصص",
  active: false,
  builtIn: false,
  updatedAt: now,
  pageSections: createDefaultPageSections(),
});

export const starterStorefrontThemes = [
  normalizeStorefrontTheme({
    id: 1,
    slug: "sila-premium",
    name: "سيلا بريميوم",
    version: "1.0.0",
    layout: "premium-grid",
    primary: "#6366f1",
    secondary: "#8b5cf6",
    background: "#f8fafc",
    surface: "#ffffff",
    text: "#0f172a",
    mutedText: "#64748b",
    font: "Cairo",
    badge: "الثيم الحالي",
    active: true,
    builtIn: true,
    updatedAt: "2026-04-20 19:44",
    pageSections: createDefaultPageSections(),
  }),
  normalizeStorefrontTheme({
    id: 2,
    slug: "neo-dark",
    name: "نيو",
    version: "1.0.0",
    layout: "dark-showcase",
    primary: "#7c3aed",
    secondary: "#06b6d4",
    background: "#020617",
    surface: "#0f172a",
    text: "#f8fafc",
    mutedText: "#cbd5e1",
    font: "IBM Plex Sans Arabic",
    badge: "مبني",
    active: false,
    builtIn: true,
    updatedAt: "2026-04-18 11:10",
    pageSections: [
      { ...createThemeSection("announcement"), text: "أسبوع العروض على اللابتوبات والكاميرات" },
      {
        ...createThemeSection("hero"),
        title: "واجهة داكنة لحملات التقنية والعروض السريعة",
        subtitle: "ترتيب بصري يركز على الصورة والمحتوى السريع والتحويل المباشر.",
        badge: "ثيم مبني",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1400&q=80",
      },
      { ...createThemeSection("bannerGrid") },
      { ...createThemeSection("videoFeature"), enabled: true },
      { ...createThemeSection("featuredProducts"), limit: 6 },
      { ...createThemeSection("catalog"), columns: 3 },
    ],
  }),
  normalizeStorefrontTheme({
    id: 3,
    slug: "campaign-rush",
    name: "العجال",
    version: "1.0.0",
    layout: "campaign",
    primary: "#ef4444",
    secondary: "#f59e0b",
    background: "#fff7ed",
    surface: "#ffffff",
    text: "#111827",
    mutedText: "#78716c",
    font: "Cairo",
    badge: "مبني",
    active: false,
    builtIn: true,
    updatedAt: "2026-04-14 09:20",
    pageSections: [
      { ...createThemeSection("announcement"), text: "خصومات موسمية حتى 20% على الملحقات" },
      {
        ...createThemeSection("hero"),
        title: "واجهة حملة موجهة للعروض والبيع السريع",
        subtitle: "تصميم واضح للأزرار والعروض والبنرات الموسمية.",
        image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1400&q=80",
      },
      {
        ...createThemeSection("bannerGrid"),
        items: [
          {
            id: createItemId(),
            title: "عروض الهواتف",
            subtitle: "خصومات مخصصة للأجهزة الأكثر طلبًا.",
            image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
            ctaLabel: "استعرض",
            ctaTarget: "#catalog",
          },
          {
            id: createItemId(),
            title: "ملحقات العمل",
            subtitle: "شواحن وسماعات وميكروفونات بأفضل سعر.",
            image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=1200&q=80",
            ctaLabel: "تسوق الآن",
            ctaTarget: "#catalog",
          },
        ],
      },
      { ...createThemeSection("featuredProducts"), category: "Accessories", mode: "category", limit: 4 },
      { ...createThemeSection("catalog"), columns: 4 },
    ],
  }),
];

export function normalizeStorefrontTheme(theme) {
  const merged = {
    ...emptyThemeBase(),
    ...theme,
  };

  const legacySections = merged.sections || {};
  const pageSections =
    Array.isArray(merged.pageSections) && merged.pageSections.length
      ? merged.pageSections.map(normalizeSection)
      : createDefaultPageSections()
          .map((section) => {
            if (section.type === "announcement" && merged.announcement) {
              return { ...section, text: merged.announcement };
            }
            if (section.type === "hero") {
              return {
                ...section,
                title: merged.heroTitle || section.title,
                subtitle: merged.heroSubtitle || section.subtitle,
                image: merged.heroImage || section.image,
                badge: merged.badge || section.badge,
              };
            }
            const legacyEnabledMap = {
              categoryList: legacySections.categories,
              featuredProducts: legacySections.featured,
              trust: legacySections.trust,
              newsletter: legacySections.newsletter,
              hero: legacySections.hero,
            };
            if (legacyEnabledMap[section.type] !== undefined) {
              return { ...section, enabled: Boolean(legacyEnabledMap[section.type]) };
            }
            return section;
          })
          .map(normalizeSection);

  return {
    ...merged,
    pageSections,
    sections: createLegacySectionMap(pageSections),
    announcement: pageSections.find((section) => section.type === "announcement")?.text || merged.announcement,
    heroTitle: pageSections.find((section) => section.type === "hero")?.title || merged.heroTitle,
    heroSubtitle: pageSections.find((section) => section.type === "hero")?.subtitle || merged.heroSubtitle,
    heroImage: pageSections.find((section) => section.type === "hero")?.image || merged.heroImage,
  };
}

function normalizeSection(section) {
  const base = createThemeSection(section.type);
  const normalized = {
    ...base,
    ...section,
    id: section.id || createSectionId(),
    enabled: section.enabled ?? true,
  };

  if (normalized.stats) {
    normalized.stats = normalized.stats.map((item) => ({
      id: item.id || createItemId(),
      label: item.label || "",
      value: item.value || "",
    }));
  }

  if (normalized.offers) {
    normalized.offers = normalized.offers.map((item) => ({
      id: item.id || createItemId(),
      text: item.text || "",
    }));
  }

  if (normalized.slides) {
    normalized.slides = normalized.slides.map((item) => ({
      id: item.id || createItemId(),
      ...item,
      stats: item.stats?.map((stat) => ({
        id: stat.id || createItemId(),
        label: stat.label || "",
        value: stat.value || "",
      })),
    }));
  }

  if (normalized.items) {
    normalized.items = normalized.items.map((item) => ({
      id: item.id || createItemId(),
      ...item,
    }));
  }

  if (normalized.bullets) {
    normalized.bullets = [...normalized.bullets];
  }

  if (normalized.manualIds) {
    normalized.manualIds = normalized.manualIds.map(Number).filter(Boolean);
  }

  return normalized;
}

function createLegacySectionMap(pageSections) {
  return {
    hero: isTypeEnabled(pageSections, "hero"),
    featured: isTypeEnabled(pageSections, "featuredProducts"),
    categories: isTypeEnabled(pageSections, "categoryList"),
    trust: isTypeEnabled(pageSections, "trust"),
    newsletter: isTypeEnabled(pageSections, "newsletter"),
  };
}

function isTypeEnabled(pageSections, type) {
  return pageSections.some((section) => section.type === type && section.enabled);
}

function emptyThemeBase() {
  return {
    name: "ثيم جديد",
    version: "1.0.0",
    layout: "premium-grid",
    primary: "#6366f1",
    secondary: "#8b5cf6",
    background: "#f8fafc",
    surface: "#ffffff",
    text: "#0f172a",
    mutedText: "#64748b",
    font: "Cairo",
    heroTitle: "",
    heroSubtitle: "",
    heroImage: "",
    announcement: "",
    badge: "مخصص",
    active: false,
    builtIn: false,
    updatedAt: now,
    pageSections: [],
    sections: {},
  };
}

function createSectionId() {
  return `section-${Math.random().toString(36).slice(2, 10)}`;
}

function createItemId() {
  return `item-${Math.random().toString(36).slice(2, 10)}`;
}
