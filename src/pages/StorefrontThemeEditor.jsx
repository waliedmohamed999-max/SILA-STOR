import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Copy,
  LayoutTemplate,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import ThemeCanvas from "../components/storefront/ThemeCanvas";
import ToggleSwitch from "../components/ToggleSwitch";
import { useStorefrontThemes } from "../context/StorefrontThemeContext";
import { categories, products } from "../data/products";
import {
  createThemeSection,
  emptyStorefrontTheme,
  normalizeStorefrontTheme,
  sectionTypeOptions,
  storefrontFontOptions,
  storefrontLayoutOptions,
  storefrontSectionLabels,
} from "../data/storefrontThemes";
import { categoryLabel } from "../utils/labels";

export default function StorefrontThemeEditor() {
  const { themeId } = useParams();
  const navigate = useNavigate();
  const { themes, saveTheme } = useStorefrontThemes();

  const sourceTheme = useMemo(() => {
    if (themeId === "new") return { ...emptyStorefrontTheme, id: undefined, slug: "custom-theme" };
    return themes.find((theme) => String(theme.id) === String(themeId)) || themes[0] || emptyStorefrontTheme;
  }, [themeId, themes]);

  const [form, setForm] = useState(() => cloneTheme(sourceTheme));
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [sectionType, setSectionType] = useState("bannerGrid");

  useEffect(() => {
    const next = cloneTheme(sourceTheme);
    setForm(next);
    setSelectedSectionId(next.pageSections?.[0]?.id || "");
  }, [sourceTheme]);

  const selectedSection = form.pageSections.find((section) => section.id === selectedSectionId) || form.pageSections[0];

  const updateTheme = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateSection = (sectionId, updates) =>
    setForm((current) => ({
      ...current,
      pageSections: current.pageSections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
    }));

  const addSection = () => {
    const next = createThemeSection(sectionType);
    setForm((current) => ({ ...current, pageSections: [...current.pageSections, next] }));
    setSelectedSectionId(next.id);
  };

  const duplicateSection = (sectionId) => {
    const section = form.pageSections.find((item) => item.id === sectionId);
    if (!section) return;
    const copy = {
      ...clone(section),
      id: createLocalId("section"),
      title: `${section.title || storefrontSectionLabels[section.type]} - نسخة`,
    };
    setForm((current) => ({ ...current, pageSections: [...current.pageSections, copy] }));
    setSelectedSectionId(copy.id);
  };

  const removeSection = (sectionId) => {
    setForm((current) => {
      const nextSections = current.pageSections.filter((section) => section.id !== sectionId);
      setSelectedSectionId(nextSections[0]?.id || "");
      return { ...current, pageSections: nextSections };
    });
  };

  const moveSection = (sectionId, direction) => {
    setForm((current) => {
      const index = current.pageSections.findIndex((section) => section.id === sectionId);
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.pageSections.length) return current;
      const nextSections = [...current.pageSections];
      [nextSections[index], nextSections[nextIndex]] = [nextSections[nextIndex], nextSections[index]];
      return { ...current, pageSections: nextSections };
    });
  };

  const save = () => {
    saveTheme(normalizeStorefrontTheme(form));
    navigate("/admin/storefront");
  };

  return (
    <div className="min-h-[calc(100vh-84px)] space-y-4">
      <section className="sticky top-[73px] z-10 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">Theme Builder</p>
            <h1 className="font-heading text-2xl font-black text-slate-950 dark:text-white">محرر الثيم الكامل</h1>
            <p className="mt-1 text-sm text-slate-500">صفحة مستقلة لتعديل الثيم وبناء واجهة المتجر بالكامل بسهولة.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/storefront">
              <Button variant="secondary">
                <X size={17} />
                إغلاق
              </Button>
            </Link>
            <Button onClick={save}>
              <Save size={17} />
              حفظ الثيم
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-5 2xl:grid-cols-[440px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="card p-5">
            <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">إعدادات الثيم</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="اسم الثيم" value={form.name} onChange={(value) => updateTheme("name", value)} />
              <Field label="Slug" value={form.slug || ""} onChange={(value) => updateTheme("slug", value)} />
              <Select label="نوع التخطيط" value={form.layout} onChange={(value) => updateTheme("layout", value)} options={storefrontLayoutOptions} />
              <Select label="الخط" value={form.font} onChange={(value) => updateTheme("font", value)} options={storefrontFontOptions} />
              <ColorField label="اللون الأساسي" value={form.primary} onChange={(value) => updateTheme("primary", value)} />
              <ColorField label="اللون الثانوي" value={form.secondary} onChange={(value) => updateTheme("secondary", value)} />
              <ColorField label="الخلفية" value={form.background} onChange={(value) => updateTheme("background", value)} />
              <ColorField label="سطح البطاقات" value={form.surface} onChange={(value) => updateTheme("surface", value)} />
              <ColorField label="لون النص" value={form.text} onChange={(value) => updateTheme("text", value)} />
              <ColorField label="لون النص الثانوي" value={form.mutedText} onChange={(value) => updateTheme("mutedText", value)} />
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">أقسام الصفحة</h2>
                <p className="text-xs text-slate-500">أضف، انسخ، احذف، أو حرّك أي جزء.</p>
              </div>
              <LayoutTemplate size={20} className="text-accent" />
            </div>

            <div className="mt-4 flex gap-2">
              <select
                value={sectionType}
                onChange={(event) => setSectionType(event.target.value)}
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {sectionTypeOptions.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <Button type="button" onClick={addSection} size="sm">
                <Plus size={16} />
                إضافة
              </Button>
            </div>

            <div className="mt-4 grid gap-2">
              {form.pageSections.map((section, index) => (
                <div
                  key={section.id}
                  className={`rounded-2xl border p-3 transition ${
                    selectedSection?.id === section.id
                      ? "border-accent bg-accent/5"
                      : "border-slate-200 hover:border-indigo-200 dark:border-slate-800"
                  }`}
                >
                  <button type="button" onClick={() => setSelectedSectionId(section.id)} className="w-full text-right">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-950 dark:text-white">
                          {index + 1}. {section.title || storefrontSectionLabels[section.type]}
                        </p>
                        <p className="text-xs text-slate-500">{storefrontSectionLabels[section.type]}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${section.enabled ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-500 dark:bg-slate-900"}`}>
                        {section.enabled ? "ظاهر" : "مخفي"}
                      </span>
                    </div>
                  </button>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <IconButton label="رفع" icon={ArrowUp} onClick={() => moveSection(section.id, "up")} disabled={index === 0} />
                    <IconButton label="خفض" icon={ArrowDown} onClick={() => moveSection(section.id, "down")} disabled={index === form.pageSections.length - 1} />
                    <IconButton label="نسخ" icon={Copy} onClick={() => duplicateSection(section.id)} />
                    <IconButton label="حذف" icon={Trash2} onClick={() => removeSection(section.id)} disabled={form.pageSections.length <= 1} danger />
                    <ToggleSwitch
                      checked={section.enabled}
                      onChange={(checked) => updateSection(section.id, { enabled: checked })}
                      label="إظهار القسم"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {selectedSection && (
            <SectionEditor
              section={selectedSection}
              onChange={(updates) => updateSection(selectedSection.id, updates)}
            />
          )}
        </aside>

        <main className="rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-950">
            <div>
              <p className="font-heading text-lg font-black text-slate-950 dark:text-white">معاينة مباشرة</p>
              <p className="text-xs text-slate-500">اضغط على أي قسم في المعاينة لتعديل إعداداته.</p>
            </div>
            <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-black text-accent">
              عرض المتجر
              <ArrowRight size={16} />
            </a>
          </div>
          <ThemeCanvas
            theme={normalizeStorefrontTheme(form)}
            preview
            onSectionAction={(sectionId) => setSelectedSectionId(sectionId)}
          />
        </main>
      </div>
    </div>
  );
}

function SectionEditor({ section, onChange }) {
  const updateArrayItem = (key, itemId, updates) => {
    onChange({
      [key]: (section[key] || []).map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
    });
  };

  const addArrayItem = (key, template) => {
    onChange({ [key]: [...(section[key] || []), { id: createLocalId("item"), ...template }] });
  };

  const removeArrayItem = (key, itemId) => {
    onChange({ [key]: (section[key] || []).filter((item) => item.id !== itemId) });
  };

  return (
    <section className="card p-5">
      <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">إعدادات القسم</h2>
      <p className="text-xs text-slate-500">{storefrontSectionLabels[section.type]}</p>

      <div className="mt-4 grid gap-4">
        {section.type === "announcement" && (
          <>
            <TextAreaField label="نص الإعلان الافتراضي" value={section.text || ""} onChange={(value) => onChange({ text: value, title: section.title || "شريط الإعلان" })} />
            <Repeater
              title="عروض الشريط المتحرك"
              items={section.offers || []}
              addLabel="إضافة عرض"
              onAdd={() => addArrayItem("offers", { text: "عرض جديد في الشريط" })}
              onRemove={(itemId) => removeArrayItem("offers", itemId)}
              renderItem={(item) => (
                <TextAreaField label="نص العرض" value={item.text || ""} onChange={(value) => updateArrayItem("offers", item.id, { text: value })} />
              )}
            />
          </>
        )}

        {section.type !== "announcement" && (
          <Field label="عنوان القسم" value={section.title || ""} onChange={(value) => onChange({ title: value })} />
        )}

        {["hero", "categoryList", "bannerGrid", "videoFeature", "featuredProducts", "newsletter", "catalog"].includes(section.type) && (
          <TextAreaField label="الوصف" value={section.subtitle || ""} onChange={(value) => onChange({ subtitle: value })} />
        )}

        {section.type === "hero" && (
          <>
            <Field label="الشارة" value={section.badge || ""} onChange={(value) => onChange({ badge: value })} />
            <Field label="صورة الهيرو" value={section.image || ""} onChange={(value) => onChange({ image: value })} />
            <Field label="زر أساسي" value={section.primaryActionLabel || ""} onChange={(value) => onChange({ primaryActionLabel: value })} />
            <Field label="مسار الزر الأساسي" value={section.primaryActionTarget || ""} onChange={(value) => onChange({ primaryActionTarget: value })} />
            <Field label="زر ثانوي" value={section.secondaryActionLabel || ""} onChange={(value) => onChange({ secondaryActionLabel: value })} />
            <Field label="مسار الزر الثانوي" value={section.secondaryActionTarget || ""} onChange={(value) => onChange({ secondaryActionTarget: value })} />
            <Repeater
              title="بنرات الهيرو المتحركة"
              items={section.slides || []}
              addLabel="إضافة بنر"
              onAdd={() => addArrayItem("slides", { title: "عرض جديد", subtitle: "وصف مختصر للعرض", badge: "عرض خاص", image: "", primaryActionLabel: "تسوق الآن", primaryActionTarget: "#catalog", secondaryActionLabel: "استعراض الأقسام", secondaryActionTarget: "#categories" })}
              onRemove={(itemId) => removeArrayItem("slides", itemId)}
              renderItem={(item) => (
                <div className="grid gap-2">
                  <Field label="الشارة" value={item.badge || ""} onChange={(value) => updateArrayItem("slides", item.id, { badge: value })} />
                  <Field label="العنوان" value={item.title || ""} onChange={(value) => updateArrayItem("slides", item.id, { title: value })} />
                  <TextAreaField label="الوصف" value={item.subtitle || ""} onChange={(value) => updateArrayItem("slides", item.id, { subtitle: value })} />
                  <Field label="الصورة" value={item.image || ""} onChange={(value) => updateArrayItem("slides", item.id, { image: value })} />
                  <Field label="نص الزر الأساسي" value={item.primaryActionLabel || ""} onChange={(value) => updateArrayItem("slides", item.id, { primaryActionLabel: value })} />
                  <Field label="مسار الزر الأساسي" value={item.primaryActionTarget || ""} onChange={(value) => updateArrayItem("slides", item.id, { primaryActionTarget: value })} />
                  <Field label="نص الزر الثانوي" value={item.secondaryActionLabel || ""} onChange={(value) => updateArrayItem("slides", item.id, { secondaryActionLabel: value })} />
                  <Field label="مسار الزر الثانوي" value={item.secondaryActionTarget || ""} onChange={(value) => updateArrayItem("slides", item.id, { secondaryActionTarget: value })} />
                </div>
              )}
            />
            <Repeater
              title="إحصائيات الهيرو"
              items={section.stats || []}
              addLabel="إضافة إحصائية"
              onAdd={() => addArrayItem("stats", { label: "مؤشر", value: "قيمة" })}
              onRemove={(itemId) => removeArrayItem("stats", itemId)}
              renderItem={(item) => (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="العنوان" value={item.label} onChange={(value) => updateArrayItem("stats", item.id, { label: value })} />
                  <Field label="القيمة" value={item.value} onChange={(value) => updateArrayItem("stats", item.id, { value })} />
                </div>
              )}
            />
          </>
        )}

        {section.type === "categoryList" && (
          <CheckboxGroup
            label="التصنيفات الظاهرة"
            values={section.categories || []}
            options={categories}
            labelMap={categoryLabel}
            onChange={(values) => onChange({ categories: values })}
          />
        )}

        {section.type === "bannerGrid" && (
          <Repeater
            title="البنرات"
            items={section.items || []}
            addLabel="إضافة بنر"
            onAdd={() => addArrayItem("items", { title: "بنر جديد", subtitle: "وصف مختصر", image: "", ctaLabel: "تسوق الآن", ctaTarget: "#catalog" })}
            onRemove={(itemId) => removeArrayItem("items", itemId)}
            renderItem={(item) => (
              <div className="grid gap-2">
                <Field label="شارة العرض" value={item.badge || ""} onChange={(value) => updateArrayItem("items", item.id, { badge: value })} />
                <Field label="العنوان" value={item.title || ""} onChange={(value) => updateArrayItem("items", item.id, { title: value })} />
                <TextAreaField label="الوصف" value={item.subtitle || ""} onChange={(value) => updateArrayItem("items", item.id, { subtitle: value })} />
                <Field label="الصورة" value={item.image || ""} onChange={(value) => updateArrayItem("items", item.id, { image: value })} />
                <Field label="نص الزر" value={item.ctaLabel || ""} onChange={(value) => updateArrayItem("items", item.id, { ctaLabel: value })} />
                <Field label="المسار" value={item.ctaTarget || ""} onChange={(value) => updateArrayItem("items", item.id, { ctaTarget: value })} />
              </div>
            )}
          />
        )}

        {section.type === "videoFeature" && (
          <>
            <Field label="رابط الفيديو Embed" value={section.videoUrl || ""} onChange={(value) => onChange({ videoUrl: value })} />
            <Field label="صورة بديلة للمعاينة" value={section.poster || ""} onChange={(value) => onChange({ poster: value })} />
            <Field label="نص الزر" value={section.ctaLabel || ""} onChange={(value) => onChange({ ctaLabel: value })} />
            <Field label="مسار الزر" value={section.ctaTarget || ""} onChange={(value) => onChange({ ctaTarget: value })} />
            <TextAreaField label="الخصائص" value={(section.bullets || []).join("\n")} onChange={(value) => onChange({ bullets: parseLines(value) })} helper="خاصية في كل سطر" />
          </>
        )}

        {section.type === "featuredProducts" && (
          <>
            <Select
              label="طريقة الاختيار"
              value={section.mode || "top-sales"}
              onChange={(value) => onChange({ mode: value })}
              options={[
                ["top-sales", "الأعلى مبيعًا"],
                ["category", "حسب التصنيف"],
                ["manual", "اختيار يدوي"],
              ]}
            />
            <Select
              label="التصنيف"
              value={section.category || "All"}
              onChange={(value) => onChange({ category: value })}
              options={[["All", "كل التصنيفات"], ...categories.map((item) => [item, categoryLabel(item)])]}
            />
            <Field label="عدد المنتجات" type="number" value={section.limit || 8} onChange={(value) => onChange({ limit: Number(value) || 1 })} />
            <TextAreaField
              label="معرفات المنتجات اليدوية"
              value={(section.manualIds || []).join(", ")}
              onChange={(value) => onChange({ manualIds: parseIds(value) })}
              helper={`مثال: ${products.slice(0, 4).map((item) => item.id).join(", ")}`}
            />
          </>
        )}

        {section.type === "trust" && (
          <Repeater
            title="خصائص الثقة"
            items={section.items || []}
            addLabel="إضافة خاصية"
            onAdd={() => addArrayItem("items", { icon: "ShieldCheck", title: "خاصية جديدة", text: "وصف مختصر" })}
            onRemove={(itemId) => removeArrayItem("items", itemId)}
            renderItem={(item) => (
              <div className="grid gap-2">
                <Select
                  label="الأيقونة"
                  value={item.icon || "ShieldCheck"}
                  onChange={(value) => updateArrayItem("items", item.id, { icon: value })}
                  options={[
                    ["Truck", "شحن"],
                    ["ShieldCheck", "أمان"],
                    ["Star", "تقييم"],
                    ["BadgePercent", "خصم"],
                    ["Package", "منتج"],
                  ]}
                />
                <Field label="العنوان" value={item.title || ""} onChange={(value) => updateArrayItem("items", item.id, { title: value })} />
                <TextAreaField label="الوصف" value={item.text || ""} onChange={(value) => updateArrayItem("items", item.id, { text: value })} />
              </div>
            )}
          />
        )}

        {section.type === "newsletter" && (
          <>
            <Field label="Placeholder" value={section.placeholder || ""} onChange={(value) => onChange({ placeholder: value })} />
            <Field label="نص الزر" value={section.buttonLabel || ""} onChange={(value) => onChange({ buttonLabel: value })} />
          </>
        )}

        {section.type === "catalog" && (
          <>
            <Field label="عدد الأعمدة" type="number" value={section.columns || 4} onChange={(value) => onChange({ columns: Number(value) || 4 })} />
            <ToggleRow label="إظهار البحث" checked={section.allowSearch !== false} onChange={(value) => onChange({ allowSearch: value })} />
            <ToggleRow label="إظهار فلتر التصنيف" checked={section.allowCategoryFilter !== false} onChange={(value) => onChange({ allowCategoryFilter: value })} />
            <ToggleRow label="إظهار الترتيب" checked={section.allowSort !== false} onChange={(value) => onChange({ allowSort: value })} />
          </>
        )}
      </div>
    </section>
  );
}

function Repeater({ title, items, addLabel, onAdd, onRemove, renderItem }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-slate-950 dark:text-white">{title}</p>
        <Button type="button" variant="secondary" size="sm" onClick={onAdd}>
          <Plus size={15} />
          {addLabel}
        </Button>
      </div>
      <div className="mt-3 grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/60">
            {renderItem(item)}
            <Button type="button" variant="danger" size="sm" className="mt-3" onClick={() => onRemove(item.id)}>
              <Trash2 size={15} />
              حذف
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckboxGroup({ label, values, options, labelMap, onChange }) {
  const toggle = (value) => {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }
    onChange([...values, value]);
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
      <p className="text-sm font-black text-slate-700 dark:text-slate-200">{label}</p>
      <p className="mt-1 text-xs text-slate-500">اتركها فارغة لعرض كل التصنيفات.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => toggle(item)}
            className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${
              values.includes(item)
                ? "border-indigo-500 bg-indigo-500 text-white"
                : "border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-800 dark:text-slate-300"
            }`}
          >
            {labelMap(item)}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <ToggleSwitch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function IconButton({ label, icon: Icon, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "border-red-200 text-danger hover:bg-red-500/10 dark:border-red-900/40"
          : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-accent dark:border-slate-800 dark:text-slate-300"
      }`}
    >
      <Icon size={16} />
    </button>
  );
}

function Field({ label, value, onChange, className = "", type = "text", helper }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      />
      {helper && <span className="mt-1 block text-xs text-slate-500">{helper}</span>}
    </label>
  );
}

function TextAreaField({ label, value, onChange, className = "", helper }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[96px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      />
      {helper && <span className="mt-1 block text-xs text-slate-500">{helper}</span>}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-14 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
      </div>
    </label>
  );
}

function cloneTheme(theme) {
  return clone(normalizeStorefrontTheme(theme));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createLocalId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function parseLines(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseIds(value) {
  return String(value || "")
    .split(",")
    .map((item) => Number(item.trim()))
    .filter(Boolean);
}
