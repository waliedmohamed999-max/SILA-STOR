import { Minus, Package, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { money } from "../utils/formatters";
import Button from "./Button";
import Drawer from "./Drawer";
import EmptyState from "./EmptyState";

export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const { items, subtotal, discount, discountAmount, shippingCost, total, removeItem, updateQuantity, applyDiscount } = useCart();

  const goTo = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <Drawer open={open} onClose={onClose}>
      <div className="flex h-full flex-col border-l border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">السلة</h2>
            <p className="text-sm text-slate-500">{items.length} منتجات مختلفة</p>
          </div>
          <Button aria-label="إغلاق السلة" variant="secondary" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-5">
          {items.length ? (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex gap-3">
                    <img src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-black text-slate-950 dark:text-white">{item.name}</p>
                          <p className="text-sm text-slate-500">{money(item.price)}</p>
                        </div>
                        <button aria-label={`حذف ${item.name}`} onClick={() => removeItem(item.id)} className="rounded-xl p-2 text-slate-400 hover:bg-red-500/10 hover:text-danger">
                          <Trash2 size={17} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button aria-label="تقليل الكمية" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="rounded-lg border border-slate-200 p-1.5 dark:border-slate-800"><Minus size={14} /></button>
                          <span className="w-8 text-center text-sm font-black dark:text-white">{item.quantity}</span>
                          <button aria-label="زيادة الكمية" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="rounded-lg border border-slate-200 p-1.5 dark:border-slate-800"><Plus size={14} /></button>
                        </div>
                        <p className="font-black text-slate-950 dark:text-white">{money(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="السلة فارغة" text="أضف منتجات من الكتالوج لإنشاء طلب دفع." action={<Package size={20} className="text-accent" />} />
          )}
        </div>
        <div className="border-t border-slate-200 p-5 dark:border-slate-800">
          <div className="mb-4 flex gap-2">
            <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="كود الخصم" className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            <Button variant="secondary" onClick={() => applyDiscount(code)}>تطبيق</Button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-500"><span>الإجمالي الفرعي</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between text-slate-500"><span>الخصم {discount.code && `(${discount.code})`}</span><span>-{money(discountAmount)}</span></div>
            <div className="flex justify-between text-slate-500"><span>الشحن</span><span>{shippingCost === 0 ? "مجاني" : money(shippingCost)}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-3 font-heading text-xl font-black text-slate-950 dark:border-slate-800 dark:text-white"><span>الإجمالي</span><span>{money(total)}</span></div>
          </div>
          <div className="mt-5 grid gap-2">
            <Button variant="secondary" onClick={() => goTo("/cart")}><ShoppingBag size={17} />عرض السلة</Button>
            <Button onClick={() => goTo("/checkout")}>إتمام الدفع</Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
