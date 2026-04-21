import {
  ArrowRight,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Mail,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
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

export default function ThemeCanvas({ theme, preview = false, addItem = () => {}, onSectionAction }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  const featuredProducts = useMemo(() => [...products].sort((a, b) => b.sales - a.sales), []);

  const filteredCatalog = useMemo(() => {
    let list = products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const matchesQuery =
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });

    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "new") list = [...list].sort((a, b) => b.id - a.id);
    return list;
  }, [category, query, sort]);

  const canvasStyle = {
    background: theme.background,
    color: theme.text,
    fontFamily: theme.font,
  };

  return (
    <div className="space-y-6 rounded-[24px] p-1 sm:p-2" style={canvasStyle}>
      {(theme.pageSections || []).filter((section) => section.enabled).map((section, index) => (
        <SectionShell key={section.id} section={section} preview={preview} onAction={onSectionAction} index={index}>
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
          })}
        </SectionShell>
      ))}
    </div>
  );
}

function renderSection({
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
}) {
  if (section.type === "announcement") {
    return <AnnouncementTicker section={section} theme={theme} preview={preview} />;
  }

  if (section.type === "hero") {
    return <HeroSlider section={section} theme={theme} preview={preview} />;
  }

  if (section.type === "categoryList") {
    const sectionCategories = section.categories?.length ? section.categories : categories;
    return (
      <section id="categories" className="space-y-3 sm:space-y-4">
        <SectionHeading title={section.title} subtitle={section.subtitle} theme={theme} />
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:overflow-visible sm:pb-0 sm:grid-cols-2 xl:grid-cols-3 [&::-webkit-scrollbar]:hidden">
          {sectionCategories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className="group relative min-w-[300px] snap-start overflow-hidden rounded-2xl border text-right transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60 sm:min-w-0"
              style={{ background: theme.surface, borderColor: category === item ? theme.primary : "#e2e8f0", color: theme.text }}
            >
              <div className="grid min-h-[118px] grid-cols-[1fr_112px] gap-0 sm:min-h-[146px] sm:grid-cols-[1fr_140px]">
                <div className="flex min-w-0 flex-col justify-between p-3 sm:p-5">
                  <div>
                    <span
                      className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-black text-white sm:px-3 sm:text-xs"
                      style={{ background: category === item ? theme.primary : theme.secondary }}
                    >
                      {category === item ? "التصنيف الحالي" : "استعرض"}
                    </span>
                    <h3 className="mt-3 truncate font-heading text-lg font-black sm:mt-4 sm:text-2xl" style={{ color: theme.text }}>{categoryLabel(item)}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 sm:mt-2 sm:text-sm sm:leading-6" style={{ color: theme.mutedText }}>{categoryVisuals[item]?.subtitle}</p>
                  </div>
                </div>
                <div className="relative min-h-[118px] sm:min-h-[146px]">
                  <img src={categoryVisuals[item]?.image} alt={categoryLabel(item)} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "bannerGrid") {
    return <OfferSlider section={section} theme={theme} preview={preview} />;
  }

  if (section.type === "videoFeature") {
    return (
      <section className="overflow-hidden rounded-2xl border" style={{ background: theme.surface, borderColor: "#e2e8f0" }}>
        <div className="grid gap-0 lg:grid-cols-[1fr_.9fr]">
          <div className="p-5 sm:p-6">
            <SectionHeading title={section.title} subtitle={section.subtitle} theme={theme} />
            {!!section.bullets?.length && (
              <div className="mt-5 grid gap-3">
                {section.bullets.map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold dark:bg-slate-900/60" style={{ color: theme.text }}>
                    {item}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5">
              <ActionButton preview={preview} target={section.ctaTarget} primary theme={theme}>
                {section.ctaLabel}
              </ActionButton>
            </div>
          </div>
          <div className="relative min-h-[320px] overflow-hidden bg-slate-950">
            {preview ? (
              <img src={section.poster} alt={section.title} className="h-full w-full object-cover opacity-80" />
            ) : (
              <iframe
                title={section.title}
                src={section.videoUrl}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "featuredProducts") {
    const scoped = pickFeaturedProducts(section, featuredProducts);
    return (
      <section className="space-y-4">
        <SectionHeading title={section.title} subtitle={section.subtitle} theme={theme} />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {scoped.map((product) => (
            <ProductCard key={product.id} product={product} theme={theme} preview={preview} addItem={addItem} />
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "trust") {
    return (
      <section className="space-y-4">
        <SectionHeading title={section.title} subtitle="" theme={theme} />
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:overflow-visible sm:pb-0 sm:grid-cols-3 sm:gap-4 [&::-webkit-scrollbar]:hidden">
          {(section.items || []).map((item) => {
            const Icon = trustIcons[item.icon] || ShieldCheck;
            return (
              <div key={item.id} className="min-w-[280px] snap-start rounded-2xl border p-4 sm:min-w-0 sm:p-5" style={{ background: theme.surface, borderColor: "#e2e8f0" }}>
                <Icon size={20} style={{ color: theme.primary }} />
                <h3 className="mt-3 font-heading text-base font-black sm:mt-4 sm:text-lg" style={{ color: theme.text }}>{item.title}</h3>
                <p className="mt-2 text-xs leading-5 sm:text-sm sm:leading-6" style={{ color: theme.mutedText }}>{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (section.type === "newsletter") {
    return (
      <section className="rounded-2xl border p-4 sm:p-6" style={{ background: theme.surface, borderColor: "#e2e8f0" }}>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <SectionHeading title={section.title} subtitle={section.subtitle} theme={theme} />
          <div className="grid gap-2 sm:flex sm:flex-row">
            <label className="flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-2 sm:min-w-[260px]" style={{ borderColor: "#e2e8f0" }}>
              <Mail size={16} className="text-slate-400" />
              <input placeholder={section.placeholder} className="w-full bg-transparent text-sm outline-none" style={{ color: theme.text }} />
            </label>
            <button type="button" className="rounded-2xl px-5 py-3 text-sm font-black text-white" style={{ background: theme.secondary }}>
              {section.buttonLabel}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "catalog") {
    const columnsClass = section.columns === 2 ? "xl:grid-cols-2" : section.columns === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4";
    return (
      <section id="catalog" className="space-y-5">
        <SectionHeading title={section.title} subtitle={section.subtitle} theme={theme} />
        <div className="rounded-2xl border p-3 sm:p-4" style={{ background: theme.surface, borderColor: "#e2e8f0" }}>
          <div className="grid gap-2 sm:gap-3 xl:grid-cols-[1fr_auto_auto]">
            {section.allowSearch && (
              <label className="flex items-center gap-2 rounded-2xl border px-3 py-2" style={{ background: theme.surface, borderColor: "#e2e8f0" }}>
                <Search size={18} className="text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث في المتجر" className="w-full bg-transparent text-sm outline-none" style={{ color: theme.text }} />
              </label>
            )}
            {section.allowCategoryFilter && (
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border px-3 py-2 text-sm font-bold outline-none" style={{ background: theme.surface, borderColor: "#e2e8f0", color: theme.text }}>
                {["All", ...categories].map((item) => <option key={item} value={item}>{categoryLabel(item)}</option>)}
              </select>
            )}
            {section.allowSort && (
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-2xl border px-3 py-2 text-sm font-bold outline-none" style={{ background: theme.surface, borderColor: "#e2e8f0", color: theme.text }}>
                <option value="featured">المميز</option>
                <option value="new">الأحدث</option>
                <option value="price-low">السعر من الأقل للأعلى</option>
                <option value="price-high">السعر من الأعلى للأقل</option>
                <option value="rating">الأعلى تقييمًا</option>
              </select>
            )}
          </div>
        </div>

        {filteredCatalog.length ? (
          <div className={`grid grid-cols-2 gap-3 sm:grid-cols-2 ${columnsClass}`}>
            {filteredCatalog.map((product) => (
              <ProductCard key={product.id} product={product} theme={theme} preview={preview} addItem={addItem} compact />
            ))}
          </div>
        ) : (
          <EmptyState title="لا توجد منتجات مطابقة" text="عدّل البحث أو التصنيف أو الترتيب لعرض منتجات مناسبة." />
        )}
      </section>
    );
  }

  return null;
}

function AnnouncementTicker({ section, theme, preview }) {
  const offers = getAnnouncementOffers(section);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (preview || offers.length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % offers.length);
    }, 3200);
    return () => window.clearInterval(interval);
  }, [preview, offers.length]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-4 py-3 text-center text-sm font-black text-white"
      style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
    >
      <div className="relative min-h-[22px]">
        {offers.map((offer, index) => (
          <div
            key={offer.id || index}
            className={`absolute inset-0 flex items-center justify-center transition duration-500 ${activeIndex === index ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}
          >
            <span className="truncate px-2">{offer.text}</span>
          </div>
        ))}
      </div>
      {offers.length > 1 && (
        <div className="absolute left-4 top-1/2 hidden -translate-y-1/2 gap-1 sm:flex">
          {offers.map((offer, index) => (
            <button
              key={offer.id || index}
              type="button"
              aria-label={`إعلان ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full bg-white transition-all ${activeIndex === index ? "w-6 opacity-100" : "w-1.5 opacity-55"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getAnnouncementOffers(section) {
  const fallback = [{ id: section.id, text: section.text }];
  const offers = section.offers?.length ? section.offers : fallback;
  return offers
    .map((offer, index) => ({
      id: offer.id || `${section.id}-${index}`,
      text: offer.text || section.text || "",
    }))
    .filter((offer) => offer.text);
}

function HeroSlider({ section, theme, preview }) {
  const slides = getHeroSlides(section);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex] || slides[0];

  useEffect(() => {
    if (preview || slides.length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(interval);
  }, [preview, slides.length]);

  const goTo = (index) => setActiveIndex((index + slides.length) % slides.length);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 shadow-premium dark:border-slate-800" style={{ background: theme.surface }}>
      <div className={`grid ${theme.layout === "campaign" ? "lg:grid-cols-[.95fr_1.05fr]" : "lg:grid-cols-[1.05fr_.95fr]"}`}>
        <div className="order-2 flex flex-col justify-center p-4 sm:p-8 lg:order-1 lg:min-h-[420px] xl:p-10">
          <Badge tone="accent" className="w-fit">{activeSlide.badge}</Badge>
          <h1 className="mt-4 max-w-2xl text-balance font-heading text-2xl font-black tracking-tight sm:mt-5 sm:text-5xl" style={{ color: theme.text }}>
            {activeSlide.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 sm:mt-4 sm:text-base" style={{ color: theme.mutedText }}>
            {activeSlide.subtitle}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:flex sm:flex-row">
            <ActionButton preview={preview} target={activeSlide.primaryActionTarget} primary theme={theme}>
              {activeSlide.primaryActionLabel}
              <ArrowRight size={18} />
            </ActionButton>
            <ActionButton preview={preview} target={activeSlide.secondaryActionTarget} theme={theme} secondary>
              {activeSlide.secondaryActionLabel}
            </ActionButton>
          </div>
          {!!activeSlide.stats?.length && (
            <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
              {activeSlide.stats.map((item) => (
                <QuickStat key={item.id} label={item.label} value={item.value} surface={theme.surface} />
              ))}
            </div>
          )}
          {slides.length > 1 && (
            <div className="mt-6 flex items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id || index}
                  type="button"
                  aria-label={`عرض ${index + 1}`}
                  onClick={() => goTo(index)}
                  className={`h-2.5 rounded-full transition-all ${activeIndex === index ? "w-9" : "w-2.5 bg-slate-300"}`}
                  style={activeIndex === index ? { background: theme.primary } : undefined}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative order-1 min-h-[210px] overflow-hidden sm:min-h-[360px] lg:order-2">
          {slides.map((slide, index) => (
            <img
              key={slide.id || index}
              src={slide.image}
              alt={slide.title}
              className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${activeIndex === index ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${theme.primary}99, ${theme.secondary}66)` }} />
          {slides.length > 1 && (
            <div className="absolute bottom-3 left-3 flex gap-2 sm:bottom-4 sm:left-4">
              <button type="button" aria-label="العرض السابق" onClick={() => goTo(activeIndex - 1)} className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-900 shadow-lg backdrop-blur sm:h-10 sm:w-10">
                <ChevronRight size={18} />
              </button>
              <button type="button" aria-label="العرض التالي" onClick={() => goTo(activeIndex + 1)} className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-900 shadow-lg backdrop-blur sm:h-10 sm:w-10">
                <ChevronLeft size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function OfferSlider({ section, theme, preview }) {
  const items = section.items || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] || items[0];

  useEffect(() => {
    if (preview || items.length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % items.length);
    }, 4300);
    return () => window.clearInterval(interval);
  }, [preview, items.length]);

  if (!activeItem) return null;

  return (
    <section className="space-y-4">
      <SectionHeading title={section.title} subtitle={section.subtitle} theme={theme} />
      <article className="overflow-hidden rounded-2xl border" style={{ background: theme.surface, borderColor: "#e2e8f0" }}>
        <div className="grid gap-0 sm:grid-cols-[1fr_220px] lg:grid-cols-[1fr_360px]">
          <div className="flex min-h-[190px] flex-col justify-center p-4 sm:min-h-[250px] sm:p-7">
            <Badge tone="accent" className="w-fit">{activeItem.badge || "عرض الشريك"}</Badge>
            <h3 className="mt-3 font-heading text-xl font-black sm:mt-4 sm:text-3xl" style={{ color: theme.text }}>{activeItem.title}</h3>
            <p className="mt-2 max-w-2xl text-xs leading-5 sm:mt-3 sm:text-sm sm:leading-6" style={{ color: theme.mutedText }}>{activeItem.subtitle}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-5">
              <ActionButton preview={preview} target={activeItem.ctaTarget} primary theme={theme}>
                {activeItem.ctaLabel}
              </ActionButton>
              {items.length > 1 && (
                <div className="flex items-center gap-2">
                  {items.map((item, index) => (
                    <button
                      key={item.id || index}
                      type="button"
                      aria-label={`عرض الشريك ${index + 1}`}
                      onClick={() => setActiveIndex(index)}
                      className={`h-2.5 rounded-full transition-all ${activeIndex === index ? "w-8" : "w-2.5 bg-slate-300"}`}
                      style={activeIndex === index ? { background: theme.secondary } : undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="relative min-h-[170px] overflow-hidden sm:min-h-[240px]">
            {items.map((item, index) => (
              <img
                key={item.id || index}
                src={item.image}
                alt={item.title}
                className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${activeIndex === index ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
              />
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}

function getHeroSlides(section) {
  const fallback = {
    id: section.id,
    title: section.title,
    subtitle: section.subtitle,
    badge: section.badge,
    image: section.image,
    primaryActionLabel: section.primaryActionLabel,
    primaryActionTarget: section.primaryActionTarget,
    secondaryActionLabel: section.secondaryActionLabel,
    secondaryActionTarget: section.secondaryActionTarget,
    stats: section.stats || [],
  };

  const slides = section.slides?.length ? section.slides : [fallback];
  return slides.map((slide, index) => ({
    ...fallback,
    ...slide,
    id: slide.id || `${section.id}-${index}`,
    stats: slide.stats?.length ? slide.stats : fallback.stats,
  }));
}

function SectionShell({ section, preview, children, onAction, index }) {
  if (!preview) return children;
  return (
    <div className="relative">
      {onAction && (
        <div className="mb-2 flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white/70 px-3 py-2 text-xs font-black text-slate-500">
          <span>{index + 1}. {section.title || section.type}</span>
          <button type="button" onClick={() => onAction(section.id)} className="text-accent">
            تعديل
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

function SectionHeading({ title, subtitle, theme }) {
  return (
    <div>
      <h2 className="font-heading text-xl font-black sm:text-2xl" style={{ color: theme.text }}>{title}</h2>
      {subtitle ? <p className="text-xs leading-5 sm:text-sm" style={{ color: theme.mutedText }}>{subtitle}</p> : null}
    </div>
  );
}

function ProductCard({ product, theme, preview, addItem, compact = false }) {
  const content = (
    <article className="group overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70" style={{ background: theme.surface, borderColor: "#e2e8f0" }}>
      <div className="relative block">
        <img src={product.image} alt={product.name} className={`w-full object-cover transition duration-500 group-hover:scale-[1.03] ${compact ? "h-28 sm:h-48" : "h-40 sm:h-52"}`} />
        <Badge tone={statusTone(stockState(product))} className="absolute right-3 top-3">{statusLabel(stockState(product))}</Badge>
      </div>
      <div className="p-3 sm:p-4">
        <p className="truncate text-[11px] font-bold uppercase tracking-wide text-slate-400 sm:text-xs">{categoryLabel(product.category)}</p>
        <div className={`mt-1 block rounded-xl font-heading font-black leading-5 ${compact ? "min-h-[42px] text-sm sm:min-h-[56px] sm:text-lg" : "text-base sm:text-xl"}`} style={{ color: theme.text }}>
          {product.name}
        </div>
        <div className="mt-2 flex items-center justify-between sm:mt-3">
          <Rating value={product.rating} compact />
          <p className="font-heading text-xs font-black sm:text-lg" style={{ color: theme.text }}>{money(product.price)}</p>
        </div>
        <button
          type="button"
          onClick={() => addItem(product, 1)}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50 sm:mt-4 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
          style={{ background: theme.primary }}
          disabled={preview || product.stock === 0}
        >
          <ShoppingCart size={16} />
          {product.stock === 0 ? "غير متوفر" : "أضف للسلة"}
        </button>
      </div>
    </article>
  );

  if (preview) return content;
  return <Link to={`/products/${product.id}`}>{content}</Link>;
}

function ActionButton({ preview, target, primary = false, secondary = false, theme, children }) {
  const className = primary
    ? "inline-flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-3 text-center text-xs font-black text-white shadow-lg sm:rounded-2xl sm:px-5 sm:text-sm"
    : "inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-center text-xs font-black sm:rounded-2xl sm:px-5 sm:text-sm";
  const style = primary
    ? { background: theme.primary }
    : secondary
      ? { borderColor: theme.primary, color: theme.text }
      : {};

  if (preview) {
    return <button type="button" className={className} style={style}>{children}</button>;
  }

  if (String(target || "").startsWith("#")) {
    return <a href={target} className={className} style={style}>{children}</a>;
  }

  return <Link to={target || "/"} className={className} style={style}>{children}</Link>;
}

function QuickStat({ label, value, surface }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white/70 px-2 py-2 dark:border-slate-800 dark:bg-slate-900/40 sm:rounded-2xl sm:px-4 sm:py-3" style={{ background: surface }}>
      <p className="truncate text-[10px] font-bold text-slate-500 sm:text-xs">{label}</p>
      <p className="mt-1 truncate font-heading text-sm font-black text-slate-950 sm:text-lg dark:text-white">{value}</p>
    </div>
  );
}

function Rating({ value, compact = false }) {
  return (
    <div className="flex items-center gap-1 text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={compact ? 13 : 15} fill={index < Math.round(value) ? "currentColor" : "none"} />
      ))}
      <span className="mr-1 text-xs font-bold text-slate-500">{value}</span>
    </div>
  );
}

function pickFeaturedProducts(section, featuredProducts) {
  if (section.mode === "manual" && section.manualIds?.length) {
    return products.filter((product) => section.manualIds.includes(product.id)).slice(0, section.limit || 8);
  }

  if (section.mode === "category" && section.category && section.category !== "All") {
    return featuredProducts.filter((product) => product.category === section.category).slice(0, section.limit || 8);
  }

  return featuredProducts.slice(0, section.limit || 8);
}
