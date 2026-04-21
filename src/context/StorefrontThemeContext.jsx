import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { emptyStorefrontTheme, normalizeStorefrontTheme, starterStorefrontThemes } from "../data/storefrontThemes";
import { useToast } from "./ToastContext";

const StorefrontThemeContext = createContext(null);
const storageKey = "sila-storefront-themes";
const fixedActiveSlug = "sila-premium";

export function StorefrontThemeProvider({ children }) {
  const { showToast } = useToast();
  const [themes, setThemes] = useState(() => readThemes());
  const [selectedId, setSelectedId] = useState(() => {
    const saved = readThemes();
    return saved.find((theme) => theme.active)?.id || saved[0]?.id || 1;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(themes));
  }, [themes]);

  const selectedTheme = useMemo(
    () => themes.find((theme) => theme.id === selectedId) || themes[0] || starterStorefrontThemes[0],
    [themes, selectedId],
  );

  const activeTheme = useMemo(
    () => themes.find((theme) => theme.slug === fixedActiveSlug) || themes.find((theme) => theme.active) || themes[0] || starterStorefrontThemes[0],
    [themes],
  );

  const createTheme = (theme) => {
    const nextId = themes.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
    const nextTheme = normalizeStorefrontTheme({
      ...emptyStorefrontTheme,
      ...theme,
      id: nextId,
      slug: theme.slug || `theme-${nextId}`,
      builtIn: false,
      active: theme.slug === fixedActiveSlug,
      updatedAt: formatNow(),
    });
    setThemes((current) => [nextTheme, ...current]);
    setSelectedId(nextId);
    showToast("تم إنشاء الثيم", `تم إنشاء الثيم ${nextTheme.name}.`, "success");
    return nextId;
  };

  const updateTheme = (themeId, updates) => {
    setThemes((current) =>
      current.map((theme) =>
        theme.id === themeId
          ? normalizeStorefrontTheme({
              ...theme,
              ...updates,
              active: theme.slug === fixedActiveSlug,
              updatedAt: formatNow(),
            })
          : theme,
      ),
    );
  };

  const saveTheme = (theme) => {
    if (theme.id) {
      updateTheme(theme.id, theme);
      showToast("تم حفظ الثيم", `تم تحديث الثيم ${theme.name}.`, "success");
      return theme.id;
    }
    return createTheme(theme);
  };

  const activateTheme = (themeId) => {
    const target = themes.find((theme) => theme.id === themeId);
    if (target && target.slug !== fixedActiveSlug) {
      setSelectedId(themeId);
      showToast("الثيم النشط ثابت", "سيلا بريميوم هو الثيم المنشور الثابت. يمكنك تخصيص أي قالب كنسخة، لكن واجهة المتجر تستخدم الثيم الثابت.", "info");
      return;
    }

    setThemes((current) =>
      current.map((theme) =>
        normalizeStorefrontTheme({
          ...theme,
          active: theme.slug === fixedActiveSlug,
          updatedAt: theme.id === themeId ? formatNow() : theme.updatedAt,
        }),
      ),
    );
    setSelectedId(themeId);
    showToast("تم تفعيل الثيم", "تم تطبيق الثيم النشط على واجهة المتجر.", "success");
  };

  const duplicateTheme = (themeId) => {
    const theme = themes.find((item) => item.id === themeId);
    if (!theme) return;
    createTheme({
      ...theme,
      id: undefined,
      name: `${theme.name} - نسخة`,
      slug: `${theme.slug}-copy`,
      badge: "مخصص",
      active: false,
    });
  };

  const deleteTheme = (themeId) => {
    const theme = themes.find((item) => item.id === themeId);
    if (!theme) return false;
    if (theme.active) {
      showToast("لا يمكن الحذف", "لا يمكن حذف الثيم النشط حاليًا.", "error");
      return false;
    }
    setThemes((current) => current.filter((item) => item.id !== themeId));
    if (selectedId === themeId) {
      const fallback = themes.find((item) => item.id !== themeId);
      if (fallback) setSelectedId(fallback.id);
    }
    showToast("تم حذف الثيم", `تم حذف الثيم ${theme.name}.`, "success");
    return true;
  };

  const value = useMemo(
    () => ({
      themes,
      selectedId,
      selectedTheme,
      activeTheme,
      setSelectedId,
      saveTheme,
      updateTheme,
      activateTheme,
      duplicateTheme,
      deleteTheme,
      createTheme,
    }),
    [themes, selectedId, selectedTheme, activeTheme],
  );

  return <StorefrontThemeContext.Provider value={value}>{children}</StorefrontThemeContext.Provider>;
}

export function useStorefrontThemes() {
  const context = useContext(StorefrontThemeContext);
  if (!context) throw new Error("useStorefrontThemes must be used within StorefrontThemeProvider");
  return context;
}

function readThemes() {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : starterStorefrontThemes;
    const themes = Array.isArray(parsed) && parsed.length ? mergeBuiltInThemes(parsed.map(normalizeStorefrontTheme)) : starterStorefrontThemes;
    return enforceFixedActiveTheme(themes);
  } catch {
    return enforceFixedActiveTheme(starterStorefrontThemes);
  }
}

function mergeBuiltInThemes(savedThemes) {
  const savedSlugs = new Set(savedThemes.map((theme) => theme.slug));
  const missingBuiltIns = starterStorefrontThemes.filter((theme) => theme.builtIn && !savedSlugs.has(theme.slug));
  return [...savedThemes, ...missingBuiltIns];
}

function enforceFixedActiveTheme(themes) {
  const hasFixed = themes.some((theme) => theme.slug === fixedActiveSlug);
  const source = hasFixed ? themes : [...starterStorefrontThemes, ...themes];
  return source.map((theme) =>
    normalizeStorefrontTheme({
      ...theme,
      active: theme.slug === fixedActiveSlug,
    }),
  );
}

function formatNow() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}
