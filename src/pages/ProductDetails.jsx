import { ArrowLeft, CheckCircle2, Minus, Plus, ShieldCheck, ShoppingCart, Star, TimerReset, Truck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ProgressBar from "../components/ProgressBar";
import { useCart } from "../context/CartContext";
import { products as fallbackProducts } from "../data/products";
import { fetchProducts } from "../services/catalogService";
import { money, statusTone, stockState } from "../utils/formatters";
import { categoryLabel, statusLabel } from "../utils/labels";

export default function ProductDetails() {
  const { productId } = useParams();
  const { addItem } = useCart();
  const [products, setProducts] = useState(fallbackProducts);
  const product = products.find((item) => String(item.id) === productId);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((items) => {
        if (!cancelled) setProducts(items);
      })
      .catch(() => {
        if (!cancelled) setProducts(fallbackProducts);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const related = useMemo(
    () => (product ? products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4) : []),
    [product]
  );
  const gallery = useMemo(() => {
    if (!product) return [];
    return [
      product.image,
      ...(product.id % 2 === 0
        ? [
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
          ]
        : [
            "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
          ]),
    ];
  }, [product]);

  if (!product) {
    return (
      <EmptyState
        title="المنتج غير موجود"
        text="المنتج الذي فتحته لم يعد متاحًا في الكتالوج الحالي."
        action={<Link to="/"><Button>العودة للمتجر</Button></Link>}
      />
    );
  }

  const stockPercent = (product.stock / Math.max(1, product.threshold * 4)) * 100;
  const specifications = [
    ["العلامة", product.name.split(" ")[0]],
    ["التصنيف", categoryLabel(product.category)],
    ["SKU", product.sku],
    ["الضمان", product.category === "Laptops" ? "24 شهر" : "12 شهر"],
    ["التوفر", statusLabel(stockState(product))],
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="inline-flex items-center gap-2 rounded-2xl text-sm font-black text-slate-600 transition hover:text-accent dark:text-slate-300">
          <ArrowLeft size={17} />
          العودة للمتجر
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500">
          <span>الرئيسية</span>
          <span>/</span>
          <span>{categoryLabel(product.category)}</span>
          <span>/</span>
          <span className="font-black text-slate-800 dark:text-slate-200">{product.name}</span>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-premium dark:border-slate-800 dark:bg-slate-950">
            <img src={gallery[selectedImage]} alt={product.name} className="h-[320px] w-full object-cover sm:h-[460px] lg:h-[560px]" />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {gallery.map((image, index) => (
              <button key={image} onClick={() => setSelectedImage(index)} className={`overflow-hidden rounded-2xl border ${selectedImage === index ? "border-accent" : "border-slate-200 dark:border-slate-800"}`}>
                <img src={image} alt={`${product.name}-${index + 1}`} className="h-20 w-full object-cover sm:h-28" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="accent">{categoryLabel(product.category)}</Badge>
              <Badge tone={statusTone(stockState(product))}>{statusLabel(stockState(product))}</Badge>
              <span className="text-sm font-bold text-slate-500">كود المنتج {product.sku}</span>
            </div>
            <h1 className="mt-5 font-heading text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">{product.name}</h1>
            <p className="mt-4 text-base leading-7 text-slate-500 dark:text-slate-400">{product.description}</p>

            <div className="mt-5 flex items-center gap-2 text-amber-400">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={18} fill={index < Math.round(product.rating) ? "currentColor" : "none"} />
              ))}
              <span className="mr-2 text-sm font-black text-slate-600 dark:text-slate-300">تقييم العملاء {product.rating}</span>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className="text-sm font-bold text-slate-500">السعر</p>
                  <div className="mt-1 flex items-end gap-3">
                    <p className="font-heading text-3xl font-black text-slate-950 sm:text-4xl dark:text-white">{money(product.price)}</p>
                    <p className="pb-1 text-sm font-bold text-slate-400 line-through">{money(Math.round(product.price * 1.15))}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button aria-label="تقليل الكمية" variant="secondary" size="icon" onClick={() => setQuantity((current) => Math.max(1, current - 1))}><Minus size={16} /></Button>
                  <span className="w-10 text-center font-black">{quantity}</span>
                  <Button aria-label="زيادة الكمية" variant="secondary" size="icon" onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}><Plus size={16} /></Button>
                </div>
              </div>
              <Button onClick={() => addItem(product, quantity)} disabled={product.stock === 0} className="mt-5 w-full">
                <ShoppingCart size={18} />
                {product.stock === 0 ? "غير متوفر" : `أضف ${quantity} للسلة`}
              </Button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-500">حالة المخزون</span>
                <span className="font-black text-slate-800 dark:text-slate-200">{product.stock} وحدة</span>
              </div>
              <ProgressBar value={stockPercent} tone={product.stock === 0 ? "bg-danger" : product.stock <= product.threshold ? "bg-warning" : "bg-success"} />
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-900">شحن خلال 24-48 ساعة</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-900">إرجاع خلال 14 يومًا</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-900">ضمان رسمي</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <TrustItem icon={Truck} title="شحن سريع" text="توجيه أولوية من المخزن" />
            <TrustItem icon={ShieldCheck} title="طلب آمن" text="مسار دفع محمي" />
            <TrustItem icon={TimerReset} title="استرجاع مرن" text="إجراءات واضحة وسريعة" />
          </div>
        </div>
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
          {[
            ["details", "تفاصيل المنتج"],
            ["specs", "المواصفات"],
            ["shipping", "الشحن والإرجاع"],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`rounded-2xl px-4 py-2 text-sm font-black transition ${activeTab === key ? "bg-accent text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "details" && (
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">لماذا هذا المنتج؟</h2>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{product.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-500">
                <li>تصميم احترافي مناسب للاستخدام اليومي والعمل المكثف.</li>
                <li>جودة تصنيع موثوقة وتغليف آمن للشحن.</li>
                <li>جاهز للشحن من مخزون سيلا الحالي.</li>
              </ul>
            </div>
            <div className="grid gap-3">
              {specifications.map(([label, value]) => <Spec key={label} label={label} value={value} />)}
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {specifications.concat([
              ["الدعم الفني", "دعم عبر البريد والهاتف"],
              ["المنشأ", "توريد معتمد من سيلا"],
              ["التوافق", "مناسب للبيئات المكتبية والاحترافية"],
            ]).map(([label, value]) => <Spec key={label} label={label} value={value} />)}
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <PolicyCard title="الشحن" text="شحن قياسي خلال 2-4 أيام عمل، وشحن سريع خلال 24-48 ساعة حسب المدينة." />
            <PolicyCard title="الإرجاع" text="يمكن تقديم طلب إرجاع خلال 14 يومًا من الاستلام وفق سياسة سيلا." />
            <PolicyCard title="الضمان" text="ضمان رسمي حسب فئة المنتج مع دعم كامل من خدمة العملاء." />
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="font-heading text-2xl font-black text-slate-950 dark:text-white">منتجات مرتبطة</h2>
            <p className="text-sm text-slate-500">خيارات أخرى من {categoryLabel(product.category)}.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((item) => (
              <Link key={item.id} to={`/products/${item.id}`} className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/30">
                <img src={item.image} alt={item.name} className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{categoryLabel(item.category)}</p>
                  <h3 className="mt-1 font-heading text-lg font-black text-slate-950 dark:text-white">{item.name}</h3>
                  <p className="mt-3 font-heading text-lg font-black text-slate-950 dark:text-white">{money(item.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TrustItem({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <Icon size={20} className="text-accent" />
      <p className="mt-3 font-black text-slate-950 dark:text-white">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function PolicyCard({ title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <p className="font-heading font-black text-slate-950 dark:text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}
