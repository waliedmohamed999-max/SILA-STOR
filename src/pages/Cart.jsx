import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import { useCart } from "../context/CartContext";
import { money } from "../utils/formatters";
import { categoryLabel } from "../utils/labels";

export default function Cart() {
  const navigate = useNavigate();
  const { items, subtotal, discount, discountAmount, shippingCost, total, removeItem, updateQuantity } = useCart();

  if (!items.length) {
    return (
      <EmptyState
        title="السلة فارغة"
        text="ابدأ بإضافة منتجات إلى السلة ثم عد إلى هذه الصفحة لمراجعة الطلب."
        action={<Link to="/"><Button><ShoppingBag size={17} />العودة للتسوق</Button></Link>}
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-black text-slate-950 dark:text-white">سلة المشتريات</h1>
              <p className="mt-1 text-sm text-slate-500">راجع المنتجات والكميات قبل الانتقال إلى الدفع.</p>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-accent">
              <ArrowLeft size={16} />
              متابعة التسوق
            </Link>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {items.map((item) => (
            <div key={item.id} className="grid gap-4 p-5 md:grid-cols-[120px_1fr_auto_auto] md:items-center">
              <img src={item.image} alt={item.name} className="h-28 w-full rounded-2xl object-cover md:w-28" />
              <div>
                <p className="font-heading text-xl font-black text-slate-950 dark:text-white">{item.name}</p>
                <p className="mt-1 text-sm text-slate-500">{categoryLabel(item.category)} · {money(item.price)}</p>
                <p className="mt-2 text-xs font-bold text-slate-400">SKU {item.sku}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button aria-label="تقليل الكمية" variant="secondary" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={16} /></Button>
                <span className="w-10 text-center font-black">{item.quantity}</span>
                <Button aria-label="زيادة الكمية" variant="secondary" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={16} /></Button>
              </div>
              <div className="flex items-center justify-between gap-3 md:block">
                <p className="font-heading text-xl font-black text-slate-950 dark:text-white">{money(item.price * item.quantity)}</p>
                <Button aria-label={`حذف ${item.name}`} variant="secondary" size="icon" onClick={() => removeItem(item.id)} className="mt-2"><Trash2 size={16} /></Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="card h-fit p-5 xl:sticky xl:top-24">
        <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">ملخص السلة</h2>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between text-slate-500"><span>الإجمالي الفرعي</span><span>{money(subtotal)}</span></div>
          <div className="flex justify-between text-slate-500"><span>الخصم {discount.code && `(${discount.code})`}</span><span>-{money(discountAmount)}</span></div>
          <div className="flex justify-between text-slate-500"><span>الشحن</span><span>{shippingCost === 0 ? "مجاني" : money(shippingCost)}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-3 font-heading text-xl font-black text-slate-950 dark:border-slate-800 dark:text-white"><span>الإجمالي</span><span>{money(total)}</span></div>
        </div>
        <Button onClick={() => navigate("/checkout")} className="mt-5 w-full">المتابعة إلى الدفع</Button>
      </aside>
    </div>
  );
}
