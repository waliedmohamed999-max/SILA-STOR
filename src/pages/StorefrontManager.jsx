import { Copy, Eye, MonitorSmartphone, PencilLine, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Pagination from "../components/Pagination";
import ThemeCanvas from "../components/storefront/ThemeCanvas";
import { useStorefrontThemes } from "../context/StorefrontThemeContext";
import { storefrontLayoutOptions, storefrontSectionLabels } from "../data/storefrontThemes";

const pageSize = 4;

export default function StorefrontManager() {
  const {
    themes,
    selectedId,
    selectedTheme,
    activeTheme,
    setSelectedId,
    activateTheme,
    duplicateTheme,
    deleteTheme,
  } = useStorefrontThemes();

  const [query, setQuery] = useState("");
  const [layoutFilter, setLayoutFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filteredThemes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return themes
      .filter((theme) => {
        const matchesQuery =
          !normalized ||
          theme.name.toLowerCase().includes(normalized) ||
          theme.layout.toLowerCase().includes(normalized) ||
          theme.slug.toLowerCase().includes(normalized);
        const matchesLayout = layoutFilter === "all" || theme.layout === layoutFilter;
        return matchesQuery && matchesLayout;
      })
      .sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name));
  }, [themes, query, layoutFilter]);

  const pagedThemes = filteredThemes.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-black text-slate-950 dark:text-white">واجهة المتجر والثيمات</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              إدارة الثيمات المنشورة، ومعاينة الواجهة، وفتح محرر مستقل لبناء صفحة المتجر بالكامل.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/" target="_blank" rel="noreferrer">
              <Button variant="secondary">
                <Eye size={17} />
                عرض المتجر
              </Button>
            </a>
            <Link to="/admin/storefront/editor/new">
              <Button>
                <Plus size={17} />
                إنشاء ثيم جديد
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.15fr_.85fr]">
        <div className="card p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">الثيم النشط</h2>
              <p className="mt-1 text-sm text-slate-500">هذه الواجهة التي يراها العملاء الآن في المتجر العام.</p>
            </div>
            <Badge tone="success">منشور</Badge>
          </div>
          <ThemeCanvas theme={activeTheme} preview />
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-heading text-2xl font-black text-slate-950 dark:text-white">{activeTheme.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {activeTheme.version} · {activeTheme.layout} · {activeTheme.slug}
                </p>
              </div>
              <Badge tone={activeTheme.builtIn ? "accent" : "warning"}>{activeTheme.builtIn ? "مبني" : "مخصص"}</Badge>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Metric label="الأقسام" value={activeTheme.pageSections?.length || 0} />
              <Metric label="الأقسام الظاهرة" value={(activeTheme.pageSections || []).filter((item) => item.enabled).length} />
              <Metric label="الخط" value={activeTheme.font} />
              <Metric label="آخر تعديل" value={activeTheme.updatedAt} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={`/admin/storefront/editor/${activeTheme.id}`}>
                <Button variant="secondary">
                  <PencilLine size={17} />
                  فتح المحرر
                </Button>
              </Link>
              <Button variant="secondary" onClick={() => duplicateTheme(activeTheme.id)}>
                <Copy size={17} />
                نسخ الثيم
              </Button>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">خريطة الصفحة</h3>
            <div className="mt-4 grid gap-3">
              {(activeTheme.pageSections || []).map((section, index) => (
                <div key={section.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
                  <div>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                      {index + 1}. {section.title || storefrontSectionLabels[section.type]}
                    </p>
                    <p className="text-xs text-slate-500">{storefrontSectionLabels[section.type]}</p>
                  </div>
                  <Badge tone={section.enabled ? "success" : "neutral"}>{section.enabled ? "ظاهر" : "مخفي"}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">الثيمات المثبتة</h2>
            <p className="mt-1 text-sm text-slate-500">فعّل ثيمًا جاهزًا أو افتحه في محرر الصفحة الكامل.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex min-w-[240px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
              <Search size={17} className="text-slate-400" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="ابحث في الثيمات"
                className="w-full bg-transparent text-sm outline-none dark:text-white"
              />
            </label>
            <select
              value={layoutFilter}
              onChange={(event) => {
                setLayoutFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="all">كل التخطيطات</option>
              {storefrontLayoutOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {pagedThemes.map((theme) => (
            <article
              key={theme.id}
              className={`rounded-2xl border p-4 transition ${
                selectedId === theme.id ? "border-accent bg-accent/5" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="grid gap-5 lg:grid-cols-[220px_1fr_auto] lg:items-center">
                <ThemeMiniPreview theme={theme} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setSelectedId(theme.id)} className="font-heading text-lg font-black text-slate-950 transition hover:text-accent dark:text-white">
                      {theme.name}
                    </button>
                    <Badge tone={theme.active ? "success" : theme.builtIn ? "accent" : "warning"}>
                      {theme.active ? "مفعل" : theme.builtIn ? "مبني" : "مخصص"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{theme.slug} · {theme.layout}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
                    <span>{theme.pageSections?.length || 0} قسم</span>
                    <span>{theme.updatedAt}</span>
                    <span>{theme.font}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Button variant="secondary" onClick={() => setSelectedId(theme.id)}>تفاصيل</Button>
                  <Link to={`/admin/storefront/editor/${theme.id}`}>
                    <Button variant="secondary">تخصيص</Button>
                  </Link>
                  <Button onClick={() => activateTheme(theme.id)} disabled={theme.active}>تفعيل ونشر</Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5">
          <Pagination page={page} totalPages={Math.max(1, Math.ceil(filteredThemes.length / pageSize))} onPage={setPage} />
        </div>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1fr_.8fr]">
        <div className="card p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">الثيم المحدد</h2>
              <p className="mt-1 text-sm text-slate-500">معاينة سريعة مع أدوات النسخ والحذف والتعديل.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/admin/storefront/editor/${selectedTheme.id}`}>
                <Button variant="secondary">
                  <PencilLine size={17} />
                  تعديل
                </Button>
              </Link>
              <Button variant="secondary" onClick={() => duplicateTheme(selectedTheme.id)}>
                <Copy size={17} />
                نسخ
              </Button>
              <Button variant="danger" onClick={() => deleteTheme(selectedTheme.id)} disabled={selectedTheme.active}>
                <Trash2 size={17} />
                حذف
              </Button>
            </div>
          </div>
          <ThemeCanvas theme={selectedTheme} preview />
        </div>

        <div className="card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <MonitorSmartphone size={20} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">مواصفات الثيم</h2>
              <p className="text-sm text-slate-500">الألوان والخطوط وبنية الصفحة.</p>
            </div>
          </div>
          <PaletteStrip theme={selectedTheme} />
          <div className="mt-5 grid gap-3">
            {[
              ["اسم الثيم", selectedTheme.name],
              ["نوع التخطيط", selectedTheme.layout],
              ["الرابط", selectedTheme.slug],
              ["الأقسام", selectedTheme.pageSections?.length || 0],
              ["آخر تعديل", selectedTheme.updatedAt],
            ].map(([label, value]) => (
              <Metric key={label} label={label} value={value} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ThemeMiniPreview({ theme }) {
  const hero = theme.pageSections?.find((section) => section.type === "hero");
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="h-32 w-full" style={{ background: theme.background }}>
        <div className="h-8" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }} />
        <div className="grid h-24 grid-cols-[1fr_70px] gap-2 p-2">
          <div className="rounded-xl" style={{ background: theme.surface }}>
            <div className="m-2 h-3 w-16 rounded-full" style={{ background: theme.primary }} />
            <div className="mx-2 mt-2 h-2 w-24 rounded-full bg-slate-200" />
            <div className="mx-2 mt-1 h-2 w-16 rounded-full bg-slate-200" />
          </div>
          <img src={hero?.image || theme.heroImage} alt={theme.name} className="h-full w-full rounded-xl object-cover" />
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

function PaletteStrip({ theme }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        ["Primary", theme.primary],
        ["Secondary", theme.secondary],
        ["Background", theme.background],
        ["Surface", theme.surface],
      ].map(([label, color]) => (
        <div key={label} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="h-12 rounded-2xl" style={{ background: color }} />
          <p className="mt-3 text-xs font-bold text-slate-500">{label}</p>
          <p className="mt-1 font-black text-slate-950 dark:text-white">{color}</p>
        </div>
      ))}
    </div>
  );
}
