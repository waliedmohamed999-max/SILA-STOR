import { Copy, Eye, Filter, Grid3X3, PencilLine, Plus, Search, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Pagination from "../components/Pagination";
import { useStorefrontThemes } from "../context/StorefrontThemeContext";
import { storefrontLayoutOptions, storefrontSectionLabels } from "../data/storefrontThemes";

const pageSize = 12;
const fixedActiveSlug = "sila-premium";
const categoryOptions = ["الكل", "أزياء", "الجمال", "منزل", "أقمشة", "أطفال", "عروض", "ألعاب", "فاخر", "تطبيق", "تقنية", "إلكترونيات"];

export default function StorefrontManager() {
  const { themes, selectedId, selectedTheme, activeTheme, setSelectedId, activateTheme, duplicateTheme, deleteTheme } = useStorefrontThemes();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("الكل");
  const [layoutFilter, setLayoutFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filteredThemes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return themes
      .filter((theme) => {
        const searchable = `${theme.name} ${theme.slug} ${theme.layout} ${theme.category || ""} ${theme.author || ""}`.toLowerCase();
        const matchesQuery = !normalized || searchable.includes(normalized);
        const matchesCategory = category === "الكل" || theme.category === category;
        const matchesLayout = layoutFilter === "all" || theme.layout === layoutFilter;
        return matchesQuery && matchesCategory && matchesLayout;
      })
      .sort((a, b) => Number(b.active) - Number(a.active) || Number(b.builtIn) - Number(a.builtIn) || (b.installs || 0) - (a.installs || 0));
  }, [themes, query, category, layoutFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredThemes.length / pageSize));
  const pagedThemes = filteredThemes.slice((page - 1) * pageSize, page * pageSize);

  const updatePage = (callback) => {
    callback();
    setPage(1);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <section className="card overflow-hidden p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent/10 text-accent">
                <Grid3X3 size={21} />
              </span>
              <div className="min-w-0">
                <h1 className="font-heading text-xl font-black text-slate-950 sm:text-2xl dark:text-white">تصفح جميع الثيمات</h1>
                <p className="mt-1 text-sm text-slate-500">ثيمات مجانية جاهزة للمتجر، قابلة للتفعيل والتخصيص من محرر الواجهة.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <a href="/" target="_blank" rel="noreferrer" className="min-w-0">
              <Button variant="secondary" className="w-full justify-center sm:w-auto">
                <Eye size={17} />
                عرض المتجر
              </Button>
            </a>
            <Link to="/admin/storefront/editor/new" className="min-w-0">
              <Button className="w-full justify-center sm:w-auto">
                <Plus size={17} />
                إنشاء ثيم جديد
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
            <Search size={17} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => updatePage(() => setQuery(event.target.value))}
              placeholder="ابحث باسم الثيم أو المصمم"
              className="w-full bg-transparent text-sm outline-none dark:text-white"
            />
          </label>
          <select
            value={layoutFilter}
            onChange={(event) => updatePage(() => setLayoutFilter(event.target.value))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">كل التخطيطات</option>
            {storefrontLayoutOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-500 dark:border-slate-800 dark:bg-slate-950">
            <Filter size={16} />
            {filteredThemes.length} ثيم
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categoryOptions.map((item) => {
            const count = item === "الكل" ? themes.length : themes.filter((theme) => theme.category === item).length;
            return (
              <button
                key={item}
                onClick={() => updatePage(() => setCategory(item))}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black transition ${
                  category === item
                    ? "border-accent bg-accent text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                }`}
              >
                {item} <span className="text-xs opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {pagedThemes.map((theme) => (
          <ThemeMarketCard
            key={theme.id}
            theme={theme}
            selected={selectedId === theme.id}
            onSelect={() => setSelectedId(theme.id)}
            onActivate={() => activateTheme(theme.id)}
          />
        ))}
      </section>

      <div className="card p-3">
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="card overflow-hidden p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">الثيم المحدد</h2>
              <p className="mt-1 text-sm text-slate-500">صورة مصغرة للثيم مع وصف وتقسيم الصفحة، وليست عرض المتجر بالكامل.</p>
            </div>
            <div className="grid w-full gap-2 sm:w-auto sm:grid-flow-col sm:flex-wrap">
              <Link to={`/admin/storefront/editor/${selectedTheme.id}`}>
                <Button variant="secondary" className="w-full justify-center sm:w-auto">
                  <PencilLine size={17} />
                  تخصيص
                </Button>
              </Link>
              <Button variant="secondary" onClick={() => duplicateTheme(selectedTheme.id)} className="w-full justify-center sm:w-auto">
                <Copy size={17} />
                نسخ
              </Button>
              <Button variant="danger" onClick={() => deleteTheme(selectedTheme.id)} disabled={selectedTheme.active} className="w-full justify-center sm:w-auto">
                <Trash2 size={17} />
                حذف
              </Button>
            </div>
          </div>
          <ThemeShowcaseCard theme={selectedTheme} />
        </div>

        <div className="card overflow-hidden p-4 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">الثيم النشط</h2>
              <p className="mt-1 text-sm text-slate-500">هذا هو الثيم المنشور حاليًا على واجهة المتجر.</p>
            </div>
            <Badge tone="success">منشور</Badge>
          </div>
          <ThemeShowcaseCard theme={activeTheme} compact />
        </div>
      </section>
    </div>
  );
}

function ThemeMarketCard({ theme, selected, onSelect, onActivate }) {
  const fixedActive = theme.slug === fixedActiveSlug;

  return (
    <article
      className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:bg-slate-950 dark:hover:shadow-black/20 ${
        selected ? "border-accent ring-2 ring-accent/20" : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <button type="button" onClick={onSelect} className="block w-full text-right">
        <ThemeMockupImage theme={theme} className="h-40 rounded-none border-0 p-0 shadow-none sm:h-44" compact />
      </button>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-heading text-lg font-black text-slate-950 dark:text-white">{theme.name}</h3>
              {theme.active ? <Badge tone="success">مفعل</Badge> : <Badge tone="accent">مجاني</Badge>}
            </div>
            <p className="mt-1 truncate text-xs font-bold text-slate-500">بواسطة {theme.author || "SILA"}</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-black text-amber-500">
            <Star size={14} fill="currentColor" />
            {theme.rating || 5}
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-heading text-lg font-black text-slate-950 dark:text-white">مجاني</p>
            <p className="text-xs font-bold text-slate-400 line-through">{theme.oldPrice || 499}.00 ر.س</p>
          </div>
          <p className="min-w-0 truncate text-xs font-bold text-slate-500">{theme.category || "متجر"} · {theme.installs || 0} تحميل</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to={`/admin/storefront/editor/${theme.id}`}>
            <Button variant="secondary" className="w-full justify-center text-xs">تخصيص</Button>
          </Link>
          <Button onClick={onActivate} disabled={theme.active} className="w-full justify-center text-xs">
            {theme.active ? "منشور" : "تفعيل"}
          </Button>
        </div>
      </div>
    </article>
  );
}

function ThemeShowcaseCard({ theme, compact = false }) {
  const visibleSections = (theme.pageSections || []).filter((section) => section.enabled);
  const hero = theme.pageSections?.find((section) => section.type === "hero");
  const description = hero?.subtitle || theme.heroSubtitle || "ثيم مجاني جاهز للمتجر مع أقسام منظمة وقابل للتخصيص.";

  return (
    <article className={`grid min-w-0 gap-5 ${compact ? "" : "lg:grid-cols-[minmax(260px,460px)_1fr] lg:items-start"}`}>
      <ThemeMockupImage theme={theme} className={compact ? "h-48 sm:h-56" : "h-56 sm:h-72"} />
      <div className="min-w-0 space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-xl font-black text-slate-950 sm:text-2xl dark:text-white">{theme.name}</h3>
            <Badge tone={theme.active ? "success" : "accent"}>{theme.active ? "منشور" : "مجاني"}</Badge>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">{description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="التصنيف" value={theme.category || "متجر"} />
          <Metric label="التخطيط" value={theme.layout} />
          <Metric label="الأقسام" value={visibleSections.length} />
          <Metric label="السعر" value="مجاني" />
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="mb-3 text-xs font-black text-slate-500">تقسيم الصفحة</p>
          <div className="flex flex-wrap gap-2">
            {visibleSections.slice(0, 8).map((section, index) => (
              <span key={section.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                {index + 1}. {storefrontSectionLabels[section.type] || section.type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function ThemeMockupImage({ theme, className = "h-72", compact = false }) {
  const hero = theme.pageSections?.find((section) => section.type === "hero");
  const sections = (theme.pageSections || []).filter((section) => section.enabled).slice(0, compact ? 4 : 7);

  return (
    <div className={`max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm sm:p-3 dark:border-slate-800 dark:bg-slate-950 ${className}`}>
      <div className="flex h-full flex-col overflow-hidden rounded-2xl" style={{ background: theme.background }}>
        <div className="flex h-8 shrink-0 items-center gap-1.5 px-3" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}>
          <span className="h-2 w-2 rounded-full bg-white/70" />
          <span className="h-2 w-2 rounded-full bg-white/50" />
          <span className="h-2 w-8 rounded-full bg-white/80" />
          <span className="mr-auto h-3 w-20 rounded-full bg-white/70" />
        </div>

        <div className="grid min-h-0 flex-1 gap-2 p-2">
          <div className="grid min-h-0 grid-cols-[1fr_.9fr] overflow-hidden rounded-xl border border-slate-200/70" style={{ background: theme.surface }}>
            <div className="relative overflow-hidden">
              <img src={hero?.image || theme.heroImage} alt={theme.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ background: `${theme.primary}55` }} />
            </div>
            <div className="flex min-w-0 flex-col justify-center gap-1.5 p-2 sm:p-3">
              <span className="h-4 w-16 rounded-full" style={{ background: `${theme.primary}22` }} />
              <span className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
              <span className="h-3 w-4/5 rounded-full bg-slate-200 dark:bg-slate-800" />
              <span className="mt-1 h-5 w-16 rounded-lg sm:h-6 sm:w-20" style={{ background: theme.primary }} />
            </div>
          </div>

          <div className={`grid gap-2 ${compact ? "grid-cols-2 min-[420px]:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
            {sections.map((section, index) => (
              <div key={section.id} className="rounded-lg border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-1.5 h-7 rounded-md" style={{ background: index % 2 ? `${theme.secondary}26` : `${theme.primary}26` }} />
                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="mt-1 h-1.5 w-2/3 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-2 font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
