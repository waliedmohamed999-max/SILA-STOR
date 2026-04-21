import {
  ArrowRight,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Mail,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../Badge";
import EmptyState from "../EmptyState";
import { categories, products } from "../../data/products";
import { money, statusTone, stockState } from "../../utils/formatters";
import { categoryLabel, statusLabel } from "../../utils/labels";

const categoryVisuals = {
  Laptops: {
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
    subtitle: "أجهزة عمل وإنتاجية عالية الأداء",
  },
  Phones: {
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    subtitle: "هواتف ذكية للفئات اليومية والاحترافية",
  },
  Headphones: {
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    subtitle: "سماعات للألعاب والعمل والموسيقى",
  },
  Cameras: {
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    subtitle: "كاميرات وعدسات ومعدات تصوير",
  },
  Tablets: {
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80",
    subtitle: "أجهزة لوحية للعمل والتعليم والمحتوى",
  },
  Accessories: {
    image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80",
    subtitle: "ملحقات تشحن وتوصل وتكمل التجربة",
  },
};

const trustIcons = {
  Truck,
  ShieldCheck,
  Star,
  BadgePercent,
  Package,
};

const variantOrder = {
  tech: ["announcement", "hero", "featuredProducts", "categoryList", "bannerGrid", "catalog", "trust", "newsletter"],
  luxury: ["announcement", "hero", "bannerGrid", "featuredProducts", "trust", "catalog", "newsletter"],
  fashion: ["hero", "categoryList", "featuredProducts", "bannerGrid", "newsletter", "catalog", "trust", "announcement"],
  marketplace: ["announcement", "categoryList", "hero", "catalog", "featuredProducts", "bannerGrid", "trust", "newsletter"],
  dynamic: ["announcement", "hero", "bannerGrid", "categoryList", "featuredProducts", "catalog", "newsletter", "trust"],
};

export default function ThemeCanvas({ theme, preview = false, addItem = () => {}, onSectionAction }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const variant = getThemeVariant(theme);

  const featuredProducts = useMemo(() => [...products].sort((a, b) => b.sales - a.sales), []);

  const filteredCatalog = useMemo(() => {
    let list = products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const search = query.trim().toLowerCase();
      const matchesQuery =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search);
      return matchesCategory && matchesQuery;
    });

    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "new") list = [...list].sort((a, b) => b.id - a.id);
    return list;
  }, [category, query, sort]);

  const sections = orderSections(theme.pageSections || [], variant, theme).filter((section) => section.enabled);

  return (
    <div className={getCanvasClass(variant)} style={getCanvasStyle(theme, variant)} data-store-theme={variant}>
      {variant === "tech" && <div className="pointer-events-none absolute inset-0 -z-0 rounded-[32px] bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,.22),transparent_34%),radial-gradient(circle_at_85%_5%,rgba(168,85,247,.25),transparent_30%)]" />}
      {sections.map((section, index) => (
        <SectionShell
          key={section.id}
          section={section}
          preview={preview}
          onAction={onSectionAction}
          index={index}
          variant={variant}
        >
          {renderSection({
            section,
            theme,
            preview,
            addItem,
            query,
            setQuery,
            category,
            setCategory,
            sort,
            setSort,
            filteredCatalog,
            featuredProducts,
            variant,
          })}
        </SectionShell>
      ))}
    </div>
  );
}

function renderSection(props) {
  const { section, theme, preview, variant } = props;

  if (section.type === "announcement") return <AnnouncementTicker section={section} theme={theme} preview={preview} variant={variant} />;
  if (section.type === "hero") return <HeroSlider section={section} theme={theme} preview={preview} variant={variant} />;
  if (section.type === "categoryList") return <CategorySection {...props} />;
  if (section.type === "bannerGrid") return <OfferSlider section={section} theme={theme} preview={preview} variant={variant} />;
  if (section.type === "videoFeature") return <VideoFeature section={section} theme={theme} preview={preview} variant={variant} />;
  if (section.type === "featuredProducts") return <FeaturedProducts {...props} />;
  if (section.type === "trust") return <TrustSection section={section} theme={theme} variant={variant} />;
  if (section.type === "newsletter") return <NewsletterSection section={section} theme={theme} variant={variant} />;
  if (section.type === "catalog") return <CatalogSection {...props} />;

  return null;
}

function CategorySection({ section, theme, category, setCategory, variant }) {
  const sectionCategories = section.categories?.length ? section.categories : categories;
  const gridClass =
    variant === "marketplace"
      ? "grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6"
      : variant === "fashion"
        ? "flex snap-x gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        : "grid gap-3 sm:grid-cols-2 xl:grid-cols-3";

  return (
    <section id="categories" className={variant === "fashion" ? "space-y-6" : "space-y-4"}>
      <SectionHeading title={section.title} subtitle={section.subtitle} theme={theme} variant={variant} />
      <div className={gridClass}>
        {sectionCategories.map((item, index) => (
          <CategoryCard
            key={item}
            item={item}
            index={index}
            selected={category === item}
            setCategory={setCategory}
            theme={theme}
            variant={variant}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ item, index, selected, setCategory, theme, variant }) {
  const visual = categoryVisuals[item] || categoryVisuals.Accessories;
  if (variant === "tech") {
    return (
      <button type="button" onClick={() => setCategory(item)} className="group relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-white/5 p-4 text-right text-white backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/60 hover:shadow-[0_0_42px_rgba(34,211,238,.18)]">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-fuchsia-500/10 opacity-0 transition group-hover:opacity-100" />
        <img src={visual.image} alt={categoryLabel(item)} className="h-36 w-full rounded-2xl object-cover opacity-80 saturate-150 transition duration-500 group-hover:scale-105" />
        <div className="relative mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[.25em] text-cyan-200">0{index + 1}</p>
            <h3 className="mt-1 font-heading text-2xl font-black">{categoryLabel(item)}</h3>
          </div>
          <Zap size={20} className={selected ? "text-cyan-200" : "text-white/50"} />
        </div>
      </button>
    );
  }

  if (variant === "luxury") {
    return (
      <button type="button" onClick={() => setCategory(item)} className="group grid min-h-[260px] overflow-hidden rounded-none border border-[#d9c08a]/50 bg-white text-right transition hover:shadow-2xl hover:shadow-[#d9c08a]/20">
        <img src={visual.image} alt={categoryLabel(item)} className="h-44 w-full object-cover grayscale-[20%] transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0" />
        <div className="p-6">
          <p className="font-serif text-2xl font-bold text-slate-950">{categoryLabel(item)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{visual.subtitle}</p>
        </div>
      </button>
    );
  }

  if (variant === "fashion") {
    return (
      <button type="button" onClick={() => setCategory(item)} className="group relative min-w-[78vw] snap-start overflow-hidden bg-slate-950 text-white sm:min-w-[360px]">
        <img src={visual.image} alt={categoryLabel(item)} className="h-[420px] w-full object-cover opacity-85 transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <p className="text-3xl font-black">{categoryLabel(item)}</p>
          <p className="mt-2 max-w-xs text-sm text-white/75">{visual.subtitle}</p>
        </div>
      </button>
    );
  }

  if (variant === "marketplace") {
    return (
      <button type="button" onClick={() => setCategory(item)} className="group rounded-2xl border border-slate-200 bg-white p-3 text-right transition hover:border-indigo-300 hover:shadow-lg">
        <img src={visual.image} alt={categoryLabel(item)} className="h-20 w-full rounded-xl object-cover" />
        <p className="mt-3 truncate font-heading text-sm font-black text-slate-950">{categoryLabel(item)}</p>
        <p className="mt-1 text-[11px] font-bold text-slate-500">{products.filter((product) => product.category === item).length} منتج</p>
      </button>
    );
  }

  return (
    <button type="button" onClick={() => setCategory(item)} className="group overflow-hidden rounded-[28px] border border-white/70 bg-white/80 text-right shadow-xl shadow-slate-200/60 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="grid min-h-[160px] grid-cols-[1fr_150px]">
        <div className="flex flex-col justify-between p-5">
          <span className="w-fit rounded-full px-3 py-1 text-xs font-black text-white" style={{ background: selected ? theme.primary : theme.secondary }}>
            {selected ? "نشط" : "استعرض"}
          </span>
          <div>
            <h3 className="font-heading text-2xl font-black text-slate-950">{categoryLabel(item)}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{visual.subtitle}</p>
          </div>
        </div>
        <img src={visual.image} alt={categoryLabel(item)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
    </button>
  );
}

function FeaturedProducts({ section, theme, preview, addItem, featuredProducts, variant }) {
  const scoped = pickFeaturedProducts(section, featuredProducts);
  const className =
    variant === "marketplace"
      ? "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      : variant === "fashion"
        ? "grid gap-1 sm:grid-cols-2 lg:grid-cols-4"
        : variant === "luxury"
          ? "grid gap-8 sm:grid-cols-2 xl:grid-cols-3"
          : "grid grid-cols-2 gap-4 xl:grid-cols-4";

  return (
    <section className="space-y-5">
      <SectionHeading title={section.title} subtitle={section.subtitle} theme={theme} variant={variant} />
      <div className={className}>
        {scoped.map((product) => (
          <ProductCard key={product.id} product={product} theme={theme} preview={preview} addItem={addItem} variant={variant} />
        ))}
      </div>
    </section>
  );
}

function CatalogSection({ section, theme, preview, addItem, query, setQuery, category, setCategory, sort, setSort, filteredCatalog, variant }) {
  const dense = variant === "marketplace";
  return (
    <section id="catalog" className={dense ? "rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5" : "space-y-4"}>
      <SectionHeading title={section.title} subtitle={section.subtitle} theme={theme} variant={variant} />
      <div className={dense ? "grid gap-4 lg:grid-cols-[250px_1fr]" : "space-y-4"}>
        <div className={dense ? "space-y-3 rounded-2xl bg-slate-50 p-3" : "grid gap-3 rounded-3xl border border-slate-200 bg-white/80 p-3 backdrop-blur-xl sm:grid-cols-[1fr_170px_170px]"}>
          <label className="relative block">
            <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث باسم المنتج أو التصنيف"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pr-10 text-sm font-bold outline-none transition focus:border-indigo-400"
            />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black outline-none">
            <option value="All">كل التصنيفات</option>
            {categories.map((item) => (
              <option key={item} value={item}>{categoryLabel(item)}</option>
            ))}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black outline-none">
            <option value="featured">المميز</option>
            <option value="new">الأحدث</option>
            <option value="rating">الأعلى تقييما</option>
            <option value="price-low">الأقل سعرا</option>
            <option value="price-high">الأعلى سعرا</option>
          </select>
          {dense && (
            <div className="hidden rounded-2xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-500 lg:block">
              <div className="mb-2 flex items-center gap-2 font-black text-slate-900"><SlidersHorizontal size={15} /> فلاتر سريعة</div>
              <p>منتجات متاحة، شحن سريع، عروض نشطة.</p>
            </div>
          )}
        </div>
        {filteredCatalog.length ? (
          <div className={dense ? "grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4" : "grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"}>
            {filteredCatalog.map((product) => (
              <ProductCard key={product.id} product={product} theme={theme} preview={preview} addItem={addItem} compact={dense} variant={variant} />
            ))}
          </div>
        ) : (
          <EmptyState title="لا توجد منتجات" description="جرّب تغيير البحث أو التصنيف الحالي." />
        )}
      </div>
    </section>
  );
}

function TrustSection({ section, theme, variant }) {
  const layout = variant === "tech" ? "grid gap-3 md:grid-cols-3" : "grid gap-3 md:grid-cols-3";
  return (
    <section className="space-y-4">
      <SectionHeading title={section.title} subtitle={section.subtitle} theme={theme} variant={variant} />
      <div className={layout}>
        {(section.items || []).map((item) => {
          const Icon = trustIcons[item.icon] || ShieldCheck;
          return (
            <div key={item.title} className={getTrustCardClass(variant)} style={variant === "luxury" ? { borderColor: "#d9c08a55" } : undefined}>
              <Icon size={24} className={variant === "tech" ? "text-cyan-200" : "text-indigo-500"} />
              <div>
                <p className={variant === "luxury" ? "font-serif text-lg font-bold text-slate-950" : "font-heading text-lg font-black"}>{item.title}</p>
                <p className="mt-1 text-sm leading-6 opacity-70">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function NewsletterSection({ section, theme, variant }) {
  return (
    <section className={getNewsletterClass(variant)} style={variant === "dynamic" ? { background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` } : undefined}>
      <div>
        <p className={variant === "luxury" ? "font-serif text-3xl font-bold text-slate-950" : "font-heading text-2xl font-black"}>{section.title}</p>
        <p className="mt-2 text-sm leading-6 opacity-70">{section.subtitle}</p>
      </div>
      <form className="flex w-full max-w-md gap-2">
        <label className="relative flex-1">
          <Mail className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-45" size={17} />
          <input placeholder="البريد الإلكتروني" className="h-12 w-full rounded-2xl border border-slate-200 bg-white pr-10 text-sm font-bold outline-none" />
        </label>
        <button type="button" className="rounded-2xl px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5" style={{ background: theme.primary }}>
          اشترك
        </button>
      </form>
    </section>
  );
}

function VideoFeature({ section, theme, preview, variant }) {
  return (
    <section className={variant === "tech" ? "overflow-hidden rounded-[32px] border border-cyan-300/20 bg-white/5 text-white backdrop-blur-xl" : "overflow-hidden rounded-[28px] border border-slate-200 bg-white"}>
      <div className="grid gap-0 lg:grid-cols-[1fr_.9fr]">
        <div className="p-6">
          <SectionHeading title={section.title} subtitle={section.subtitle} theme={theme} variant={variant} />
          {!!section.bullets?.length && (
            <div className="mt-5 grid gap-3">
              {section.bullets.map((item, index) => (
                <div key={`${item}-${index}`} className={variant === "tech" ? "rounded-2xl bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-50" : "rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"}>
                  {item}
                </div>
              ))}
            </div>
          )}
          <div className="mt-5">
            <ActionButton preview={preview} target={section.ctaTarget} primary theme={theme} variant={variant}>{section.ctaLabel}</ActionButton>
          </div>
        </div>
        <div className="relative min-h-[320px] overflow-hidden bg-slate-950">
          {preview ? (
            <img src={section.poster} alt={section.title} className="h-full w-full object-cover opacity-80" />
          ) : (
            <iframe title={section.title} src={section.videoUrl} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          )}
        </div>
      </div>
    </section>
  );
}

function AnnouncementTicker({ section, theme, preview, variant }) {
  const offers = getAnnouncementOffers(section, theme);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (preview || offers.length < 2) return undefined;
    const id = window.setInterval(() => setActive((current) => (current + 1) % offers.length), 3200);
    return () => window.clearInterval(id);
  }, [offers.length, preview]);

  return (
    <div className={getAnnouncementClass(variant)} style={getAnnouncementStyle(theme, variant)}>
      <span className="hidden rounded-full bg-white/15 px-3 py-1 text-xs font-black sm:inline-flex">{offers[active]?.label || "عرض"}</span>
      <span className="truncate text-center font-heading text-sm font-black sm:text-base">{offers[active]?.text}</span>
      <span className="hidden text-xs font-black opacity-75 sm:inline">{active + 1}/{offers.length}</span>
    </div>
  );
}

function HeroSlider({ section, theme, preview, variant }) {
  const slides = getHeroSlides(section, theme);
  const [active, setActive] = useState(0);
  const slide = slides[active] || slides[0];

  useEffect(() => {
    if (preview || slides.length < 2) return undefined;
    const id = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5200);
    return () => window.clearInterval(id);
  }, [preview, slides.length]);

  const go = (direction) => setActive((current) => (current + direction + slides.length) % slides.length);

  if (variant === "fashion") {
    return (
      <section className="relative min-h-[680px] overflow-hidden bg-slate-950 text-white">
        <img src={slide.image} alt={slide.title} className="absolute inset-0 h-full w-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="relative flex min-h-[680px] flex-col justify-end p-7 sm:p-12 lg:p-16">
          <span className="mb-5 w-fit border border-white/35 px-4 py-2 text-xs font-black uppercase tracking-[.3em]">{slide.badge}</span>
          <h1 className="max-w-3xl font-heading text-5xl font-black leading-[1.05] sm:text-7xl">{slide.title}</h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/75">{slide.subtitle}</p>
          <div className="mt-7 flex gap-3"><ActionButton preview={preview} target={slide.ctaTarget} primary theme={theme} variant={variant}>{slide.ctaLabel}</ActionButton></div>
        </div>
        <SliderControls active={active} count={slides.length} go={go} variant={variant} />
      </section>
    );
  }

  if (variant === "luxury") {
    return (
      <section className="grid min-h-[620px] overflow-hidden border border-[#d9c08a]/45 bg-[#fbfaf6] lg:grid-cols-[.95fr_1.05fr]">
        <div className="order-2 flex flex-col justify-center p-8 text-right lg:order-1 lg:p-16">
          <span className="mb-6 w-fit self-end border border-[#b9974d] px-4 py-2 font-serif text-sm text-[#8a6a22]">{slide.badge}</span>
          <h1 className="font-serif text-5xl font-bold leading-tight text-slate-950 sm:text-7xl">{slide.title}</h1>
          <p className="mt-6 max-w-xl self-end text-lg leading-9 text-slate-500">{slide.subtitle}</p>
          <div className="mt-8 flex justify-end gap-3"><ActionButton preview={preview} target={slide.ctaTarget} primary theme={theme} variant={variant}>{slide.ctaLabel}</ActionButton></div>
        </div>
        <img src={slide.image} alt={slide.title} className="order-1 h-[360px] w-full object-cover lg:order-2 lg:h-full" />
      </section>
    );
  }

  if (variant === "marketplace") {
    return (
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[.85fr_1.15fr]">
          <img src={slide.image} alt={slide.title} className="h-72 w-full object-cover lg:h-full" />
          <div className="p-5 sm:p-8">
            <span className="rounded-full bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-600">{slide.badge}</span>
            <h1 className="mt-5 font-heading text-4xl font-black leading-tight text-slate-950 sm:text-5xl">{slide.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">{slide.subtitle}</p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {(slide.stats || []).map((stat) => <QuickStat key={stat.label} stat={stat} theme={theme} compact />)}
            </div>
            <div className="mt-6 flex flex-wrap gap-3"><ActionButton preview={preview} target={slide.ctaTarget} primary theme={theme} variant={variant}>{slide.ctaLabel}</ActionButton></div>
          </div>
        </div>
      </section>
    );
  }

  const tech = variant === "tech";
  return (
    <section className={tech ? "relative overflow-hidden rounded-[36px] border border-cyan-300/20 bg-slate-950/60 text-white shadow-[0_0_80px_rgba(34,211,238,.12)] backdrop-blur-xl" : "relative overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-2xl shadow-slate-200/70 backdrop-blur-xl"}>
      <div className="grid min-h-[560px] lg:grid-cols-[.9fr_1.1fr]">
        <div className="relative overflow-hidden">
          <img src={slide.image} alt={slide.title} className="h-full min-h-[320px] w-full object-cover transition duration-700" />
          <div className={tech ? "absolute inset-0 bg-gradient-to-tr from-cyan-500/25 via-transparent to-fuchsia-500/30" : "absolute inset-0 bg-gradient-to-r from-indigo-500/25 to-transparent"} />
        </div>
        <div className="flex flex-col justify-center p-6 text-right sm:p-10 lg:p-12">
          <span className={tech ? "mb-4 w-fit self-end rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-black text-cyan-100" : "mb-4 w-fit self-end rounded-full bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-600"}>{slide.badge}</span>
          <h1 className="font-heading text-4xl font-black leading-tight sm:text-6xl">{slide.title}</h1>
          <p className={tech ? "mt-5 max-w-2xl self-end text-base leading-8 text-cyan-50/70" : "mt-5 max-w-2xl self-end text-base leading-8 text-slate-500"}>{slide.subtitle}</p>
          <div className="mt-7 flex flex-wrap justify-end gap-3">
            <ActionButton preview={preview} target={slide.ctaTarget} primary theme={theme} variant={variant}>{slide.ctaLabel}</ActionButton>
            {slide.secondaryLabel && <ActionButton preview={preview} target={slide.secondaryTarget} theme={theme} variant={variant}>{slide.secondaryLabel}</ActionButton>}
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {(slide.stats || []).map((stat) => <QuickStat key={stat.label} stat={stat} theme={theme} variant={variant} />)}
          </div>
        </div>
      </div>
      <SliderControls active={active} count={slides.length} go={go} variant={variant} />
    </section>
  );
}

function OfferSlider({ section, theme, preview, variant }) {
  const slides = (section.banners?.length ? section.banners : [{
    title: section.title,
    subtitle: section.subtitle,
    image: theme.heroImage,
    badge: section.badge || "عرض",
    ctaLabel: section.ctaLabel || "استعرض الآن",
    ctaTarget: section.ctaTarget || "/",
  }]).map((item, index) => ({ id: `${section.id}-${index}`, ...item }));
  const [active, setActive] = useState(0);
  const slide = slides[active] || slides[0];

  useEffect(() => {
    if (preview || slides.length < 2) return undefined;
    const id = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 4500);
    return () => window.clearInterval(id);
  }, [preview, slides.length]);

  const go = (direction) => setActive((current) => (current + direction + slides.length) % slides.length);

  return (
    <section className={getOfferClass(variant)}>
      <div className={variant === "luxury" ? "grid lg:grid-cols-[1.1fr_.9fr]" : "grid lg:grid-cols-[.9fr_1.1fr]"}>
        <img src={slide.image} alt={slide.title} className={variant === "fashion" ? "h-[520px] w-full object-cover" : "h-72 w-full object-cover lg:h-full"} />
        <div className="flex flex-col justify-center p-6 text-right sm:p-10">
          <span className={variant === "tech" ? "mb-4 w-fit self-end rounded-full bg-cyan-300/15 px-4 py-2 text-xs font-black text-cyan-100" : "mb-4 w-fit self-end rounded-full bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-600"}>{slide.badge}</span>
          <h2 className={variant === "luxury" ? "font-serif text-4xl font-bold leading-tight text-slate-950 sm:text-6xl" : "font-heading text-4xl font-black leading-tight sm:text-5xl"}>{slide.title}</h2>
          <p className="mt-4 max-w-xl self-end text-sm leading-7 opacity-70">{slide.subtitle}</p>
          <div className="mt-6 flex justify-end"><ActionButton preview={preview} target={slide.ctaTarget} primary theme={theme} variant={variant}>{slide.ctaLabel}</ActionButton></div>
        </div>
      </div>
      <SliderControls active={active} count={slides.length} go={go} variant={variant} />
    </section>
  );
}

function ProductCard({ product, theme, preview, addItem, compact = false, variant = "marketplace" }) {
  const stock = stockState(product);
  const disabled = preview || product.stock === 0;
  const handleAdd = () => !disabled && addItem(product);

  if (variant === "tech") {
    return (
      <article className="group relative overflow-hidden rounded-[28px] border border-cyan-300/20 bg-white/5 text-white backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/60 hover:shadow-[0_0_44px_rgba(34,211,238,.18)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover opacity-85 saturate-150 transition duration-700 group-hover:scale-110" />
          <span className="absolute right-3 top-3 rounded-full bg-cyan-300/15 px-3 py-1 text-xs font-black text-cyan-100">{statusLabel(product.status)}</span>
          <button type="button" onClick={handleAdd} disabled={disabled} className="absolute bottom-3 left-3 grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300 text-slate-950 shadow-lg transition disabled:opacity-40"><ShoppingCart size={18} /></button>
        </div>
        <div className="p-4">
          <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-100/70">{categoryLabel(product.category)}</p>
          <h3 className="mt-2 line-clamp-2 font-heading text-lg font-black">{product.name}</h3>
          <div className="mt-4 flex items-center justify-between"><span className="text-xl font-black">{money(product.price)}</span><Rating value={product.rating} /></div>
        </div>
      </article>
    );
  }

  if (variant === "luxury") {
    return (
      <article className="group border-b border-[#d9c08a]/45 bg-white pb-6 text-right">
        <div className="aspect-[4/5] overflow-hidden bg-[#fbfaf6]">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        </div>
        <div className="pt-5">
          <p className="font-serif text-2xl font-bold text-slate-950">{product.name}</p>
          <p className="mt-2 text-sm text-slate-500">{categoryLabel(product.category)}</p>
          <div className="mt-5 flex items-center justify-between border-t border-[#d9c08a]/30 pt-4">
            <button type="button" onClick={handleAdd} disabled={disabled} className="text-sm font-black text-[#8a6a22] underline-offset-4 transition hover:underline disabled:opacity-40">أضف للسلة</button>
            <span className="font-serif text-xl font-bold text-slate-950">{money(product.price)}</span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "fashion") {
    return (
      <article className="group relative aspect-[3/4] overflow-hidden bg-slate-950 text-white">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
        <div className="absolute inset-x-0 bottom-0 translate-y-5 p-5 opacity-90 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="font-heading text-xl font-black">{product.name}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-black">{money(product.price)}</span>
            <button type="button" onClick={handleAdd} disabled={disabled} className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40">شراء</button>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "marketplace") {
    return (
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-right shadow-sm transition hover:border-indigo-300 hover:shadow-lg">
        <div className="relative aspect-[4/3] bg-slate-100">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          <Badge className="absolute right-2 top-2 text-[10px]" variant={statusTone(product.status)}>{statusLabel(product.status)}</Badge>
        </div>
        <div className={compact ? "p-3" : "p-4"}>
          <p className="truncate text-[11px] font-bold text-slate-400">{categoryLabel(product.category)}</p>
          <h3 className="mt-1 line-clamp-2 font-heading text-sm font-black text-slate-950 sm:text-base">{product.name}</h3>
          <div className="mt-2 flex items-center justify-between text-xs"><Rating value={product.rating} /><span className="font-bold text-slate-400">{stock.label}</span></div>
          <div className="mt-3 flex items-center gap-2">
            <span className="font-black text-slate-950">{money(product.price)}</span>
            <button type="button" onClick={handleAdd} disabled={disabled} className="mr-auto rounded-xl px-3 py-2 text-xs font-black text-white disabled:opacity-40" style={{ background: theme.primary }}>
              أضف
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-xl shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
        <div className="absolute inset-x-3 top-3 flex justify-between opacity-0 transition group-hover:opacity-100">
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-800"><Heart size={16} /></button>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-800"><Eye size={16} /></button>
        </div>
      </div>
      <div className="p-4 text-right">
        <h3 className="line-clamp-2 font-heading text-lg font-black text-slate-950">{product.name}</h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-black" style={{ color: theme.primary }}>{money(product.price)}</span>
          <button type="button" onClick={handleAdd} disabled={disabled} className="rounded-2xl px-4 py-2 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-40" style={{ background: theme.primary }}>
            أضف للسلة
          </button>
        </div>
      </div>
    </article>
  );
}

function SectionShell({ section, preview, onAction, index, variant, children }) {
  return (
    <div className={`group/section relative ${getVisibilityClass(section)} ${getAnimationClass(section)}`} style={getSectionStyle(section)}>
      {preview && (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black text-slate-500 shadow-lg backdrop-blur">
          <span>{index + 1}. {section.title}</span>
          <span className="text-slate-300">{section.type}</span>
          {onAction && <button type="button" onClick={() => onAction(section)} className="text-indigo-500">تعديل</button>}
        </div>
      )}
      <div className={variant === "fashion" ? "rounded-none" : "relative"}>{children}</div>
    </div>
  );
}

function SectionHeading({ title, subtitle, theme, variant }) {
  if (variant === "fashion") {
    return (
      <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4 text-right">
        <div>
          <p className="text-xs font-black uppercase tracking-[.35em] text-slate-400">Editorial selection</p>
          <h2 className="mt-2 font-heading text-4xl font-black text-slate-950">{title}</h2>
        </div>
        {subtitle && <p className="hidden max-w-md text-sm leading-7 text-slate-500 sm:block">{subtitle}</p>}
      </div>
    );
  }
  if (variant === "luxury") {
    return (
      <div className="text-right">
        <p className="font-serif text-sm text-[#8a6a22]">SILA COLLECTION</p>
        <h2 className="mt-1 font-serif text-4xl font-bold text-slate-950">{title}</h2>
        {subtitle && <p className="mt-2 text-sm leading-7 text-slate-500">{subtitle}</p>}
      </div>
    );
  }
  return (
    <div className="text-right">
      <h2 className={variant === "tech" ? "font-heading text-3xl font-black text-white" : "font-heading text-3xl font-black"} style={variant !== "tech" ? { color: theme.text } : undefined}>{title}</h2>
      {subtitle && <p className={variant === "tech" ? "mt-2 text-sm leading-7 text-cyan-50/60" : "mt-2 text-sm leading-7"} style={variant !== "tech" ? { color: theme.mutedText } : undefined}>{subtitle}</p>}
    </div>
  );
}

function ActionButton({ children, preview, target = "/", primary = false, theme, variant }) {
  const className =
    variant === "luxury"
      ? `inline-flex items-center justify-center gap-2 border px-6 py-3 font-serif text-sm font-bold transition ${primary ? "border-[#8a6a22] bg-[#8a6a22] text-white" : "border-[#d9c08a] text-[#8a6a22]"}`
      : `inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 ${primary ? "text-white shadow-lg" : "border"}`;
  const style = variant === "luxury" ? undefined : primary ? { background: theme.primary, boxShadow: `0 18px 40px -20px ${theme.primary}` } : { borderColor: variant === "tech" ? "rgba(103,232,249,.35)" : theme.primary, color: variant === "tech" ? "#cffafe" : theme.primary };

  if (preview) return <span className={className} style={style}>{children}<ArrowRight size={16} /></span>;
  return <Link to={target} className={className} style={style}>{children}<ArrowRight size={16} /></Link>;
}

function QuickStat({ stat, variant, compact = false }) {
  return (
    <div className={variant === "tech" ? "rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-right text-cyan-50" : "rounded-2xl border border-slate-200 bg-white/75 p-3 text-right"}>
      <p className="text-[11px] font-bold opacity-65">{stat.label}</p>
      <p className={compact ? "mt-1 text-sm font-black" : "mt-1 font-heading text-lg font-black"}>{stat.value}</p>
    </div>
  );
}

function SliderControls({ active, count, go, variant }) {
  if (count < 2) return null;
  return (
    <div className="absolute bottom-5 left-5 z-10 flex items-center gap-2">
      <button type="button" onClick={() => go(-1)} className={getSliderButtonClass(variant)}><ChevronRight size={18} /></button>
      <button type="button" onClick={() => go(1)} className={getSliderButtonClass(variant)}><ChevronLeft size={18} /></button>
      <div className="mr-2 flex gap-1">
        {Array.from({ length: count }).map((_, index) => (
          <span key={index} className={`h-2 rounded-full transition ${index === active ? "w-8" : "w-2 opacity-40"}`} style={{ background: variant === "tech" ? "#67e8f9" : "#6366f1" }} />
        ))}
      </div>
    </div>
  );
}

function Rating({ value }) {
  return (
    <span className="flex items-center gap-0.5 text-[11px] font-bold text-slate-400">
      <span>{value}</span>
      <Star size={13} className="fill-amber-400 text-amber-400" />
    </span>
  );
}

function getThemeVariant(theme) {
  const slug = `${theme?.slug || ""} ${theme?.name || ""} ${theme?.layout || ""}`.toLowerCase();
  if (slug.includes("dark") || slug.includes("neo") || slug.includes("radar") || slug.includes("gaming") || slug.includes("creative-tech")) return "tech";
  if (slug.includes("royale") || slug.includes("luxury") || slug.includes("gold") || slug.includes("elegance")) return "luxury";
  if (slug.includes("fashion") || slug.includes("stylix") || slug.includes("luna") || slug.includes("style-red")) return "fashion";
  if (slug.includes("campaign") || slug.includes("rush") || slug.includes("glowy") || slug.includes("kids") || slug.includes("dynamic")) return "dynamic";
  return "marketplace";
}

function orderSections(sections, variant, theme) {
  if (theme?.builder) return sections;
  const order = variantOrder[variant] || variantOrder.marketplace;
  return [...sections].sort((a, b) => {
    const ai = order.indexOf(a.type);
    const bi = order.indexOf(b.type);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function getSectionStyle(section) {
  const styles = section.styles || {};
  const style = {};
  if (styles.backgroundType === "color" && styles.backgroundValue) style.background = styles.backgroundValue;
  if (styles.backgroundType === "gradient" && styles.backgroundValue) style.background = styles.backgroundValue;
  if (styles.backgroundType === "image" && styles.backgroundValue) {
    style.backgroundImage = `url("${styles.backgroundValue}")`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
  }
  if (styles.marginTop) style.marginTop = `${styles.marginTop}px`;
  if (styles.marginBottom) style.marginBottom = `${styles.marginBottom}px`;
  if (styles.paddingTop || styles.paddingBottom || styles.paddingLeft || styles.paddingRight) {
    style.paddingTop = styles.paddingTop ? `${styles.paddingTop}px` : undefined;
    style.paddingBottom = styles.paddingBottom ? `${styles.paddingBottom}px` : undefined;
    style.paddingLeft = styles.paddingLeft ? `${styles.paddingLeft}px` : undefined;
    style.paddingRight = styles.paddingRight ? `${styles.paddingRight}px` : undefined;
  }
  if (styles.fontSize) style.fontSize = `${styles.fontSize}px`;
  if (styles.fontWeight) style.fontWeight = styles.fontWeight;
  return style;
}

function getVisibilityClass(section) {
  const visibility = section.visibility || {};
  return [
    visibility.mobile === false ? "max-sm:hidden" : "",
    visibility.tablet === false ? "sm:max-lg:hidden" : "",
    visibility.desktop === false ? "lg:hidden" : "",
  ].filter(Boolean).join(" ");
}

function getAnimationClass(section) {
  const animation = section.animation?.type;
  if (animation === "fade") return "motion-safe:animate-[fadeIn_.45s_ease-out]";
  if (animation === "slide") return "motion-safe:animate-[slideUp_.45s_ease-out]";
  return "";
}

function getCanvasClass(variant) {
  const base = "relative isolate overflow-hidden";
  if (variant === "tech") return `${base} space-y-8 rounded-[32px] bg-slate-950 p-2 sm:p-4`;
  if (variant === "luxury") return `${base} space-y-10 bg-[#fbfaf6] p-2 sm:p-5`;
  if (variant === "fashion") return `${base} space-y-12 bg-white p-0`;
  if (variant === "dynamic") return `${base} space-y-7 rounded-[32px] bg-gradient-to-br from-white via-indigo-50/70 to-fuchsia-50 p-2 sm:p-4`;
  return `${base} space-y-6 rounded-[28px] bg-slate-50 p-2 sm:p-4`;
}

function getCanvasStyle(theme, variant) {
  if (variant === "tech") return { color: "#f8fafc", fontFamily: theme.font };
  if (variant === "luxury") return { color: "#0f172a", fontFamily: theme.font };
  return { background: variant === "fashion" ? "#ffffff" : theme.background, color: theme.text, fontFamily: theme.font };
}

function getAnnouncementClass(variant) {
  if (variant === "luxury") return "flex items-center justify-center gap-3 border border-[#d9c08a]/45 bg-[#8a6a22] px-5 py-3 text-white";
  if (variant === "fashion") return "flex items-center justify-center gap-3 bg-slate-950 px-5 py-3 text-white";
  return "flex items-center justify-between gap-3 rounded-2xl px-5 py-3 text-white shadow-lg";
}

function getAnnouncementStyle(theme, variant) {
  if (variant === "tech") return { background: "linear-gradient(90deg, rgba(14,165,233,.85), rgba(168,85,247,.85))" };
  if (variant === "luxury" || variant === "fashion") return undefined;
  return { background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` };
}

function getOfferClass(variant) {
  if (variant === "tech") return "relative overflow-hidden rounded-[32px] border border-cyan-300/20 bg-white/5 text-white backdrop-blur-xl";
  if (variant === "luxury") return "relative overflow-hidden border border-[#d9c08a]/45 bg-white text-slate-950";
  if (variant === "fashion") return "relative overflow-hidden bg-slate-950 text-white";
  return "relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-200/60";
}

function getTrustCardClass(variant) {
  if (variant === "tech") return "flex items-start gap-4 rounded-3xl border border-cyan-300/20 bg-white/5 p-5 text-white backdrop-blur-xl";
  if (variant === "luxury") return "flex items-start gap-4 border bg-white p-6 text-slate-950";
  return "flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-5 text-slate-950 shadow-sm";
}

function getNewsletterClass(variant) {
  if (variant === "tech") return "flex flex-col gap-5 rounded-[32px] border border-cyan-300/20 bg-white/5 p-6 text-white backdrop-blur-xl md:flex-row md:items-center md:justify-between";
  if (variant === "luxury") return "flex flex-col gap-5 border border-[#d9c08a]/45 bg-white p-8 text-slate-950 md:flex-row md:items-center md:justify-between";
  if (variant === "dynamic") return "flex flex-col gap-5 rounded-[32px] p-7 text-white shadow-xl md:flex-row md:items-center md:justify-between";
  return "flex flex-col gap-5 rounded-[28px] border border-slate-200 bg-white p-6 text-slate-950 shadow-sm md:flex-row md:items-center md:justify-between";
}

function getSliderButtonClass(variant) {
  if (variant === "tech" || variant === "fashion") return "grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25";
  return "grid h-10 w-10 place-items-center rounded-full bg-white text-slate-950 shadow-lg transition hover:-translate-y-0.5";
}

function getAnnouncementOffers(section, theme) {
  const base = [
    { label: "شحن", text: section.title || theme.announcement || "شحن مجاني للطلبات فوق 500 ر.س" },
    { label: "خصم", text: "خصومات موسمية على الأجهزة المختارة" },
    { label: "دعم", text: "دعم سريع وخيارات دفع آمنة" },
  ];
  return section.offers?.length ? section.offers : base;
}

function getHeroSlides(section, theme) {
  const baseSlides = section.slides?.length ? section.slides : [
    {
      title: section.title || theme.heroTitle,
      subtitle: section.subtitle || theme.heroSubtitle,
      image: section.image || theme.heroImage,
      badge: section.badge || "خصم اليوم",
      ctaLabel: section.ctaLabel || "تسوق الآن",
      ctaTarget: section.ctaTarget || "/",
      secondaryLabel: "استعراض الأقسام",
      secondaryTarget: "#categories",
      stats: [
        { label: "جاهز للشحن", value: "24 ساعة" },
        { label: "أجهزة متاحة", value: "+20" },
        { label: "الدفع", value: "آمن ومرن" },
      ],
    },
    {
      title: "باقات المكتب الذكي بسعر أقل لفترة محدودة",
      subtitle: "اختيارات جاهزة تجمع السماعات والملحقات والهواتف لتدعم عملك وأكثر تنظيما.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85",
      badge: "باقة الشركات",
      ctaLabel: "اطلب الباقة",
      ctaTarget: "/checkout",
      secondaryLabel: "حل الملحقات",
      secondaryTarget: "#catalog",
      stats: [
        { label: "توفير", value: "حتى 25%" },
        { label: "تجهيز", value: "خلال يوم" },
        { label: "دعم", value: "مخصص" },
      ],
    },
  ];

  return baseSlides.map((slide, index) => ({
    ...slide,
    title: (index === 0 ? section.title : slide.title) || slide.title || theme.heroTitle,
    subtitle: (index === 0 ? section.subtitle : slide.subtitle) || slide.subtitle || theme.heroSubtitle,
    image: (index === 0 ? section.image : slide.image) || slide.image || theme.heroImage,
    badge: (index === 0 ? section.badge : slide.badge) || slide.badge,
    ctaLabel: slide.ctaLabel || slide.primaryActionLabel || section.ctaLabel || "تسوق الآن",
    ctaTarget: slide.ctaTarget || slide.primaryActionTarget || section.ctaTarget || "/",
    secondaryLabel: slide.secondaryLabel || slide.secondaryActionLabel,
    secondaryTarget: slide.secondaryTarget || slide.secondaryActionTarget,
  }));
}

function pickFeaturedProducts(section, source) {
  if (!section.productIds?.length) return source.slice(0, section.limit || 8);
  const selected = section.productIds.map((id) => products.find((product) => product.id === id)).filter(Boolean);
  return selected.length ? selected : source.slice(0, section.limit || 8);
}
