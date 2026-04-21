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

starterStorefrontThemes.push(
  ...[
    {
      slug: "stylix-fashion",
      name: "Stylix",
      layout: "premium-grid",
      primary: "#111827",
      secondary: "#ec4899",
      background: "#fafafa",
      surface: "#ffffff",
      text: "#111827",
      mutedText: "#6b7280",
      font: "Cairo",
      category: "أزياء",
      author: "aramex dev",
      rating: 4.9,
      installs: 399,
      heroTitle: "واجهة أزياء عصرية لعرض المنتجات الراقية",
      heroSubtitle: "ثيم مجاني مرتب للملابس والإكسسوارات مع بنرات واضحة وكروت منتجات أنيقة.",
      heroImage: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=80",
    },
    {
      slug: "glowy-beauty",
      name: "جلوي",
      layout: "campaign",
      primary: "#be185d",
      secondary: "#f59e0b",
      background: "#fff7ed",
      surface: "#ffffff",
      text: "#3f1d2b",
      mutedText: "#8a5a67",
      font: "Cairo",
      category: "الجمال",
      author: "Faisal code",
      rating: 5,
      installs: 747,
      heroTitle: "متجر جمال ومنتجات عناية بتجربة ناعمة",
      heroSubtitle: "مصمم للمنتجات الجمالية والعطور والعناية الشخصية مع تركيز على العروض.",
      heroImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80",
    },
    {
      slug: "zard-home",
      name: "زاد",
      layout: "premium-grid",
      primary: "#0f766e",
      secondary: "#94a3b8",
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#0f172a",
      mutedText: "#64748b",
      font: "Cairo",
      category: "منزل",
      author: "Faisal code",
      rating: 4.8,
      installs: 460,
      heroTitle: "متجر منزلي هادئ للديكور والأدوات",
      heroSubtitle: "تخطيط مجاني واضح للمنتجات المنزلية، البنرات الموسمية، والأقسام السريعة.",
      heroImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
    },
    {
      slug: "elegance-textile",
      name: "أناقة",
      layout: "premium-grid",
      primary: "#166534",
      secondary: "#ca8a04",
      background: "#f7fee7",
      surface: "#ffffff",
      text: "#172554",
      mutedText: "#64748b",
      font: "IBM Plex Sans Arabic",
      category: "أقمشة",
      author: "eslam ibrahim",
      rating: 5,
      installs: 460,
      heroTitle: "ثيم أقمشة ومنسوجات بتفاصيل قريبة",
      heroSubtitle: "واجهة مناسبة للأقمشة والمفروشات مع ألوان طبيعية ومساحات عرض واسعة.",
      heroImage: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1400&q=80",
    },
    {
      slug: "nemo-kids",
      name: "نمو",
      layout: "campaign",
      primary: "#16a34a",
      secondary: "#f97316",
      background: "#f0fdf4",
      surface: "#ffffff",
      text: "#14532d",
      mutedText: "#64748b",
      font: "Cairo",
      category: "أطفال",
      author: "Theme Market",
      rating: 4.7,
      installs: 0,
      heroTitle: "واجهة مرحة لمتاجر الأطفال والألعاب",
      heroSubtitle: "ألوان خفيفة وبنرات عروض مناسبة للمنتجات العائلية والهدايا.",
      heroImage: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1400&q=80",
    },
    {
      slug: "gold-offers",
      name: "صيف خاص",
      layout: "campaign",
      primary: "#b45309",
      secondary: "#ef4444",
      background: "#fffbeb",
      surface: "#ffffff",
      text: "#451a03",
      mutedText: "#92400e",
      font: "Cairo",
      category: "عروض",
      author: "Faisal code",
      rating: 5,
      installs: 230,
      heroTitle: "ثيم حملات وخصومات سريع التحويل",
      heroSubtitle: "مناسب لعروض الموسم، الكوبونات، وحملات البيع السريعة.",
      heroImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=80",
    },
    {
      slug: "radar-gaming",
      name: "رادار",
      layout: "dark-showcase",
      primary: "#ef4444",
      secondary: "#facc15",
      background: "#020617",
      surface: "#111827",
      text: "#f8fafc",
      mutedText: "#cbd5e1",
      font: "IBM Plex Sans Arabic",
      category: "ألعاب",
      author: "mohamed tarek",
      rating: 5,
      installs: 690,
      heroTitle: "ثيم داكن لمتاجر الألعاب والإكسسوارات",
      heroSubtitle: "واجهة قوية للأجهزة، الكيبوردات، السماعات، وحملات الجيمينج.",
      heroImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80",
    },
    {
      slug: "royale-luxury",
      name: "رويال",
      layout: "premium-grid",
      primary: "#b45309",
      secondary: "#111827",
      background: "#fffbeb",
      surface: "#ffffff",
      text: "#1f2937",
      mutedText: "#78716c",
      font: "Cairo",
      category: "فاخر",
      author: "Yazan Abdelaziz",
      rating: 5,
      installs: 1955,
      heroTitle: "واجهة فاخرة للمنتجات المميزة",
      heroSubtitle: "ثيم مجاني بمظهر راق للمنتجات عالية القيمة والهدايا الفاخرة.",
      heroImage: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1400&q=80",
    },
    {
      slug: "matjar-mobile",
      name: "م",
      layout: "premium-grid",
      primary: "#7c3aed",
      secondary: "#06b6d4",
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#0f172a",
      mutedText: "#64748b",
      font: "Cairo",
      category: "تطبيق",
      author: "Hesham iSoft",
      rating: 5,
      installs: 499,
      heroTitle: "ثيم متجر متجاوب يبرز تجربة الموبايل",
      heroSubtitle: "مناسب للمتاجر التي تركز على تجربة الجوال والتصفح السريع.",
      heroImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    },
    {
      slug: "creative-tech",
      name: "إبداعي",
      layout: "dark-showcase",
      primary: "#84cc16",
      secondary: "#22d3ee",
      background: "#0f172a",
      surface: "#111827",
      text: "#f8fafc",
      mutedText: "#cbd5e1",
      font: "IBM Plex Sans Arabic",
      category: "تقنية",
      author: "Mader Technical Solutions",
      rating: 5,
      installs: 460,
      heroTitle: "ثيم تقني سريع للمنتجات الرقمية",
      heroSubtitle: "ألوان قوية ومساحات نظيفة للمنتجات التقنية والبرمجيات والأجهزة.",
      heroImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
    },
    {
      slug: "style-red",
      name: "ستيرة",
      layout: "campaign",
      primary: "#dc2626",
      secondary: "#111827",
      background: "#fef2f2",
      surface: "#ffffff",
      text: "#111827",
      mutedText: "#64748b",
      font: "Cairo",
      category: "أزياء",
      author: "mohamed tariq",
      rating: 5,
      installs: 690,
      heroTitle: "ثيم أزياء موجه للعروض الجريئة",
      heroSubtitle: "واجهة مجانية للملابس والمنتجات الموسمية مع بنرات خصومات واضحة.",
      heroImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80",
    },
    {
      slug: "luna-fashion",
      name: "لونا",
      layout: "premium-grid",
      primary: "#db2777",
      secondary: "#111827",
      background: "#fdf2f8",
      surface: "#ffffff",
      text: "#111827",
      mutedText: "#64748b",
      font: "Cairo",
      category: "أزياء",
      author: "mohamed tariq",
      rating: 5,
      installs: 690,
      heroTitle: "ثيم موضة ناعم للواجهات النسائية",
      heroSubtitle: "مناسب للأزياء، العطور، والإكسسوارات مع عرض منتجات مرتب وواضح.",
      heroImage: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=80",
    },
  ].map((theme, index) =>
    normalizeStorefrontTheme({
      id: 10 + index,
      version: "1.0.0",
      badge: "مجاني",
      active: false,
      builtIn: true,
      price: 0,
      oldPrice: theme.installs + 70,
      updatedAt: "2026-04-21 12:00",
      ...theme,
      pageSections: createDefaultPageSections().map((section) => {
        if (section.type === "hero") {
          return {
            ...section,
            title: theme.heroTitle,
            subtitle: theme.heroSubtitle,
            badge: "ثيم مجاني",
            image: theme.heroImage,
            slides: (section.slides || []).map((slide, slideIndex) => ({
              ...slide,
              title: slideIndex === 0 ? theme.heroTitle : slide.title,
              subtitle: slideIndex === 0 ? theme.heroSubtitle : slide.subtitle,
              image: slideIndex === 0 ? theme.heroImage : slide.image,
            })),
          };
        }
        if (section.type === "announcement") {
          return { ...section, text: "ثيم مجاني بالكامل للمتاجر الإلكترونية" };
        }
        return section;
      }),
    }),
  ),
);

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
