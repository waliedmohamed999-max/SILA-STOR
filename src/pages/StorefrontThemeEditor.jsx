import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDownToLine,
  Braces,
  Code2,
  Copy,
  Eye,
  EyeOff,
  FileInput,
  GripVertical,
  History,
  Image,
  Laptop,
  Layers3,
  Monitor,
  Palette,
  PanelLeft,
  PanelRight,
  Plus,
  Redo2,
  Save,
  Settings2,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import ToggleSwitch from "../components/ToggleSwitch";
import { useStorefrontThemes } from "../context/StorefrontThemeContext";
import { categories, products } from "../data/products";
import {
  createThemeSection,
  emptyStorefrontTheme,
  normalizeStorefrontTheme,
  storefrontFontOptions,
  storefrontLayoutOptions,
  storefrontSectionLabels,
} from "../data/storefrontThemes";
import { categoryLabel } from "../utils/labels";

const sectionCategories = [
  {
    title: "Hero",
    items: [
      ["hero", "Hero banner", "Main campaign with slides and stats"],
      ["announcement", "Announcement bar", "Rotating offers strip"],
    ],
  },
  {
    title: "Products",
    items: [
      ["featuredProducts", "Featured products", "Top sales or manual products"],
      ["catalog", "Catalog", "Search, filters, and product grid"],
    ],
  },
  {
    title: "Banner",
    items: [
      ["bannerGrid", "Ad partner slider", "Promotional rotating campaign"],
      ["trust", "Trust badges", "Shipping, payment, quality"],
    ],
  },
  {
    title: "Slider",
    items: [["videoFeature", "Video feature", "Campaign video or media block"]],
  },
  {
    title: "Custom",
    items: [
      ["newsletter", "Newsletter", "Capture subscribers"],
      ["customHtml", "HTML block", "Custom HTML, CSS classes, embed snippets"],
    ],
  },
];

const deviceModes = {
  desktop: { label: "Desktop", icon: Monitor, width: "100%", frame: "min-h-[760px]" },
  tablet: { label: "Tablet", icon: Tablet, width: "768px", frame: "min-h-[760px]" },
  mobile: { label: "Mobile", icon: Smartphone, width: "390px", frame: "min-h-[760px]" },
};

const spacingKeys = ["marginTop", "marginBottom", "paddingTop", "paddingBottom"];
const animationOptions = ["none", "fade", "slide-up", "slide-left", "zoom"];
const weightOptions = ["400", "500", "700", "900"];
const languages = {
  ar: {
    direction: "rtl",
    builder: "منشئ الثيم",
    sections: "الأقسام",
    properties: "الخصائص",
    preview: "المعاينة",
    save: "حفظ",
    export: "تصدير",
    import: "استيراد",
  },
  en: {
    direction: "ltr",
    builder: "Theme Builder",
    sections: "Sections",
    properties: "Properties",
    preview: "Preview",
    save: "Save",
    export: "Export",
    import: "Import",
  },
};

export default function StorefrontThemeEditor() {
  const { themeId } = useParams();
  const navigate = useNavigate();
  const importRef = useRef(null);
  const iframeRef = useRef(null);
  const { themes, saveTheme, activateTheme } = useStorefrontThemes();

  const sourceTheme = useMemo(() => {
    if (themeId === "new") return { ...emptyStorefrontTheme, id: undefined, slug: "custom-theme" };
    return themes.find((theme) => String(theme.id) === String(themeId)) || themes[0] || emptyStorefrontTheme;
  }, [themeId, themes]);

  const [history, setHistory] = useState(() => [withBuilderDefaults(cloneTheme(sourceTheme))]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [device, setDevice] = useState("desktop");
  const [language, setLanguage] = useState("ar");
  const [developerMode, setDeveloperMode] = useState(false);

  const form = history[historyIndex];
  const selectedSection = form.pageSections.find((section) => section.id === selectedId) || form.pageSections[0];
  const locale = languages[language];

  useEffect(() => {
    const next = withBuilderDefaults(cloneTheme(sourceTheme));
    setHistory([next]);
    setHistoryIndex(0);
    setSelectedId(next.pageSections[0]?.id || "");
  }, [sourceTheme]);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.data?.source !== "sila-theme-preview") return;
      if (event.data.type === "select-section") setSelectedId(event.data.sectionId);
      if (event.data.type === "edit-field") {
        const current = form.pageSections.find((section) => section.id === event.data.sectionId);
        if (!current) return;
        const value = window.prompt("Edit content", current[event.data.field] || "");
        if (value !== null) updateSection(event.data.sectionId, { [event.data.field]: value });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [form]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const commit = (producer) => {
    setHistory((current) => {
      const base = current[historyIndex];
      const next = typeof producer === "function" ? producer(clone(base)) : producer;
      const normalized = withBuilderDefaults(next);
      return [...current.slice(0, historyIndex + 1), normalized].slice(-60);
    });
    setHistoryIndex((index) => Math.min(index + 1, 59));
  };

  const undo = () => setHistoryIndex((index) => Math.max(0, index - 1));
  const redo = () => setHistoryIndex((index) => Math.min(history.length - 1, index + 1));

  const updateTheme = (updates) => commit((draft) => ({ ...draft, ...updates }));
  const updateBuilder = (updates) => commit((draft) => ({ ...draft, builder: { ...draft.builder, ...updates } }));
  const updateSection = (sectionId, updates) =>
    commit((draft) => ({
      ...draft,
      pageSections: draft.pageSections.map((section) =>
        section.id === sectionId ? withSectionDefaults({ ...section, ...updates }) : section,
      ),
    }));

  const addSection = (type) => {
    const next = withSectionDefaults(type === "customHtml" ? createCustomHtmlSection() : createThemeSection(type));
    commit((draft) => ({ ...draft, pageSections: [...draft.pageSections, next] }));
    setSelectedId(next.id);
  };

  const duplicateSection = (sectionId) => {
    const section = form.pageSections.find((item) => item.id === sectionId);
    if (!section) return;
    const copy = { ...clone(section), id: createLocalId("section"), title: `${section.title || section.type} copy` };
    commit((draft) => ({ ...draft, pageSections: [...draft.pageSections, copy] }));
    setSelectedId(copy.id);
  };

  const removeSection = (sectionId) => {
    commit((draft) => {
      const nextSections = draft.pageSections.filter((section) => section.id !== sectionId);
      return { ...draft, pageSections: nextSections.length ? nextSections : draft.pageSections };
    });
    if (selectedId === sectionId) setSelectedId(form.pageSections.find((section) => section.id !== sectionId)?.id || "");
  };

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    commit((draft) => {
      const oldIndex = draft.pageSections.findIndex((section) => section.id === active.id);
      const newIndex = draft.pageSections.findIndex((section) => section.id === over.id);
      return { ...draft, pageSections: arrayMove(draft.pageSections, oldIndex, newIndex) };
    });
  };

  const save = () => {
    const prepared = prepareThemeForStorefront(form);
    const savedId = saveTheme(prepared);
    if (savedId) activateTheme(savedId);
    navigate("/admin/storefront");
  };

  const exportTheme = () => {
    const blob = new Blob([JSON.stringify(form, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form.slug || "theme"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text);
    const next = withBuilderDefaults(normalizeStorefrontTheme(parsed));
    commit(next);
    setSelectedId(next.pageSections[0]?.id || "");
    event.target.value = "";
  };

  const srcDoc = useMemo(() => buildPreviewDocument(form, selectedId, locale.direction), [form, selectedId, locale.direction]);
  const frame = deviceModes[device];

  return (
    <div className="min-h-screen overflow-hidden bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white" dir={locale.direction}>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/admin/storefront"><Button variant="ghost" size="icon"><X size={18} /></Button></Link>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">Webflow / Shopify style</p>
              <h1 className="font-heading text-xl font-black">{locale.builder}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented value={language} onChange={setLanguage} items={[["ar", "AR"], ["en", "EN"]]} />
            <Segmented value={device} onChange={setDevice} items={Object.entries(deviceModes).map(([key, item]) => [key, item.label, item.icon])} />
            <IconAction label="Undo" icon={Undo2} onClick={undo} disabled={historyIndex === 0} />
            <IconAction label="Redo" icon={Redo2} onClick={redo} disabled={historyIndex >= history.length - 1} />
            <Button variant="secondary" onClick={() => importRef.current?.click()}><FileInput size={16} />{locale.import}</Button>
            <Button variant="secondary" onClick={exportTheme}><ArrowDownToLine size={16} />{locale.export}</Button>
            <Button onClick={save}><Save size={16} />{locale.save}</Button>
            <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={importTheme} />
          </div>
        </div>
      </header>

      <div className="grid h-[calc(100vh-73px)] min-h-[760px] grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="order-1 min-h-0 overflow-y-auto border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <PanelTitle icon={PanelRight} title="الأقسام والخصائص" subtitle="رتب الأقسام وعدل خصائص الطبقة المختارة" />
          <div className="space-y-4 p-4">
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-sm font-black">{locale.sections}</h2>
                <Plus size={18} className="text-indigo-500" />
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={form.pageSections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
                  <div className="grid gap-2">
                    {form.pageSections.map((section, index) => (
                      <SortableSectionRow
                        key={section.id}
                        section={section}
                        index={index}
                        selected={selectedSection?.id === section.id}
                        onSelect={() => setSelectedId(section.id)}
                        onDuplicate={() => duplicateSection(section.id)}
                        onRemove={() => removeSection(section.id)}
                        onToggle={(enabled) => updateSection(section.id, { enabled })}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              <h2 className="mb-3 font-heading text-sm font-black">Add new section</h2>
              <div className="grid gap-3">
                {sectionCategories.map((group) => (
                  <details key={group.title} className="rounded-xl border border-slate-200 p-3 open:bg-slate-50 dark:border-slate-800 dark:open:bg-slate-900" open={group.title === "Hero"}>
                    <summary className="cursor-pointer text-xs font-black uppercase tracking-wider text-slate-500">{group.title}</summary>
                    <div className="mt-3 grid gap-2">
                      {group.items.map(([type, title, subtitle]) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => addSection(type)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-start transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800"
                        >
                          <span className="block text-sm font-black">{title}</span>
                          <span className="text-xs text-slate-500">{subtitle}</span>
                        </button>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            <GlobalDesignPanel form={form} updateTheme={updateTheme} updateBuilder={updateBuilder} />
            {selectedSection ? (
              <SectionProperties section={selectedSection} onChange={(updates) => updateSection(selectedSection.id, updates)} />
            ) : (
              <EmptyProperties />
            )}
            <DeveloperPanel form={form} enabled={developerMode} setEnabled={setDeveloperMode} updateBuilder={updateBuilder} />
          </div>
        </aside>

        <main className="order-2 min-h-0 overflow-auto bg-slate-100 p-5 dark:bg-slate-950">
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-indigo-500" />
              <div>
                <p className="text-sm font-black">{locale.preview}</p>
                <p className="text-xs text-slate-500">الموقع يظهر هنا بالكامل داخل iframe، اضغط على أي قسم لتعديله</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500 dark:bg-slate-800">{frame.label}</span>
          </div>
          <div className="mx-auto transition-all duration-300" style={{ width: frame.width, maxWidth: "100%" }}>
            <iframe
              ref={iframeRef}
              title="Theme preview"
              srcDoc={srcDoc}
              className={`${frame.frame} w-full rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/50 dark:border-slate-800 dark:shadow-black/30`}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function SortableSectionRow({ section, index, selected, onSelect, onDuplicate, onRemove, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const label = storefrontSectionLabels[section.type] || section.title || section.type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border p-3 shadow-sm transition ${selected ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"} ${isDragging ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-2">
        <button type="button" className="cursor-grab rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" {...attributes} {...listeners}>
          <GripVertical size={17} />
        </button>
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-start">
          <span className="block truncate text-sm font-black">{index + 1}. {section.title || label}</span>
          <span className="text-xs text-slate-500">{section.type}</span>
        </button>
        <button type="button" onClick={() => onToggle(!section.enabled)} className="text-slate-400">
          {section.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button type="button" onClick={onDuplicate} className="text-slate-400"><Copy size={16} /></button>
        <button type="button" onClick={onRemove} className="text-red-500"><Trash2 size={16} /></button>
      </div>
    </div>
  );
}

function GlobalDesignPanel({ form, updateTheme, updateBuilder }) {
  const builder = form.builder || {};
  return (
    <PropertyGroup icon={Palette} title="Global design system">
      <div className="grid grid-cols-2 gap-3">
        <ColorField label="Primary" value={form.primary} onChange={(value) => updateTheme({ primary: value })} />
        <ColorField label="Secondary" value={form.secondary} onChange={(value) => updateTheme({ secondary: value })} />
        <ColorField label="Background" value={form.background} onChange={(value) => updateTheme({ background: value })} />
        <ColorField label="Surface" value={form.surface} onChange={(value) => updateTheme({ surface: value })} />
      </div>
      <SelectField label="Font family" value={form.font} onChange={(value) => updateTheme({ font: value })} options={storefrontFontOptions} />
      <SelectField label="Layout preset" value={form.layout} onChange={(value) => updateTheme({ layout: value })} options={storefrontLayoutOptions} />
      <RangeField label="Global spacing" value={builder.spacingScale || 16} min={8} max={40} onChange={(value) => updateBuilder({ spacingScale: Number(value) })} />
      <div className="grid grid-cols-3 gap-2">
        {["h1", "h2", "h3"].map((key) => (
          <RangeField key={key} label={key.toUpperCase()} value={builder.typeScale?.[key] || defaultTypeScale[key]} min={18} max={64} onChange={(value) => updateBuilder({ typeScale: { ...builder.typeScale, [key]: Number(value) } })} />
        ))}
      </div>
    </PropertyGroup>
  );
}

function SectionProperties({ section, onChange }) {
  const styles = section.styles || {};
  const deviceVisibility = section.visibility || { desktop: true, tablet: true, mobile: true };

  const updateStyles = (updates) => onChange({ styles: { ...styles, ...updates } });
  const updateVisibility = (device, value) => onChange({ visibility: { ...deviceVisibility, [device]: value } });
  const updateArray = (key, id, updates) => {
    onChange({ [key]: (section[key] || []).map((item) => (item.id === id ? { ...item, ...updates } : item)) });
  };
  const addArray = (key, template) => onChange({ [key]: [...(section[key] || []), { id: createLocalId("block"), ...template }] });
  const removeArray = (key, id) => onChange({ [key]: (section[key] || []).filter((item) => item.id !== id) });
  const moveArray = (key, from, to) => onChange({ [key]: arrayMove(section[key] || [], from, to) });

  return (
    <>
      <PropertyGroup icon={Settings2} title="Section content">
        <TextField label="Title" value={section.title || ""} onChange={(value) => onChange({ title: value })} />
        {"subtitle" in section && <TextAreaField label="Subtitle" value={section.subtitle || ""} onChange={(value) => onChange({ subtitle: value })} />}
        {"badge" in section && <TextField label="Badge" value={section.badge || ""} onChange={(value) => onChange({ badge: value })} />}
        {"image" in section && <TextField label="Image URL" value={section.image || ""} onChange={(value) => onChange({ image: value })} icon={Image} />}
        {section.type === "customHtml" && <TextAreaField label="HTML" value={section.html || ""} onChange={(value) => onChange({ html: value })} className="font-mono" />}
      </PropertyGroup>

      {(section.slides || section.items || section.offers || section.stats) && (
        <PropertyGroup icon={Layers3} title="Nested blocks">
          {section.slides && (
            <BlockRepeater
              title="Slides"
              items={section.slides}
              addLabel="Add slide"
              onAdd={() => addArray("slides", { title: "New slide", subtitle: "Campaign text", badge: "Offer", image: "", primaryActionLabel: "Shop now", primaryActionTarget: "#catalog" })}
              onRemove={(id) => removeArray("slides", id)}
              onMove={(from, to) => moveArray("slides", from, to)}
              renderItem={(item) => (
                <div className="grid gap-2">
                  <TextField label="Title" value={item.title || ""} onChange={(value) => updateArray("slides", item.id, { title: value })} />
                  <TextField label="Badge" value={item.badge || ""} onChange={(value) => updateArray("slides", item.id, { badge: value })} />
                  <TextField label="Image" value={item.image || ""} onChange={(value) => updateArray("slides", item.id, { image: value })} />
                </div>
              )}
            />
          )}
          {section.items && (
            <BlockRepeater
              title="Items"
              items={section.items}
              addLabel="Add item"
              onAdd={() => addArray("items", { title: "New item", subtitle: "Description", image: "", ctaLabel: "Open", ctaTarget: "#catalog" })}
              onRemove={(id) => removeArray("items", id)}
              onMove={(from, to) => moveArray("items", from, to)}
              renderItem={(item) => (
                <div className="grid gap-2">
                  <TextField label="Title" value={item.title || ""} onChange={(value) => updateArray("items", item.id, { title: value })} />
                  <TextField label="Text" value={item.subtitle || item.text || ""} onChange={(value) => updateArray("items", item.id, { subtitle: value, text: value })} />
                  {"image" in item && <TextField label="Image" value={item.image || ""} onChange={(value) => updateArray("items", item.id, { image: value })} />}
                </div>
              )}
            />
          )}
          {section.offers && (
            <BlockRepeater
              title="Offers"
              items={section.offers}
              addLabel="Add offer"
              onAdd={() => addArray("offers", { text: "New offer" })}
              onRemove={(id) => removeArray("offers", id)}
              onMove={(from, to) => moveArray("offers", from, to)}
              renderItem={(item) => <TextField label="Text" value={item.text || ""} onChange={(value) => updateArray("offers", item.id, { text: value })} />}
            />
          )}
        </PropertyGroup>
      )}

      <PropertyGroup icon={Palette} title="Background">
        <SelectField label="Type" value={styles.backgroundType || "color"} onChange={(value) => updateStyles({ backgroundType: value })} options={[["color", "Color"], ["gradient", "Gradient"], ["image", "Image"], ["video", "Video"]]} />
        <TextField label="Value / URL" value={styles.backgroundValue || ""} onChange={(value) => updateStyles({ backgroundValue: value })} />
      </PropertyGroup>

      <PropertyGroup icon={Type} title="Typography and spacing">
        <div className="grid grid-cols-2 gap-2">
          <RangeField label="Font size" value={styles.fontSize || 16} min={10} max={56} onChange={(value) => updateStyles({ fontSize: Number(value) })} />
          <SelectField label="Weight" value={String(styles.fontWeight || 700)} onChange={(value) => updateStyles({ fontWeight: value })} options={weightOptions.map((item) => [item, item])} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {spacingKeys.map((key) => (
            <RangeField key={key} label={key.replace(/([A-Z])/g, " $1")} value={styles[key] || 0} min={0} max={96} onChange={(value) => updateStyles({ [key]: Number(value) })} />
          ))}
        </div>
      </PropertyGroup>

      <PropertyGroup icon={History} title="Animation and visibility">
        <SelectField label="Animation" value={section.animation?.type || "none"} onChange={(value) => onChange({ animation: { ...section.animation, type: value } })} options={animationOptions.map((item) => [item, item])} />
        <RangeField label="Delay" value={section.animation?.delay || 0} min={0} max={2000} step={100} onChange={(value) => onChange({ animation: { ...section.animation, delay: Number(value) } })} />
        <div className="grid grid-cols-3 gap-2">
          {Object.keys(deviceModes).map((key) => (
            <ToggleSwitch key={key} checked={deviceVisibility[key] !== false} onChange={(value) => updateVisibility(key, value)} label={key} />
          ))}
        </div>
      </PropertyGroup>
    </>
  );
}

function DeveloperPanel({ form, enabled, setEnabled, updateBuilder }) {
  return (
    <PropertyGroup icon={Code2} title="Developer mode">
      <ToggleSwitch checked={enabled} onChange={setEnabled} label="Enable developer controls" />
      {enabled && (
        <div className="grid gap-3">
          <TextAreaField label="Custom CSS" value={form.builder?.customCSS || ""} onChange={(value) => updateBuilder({ customCSS: value })} className="font-mono" />
          <TextAreaField label="Custom JS injection" value={form.builder?.customJS || ""} onChange={(value) => updateBuilder({ customJS: value })} className="font-mono" />
        </div>
      )}
    </PropertyGroup>
  );
}

function BlockRepeater({ title, items, addLabel, onAdd, onRemove, onMove, renderItem }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-black">{title}</p>
        <Button size="sm" variant="secondary" onClick={onAdd}><Plus size={14} />{addLabel}</Button>
      </div>
      <div className="grid gap-3">
        {items.map((item, index) => (
          <div key={item.id || index} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-black text-slate-400">Block {index + 1}</span>
              <div className="flex gap-1">
                <IconAction label="Up" icon={GripVertical} onClick={() => onMove(index, Math.max(0, index - 1))} disabled={index === 0} />
                <IconAction label="Down" icon={ArrowDownToLine} onClick={() => onMove(index, Math.min(items.length - 1, index + 1))} disabled={index === items.length - 1} />
                <IconAction label="Remove" icon={Trash2} onClick={() => onRemove(item.id)} />
              </div>
            </div>
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

function buildPreviewDocument(theme, selectedId, direction) {
  const normalized = withBuilderDefaults(theme);
  const builder = normalized.builder || {};
  const spacing = builder.spacingScale || 16;
  const typeScale = { ...defaultTypeScale, ...(builder.typeScale || {}) };
  const sections = normalized.pageSections
    .filter((section) => section.enabled !== false)
    .map((section) => renderPreviewSection(section, normalized, selectedId))
    .join("");

  return `<!doctype html>
<html lang="${direction === "rtl" ? "ar" : "en"}" dir="${direction}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  *{box-sizing:border-box}body{margin:0;background:${normalized.background};color:${normalized.text};font-family:${normalized.font},system-ui,sans-serif}
  .page{padding:${spacing}px;display:grid;gap:${spacing}px}.section{position:relative;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;background:${normalized.surface};transition:.2s}
  .section:hover{outline:2px solid ${normalized.primary}55}.section.selected{outline:3px solid ${normalized.primary}}
  .section-toolbar{position:absolute;top:10px;inset-inline-start:10px;z-index:5;border-radius:999px;background:${normalized.primary};color:white;padding:6px 10px;font:800 11px system-ui}
  h1{font-size:${typeScale.h1}px;line-height:1.05;margin:0}h2{font-size:${typeScale.h2}px;margin:0}h3{font-size:${typeScale.h3}px;margin:0}.muted{color:${normalized.mutedText}}
  .hero{display:grid;grid-template-columns:1.05fr .95fr;min-height:380px}.hero-content{padding:44px;display:flex;flex-direction:column;justify-content:center;gap:18px}.hero-media{min-height:320px;background-size:cover;background-position:center}
  .pill{display:inline-flex;width:max-content;border-radius:999px;background:${normalized.primary}12;color:${normalized.primary};padding:6px 12px;font-weight:900;font-size:12px}.actions{display:flex;gap:10px;flex-wrap:wrap}.btn{border:0;border-radius:14px;background:${normalized.primary};color:#fff;padding:12px 18px;font-weight:900}
  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.stat{border:1px solid #e2e8f0;border-radius:14px;padding:12px;background:#fff}
  .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:22px}.category{display:grid;grid-template-columns:1fr 140px;min-height:150px}.category img,.product img,.ad-img{width:100%;height:100%;object-fit:cover}
  .ad{display:grid;grid-template-columns:1fr 320px}.ad-content{padding:34px;display:grid;align-content:center;gap:14px}.ad-img{min-height:240px}
  .products{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:22px}.product{border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:#fff}.product img{height:170px}.product-body{padding:14px}.trust{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:22px}.trust-card{border:1px solid #e2e8f0;border-radius:16px;padding:22px}
  .newsletter,.catalog,.custom{padding:24px}.input{border:1px solid #e2e8f0;border-radius:14px;padding:12px;width:100%;margin-top:10px}.announce{padding:14px;text-align:center;color:#fff;font-weight:900;background:linear-gradient(135deg,${normalized.primary},${normalized.secondary})}
  @media(max-width:800px){.hero,.ad{grid-template-columns:1fr}.hero-content{padding:24px}.hero-media{order:-1;min-height:230px}h1{font-size:34px}.cards,.products{grid-template-columns:repeat(2,1fr)}.trust{display:flex;overflow:auto}.trust-card{min-width:260px}.category{grid-template-columns:1fr 115px}.ad-img{min-height:190px}}
  ${builder.customCSS || ""}
</style>
</head>
<body>
<main class="page">${sections}</main>
<script>
  document.querySelectorAll('[data-section-id]').forEach((node)=> {
    node.addEventListener('click', (event)=> {
      event.preventDefault();
      const editable = event.target.closest('[data-edit-field]');
      parent.postMessage({ source:'sila-theme-preview', type: editable ? 'edit-field' : 'select-section', sectionId: node.dataset.sectionId, field: editable?.dataset.editField }, '*');
    });
  });
  ${builder.customJS || ""}
</script>
</body>
</html>`;
}

function renderPreviewSection(section, theme, selectedId) {
  const selected = section.id === selectedId ? " selected" : "";
  const style = sectionStyle(section);
  const toolbar = `<span class="section-toolbar">${escapeHtml(section.type)}</span>`;
  if (section.type === "announcement") {
    return `<section class="section announce${selected}" style="${style}" data-section-id="${section.id}">${toolbar}${escapeHtml(section.offers?.[0]?.text || section.text || "")}</section>`;
  }
  if (section.type === "hero") {
    const slide = section.slides?.[0] || section;
    return `<section class="section hero${selected}" style="${style}" data-section-id="${section.id}">${toolbar}<div class="hero-content"><span class="pill" data-edit-field="badge">${escapeHtml(slide.badge || section.badge || "")}</span><h1 data-edit-field="title">${escapeHtml(slide.title || section.title || "")}</h1><p class="muted" data-edit-field="subtitle">${escapeHtml(slide.subtitle || section.subtitle || "")}</p><div class="actions"><button class="btn">${escapeHtml(slide.primaryActionLabel || "Shop now")}</button><button class="btn" style="background:${theme.secondary}">${escapeHtml(slide.secondaryActionLabel || "Browse")}</button></div>${renderStats(section.stats)}</div><div class="hero-media" style="background-image:url('${escapeAttr(slide.image || section.image || "")}')"></div></section>`;
  }
  if (section.type === "categoryList") {
    return `<section class="section${selected}" style="${style}" data-section-id="${section.id}">${toolbar}<div class="newsletter"><h2 data-edit-field="title">${escapeHtml(section.title || "Categories")}</h2><p class="muted">${escapeHtml(section.subtitle || "")}</p></div><div class="cards">${categories.slice(0, 6).map((category) => `<article class="section category"><div class="product-body"><span class="pill">${escapeHtml(categoryLabel(category))}</span><h3>${escapeHtml(categoryLabel(category))}</h3><p class="muted">${escapeHtml(category)}</p></div><img src="${categoryImage(category)}" /></article>`).join("")}</div></section>`;
  }
  if (section.type === "bannerGrid") {
    const item = section.items?.[0] || {};
    return `<section class="section ad${selected}" style="${style}" data-section-id="${section.id}">${toolbar}<div class="ad-content"><span class="pill">${escapeHtml(item.badge || "Ad partner")}</span><h2 data-edit-field="title">${escapeHtml(item.title || section.title || "")}</h2><p class="muted">${escapeHtml(item.subtitle || section.subtitle || "")}</p><button class="btn">${escapeHtml(item.ctaLabel || "Open")}</button></div><img class="ad-img" src="${escapeAttr(item.image || "")}" /></section>`;
  }
  if (section.type === "featuredProducts" || section.type === "catalog") {
    return `<section class="section${selected}" style="${style}" data-section-id="${section.id}">${toolbar}<div class="newsletter"><h2 data-edit-field="title">${escapeHtml(section.title || "Products")}</h2><p class="muted">${escapeHtml(section.subtitle || "")}</p></div><div class="products">${products.slice(0, section.limit || 8).map((product) => `<article class="product"><img src="${product.image}" /><div class="product-body"><p class="muted">${escapeHtml(categoryLabel(product.category))}</p><h3>${escapeHtml(product.name)}</h3><b>${product.price} ر.س</b></div></article>`).join("")}</div></section>`;
  }
  if (section.type === "trust") {
    return `<section class="section${selected}" style="${style}" data-section-id="${section.id}">${toolbar}<div class="newsletter"><h2 data-edit-field="title">${escapeHtml(section.title || "Trust")}</h2></div><div class="trust">${(section.items || []).map((item) => `<article class="trust-card"><h3>${escapeHtml(item.title || "")}</h3><p class="muted">${escapeHtml(item.text || "")}</p></article>`).join("")}</div></section>`;
  }
  if (section.type === "newsletter") {
    return `<section class="section newsletter${selected}" style="${style}" data-section-id="${section.id}">${toolbar}<h2 data-edit-field="title">${escapeHtml(section.title || "Newsletter")}</h2><p class="muted">${escapeHtml(section.subtitle || "")}</p><input class="input" placeholder="${escapeAttr(section.placeholder || "Email")}" /></section>`;
  }
  if (section.type === "customHtml") {
    return `<section class="section custom${selected}" style="${style}" data-section-id="${section.id}">${toolbar}${section.html || "<h2>Custom HTML</h2>"}</section>`;
  }
  return `<section class="section newsletter${selected}" style="${style}" data-section-id="${section.id}">${toolbar}<h2>${escapeHtml(section.title || section.type)}</h2></section>`;
}

function sectionStyle(section) {
  const styles = section.styles || {};
  const rules = [];
  spacingKeys.forEach((key) => {
    if (styles[key]) rules.push(`${cssCase(key)}:${styles[key]}px`);
  });
  if (styles.fontSize) rules.push(`font-size:${styles.fontSize}px`);
  if (styles.fontWeight) rules.push(`font-weight:${styles.fontWeight}`);
  if (styles.backgroundValue) {
    if (styles.backgroundType === "gradient") rules.push(`background:${styles.backgroundValue}`);
    if (styles.backgroundType === "color") rules.push(`background:${styles.backgroundValue}`);
    if (styles.backgroundType === "image") rules.push(`background-image:url('${escapeAttr(styles.backgroundValue)}');background-size:cover;background-position:center`);
  }
  return rules.join(";");
}

function renderStats(stats = []) {
  if (!stats.length) return "";
  return `<div class="stats">${stats.map((item) => `<div class="stat"><small class="muted">${escapeHtml(item.label)}</small><br/><b>${escapeHtml(item.value)}</b></div>`).join("")}</div>`;
}

function withBuilderDefaults(theme) {
  return {
    ...theme,
    builder: {
      spacingScale: 18,
      typeScale: defaultTypeScale,
      customCSS: "",
      customJS: "",
      ...(theme.builder || {}),
    },
    pageSections: (theme.pageSections || []).map(withSectionDefaults),
  };
}

function prepareThemeForStorefront(theme) {
  const normalized = withBuilderDefaults(normalizeStorefrontTheme(theme));
  return normalizeStorefrontTheme({
    ...normalized,
    pageSections: normalized.pageSections.map((section) => {
      if (section.type === "hero" && section.slides?.length) {
        return {
          ...section,
          slides: section.slides.map((slide, index) =>
            index === 0
              ? {
                  ...slide,
                  title: section.title || slide.title,
                  subtitle: section.subtitle || slide.subtitle,
                  badge: section.badge || slide.badge,
                  image: section.image || slide.image,
                  ctaLabel: section.ctaLabel || slide.ctaLabel || slide.primaryActionLabel,
                  ctaTarget: section.ctaTarget || slide.ctaTarget || slide.primaryActionTarget,
                }
              : slide,
          ),
        };
      }

      if (section.type === "bannerGrid" && section.banners?.length) {
        return {
          ...section,
          banners: section.banners.map((banner, index) =>
            index === 0
              ? {
                  ...banner,
                  title: section.title || banner.title,
                  subtitle: section.subtitle || banner.subtitle,
                  badge: section.badge || banner.badge,
                  image: section.image || banner.image,
                  ctaLabel: section.ctaLabel || banner.ctaLabel,
                  ctaTarget: section.ctaTarget || banner.ctaTarget,
                }
              : banner,
          ),
        };
      }

      return section;
    }),
  });
}

function withSectionDefaults(section) {
  return {
    styles: {},
    visibility: { desktop: true, tablet: true, mobile: true },
    animation: { type: "none", delay: 0 },
    ...section,
  };
}

function createCustomHtmlSection() {
  return withSectionDefaults({
    id: createLocalId("section"),
    type: "customHtml",
    enabled: true,
    title: "Custom HTML",
    html: "<section><h2>Custom HTML block</h2><p>Edit this markup from Developer Mode.</p></section>",
  });
}

const defaultTypeScale = { h1: 48, h2: 30, h3: 20, h4: 18, h5: 16, h6: 14 };

function PanelTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500/10 text-indigo-500"><Icon size={18} /></span>
        <div>
          <h2 className="font-heading text-base font-black">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function PropertyGroup({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={18} className="text-indigo-500" />
        <h3 className="font-heading text-sm font-black">{title}</h3>
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function EmptyProperties() {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-800">
      Select a section from the left panel or preview canvas.
    </section>
  );
}

function Segmented({ value, onChange, items }) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
      {items.map(([key, label, Icon]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black transition ${value === key ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800" : "text-slate-500"}`}
        >
          {Icon ? <Icon size={14} /> : null}
          {label}
        </button>
      ))}
    </div>
  );
}

function IconAction({ label, icon: Icon, ...props }) {
  return (
    <button type="button" title={label} aria-label={label} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800" {...props}>
      <Icon size={16} />
    </button>
  );
}

function TextField({ label, value, onChange, icon: Icon }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-black text-slate-500">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
        {Icon ? <Icon size={15} className="text-slate-400" /> : null}
        <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
      </span>
    </label>
  );
}

function TextAreaField({ label, value, onChange, className = "" }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-black text-slate-500">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className={`min-h-[120px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-900 ${className}`} />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-black text-slate-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-900">
        {options.map(([key, labelText]) => <option key={key} value={key}>{labelText}</option>)}
      </select>
    </label>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-black text-slate-500">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-2 dark:border-slate-800 dark:bg-slate-900">
        <input type="color" value={value || "#000000"} onChange={(event) => onChange(event.target.value)} className="h-8 w-8 rounded-lg border-0 bg-transparent" />
        <input value={value || ""} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs outline-none" />
      </span>
    </label>
  );
}

function RangeField({ label, value, onChange, min = 0, max = 100, step = 1 }) {
  return (
    <label className="grid gap-1">
      <span className="flex items-center justify-between text-xs font-black text-slate-500"><span>{label}</span><span>{value}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} className="accent-indigo-500" />
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

function cssCase(value) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function categoryImage(category) {
  const product = products.find((item) => item.category === category);
  return product?.image || "";
}
