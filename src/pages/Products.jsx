import {
  ArrowLeftRight,
  Boxes,
  Copy,
  Edit3,
  Eye,
  Filter,
  FolderTree,
  Image,
  Layers3,
  PackagePlus,
  Plus,
  Save,
  SlidersHorizontal,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import SearchInput from "../components/SearchInput";
import Table from "../components/Table";
import { useToast } from "../context/ToastContext";
import { categories as baseCategories, products as seedProducts } from "../data/products";
import { money, sortBy, statusTone, stockState } from "../utils/formatters";
import { categoryLabel, statusLabel } from "../utils/labels";

const storageKey = "sila-product-admin";

const sectionItems = [
  { slug: "", label: "المنتجات", icon: PackagePlus, exact: true },
  { slug: "categories", label: "التصنيفات", icon: FolderTree },
  { slug: "inventory", label: "المخزون", icon: Boxes },
  { slug: "stock-movements", label: "إدارة تغييرات المخزون", icon: ArrowLeftRight },
  { slug: "filter-standards", label: "معايير التصفية", icon: Filter },
  { slug: "custom-fields", label: "الحقول المخصصة", icon: SlidersHorizontal },
  { slug: "options-library", label: "مكتبة الاختيارات", icon: Layers3 },
];

const publishTones = {
  published: "success",
  draft: "warning",
  archived: "neutral",
};

const publishLabels = {
  published: "منشور",
  draft: "مسودة",
  archived: "مؤرشف",
};

const stockMovementLabels = {
  receive: "توريد",
  sale: "بيع",
  adjust: "تسوية",
  return: "مرتجع",
  transfer: "تحويل",
  damage: "فاقد",
};

const stockMovementTones = {
  receive: "success",
  sale: "accent",
  adjust: "warning",
  return: "info",
  transfer: "neutral",
  damage: "danger",
};

const fieldTypeLabels = {
  text: "نص",
  textarea: "نص طويل",
  select: "قائمة",
  number: "رقم",
  date: "تاريخ",
  boolean: "نعم / لا",
};

const filterSourceLabels = {
  category: "تصنيف",
  brand: "علامة تجارية",
  price: "سعر",
  customField: "حقل مخصص",
  optionSet: "مكتبة اختيارات",
  stock: "حالة مخزون",
};

const optionDisplayLabels = {
  chips: "أزرار",
  dropdown: "قائمة منسدلة",
  radio: "خيارات فردية",
  swatch: "ألوان",
  range: "نطاق",
};

const warehouseOptions = ["المستودع الرئيسي", "مستودع الرياض", "مستودع القاهرة", "مخزن المرتجعات"];

const emptyProduct = {
  name: "",
  slug: "",
  brand: "",
  category: "Laptops",
  sku: "",
  barcode: "",
  price: 0,
  compareAtPrice: 0,
  cost: 0,
  stock: 0,
  threshold: 5,
  status: "published",
  visibility: "public",
  warehouse: warehouseOptions[0],
  supplier: "SILA Direct",
  image: "",
  gallery: [],
  description: "",
  shortDescription: "",
  tags: [],
  warranty: "12 شهر",
  shippingClass: "قياسي",
  weight: "1.2 كجم",
  dimensions: "30 x 20 x 2 سم",
  seoTitle: "",
  seoDescription: "",
  specs: [],
  customFieldValues: {},
  optionSelections: {},
};

const defaultCategoryRecords = [
  {
    id: 1,
    key: "Laptops",
    name: "Laptops",
    description: "أجهزة كمبيوتر محمولة موجهة للأعمال والأداء العالي.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
    status: "active",
    featured: true,
    sortOrder: 1,
    seoTitle: "لابتوبات سيلا",
    seoDescription: "أجهزة لابتوب للأعمال والمحتوى والأداء.",
  },
  {
    id: 2,
    key: "Phones",
    name: "Phones",
    description: "هواتف ذكية للفئة العليا والمتوسطة مع مخزون مستقر.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    status: "active",
    featured: true,
    sortOrder: 2,
    seoTitle: "هواتف سيلا",
    seoDescription: "هواتف ذكية مميزة ومجهزة للبيع السريع.",
  },
  {
    id: 3,
    key: "Headphones",
    name: "Headphones",
    description: "سماعات للموسيقى والألعاب والعمل الاحترافي.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    status: "active",
    featured: true,
    sortOrder: 3,
    seoTitle: "سماعات سيلا",
    seoDescription: "سماعات لاسلكية وألعاب وعزل ضوضاء.",
  },
  {
    id: 4,
    key: "Cameras",
    name: "Cameras",
    description: "كاميرات وعدسات ومعدات تصوير جاهزة للبيع.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    status: "active",
    featured: false,
    sortOrder: 4,
    seoTitle: "كاميرات سيلا",
    seoDescription: "كاميرات مدمجة واحترافية وعدسات.",
  },
  {
    id: 5,
    key: "Tablets",
    name: "Tablets",
    description: "أجهزة لوحية للعمل والتعليم والمحتوى.",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80",
    status: "active",
    featured: false,
    sortOrder: 5,
    seoTitle: "تابلت سيلا",
    seoDescription: "أجهزة لوحية ومستلزماتها.",
  },
  {
    id: 6,
    key: "Accessories",
    name: "Accessories",
    description: "ملحقات تقنية للشحن والإنتاجية والصوت.",
    image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80",
    status: "active",
    featured: false,
    sortOrder: 6,
    seoTitle: "ملحقات سيلا",
    seoDescription: "شواحن، حوامل، ميكروفونات ولوحات مفاتيح.",
  },
];

const defaultCustomFields = [
  {
    id: 1,
    name: "المعالج",
    key: "processor",
    type: "text",
    scope: "category",
    category: "Laptops",
    required: true,
    filterable: true,
    description: "نوع المعالج أو العائلة.",
  },
  {
    id: 2,
    name: "المقاس",
    key: "screen_size",
    type: "text",
    scope: "category",
    category: "Laptops",
    required: false,
    filterable: true,
    description: "مقاس الشاشة بالبوصة.",
  },
  {
    id: 3,
    name: "السعة",
    key: "storage",
    type: "select",
    scope: "category",
    category: "Phones",
    required: true,
    filterable: true,
    options: ["128GB", "256GB", "512GB"],
    description: "السعة التخزينية للهاتف.",
  },
  {
    id: 4,
    name: "نوع الاتصال",
    key: "wireless_type",
    type: "select",
    scope: "category",
    category: "Headphones",
    required: false,
    filterable: true,
    options: ["Bluetooth", "USB-C", "3.5mm"],
    description: "آلية الاتصال الأساسية.",
  },
  {
    id: 5,
    name: "مدة الضمان الممتد",
    key: "extended_warranty",
    type: "boolean",
    scope: "all",
    category: "All",
    required: false,
    filterable: false,
    description: "هل يدعم المنتج ضمانًا ممتدًا.",
  },
];

const defaultOptionSets = [
  {
    id: 1,
    name: "الألوان",
    key: "colors",
    type: "swatch",
    category: "All",
    required: false,
    values: ["أسود", "فضي", "أزرق", "أبيض"],
    description: "ألوان العرض الأساسية للمنتج.",
  },
  {
    id: 2,
    name: "السعة التخزينية",
    key: "storage_options",
    type: "chips",
    category: "Phones",
    required: true,
    values: ["128GB", "256GB", "512GB"],
    description: "خيارات السعة المتاحة للبيع.",
  },
  {
    id: 3,
    name: "باقات الضمان",
    key: "warranty_plan",
    type: "dropdown",
    category: "All",
    required: false,
    values: ["ضمان أساسي", "ضمان 24 شهر", "ضمان أعمال"],
    description: "خيارات الضمان المتاحة لكل منتج.",
  },
];

const defaultFilterStandards = [
  {
    id: 1,
    name: "التصفية حسب التصنيف",
    source: "category",
    category: "All",
    display: "chips",
    status: "active",
    linkedKey: "category",
  },
  {
    id: 2,
    name: "التصفية حسب العلامة التجارية",
    source: "brand",
    category: "All",
    display: "dropdown",
    status: "active",
    linkedKey: "brand",
  },
  {
    id: 3,
    name: "التصفية حسب السعة",
    source: "customField",
    category: "Phones",
    display: "chips",
    status: "active",
    linkedKey: "storage",
  },
  {
    id: 4,
    name: "التصفية حسب الألوان",
    source: "optionSet",
    category: "All",
    display: "swatch",
    status: "active",
    linkedKey: "colors",
  },
];

const adminProductsSeed = seedProducts.map((product, index) => {
  const phoneStorage = ["128GB", "256GB", "512GB"][index % 3];
  const color = ["أسود", "فضي", "أبيض", "أزرق"][index % 4];
  return {
    ...emptyProduct,
    ...product,
    slug: product.name.toLowerCase().replaceAll(" ", "-"),
    brand: product.name.split(" ")[0],
    barcode: `BC-${880000 + product.id}`,
    compareAtPrice: Math.round(product.price * 1.16),
    cost: Math.round(product.price * 0.62),
    status: index % 7 === 0 ? "draft" : index % 11 === 0 ? "archived" : "published",
    visibility: index % 7 === 0 ? "hidden" : "public",
    gallery: [product.image],
    shortDescription: "منتج إلكتروني احترافي مناسب للبيع في متجر عالي الجودة.",
    tags: [product.category, "Premium", "Electronics"],
    warranty: index % 3 === 0 ? "24 شهر" : "12 شهر",
    shippingClass: product.price > 1000 ? "شحن مؤمن" : "قياسي",
    weight: product.category === "Laptops" ? "1.6 كجم" : product.category === "Phones" ? "210 جم" : "650 جم",
    dimensions: product.category === "Laptops" ? "32 x 22 x 1.6 سم" : "18 x 12 x 6 سم",
    seoTitle: `${product.name} | سيلا SILA`,
    seoDescription: `اشتر ${product.name} من سيلا SILA مع توفر مخزون وتجربة دفع سريعة.`,
    warehouse: index % 5 === 0 ? "مستودع الرياض" : warehouseOptions[0],
    supplier: index % 4 === 0 ? "Nexa Distribution" : "SILA Direct",
    specs: [
      { key: "العلامة", value: product.name.split(" ")[0] },
      { key: "التصنيف", value: categoryLabel(product.category) },
      { key: "الضمان", value: index % 3 === 0 ? "24 شهر" : "12 شهر" },
    ],
    customFieldValues: {
      processor: product.category === "Laptops" ? ["M3 Pro", "Intel Ultra 7", "Ryzen 9"][index % 3] : "",
      screen_size: product.category === "Laptops" ? ["13 بوصة", "14 بوصة", "16 بوصة"][index % 3] : "",
      storage: product.category === "Phones" ? phoneStorage : "",
      wireless_type: product.category === "Headphones" ? ["Bluetooth", "USB-C", "3.5mm"][index % 3] : "",
      extended_warranty: index % 2 === 0 ? "نعم" : "لا",
    },
    optionSelections: {
      colors: [color],
      storage_options: product.category === "Phones" ? [phoneStorage] : [],
      warranty_plan: [index % 3 === 0 ? "ضمان 24 شهر" : "ضمان أساسي"],
    },
  };
});

const defaultStockMovements = adminProductsSeed.slice(0, 12).flatMap((product, index) => {
  const baseDate = new Date(`2026-04-${String((index % 9) + 10).padStart(2, "0")}T10:00:00`);
  return [
    {
      id: index * 2 + 1,
      productId: product.id,
      sku: product.sku,
      type: "receive",
      quantity: 20 + (index % 5) * 5,
      warehouse: product.warehouse,
      reason: "توريد مجدول للمخزون",
      createdAt: baseDate.toISOString(),
      createdBy: "فريق المستودع",
    },
    {
      id: index * 2 + 2,
      productId: product.id,
      sku: product.sku,
      type: index % 4 === 0 ? "adjust" : "sale",
      quantity: index % 4 === 0 ? -2 : -6,
      warehouse: product.warehouse,
      reason: index % 4 === 0 ? "تسوية جرد ربع سنوية" : "طلب عميل مؤكد",
      createdAt: new Date(baseDate.getTime() + 1000 * 60 * 60 * 5).toISOString(),
      createdBy: index % 4 === 0 ? "فريق التدقيق" : "طلبات المتجر",
    },
  ];
});

function getInitialState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        products: parsed.products?.length ? parsed.products : adminProductsSeed,
        categoryRecords: parsed.categoryRecords?.length ? parsed.categoryRecords : defaultCategoryRecords,
        stockMovements: parsed.stockMovements?.length ? parsed.stockMovements : defaultStockMovements,
        filterStandards: parsed.filterStandards?.length ? parsed.filterStandards : defaultFilterStandards,
        customFields: parsed.customFields?.length ? parsed.customFields : defaultCustomFields,
        optionSets: parsed.optionSets?.length ? parsed.optionSets : defaultOptionSets,
      };
    }
  } catch {}

  return {
    products: adminProductsSeed,
    categoryRecords: defaultCategoryRecords,
    stockMovements: defaultStockMovements,
    filterStandards: defaultFilterStandards,
    customFields: defaultCustomFields,
    optionSets: defaultOptionSets,
  };
}

export default function Products() {
  const initial = useMemo(() => getInitialState(), []);
  const [items, setItems] = useState(initial.products);
  const [categoryRecords, setCategoryRecords] = useState(initial.categoryRecords);
  const [stockMovements, setStockMovements] = useState(initial.stockMovements);
  const [filterStandards, setFilterStandards] = useState(initial.filterStandards);
  const [customFields, setCustomFields] = useState(initial.customFields);
  const [optionSets, setOptionSets] = useState(initial.optionSets);
  const [editingProduct, setEditingProduct] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingMovement, setEditingMovement] = useState(null);
  const [editingFilter, setEditingFilter] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editingOptionSet, setEditingOptionSet] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        products: items,
        categoryRecords,
        stockMovements,
        filterStandards,
        customFields,
        optionSets,
      }),
    );
  }, [items, categoryRecords, stockMovements, filterStandards, customFields, optionSets]);

  const section = getSectionFromPath(location.pathname);
  const categoriesList = useMemo(() => categoryRecords.map((item) => item.name), [categoryRecords]);

  const productStats = useMemo(
    () => ({
      total: items.length,
      published: items.filter((product) => product.status === "published").length,
      lowStock: items.filter((product) => product.stock > 0 && product.stock <= product.threshold).length,
      out: items.filter((product) => product.stock === 0).length,
      value: items.reduce((sum, product) => sum + product.stock * product.cost, 0),
    }),
    [items],
  );

  const categoryInsights = useMemo(
    () =>
      categoryRecords
        .map((record) => {
          const products = items.filter((product) => product.category === record.name);
          return {
            ...record,
            productCount: products.length,
            publishedCount: products.filter((product) => product.status === "published").length,
            lowStockCount: products.filter((product) => product.stock > 0 && product.stock <= product.threshold).length,
            revenueShare: products.reduce((sum, product) => sum + product.sales * product.price, 0),
          };
        })
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [categoryRecords, items],
  );

  const inventoryRows = useMemo(
    () =>
      items.map((product) => ({
        ...product,
        availableValue: product.stock * product.cost,
        stockStatus: stockState(product),
      })),
    [items],
  );

  const customFieldMap = useMemo(() => Object.fromEntries(customFields.map((field) => [field.key, field])), [customFields]);
  const optionSetMap = useMemo(() => Object.fromEntries(optionSets.map((set) => [set.key, set])), [optionSets]);

  const stockMovementRows = useMemo(
    () =>
      stockMovements
        .map((movement) => ({
          ...movement,
          product: items.find((product) => product.id === movement.productId),
        }))
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)),
    [stockMovements, items],
  );

  const filterInsights = useMemo(
    () =>
      filterStandards.map((filterItem) => ({
        ...filterItem,
        linkedCount: countLinkedValues(filterItem, items, customFieldMap, optionSetMap),
      })),
    [filterStandards, items, customFieldMap, optionSetMap],
  );

  const saveProduct = (product) => {
    const normalized = normalizeProduct(product, categoriesList, customFields, optionSets);
    if (!normalized.name.trim() || !normalized.sku.trim()) {
      showToast("بيانات ناقصة", "اسم المنتج و SKU مطلوبان قبل الحفظ.", "error");
      return;
    }

    setItems((current) => {
      if (normalized.id) {
        return current.map((item) => (item.id === normalized.id ? normalized : item));
      }
      const nextId = current.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      return [{ ...normalized, id: nextId, sales: 0, rating: 0 }, ...current];
    });

    setEditingProduct(null);
    showToast("تم حفظ المنتج", "تم تحديث الكتالوج وربط المنتج ببقية أقسام الإدارة.", "success");
  };

  const deleteProduct = (product) => {
    if (!window.confirm(`هل تريد حذف ${product.name} من الكتالوج؟`)) return;
    setItems((current) => current.filter((item) => item.id !== product.id));
    setStockMovements((current) => current.filter((movement) => movement.productId !== product.id));
    showToast("تم حذف المنتج", "تمت إزالة المنتج وسجل حركاته من الوحدة الحالية.", "success");
  };

  const duplicateProduct = (product) => {
    const nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const copy = normalizeProduct(
      {
        ...product,
        id: nextId,
        name: `${product.name} - نسخة`,
        slug: `${product.slug}-copy-${nextId}`,
        sku: `${product.sku}-COPY`,
        status: "draft",
        visibility: "hidden",
      },
      categoriesList,
      customFields,
      optionSets,
    );
    setItems((current) => [copy, ...current]);
    showToast("تم نسخ المنتج", "تم إنشاء نسخة مرتبطة بالتصنيف والمخزون والحقول.", "success");
  };

  const togglePublish = (product) => {
    const nextStatus = product.status === "published" ? "draft" : "published";
    setItems((current) =>
      current.map((item) =>
        item.id === product.id
          ? { ...item, status: nextStatus, visibility: nextStatus === "published" ? "public" : "hidden" }
          : item,
      ),
    );
    showToast("تم تحديث حالة النشر", `المنتج الآن ${publishLabels[nextStatus]}.`, "success");
  };

  const saveCategory = (record) => {
    if (!record.name.trim()) {
      showToast("اسم التصنيف مطلوب", "أدخل اسمًا واضحًا للتصنيف قبل الحفظ.", "error");
      return;
    }

    const normalized = {
      ...record,
      key: record.key?.trim() || record.name.trim(),
      sortOrder: Number(record.sortOrder) || categoryRecords.length + 1,
    };

    setCategoryRecords((current) => {
      if (normalized.id) {
        return current.map((item) => (item.id === normalized.id ? normalized : item));
      }
      const nextId = current.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      return [...current, { ...normalized, id: nextId }];
    });

    if (record.originalName && record.originalName !== record.name) {
      setItems((current) =>
        current.map((item) => (item.category === record.originalName ? { ...item, category: record.name } : item)),
      );
      setCustomFields((current) =>
        current.map((item) => (item.category === record.originalName ? { ...item, category: record.name } : item)),
      );
      setOptionSets((current) =>
        current.map((item) => (item.category === record.originalName ? { ...item, category: record.name } : item)),
      );
      setFilterStandards((current) =>
        current.map((item) => (item.category === record.originalName ? { ...item, category: record.name } : item)),
      );
    }

    setEditingCategory(null);
    showToast("تم حفظ التصنيف", "تم تحديث التصنيف وربطه بالمنتجات والحقول والاختيارات.", "success");
  };

  const deleteCategory = (record) => {
    const linkedProducts = items.filter((product) => product.category === record.name).length;
    if (linkedProducts > 0) {
      showToast("لا يمكن الحذف", "يوجد منتجات مرتبطة بهذا التصنيف. انقلها أولاً.", "error");
      return;
    }
    setCategoryRecords((current) => current.filter((item) => item.id !== record.id));
    setCustomFields((current) => current.filter((item) => item.category !== record.name));
    setOptionSets((current) => current.filter((item) => item.category !== record.name));
    setFilterStandards((current) => current.filter((item) => item.category !== record.name));
    showToast("تم حذف التصنيف", "تمت إزالة التصنيف من الوحدة الحالية.", "success");
  };

  const saveMovement = (movement) => {
    const product = items.find((item) => item.id === Number(movement.productId));
    if (!product) {
      showToast("منتج غير صالح", "اختر منتجًا صحيحًا لتسجيل الحركة.", "error");
      return;
    }

    const signedQuantity = getSignedQuantity(movement.type, Number(movement.quantity));
    const nextStock = Math.max(0, product.stock + signedQuantity);
    const nextMovement = {
      id: stockMovements.reduce((max, item) => Math.max(max, item.id), 0) + 1,
      productId: product.id,
      sku: product.sku,
      type: movement.type,
      quantity: signedQuantity,
      warehouse: movement.warehouse,
      reason: movement.reason,
      createdAt: new Date().toISOString(),
      createdBy: "إدارة المنتجات",
    };

    setItems((current) =>
      current.map((item) =>
        item.id === product.id
          ? { ...item, stock: nextStock, warehouse: movement.warehouse || item.warehouse }
          : item,
      ),
    );
    setStockMovements((current) => [nextMovement, ...current]);
    setEditingMovement(null);
    showToast("تم تسجيل الحركة", "تم تحديث رصيد المخزون وإضافة السجل للحركات.", "success");
  };

  const saveFilter = (record) => {
    if (!record.name.trim()) {
      showToast("اسم المعيار مطلوب", "أدخل اسمًا واضحًا لمعيار التصفية.", "error");
      return;
    }
    const normalized = { ...record, linkedKey: record.linkedKey.trim() };
    setFilterStandards((current) => {
      if (normalized.id) {
        return current.map((item) => (item.id === normalized.id ? normalized : item));
      }
      const nextId = current.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      return [{ ...normalized, id: nextId }, ...current];
    });
    setEditingFilter(null);
    showToast("تم حفظ معيار التصفية", "المعيار مرتبط الآن ببيانات المنتجات ويُحسب منه عدد القيم.", "success");
  };

  const saveField = (record) => {
    if (!record.name.trim() || !record.key.trim()) {
      showToast("بيانات ناقصة", "اسم الحقل والمفتاح البرمجي مطلوبان.", "error");
      return;
    }
    const normalized = {
      ...record,
      options: parseList(record.options),
    };
    setCustomFields((current) => {
      if (normalized.id) {
        return current.map((item) => (item.id === normalized.id ? normalized : item));
      }
      const nextId = current.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      return [{ ...normalized, id: nextId }, ...current];
    });
    setEditingField(null);
    showToast("تم حفظ الحقل", "سيظهر الحقل داخل محرر المنتج المرتبط به.", "success");
  };

  const saveOptionSet = (record) => {
    if (!record.name.trim() || !record.key.trim()) {
      showToast("بيانات ناقصة", "اسم المكتبة والمفتاح البرمجي مطلوبان.", "error");
      return;
    }
    const normalized = {
      ...record,
      values: parseList(record.values),
    };
    setOptionSets((current) => {
      if (normalized.id) {
        return current.map((item) => (item.id === normalized.id ? normalized : item));
      }
      const nextId = current.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      return [{ ...normalized, id: nextId }, ...current];
    });
    setEditingOptionSet(null);
    showToast("تم حفظ مكتبة الاختيارات", "أصبحت المكتبة جاهزة للربط مع المنتجات.", "success");
  };

  return (
    <div className="space-y-6">
      <section className="card p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">Product Control Center</p>
            <h2 className="mt-2 font-heading text-2xl font-black text-slate-950 dark:text-white">نظام إدارة المنتجات</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              كتالوج موحد للمنتجات والتصنيفات والمخزون والحقول المخصصة ومعايير التصفية. كل قسم هنا يقرأ من نفس
              البيانات ويؤثر مباشرة على بقية الأقسام.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setEditingProduct({ ...emptyProduct, category: categoriesList[0] || baseCategories[0] })}>
              <PackagePlus size={18} />
              إضافة منتج
            </Button>
            <Button variant="secondary" onClick={() => navigate("/admin/products/categories")}>
              <FolderTree size={18} />
              إدارة التصنيفات
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="إجمالي المنتجات" value={productStats.total} tone="accent" />
          <MetricCard label="المنشور" value={productStats.published} tone="success" />
          <MetricCard label="مخزون منخفض" value={productStats.lowStock} tone="warning" />
          <MetricCard label="غير متوفر" value={productStats.out} tone="danger" />
          <MetricCard label="قيمة المخزون" value={money(productStats.value)} tone="neutral" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="card h-fit p-3">
          <p className="px-2 pb-3 text-sm font-black text-slate-950 dark:text-white">أقسام المنتجات</p>
          <nav className="space-y-1">
            {sectionItems.map((item) => {
              const Icon = item.icon;
              const target = item.slug ? `/admin/products/${item.slug}` : "/admin/products";
              return (
                <NavLink
                  key={target}
                  to={target}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition ${
                      isActive
                        ? "bg-accent text-white shadow-lg shadow-indigo-500/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="mt-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <p className="text-sm font-black text-slate-950 dark:text-white">ربط مباشر بين الأقسام</p>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              التصنيفات تتحكم في الحقول والمكتبات. الحركات تضبط المخزون. معايير التصفية تقرأ من الحقول والاختيارات
              والمنتجات المنشورة.
            </p>
          </div>
        </aside>

        <div className="space-y-6">
          {section === "catalog" && (
            <CatalogSection
              items={items}
              categoriesList={categoriesList}
              onEdit={setEditingProduct}
              onPreview={setPreviewProduct}
              onDuplicate={duplicateProduct}
              onDelete={deleteProduct}
              onTogglePublish={togglePublish}
              onOpenCategories={() => navigate("/admin/products/categories")}
            />
          )}

          {section === "categories" && (
            <CategoriesSection
              categories={categoryInsights}
              onEdit={(record) => setEditingCategory({ ...record, originalName: record.name })}
              onDelete={deleteCategory}
              onCreate={() =>
                setEditingCategory({
                  name: "",
                  key: "",
                  description: "",
                  image: "",
                  status: "active",
                  featured: false,
                  sortOrder: categoryRecords.length + 1,
                  seoTitle: "",
                  seoDescription: "",
                })
              }
            />
          )}

          {section === "inventory" && (
            <InventorySection
              rows={inventoryRows}
              onAdjust={(product) =>
                setEditingMovement({
                  productId: product.id,
                  type: "adjust",
                  quantity: 1,
                  warehouse: product.warehouse,
                  reason: "",
                })
              }
            />
          )}

          {section === "stock-movements" && (
            <StockMovementsSection
              rows={stockMovementRows}
              items={items}
              onCreate={() =>
                setEditingMovement({
                  productId: items[0]?.id || "",
                  type: "receive",
                  quantity: 1,
                  warehouse: items[0]?.warehouse || warehouseOptions[0],
                  reason: "",
                })
              }
            />
          )}

          {section === "filter-standards" && (
            <FilterStandardsSection
              rows={filterInsights}
              onCreate={() =>
                setEditingFilter({
                  name: "",
                  source: "category",
                  category: "All",
                  display: "chips",
                  status: "active",
                  linkedKey: "category",
                })
              }
              onEdit={setEditingFilter}
            />
          )}

          {section === "custom-fields" && (
            <CustomFieldsSection
              rows={customFields}
              onCreate={() =>
                setEditingField({
                  name: "",
                  key: "",
                  type: "text",
                  scope: "all",
                  category: "All",
                  required: false,
                  filterable: false,
                  options: [],
                  description: "",
                })
              }
              onEdit={(field) => setEditingField({ ...field, options: field.options || [] })}
              items={items}
            />
          )}

          {section === "options-library" && (
            <OptionsLibrarySection
              rows={optionSets}
              onCreate={() =>
                setEditingOptionSet({
                  name: "",
                  key: "",
                  type: "chips",
                  category: "All",
                  required: false,
                  values: [],
                  description: "",
                })
              }
              onEdit={(set) => setEditingOptionSet({ ...set, values: set.values || [] })}
              items={items}
            />
          )}
        </div>
      </div>

      <ProductEditor
        open={!!editingProduct}
        product={editingProduct}
        categoriesList={categoriesList}
        customFields={customFields}
        optionSets={optionSets}
        onClose={() => setEditingProduct(null)}
        onSave={saveProduct}
      />

      <ProductPreview
        open={!!previewProduct}
        product={previewProduct}
        customFields={customFields}
        optionSets={optionSets}
        onClose={() => setPreviewProduct(null)}
        onEdit={(product) => {
          setPreviewProduct(null);
          setEditingProduct(product);
        }}
      />

      <CategoryEditor
        open={!!editingCategory}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSave={saveCategory}
      />

      <StockMovementEditor
        open={!!editingMovement}
        movement={editingMovement}
        items={items}
        onClose={() => setEditingMovement(null)}
        onSave={saveMovement}
      />

      <FilterStandardEditor
        open={!!editingFilter}
        record={editingFilter}
        categoriesList={categoriesList}
        customFields={customFields}
        optionSets={optionSets}
        onClose={() => setEditingFilter(null)}
        onSave={saveFilter}
      />

      <CustomFieldEditor
        open={!!editingField}
        field={editingField}
        categoriesList={categoriesList}
        onClose={() => setEditingField(null)}
        onSave={saveField}
      />

      <OptionSetEditor
        open={!!editingOptionSet}
        record={editingOptionSet}
        categoriesList={categoriesList}
        onClose={() => setEditingOptionSet(null)}
        onSave={saveOptionSet}
      />
    </div>
  );
}

function CatalogSection({ items, categoriesList, onEdit, onPreview, onDuplicate, onDelete, onTogglePublish, onOpenCategories }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [publishStatus, setPublishStatus] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sort, setSort] = useState({ key: "id", direction: "desc" });

  const filtered = useMemo(() => {
    const list = items.filter((product) => {
      const haystack = [product.name, product.sku, product.brand, product.slug, product.supplier, product.barcode]
        .join(" ")
        .toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesCategory = category === "All" || product.category === category;
      const matchesPublish = publishStatus === "all" || product.status === publishStatus;
      const matchesStock = stockFilter === "all" || stockState(product) === stockFilter;
      return matchesQuery && matchesCategory && matchesPublish && matchesStock;
    });
    return sortBy(list, sort);
  }, [items, query, category, publishStatus, stockFilter, sort]);

  return (
    <div className="space-y-4">
      <section className="card p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="font-heading text-xl font-black text-slate-950 dark:text-white">كتالوج المنتجات</h3>
            <p className="mt-1 text-sm text-slate-500">إدارة وصف المنتج والسعر والمخزون والنشر والبيانات المرتبطة بكل منتج.</p>
          </div>
          <Button variant="secondary" onClick={onOpenCategories}>
            <FolderTree size={17} />
            عرض التصنيفات
          </Button>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-[1.2fr_repeat(3,minmax(0,0.8fr))]">
          <SearchInput value={query} onChange={setQuery} placeholder="ابحث بالاسم أو SKU أو المورد أو الباركود" />
          <SelectField value={category} onChange={setCategory} options={["All", ...categoriesList]} labelMap={categoryLabel} />
          <SelectField
            value={publishStatus}
            onChange={setPublishStatus}
            options={["all", "published", "draft", "archived"]}
            labelMap={(value) => (value === "all" ? "كل حالات النشر" : publishLabels[value])}
          />
          <SelectField
            value={stockFilter}
            onChange={setStockFilter}
            options={["all", "In stock", "Low stock", "Out of stock"]}
            labelMap={(value) => (value === "all" ? "كل المخزون" : statusLabel(value))}
          />
        </div>
      </section>

      {filtered.length ? (
        <Table
          columns={[
            { key: "name", label: "المنتج", sortable: true },
            { key: "sku", label: "SKU", sortable: true },
            { key: "category", label: "التصنيف", sortable: true },
            { key: "price", label: "السعر", sortable: true },
            { key: "stock", label: "المخزون", sortable: true },
            { key: "status", label: "النشر", sortable: true },
            { key: "visibility", label: "الظهور" },
            { key: "actions", label: "إجراءات" },
          ]}
          rows={filtered}
          sort={sort}
          onSort={(key) =>
            setSort((current) => ({
              key,
              direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
            }))
          }
          renderRow={(product) => (
            <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <img src={product.image} alt={product.name} className="h-14 w-14 rounded-2xl object-cover" />
                  <div className="min-w-0">
                    <p className="font-black text-slate-950 dark:text-white">{product.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {product.brand} · {product.slug}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{product.sku}</td>
              <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{categoryLabel(product.category)}</td>
              <td className="px-4 py-4">
                <p className="font-black text-slate-950 dark:text-white">{money(product.price)}</p>
                <p className="text-xs text-slate-500">تكلفة {money(product.cost)}</p>
              </td>
              <td className="px-4 py-4">
                <div className="space-y-1">
                  <Badge tone={statusTone(stockState(product))}>
                    {statusLabel(stockState(product))}: {product.stock}
                  </Badge>
                  <p className="text-xs text-slate-500">حد التنبيه {product.threshold}</p>
                </div>
              </td>
              <td className="px-4 py-4">
                <Badge tone={publishTones[product.status]}>{publishLabels[product.status]}</Badge>
              </td>
              <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                {product.visibility === "public" ? "ظاهر" : "مخفي"}
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <IconAction label="معاينة" onClick={() => onPreview(product)} icon={Eye} />
                  <IconAction label="تعديل" onClick={() => onEdit(product)} icon={Edit3} />
                  <IconAction label="نسخ" onClick={() => onDuplicate(product)} icon={Copy} />
                  <Button variant="secondary" size="sm" onClick={() => onTogglePublish(product)}>
                    {product.status === "published" ? "إلغاء النشر" : "نشر"}
                  </Button>
                  <IconAction label="حذف" onClick={() => onDelete(product)} icon={Trash2} danger />
                </div>
              </td>
            </tr>
          )}
        />
      ) : (
        <EmptyState title="لا توجد منتجات" text="لم يتم العثور على نتائج مطابقة للفلاتر الحالية." />
      )}
    </div>
  );
}

function CategoriesSection({ categories, onEdit, onDelete, onCreate }) {
  return (
    <div className="space-y-4">
      <section className="card p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="font-heading text-xl font-black text-slate-950 dark:text-white">التصنيفات</h3>
            <p className="mt-1 text-sm text-slate-500">كل تصنيف يحدد البنية التشغيلية للمنتجات والحقول والاختيارات ومعايير التصفية.</p>
          </div>
          <Button onClick={onCreate}>
            <Plus size={18} />
            إضافة تصنيف
          </Button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {categories.map((record) => (
          <article key={record.id} className="card overflow-hidden">
            <div className="grid md:grid-cols-[180px_1fr]">
              <img src={record.image} alt={record.name} className="h-full min-h-44 w-full object-cover" />
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={record.status === "active" ? "success" : "neutral"}>
                    {record.status === "active" ? "نشط" : "مخفي"}
                  </Badge>
                  {record.featured && <Badge tone="accent">مميز</Badge>}
                </div>
                <h4 className="mt-3 font-heading text-2xl font-black text-slate-950 dark:text-white">{categoryLabel(record.name)}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-500">{record.description}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Info label="المنتجات" value={record.productCount} />
                  <Info label="منشور" value={record.publishedCount} />
                  <Info label="مخزون منخفض" value={record.lowStockCount} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => onEdit(record)}>
                    <Edit3 size={16} />
                    تعديل
                  </Button>
                  <Button variant="secondary" onClick={() => onDelete(record)}>
                    <Trash2 size={16} />
                    حذف
                  </Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function InventorySection({ rows, onAdjust }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState({ key: "stock", direction: "asc" });

  const filtered = useMemo(() => {
    const list = rows.filter((row) => {
      const matchesQuery = [row.name, row.sku, row.warehouse, row.supplier].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || row.stockStatus === statusFilter;
      return matchesQuery && matchesStatus;
    });
    return sortBy(list, sort);
  }, [rows, query, statusFilter, sort]);

  const summary = useMemo(
    () => ({
      inStock: rows.filter((row) => row.stockStatus === "In stock").length,
      low: rows.filter((row) => row.stockStatus === "Low stock").length,
      out: rows.filter((row) => row.stockStatus === "Out of stock").length,
      value: rows.reduce((sum, row) => sum + row.availableValue, 0),
    }),
    [rows],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="متوفر" value={summary.inStock} tone="success" />
        <MetricCard label="منخفض" value={summary.low} tone="warning" />
        <MetricCard label="غير متوفر" value={summary.out} tone="danger" />
        <MetricCard label="قيمة المخزون" value={money(summary.value)} tone="neutral" />
      </div>

      <section className="card p-4">
        <div className="grid gap-3 xl:grid-cols-[1fr_260px]">
          <SearchInput value={query} onChange={setQuery} placeholder="ابحث باسم المنتج أو SKU أو المورد أو المستودع" />
          <SelectField
            value={statusFilter}
            onChange={setStatusFilter}
            options={["all", "In stock", "Low stock", "Out of stock"]}
            labelMap={(value) => (value === "all" ? "كل الحالات" : statusLabel(value))}
          />
        </div>
      </section>

      <Table
        columns={[
          { key: "name", label: "المنتج", sortable: true },
          { key: "sku", label: "SKU", sortable: true },
          { key: "warehouse", label: "المستودع", sortable: true },
          { key: "stock", label: "المتوفر", sortable: true },
          { key: "threshold", label: "حد التنبيه", sortable: true },
          { key: "availableValue", label: "القيمة", sortable: true },
          { key: "status", label: "الحالة" },
          { key: "actions", label: "إجراءات" },
        ]}
        rows={filtered}
        sort={sort}
        onSort={(key) =>
          setSort((current) => ({
            key,
            direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
          }))
        }
        renderRow={(product) => (
          <tr key={product.id} className={product.stock <= product.threshold ? "bg-amber-50/60 dark:bg-amber-500/5" : ""}>
            <td className="px-4 py-4">
              <div className="flex items-center gap-3">
                <img src={product.image} alt={product.name} className="h-12 w-12 rounded-2xl object-cover" />
                <div>
                  <p className="font-black text-slate-950 dark:text-white">{product.name}</p>
                  <p className="text-xs text-slate-500">{categoryLabel(product.category)}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{product.sku}</td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{product.warehouse}</td>
            <td className="px-4 py-4 font-black text-slate-950 dark:text-white">{product.stock}</td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{product.threshold}</td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{money(product.availableValue)}</td>
            <td className="px-4 py-4">
              <Badge tone={statusTone(product.stockStatus)}>{statusLabel(product.stockStatus)}</Badge>
            </td>
            <td className="px-4 py-4">
              <Button variant="secondary" size="sm" onClick={() => onAdjust(product)}>
                <ArrowLeftRight size={15} />
                تسوية
              </Button>
            </td>
          </tr>
        )}
      />
    </div>
  );
}

function StockMovementsSection({ rows, items, onCreate }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const matchesQuery = [row.product?.name, row.sku, row.reason, row.warehouse].join(" ").toLowerCase().includes(query.toLowerCase());
        const matchesType = typeFilter === "all" || row.type === typeFilter;
        return matchesQuery && matchesType;
      }),
    [rows, query, typeFilter],
  );

  const totals = useMemo(
    () => ({
      receive: rows.filter((row) => row.type === "receive").reduce((sum, row) => sum + Math.abs(row.quantity), 0),
      sale: rows.filter((row) => row.type === "sale").reduce((sum, row) => sum + Math.abs(row.quantity), 0),
      adjust: rows.filter((row) => row.type === "adjust").length,
      products: items.length,
    }),
    [rows, items.length],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="وحدات موردة" value={totals.receive} tone="success" />
        <MetricCard label="وحدات مباعة" value={totals.sale} tone="accent" />
        <MetricCard label="تسويات" value={totals.adjust} tone="warning" />
        <MetricCard label="منتجات مرتبطة" value={totals.products} tone="neutral" />
      </div>

      <section className="card p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid flex-1 gap-3 xl:grid-cols-[1fr_220px]">
            <SearchInput value={query} onChange={setQuery} placeholder="ابحث بالمنتج أو السبب أو المستودع" />
            <SelectField
              value={typeFilter}
              onChange={setTypeFilter}
              options={["all", "receive", "sale", "adjust", "return", "transfer", "damage"]}
              labelMap={(value) => (value === "all" ? "كل الحركات" : stockMovementLabels[value])}
            />
          </div>
          <Button onClick={onCreate}>
            <Plus size={18} />
            تسجيل حركة
          </Button>
        </div>
      </section>

      <Table
        columns={[
          { key: "product", label: "المنتج" },
          { key: "type", label: "النوع" },
          { key: "quantity", label: "الكمية" },
          { key: "warehouse", label: "المستودع" },
          { key: "reason", label: "السبب" },
          { key: "createdAt", label: "التاريخ" },
          { key: "createdBy", label: "بواسطة" },
        ]}
        rows={filtered}
        renderRow={(row) => (
          <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
            <td className="px-4 py-4">
              <div>
                <p className="font-black text-slate-950 dark:text-white">{row.product?.name || "منتج محذوف"}</p>
                <p className="text-xs text-slate-500">{row.sku}</p>
              </div>
            </td>
            <td className="px-4 py-4">
              <Badge tone={stockMovementTones[row.type]}>{stockMovementLabels[row.type]}</Badge>
            </td>
            <td className={`px-4 py-4 font-black ${row.quantity > 0 ? "text-success" : "text-danger"}`}>
              {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
            </td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{row.warehouse}</td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{row.reason}</td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatDate(row.createdAt)}</td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{row.createdBy}</td>
          </tr>
        )}
      />
    </div>
  );
}

function FilterStandardsSection({ rows, onCreate, onEdit }) {
  return (
    <div className="space-y-4">
      <section className="card p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="font-heading text-xl font-black text-slate-950 dark:text-white">معايير التصفية</h3>
            <p className="mt-1 text-sm text-slate-500">تنظيم الفلاتر التي ستُعرض في واجهة المتجر وربطها بالحقول والمكتبات والخصائص الفعلية.</p>
          </div>
          <Button onClick={onCreate}>
            <Plus size={18} />
            إضافة معيار
          </Button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {rows.map((row) => (
          <article key={row.id} className="card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={row.status === "active" ? "success" : "neutral"}>{row.status === "active" ? "نشط" : "متوقف"}</Badge>
              <Badge tone="accent">{filterSourceLabels[row.source]}</Badge>
              <Badge tone="neutral">{optionDisplayLabels[row.display]}</Badge>
            </div>
            <h4 className="mt-3 font-heading text-xl font-black text-slate-950 dark:text-white">{row.name}</h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info label="النطاق" value={row.category === "All" ? "كل التصنيفات" : categoryLabel(row.category)} />
              <Info label="المفتاح المرتبط" value={row.linkedKey} />
              <Info label="عدد القيم" value={row.linkedCount} />
              <Info label="نوع العرض" value={optionDisplayLabels[row.display]} />
            </div>
            <div className="mt-4">
              <Button variant="secondary" onClick={() => onEdit(row)}>
                <Edit3 size={16} />
                تعديل المعيار
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function CustomFieldsSection({ rows, onCreate, onEdit, items }) {
  const usage = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        usageCount: items.filter((item) => {
          if (row.scope === "all") return true;
          return item.category === row.category;
        }).length,
      })),
    [rows, items],
  );

  return (
    <div className="space-y-4">
      <section className="card p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="font-heading text-xl font-black text-slate-950 dark:text-white">الحقول المخصصة</h3>
            <p className="mt-1 text-sm text-slate-500">بناء خصائص مخصصة تظهر داخل شاشة المنتج وتغذي معايير التصفية والبيانات التفصيلية.</p>
          </div>
          <Button onClick={onCreate}>
            <Plus size={18} />
            إضافة حقل
          </Button>
        </div>
      </section>

      <Table
        columns={[
          { key: "name", label: "الحقل" },
          { key: "key", label: "المفتاح" },
          { key: "type", label: "النوع" },
          { key: "scope", label: "النطاق" },
          { key: "usageCount", label: "عدد المنتجات" },
          { key: "flags", label: "الخصائص" },
          { key: "actions", label: "إجراءات" },
        ]}
        rows={usage}
        renderRow={(row) => (
          <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
            <td className="px-4 py-4">
              <div>
                <p className="font-black text-slate-950 dark:text-white">{row.name}</p>
                <p className="text-xs text-slate-500">{row.description}</p>
              </div>
            </td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{row.key}</td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{fieldTypeLabels[row.type]}</td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
              {row.scope === "all" ? "كل المنتجات" : categoryLabel(row.category)}
            </td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{row.usageCount}</td>
            <td className="px-4 py-4">
              <div className="flex flex-wrap gap-2">
                {row.required && <Badge tone="warning">إجباري</Badge>}
                {row.filterable && <Badge tone="accent">قابل للتصفية</Badge>}
              </div>
            </td>
            <td className="px-4 py-4">
              <Button variant="secondary" size="sm" onClick={() => onEdit(row)}>
                <Edit3 size={15} />
                تعديل
              </Button>
            </td>
          </tr>
        )}
      />
    </div>
  );
}

function OptionsLibrarySection({ rows, onCreate, onEdit, items }) {
  const usage = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        usageCount: items.filter((item) => row.category === "All" || item.category === row.category).length,
      })),
    [rows, items],
  );

  return (
    <div className="space-y-4">
      <section className="card p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="font-heading text-xl font-black text-slate-950 dark:text-white">مكتبة الاختيارات</h3>
            <p className="mt-1 text-sm text-slate-500">تعريف مكتبات الألوان والسعات والباقات وربطها مباشرة بشاشة المنتج وبفلاتر المتجر.</p>
          </div>
          <Button onClick={onCreate}>
            <Plus size={18} />
            إضافة مكتبة
          </Button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {usage.map((row) => (
          <article key={row.id} className="card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">{optionDisplayLabels[row.type]}</Badge>
              <Badge tone="neutral">{row.category === "All" ? "كل التصنيفات" : categoryLabel(row.category)}</Badge>
              {row.required && <Badge tone="warning">مطلوب</Badge>}
            </div>
            <h4 className="mt-3 font-heading text-xl font-black text-slate-950 dark:text-white">{row.name}</h4>
            <p className="mt-2 text-sm text-slate-500">{row.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {row.values.map((value) => (
                <Badge key={value} tone="neutral">
                  {value}
                </Badge>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info label="المفتاح" value={row.key} />
              <Info label="منتجات مرتبطة" value={row.usageCount} />
            </div>
            <div className="mt-4">
              <Button variant="secondary" onClick={() => onEdit(row)}>
                <Edit3 size={16} />
                تعديل
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProductEditor({ open, product, categoriesList, customFields, optionSets, onClose, onSave }) {
  const [form, setForm] = useState(product || emptyProduct);

  useEffect(() => {
    if (product) {
      setForm({
        ...product,
        customFieldValues: { ...(product.customFieldValues || {}) },
        optionSelections: { ...(product.optionSelections || {}) },
      });
    }
  }, [product]);

  if (!product) return null;

  const fieldsForCategory = customFields.filter((field) => field.scope === "all" || field.category === form.category);
  const optionSetsForCategory = optionSets.filter((set) => set.category === "All" || set.category === form.category);
  const specsText = Array.isArray(form.specs)
    ? form.specs.map((item) => `${item.key}: ${item.value}`).join("\n")
    : String(form.specs || "");
  const galleryText = Array.isArray(form.gallery) ? form.gallery.join("\n") : String(form.gallery || "");
  const tagsText = Array.isArray(form.tags) ? form.tags.join(", ") : String(form.tags || "");

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    onSave({
      ...form,
      price: Number(form.price),
      compareAtPrice: Number(form.compareAtPrice),
      cost: Number(form.cost),
      stock: Number(form.stock),
      threshold: Number(form.threshold),
      tags: parseList(tagsText),
      gallery: String(galleryText)
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean),
      specs: String(specsText)
        .split("\n")
        .map((line) => {
          const [key, ...rest] = line.split(":");
          return { key: key?.trim() || "خاصية", value: rest.join(":").trim() || "-" };
        })
        .filter((item) => item.key),
    });
  };

  return (
    <Modal open={open} title={form.id ? "تعديل المنتج" : "إضافة منتج جديد"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-6 p-5">
        <FormSection title="البيانات الأساسية" description="الاسم والرابط والعلامة والتصنيف والمعرفات التجارية.">
          <Field label="اسم المنتج" value={form.name} onChange={(value) => update("name", value)} required />
          <Field label="الرابط المختصر" value={form.slug} onChange={(value) => update("slug", value)} placeholder="product-slug" />
          <Field label="العلامة التجارية" value={form.brand} onChange={(value) => update("brand", value)} />
          <SelectInput label="التصنيف" value={form.category} onChange={(value) => update("category", value)} options={categoriesList} labelMap={categoryLabel} />
          <Field label="SKU" value={form.sku} onChange={(value) => update("sku", value)} required />
          <Field label="الباركود" value={form.barcode} onChange={(value) => update("barcode", value)} />
          <Field label="المورد" value={form.supplier} onChange={(value) => update("supplier", value)} />
          <SelectInput label="المستودع" value={form.warehouse} onChange={(value) => update("warehouse", value)} options={warehouseOptions} />
        </FormSection>

        <FormSection title="السعر والمخزون" description="التسعير التجاري وحالة المخزون وحد التنبيه.">
          <Field label="سعر البيع" type="number" value={form.price} onChange={(value) => update("price", value)} />
          <Field label="سعر قبل الخصم" type="number" value={form.compareAtPrice} onChange={(value) => update("compareAtPrice", value)} />
          <Field label="التكلفة" type="number" value={form.cost} onChange={(value) => update("cost", value)} />
          <Field label="المخزون" type="number" value={form.stock} onChange={(value) => update("stock", value)} />
          <Field label="حد التنبيه" type="number" value={form.threshold} onChange={(value) => update("threshold", value)} />
          <SelectInput label="حالة النشر" value={form.status} onChange={(value) => update("status", value)} options={["published", "draft", "archived"]} labelMap={(value) => publishLabels[value]} />
        </FormSection>

        <FormSection title="الوصف والمحتوى" description="الوصف الظاهر للعملاء ومواصفات المنتج وتسويق الصفحة.">
          <Field label="وصف مختصر" value={form.shortDescription} onChange={(value) => update("shortDescription", value)} className="md:col-span-2" />
          <TextArea label="الوصف الكامل" value={form.description} onChange={(value) => update("description", value)} className="md:col-span-2" rows={5} />
          <TextArea label="المواصفات الفنية" value={specsText} onChange={(value) => update("specs", value)} helper="كل سطر بصيغة: الخاصية: القيمة" className="md:col-span-2" />
        </FormSection>

        <FormSection title="الصور والشحن" description="الصورة الرئيسية ومعرض الصور والوزن والأبعاد.">
          <Field label="الصورة الرئيسية" value={form.image} onChange={(value) => update("image", value)} className="md:col-span-2" />
          <TextArea label="معرض الصور" value={galleryText} onChange={(value) => update("gallery", value)} helper="رابط في كل سطر" className="md:col-span-2" />
          <Field label="الوزن" value={form.weight} onChange={(value) => update("weight", value)} />
          <Field label="الأبعاد" value={form.dimensions} onChange={(value) => update("dimensions", value)} />
          <Field label="الضمان" value={form.warranty} onChange={(value) => update("warranty", value)} />
          <Field label="فئة الشحن" value={form.shippingClass} onChange={(value) => update("shippingClass", value)} />
        </FormSection>

        <FormSection title="الحقول المخصصة" description="حقول مرتبطة مباشرة بالتصنيف المحدد لهذا المنتج.">
          {fieldsForCategory.length ? (
            fieldsForCategory.map((field) => (
              <DynamicFieldInput
                key={field.id}
                field={field}
                value={form.customFieldValues?.[field.key] || ""}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    customFieldValues: { ...(current.customFieldValues || {}), [field.key]: value },
                  }))
                }
              />
            ))
          ) : (
            <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800">
              لا توجد حقول مخصصة مرتبطة بهذا التصنيف.
            </div>
          )}
        </FormSection>

        <FormSection title="مكتبة الاختيارات" description="خيارات البيع والاختيار القابلة للربط مع واجهة المتجر.">
          {optionSetsForCategory.length ? (
            optionSetsForCategory.map((set) => (
              <Field
                key={set.id}
                label={set.name}
                value={(form.optionSelections?.[set.key] || []).join(", ")}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    optionSelections: { ...(current.optionSelections || {}), [set.key]: parseList(value) },
                  }))
                }
                helper={`النوع: ${optionDisplayLabels[set.type]} - افصل القيم بفاصلة`}
                className="md:col-span-2"
              />
            ))
          ) : (
            <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800">
              لا توجد مكتبات اختيارات مفعلة لهذا التصنيف.
            </div>
          )}
        </FormSection>

        <FormSection title="SEO والوسوم" description="عنوان الصفحة ووصفها والوسوم التسويقية.">
          <Field label="عنوان SEO" value={form.seoTitle} onChange={(value) => update("seoTitle", value)} className="md:col-span-2" />
          <TextArea label="وصف SEO" value={form.seoDescription} onChange={(value) => update("seoDescription", value)} className="md:col-span-2" />
          <Field label="الوسوم" value={tagsText} onChange={(value) => update("tags", value)} helper="افصل الوسوم بفاصلة" className="md:col-span-2" />
        </FormSection>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            <X size={17} />
            إلغاء
          </Button>
          <Button type="submit">
            <Save size={17} />
            حفظ المنتج
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ProductPreview({ open, product, customFields, optionSets, onClose, onEdit }) {
  if (!product) return null;

  const fieldsForCategory = customFields.filter((field) => field.scope === "all" || field.category === product.category);
  const optionSetsForCategory = optionSets.filter((set) => set.category === "All" || set.category === product.category);

  return (
    <Modal open={open} title="معاينة بيانات المنتج" onClose={onClose}>
      <div className="grid gap-0 md:grid-cols-[340px_1fr]">
        <div className="bg-slate-100 dark:bg-slate-900">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full min-h-96 w-full object-cover" />
          ) : (
            <div className="grid min-h-96 place-items-center text-slate-400">
              <Image size={48} />
            </div>
          )}
        </div>
        <div className="space-y-5 p-6">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone={publishTones[product.status]}>{publishLabels[product.status]}</Badge>
              <Badge tone={statusTone(stockState(product))}>{statusLabel(stockState(product))}</Badge>
              <Badge tone="accent">{categoryLabel(product.category)}</Badge>
            </div>
            <h2 className="mt-4 font-heading text-3xl font-black text-slate-950 dark:text-white">{product.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{product.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="السعر" value={money(product.price)} />
            <Info label="التكلفة" value={money(product.cost)} />
            <Info label="SKU" value={product.sku} />
            <Info label="المخزون" value={`${product.stock} وحدة`} />
            <Info label="المستودع" value={product.warehouse} />
            <Info label="المورد" value={product.supplier} />
          </div>
          <div>
            <p className="font-heading font-black text-slate-950 dark:text-white">الحقول المخصصة</p>
            <div className="mt-3 grid gap-2">
              {fieldsForCategory.map((field) => (
                <Info key={field.id} label={field.name} value={String(product.customFieldValues?.[field.key] || "-")} />
              ))}
            </div>
          </div>
          <div>
            <p className="font-heading font-black text-slate-950 dark:text-white">مكتبة الاختيارات</p>
            <div className="mt-3 grid gap-2">
              {optionSetsForCategory.map((set) => (
                <Info key={set.id} label={set.name} value={(product.optionSelections?.[set.key] || []).join("، ") || "-"} />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => onEdit(product)}>
              <Edit3 size={17} />
              تعديل
            </Button>
            <Button variant="secondary" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function CategoryEditor({ open, category, onClose, onSave }) {
  const [form, setForm] = useState(category);

  useEffect(() => {
    if (category) setForm(category);
  }, [category]);

  if (!category) return null;

  return (
    <Modal open={open} title={form.id ? "تعديل التصنيف" : "إضافة تصنيف"} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
        className="space-y-5 p-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="اسم التصنيف" value={form.name || ""} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
          <Field label="المفتاح" value={form.key || ""} onChange={(value) => setForm((current) => ({ ...current, key: value }))} />
          <Field label="رابط الصورة" value={form.image || ""} onChange={(value) => setForm((current) => ({ ...current, image: value }))} className="md:col-span-2" />
          <Field label="الترتيب" type="number" value={form.sortOrder || 1} onChange={(value) => setForm((current) => ({ ...current, sortOrder: value }))} />
          <SelectInput label="الحالة" value={form.status || "active"} onChange={(value) => setForm((current) => ({ ...current, status: value }))} options={["active", "hidden"]} labelMap={(value) => (value === "active" ? "نشط" : "مخفي")} />
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
            <input type="checkbox" checked={!!form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">تصنيف مميز</span>
          </label>
          <TextArea label="الوصف" value={form.description || ""} onChange={(value) => setForm((current) => ({ ...current, description: value }))} className="md:col-span-2" />
          <Field label="عنوان SEO" value={form.seoTitle || ""} onChange={(value) => setForm((current) => ({ ...current, seoTitle: value }))} className="md:col-span-2" />
          <TextArea label="وصف SEO" value={form.seoDescription || ""} onChange={(value) => setForm((current) => ({ ...current, seoDescription: value }))} className="md:col-span-2" />
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit">
            <Save size={17} />
            حفظ التصنيف
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function StockMovementEditor({ open, movement, items, onClose, onSave }) {
  const [form, setForm] = useState(movement);

  useEffect(() => {
    if (movement) setForm(movement);
  }, [movement]);

  if (!movement) return null;

  return (
    <Modal open={open} title="تسجيل حركة مخزون" onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
        className="space-y-5 p-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <SelectInput
            label="المنتج"
            value={String(form.productId || "")}
            onChange={(value) =>
              setForm((current) => {
                const next = items.find((item) => item.id === Number(value));
                return { ...current, productId: Number(value), warehouse: next?.warehouse || current.warehouse };
              })
            }
            options={items.map((item) => String(item.id))}
            labelMap={(value) => items.find((item) => item.id === Number(value))?.name || value}
          />
          <SelectInput label="نوع الحركة" value={form.type} onChange={(value) => setForm((current) => ({ ...current, type: value }))} options={["receive", "sale", "adjust", "return", "transfer", "damage"]} labelMap={(value) => stockMovementLabels[value]} />
          <Field label="الكمية" type="number" value={form.quantity} onChange={(value) => setForm((current) => ({ ...current, quantity: value }))} />
          <SelectInput label="المستودع" value={form.warehouse} onChange={(value) => setForm((current) => ({ ...current, warehouse: value }))} options={warehouseOptions} />
          <TextArea label="السبب" value={form.reason || ""} onChange={(value) => setForm((current) => ({ ...current, reason: value }))} className="md:col-span-2" />
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit">
            <Save size={17} />
            تسجيل الحركة
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function FilterStandardEditor({ open, record, categoriesList, customFields, optionSets, onClose, onSave }) {
  const [form, setForm] = useState(record);

  useEffect(() => {
    if (record) setForm(record);
  }, [record]);

  if (!record) return null;

  const linkedOptions = getLinkedKeyOptions(customFields, optionSets);

  return (
    <Modal open={open} title="تحرير معيار التصفية" onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
        className="space-y-5 p-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="اسم المعيار" value={form.name || ""} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
          <SelectInput label="المصدر" value={form.source} onChange={(value) => setForm((current) => ({ ...current, source: value }))} options={["category", "brand", "price", "customField", "optionSet", "stock"]} labelMap={(value) => filterSourceLabels[value]} />
          <SelectInput label="التصنيف" value={form.category} onChange={(value) => setForm((current) => ({ ...current, category: value }))} options={["All", ...categoriesList]} labelMap={(value) => (value === "All" ? "كل التصنيفات" : categoryLabel(value))} />
          <SelectInput label="نوع العرض" value={form.display} onChange={(value) => setForm((current) => ({ ...current, display: value }))} options={["chips", "dropdown", "radio", "swatch", "range"]} labelMap={(value) => optionDisplayLabels[value]} />
          <SelectInput label="الحالة" value={form.status} onChange={(value) => setForm((current) => ({ ...current, status: value }))} options={["active", "paused"]} labelMap={(value) => (value === "active" ? "نشط" : "متوقف")} />
          <SelectInput label="المفتاح المرتبط" value={form.linkedKey} onChange={(value) => setForm((current) => ({ ...current, linkedKey: value }))} options={linkedOptions.map((item) => item.value)} labelMap={(value) => linkedOptions.find((item) => item.value === value)?.label || value} />
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit">
            <Save size={17} />
            حفظ المعيار
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function CustomFieldEditor({ open, field, categoriesList, onClose, onSave }) {
  const [form, setForm] = useState(field);

  useEffect(() => {
    if (field) setForm(field);
  }, [field]);

  if (!field) return null;

  return (
    <Modal open={open} title="تحرير الحقل المخصص" onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
        className="space-y-5 p-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="اسم الحقل" value={form.name || ""} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
          <Field label="المفتاح البرمجي" value={form.key || ""} onChange={(value) => setForm((current) => ({ ...current, key: value }))} required />
          <SelectInput label="نوع الحقل" value={form.type} onChange={(value) => setForm((current) => ({ ...current, type: value }))} options={["text", "textarea", "select", "number", "date", "boolean"]} labelMap={(value) => fieldTypeLabels[value]} />
          <SelectInput label="النطاق" value={form.scope} onChange={(value) => setForm((current) => ({ ...current, scope: value, category: value === "all" ? "All" : current.category }))} options={["all", "category"]} labelMap={(value) => (value === "all" ? "كل المنتجات" : "تصنيف محدد")} />
          <SelectInput label="التصنيف" value={form.category} onChange={(value) => setForm((current) => ({ ...current, category: value }))} options={["All", ...categoriesList]} labelMap={(value) => (value === "All" ? "كل التصنيفات" : categoryLabel(value))} />
          <Field label="خيارات الحقل" value={Array.isArray(form.options) ? form.options.join(", ") : form.options || ""} onChange={(value) => setForm((current) => ({ ...current, options: value }))} helper="لحقول القائمة فقط" />
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
            <input type="checkbox" checked={!!form.required} onChange={(event) => setForm((current) => ({ ...current, required: event.target.checked }))} />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">حقل إجباري</span>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
            <input type="checkbox" checked={!!form.filterable} onChange={(event) => setForm((current) => ({ ...current, filterable: event.target.checked }))} />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">قابل للتصفية</span>
          </label>
          <TextArea label="الوصف" value={form.description || ""} onChange={(value) => setForm((current) => ({ ...current, description: value }))} className="md:col-span-2" />
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit">
            <Save size={17} />
            حفظ الحقل
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function OptionSetEditor({ open, record, categoriesList, onClose, onSave }) {
  const [form, setForm] = useState(record);

  useEffect(() => {
    if (record) setForm(record);
  }, [record]);

  if (!record) return null;

  return (
    <Modal open={open} title="تحرير مكتبة الاختيارات" onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
        className="space-y-5 p-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="اسم المكتبة" value={form.name || ""} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
          <Field label="المفتاح البرمجي" value={form.key || ""} onChange={(value) => setForm((current) => ({ ...current, key: value }))} required />
          <SelectInput label="نوع العرض" value={form.type} onChange={(value) => setForm((current) => ({ ...current, type: value }))} options={["chips", "dropdown", "radio", "swatch"]} labelMap={(value) => optionDisplayLabels[value]} />
          <SelectInput label="التصنيف" value={form.category} onChange={(value) => setForm((current) => ({ ...current, category: value }))} options={["All", ...categoriesList]} labelMap={(value) => (value === "All" ? "كل التصنيفات" : categoryLabel(value))} />
          <Field label="القيم" value={Array.isArray(form.values) ? form.values.join(", ") : form.values || ""} onChange={(value) => setForm((current) => ({ ...current, values: value }))} helper="افصل القيم بفاصلة" className="md:col-span-2" />
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
            <input type="checkbox" checked={!!form.required} onChange={(event) => setForm((current) => ({ ...current, required: event.target.checked }))} />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">اختيار مطلوب</span>
          </label>
          <TextArea label="الوصف" value={form.description || ""} onChange={(value) => setForm((current) => ({ ...current, description: value }))} className="md:col-span-2" />
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit">
            <Save size={17} />
            حفظ المكتبة
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function MetricCard({ label, value, tone = "accent" }) {
  const tones = {
    accent: "bg-indigo-500/10 text-accent",
    success: "bg-emerald-500/10 text-success",
    warning: "bg-amber-500/10 text-warning",
    danger: "bg-red-500/10 text-danger",
    neutral: "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-200",
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-1 font-heading text-2xl font-black text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${tones[tone]}`}>
          <Tags size={20} />
        </div>
      </div>
    </div>
  );
}

function IconAction({ label, onClick, icon: Icon, danger = false }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${
        danger
          ? "border-red-200 text-danger hover:bg-red-500/10 dark:border-red-900/40"
          : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-accent dark:border-slate-800 dark:text-slate-300"
      }`}
    >
      <Icon size={16} />
    </button>
  );
}

function FormSection({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="mb-4">
        <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", helper, className = "", required = false, placeholder = "" }) {
  return (
    <label className={className}>
      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      />
      {helper && <span className="mt-1 block text-xs text-slate-500">{helper}</span>}
    </label>
  );
}

function TextArea({ label, value, onChange, helper, className = "", rows = 4 }) {
  return (
    <label className={className}>
      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      />
      {helper && <span className="mt-1 block text-xs text-slate-500">{helper}</span>}
    </label>
  );
}

function SelectInput({ label, value, onChange, options, labelMap = (item) => item, className = "" }) {
  return (
    <label className={className}>
      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {labelMap(item)}
          </option>
        ))}
      </select>
    </label>
  );
}

function SelectField({ value, onChange, options, labelMap = (item) => item }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
    >
      {options.map((item) => (
        <option key={item} value={item}>
          {labelMap(item)}
        </option>
      ))}
    </select>
  );
}

function DynamicFieldInput({ field, value, onChange }) {
  if (field.type === "textarea") {
    return <TextArea label={field.name} value={value} onChange={onChange} helper={field.description} />;
  }

  if (field.type === "select") {
    return <SelectInput label={field.name} value={value || ""} onChange={onChange} options={field.options || []} />;
  }

  if (field.type === "boolean") {
    return (
      <SelectInput label={field.name} value={value || "لا"} onChange={onChange} options={["نعم", "لا"]} />
    );
  }

  const type = field.type === "number" ? "number" : field.type === "date" ? "date" : "text";
  return <Field label={field.name} value={value} onChange={onChange} type={type} helper={field.description} />;
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function normalizeProduct(product, categoriesList, customFields, optionSets) {
  const fallbackCategory = categoriesList[0] || baseCategories[0];
  const category = categoriesList.includes(product.category) ? product.category : fallbackCategory;
  const fieldsForCategory = customFields.filter((field) => field.scope === "all" || field.category === category);
  const optionSetsForCategory = optionSets.filter((set) => set.category === "All" || set.category === category);
  const slug = (product.slug || product.name || "").toLowerCase().trim().replaceAll(" ", "-");
  const image = product.image || "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80";
  const customFieldValues = Object.fromEntries(fieldsForCategory.map((field) => [field.key, product.customFieldValues?.[field.key] || ""]));
  const optionSelections = Object.fromEntries(optionSetsForCategory.map((set) => [set.key, product.optionSelections?.[set.key] || []]));

  return {
    ...emptyProduct,
    ...product,
    category,
    slug,
    image,
    gallery: Array.isArray(product.gallery) ? product.gallery : [],
    tags: Array.isArray(product.tags) ? product.tags : [],
    specs: Array.isArray(product.specs) ? product.specs : [],
    customFieldValues,
    optionSelections,
    price: Number(product.price) || 0,
    compareAtPrice: Number(product.compareAtPrice) || 0,
    cost: Number(product.cost) || 0,
    stock: Number(product.stock) || 0,
    threshold: Number(product.threshold) || 0,
    visibility: product.status === "published" ? "public" : product.visibility || "hidden",
    seoTitle: product.seoTitle || `${product.name} | سيلا SILA`,
    seoDescription: product.seoDescription || product.shortDescription || product.description,
  };
}

function getSectionFromPath(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  const section = parts[2];
  if (!section) return "catalog";
  if (section === "categories") return "categories";
  if (section === "inventory") return "inventory";
  if (section === "stock-movements") return "stock-movements";
  if (section === "filter-standards") return "filter-standards";
  if (section === "custom-fields") return "custom-fields";
  if (section === "options-library") return "options-library";
  return "catalog";
}

function parseList(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSignedQuantity(type, quantity) {
  const amount = Math.abs(Number(quantity) || 0);
  if (["sale", "damage"].includes(type)) return -amount;
  return amount;
}

function formatDate(value) {
  return new Date(value).toLocaleString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function countLinkedValues(filterItem, items, customFieldMap, optionSetMap) {
  const scopedProducts = items.filter((product) => filterItem.category === "All" || product.category === filterItem.category);

  if (filterItem.source === "category") {
    return new Set(scopedProducts.map((product) => product.category)).size;
  }

  if (filterItem.source === "brand") {
    return new Set(scopedProducts.map((product) => product.brand)).size;
  }

  if (filterItem.source === "price") {
    return 4;
  }

  if (filterItem.source === "stock") {
    return new Set(scopedProducts.map((product) => stockState(product))).size;
  }

  if (filterItem.source === "customField") {
    const field = customFieldMap[filterItem.linkedKey];
    if (!field) return 0;
    return new Set(scopedProducts.map((product) => product.customFieldValues?.[field.key]).filter(Boolean)).size;
  }

  if (filterItem.source === "optionSet") {
    const set = optionSetMap[filterItem.linkedKey];
    if (!set) return 0;
    return new Set(scopedProducts.flatMap((product) => product.optionSelections?.[set.key] || []).filter(Boolean)).size;
  }

  return 0;
}

function getLinkedKeyOptions(customFields, optionSets) {
  return [
    { value: "category", label: "تصنيف المنتج" },
    { value: "brand", label: "العلامة التجارية" },
    { value: "price", label: "السعر" },
    { value: "stock", label: "حالة المخزون" },
    ...customFields.map((field) => ({ value: field.key, label: `حقل: ${field.name}` })),
    ...optionSets.map((set) => ({ value: set.key, label: `مكتبة: ${set.name}` })),
  ];
}
