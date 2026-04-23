import { AlertTriangle, ArrowLeftRight, ClipboardList, PackageCheck, Plus, Save, Warehouse, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ProgressBar from "../components/ProgressBar";
import SearchInput from "../components/SearchInput";
import Table from "../components/Table";
import { useToast } from "../context/ToastContext";
import { products } from "../data/products";
import { money, sortBy, statusTone, stockState } from "../utils/formatters";
import { categoryLabel, statusLabel } from "../utils/labels";
import { zeroProductMetrics } from "../utils/zeroDataMetrics";

const warehouses = ["المخزن الرئيسي", "مخزن الرياض", "مخزن جدة", "مخزن المرتجعات"];
const reasons = ["توريد", "بيع", "تسوية", "مرتجع", "تالف", "تحويل"];

const inventorySeed = products.map(zeroProductMetrics).map((product, index) => ({
  ...product,
  reserved: 0,
  incoming: 0,
  warehouse: warehouses[index % warehouses.length],
  bin: `R${(index % 6) + 1}-S${(index % 8) + 1}`,
  supplier: ["TechBridge", "Nova Supply", "Gulf Devices", "SILA Direct"][index % 4],
  reorderQty: 0,
  lastMovement: `2026-04-${String(20 - (index % 18)).padStart(2, "0")}`,
}));

const movementsSeed = inventorySeed.slice(0, 9).map((product, index) => ({
  id: index + 1,
  productId: product.id,
  product: product.name,
  type: ["توريد", "بيع", "تسوية", "مرتجع", "تحويل"][index % 5],
  quantity: 0,
  warehouse: product.warehouse,
  date: `2026-04-${String(20 - index).padStart(2, "0")}`,
  user: ["مدير المخزون", "فريق الشحن", "مشرف المتجر"][index % 3],
}));

export default function Inventory() {
  const [items, setItems] = useState(inventorySeed);
  const [movements, setMovements] = useState(movementsSeed);
  const [query, setQuery] = useState("");
  const [warehouse, setWarehouse] = useState("الكل");
  const [stockFilter, setStockFilter] = useState("all");
  const [sort, setSort] = useState({ key: "stock", direction: "asc" });
  const [adjusting, setAdjusting] = useState(null);
  const [transfer, setTransfer] = useState(null);
  const [purchaseOrder, setPurchaseOrder] = useState(false);
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    const list = items.filter((item) => {
      const matchesQuery = [item.name, item.sku, item.supplier, item.bin].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesWarehouse = warehouse === "الكل" || item.warehouse === warehouse;
      const state = stockState(item);
      const matchesStock = stockFilter === "all" || state === stockFilter;
      return matchesQuery && matchesWarehouse && matchesStock;
    });
    return sortBy(list, sort);
  }, [items, query, warehouse, stockFilter, sort]);

  const summary = {
    available: items.filter((item) => item.stock > item.threshold).length,
    low: items.filter((item) => item.stock > 0 && item.stock <= item.threshold).length,
    out: items.filter((item) => item.stock === 0).length,
    value: items.reduce((sum, item) => sum + item.stock * item.price, 0),
  };

  const toggleSort = (key) => setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));

  const applyAdjustment = (payload) => {
    const quantity = Number(payload.quantity);
    if (!quantity) {
      showToast("كمية غير صحيحة", "أدخل كمية أكبر أو أقل من صفر.", "error");
      return;
    }
    setItems((current) => current.map((item) => (item.id === payload.product.id ? { ...item, stock: Math.max(0, item.stock + quantity), lastMovement: payload.date } : item)));
    addMovement(payload.product, payload.reason, quantity, payload.product.warehouse);
    setAdjusting(null);
    showToast("تم تعديل المخزون", "تم تسجيل الحركة وتحديث الكمية.", "success");
  };

  const applyTransfer = (payload) => {
    if (payload.from === payload.to) {
      showToast("تحويل غير صحيح", "اختر مستودعين مختلفين.", "error");
      return;
    }
    const quantity = Number(payload.quantity);
    if (!quantity || quantity > payload.product.stock) {
      showToast("كمية غير متاحة", "الكمية المطلوبة للتحويل أكبر من المتاح.", "error");
      return;
    }
    setItems((current) => current.map((item) => (item.id === payload.product.id ? { ...item, stock: item.stock - quantity, warehouse: payload.to, lastMovement: payload.date } : item)));
    addMovement(payload.product, "تحويل", -quantity, `${payload.from} ← ${payload.to}`);
    setTransfer(null);
    showToast("تم تحويل المخزون", "تم تسجيل التحويل بين المستودعات.", "success");
  };

  const createPurchaseOrder = (selectedIds) => {
    const selected = items.filter((item) => selectedIds.includes(item.id));
    if (!selected.length) {
      showToast("لا توجد منتجات", "اختر منتجات منخفضة المخزون لإنشاء أمر توريد.", "error");
      return;
    }
    selected.forEach((item) => addMovement(item, "أمر توريد", item.reorderQty, item.warehouse));
    setItems((current) => current.map((item) => (selectedIds.includes(item.id) ? { ...item, incoming: item.incoming + item.reorderQty } : item)));
    setPurchaseOrder(false);
    showToast("تم إنشاء أمر توريد", "تم إضافة الكميات الواردة للمنتجات المحددة.", "success");
  };

  const addMovement = (product, type, quantity, warehouseName) => {
    setMovements((current) => [{
      id: current.length + 1,
      productId: product.id,
      product: product.name,
      type,
      quantity,
      warehouse: warehouseName,
      date: new Date().toISOString().slice(0, 10),
      user: "مدير سيلا",
    }, ...current]);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard title="متوفر" value={summary.available} icon={PackageCheck} tone="text-success bg-emerald-500/10" />
        <SummaryCard title="مخزون منخفض" value={summary.low} icon={AlertTriangle} tone="text-warning bg-amber-500/10" />
        <SummaryCard title="غير متوفر" value={summary.out} icon={XCircle} tone="text-danger bg-red-500/10" />
        <SummaryCard title="قيمة المخزون" value={money(summary.value)} icon={Warehouse} tone="text-accent bg-indigo-500/10" />
      </div>

      <section className="card p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">نظام إدارة المخزون</h2>
            <p className="mt-1 text-sm text-slate-500">مستودعات، حد إعادة الطلب، كميات محجوزة، وارد، تحويلات، وتسويات مخزون.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setPurchaseOrder(true)}><ClipboardList size={17} />أمر توريد</Button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_auto_auto]">
          <SearchInput value={query} onChange={setQuery} placeholder="ابحث باسم المنتج أو SKU أو المورد أو موقع التخزين" />
          <select value={warehouse} onChange={(event) => setWarehouse(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            {["الكل", ...warehouses].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <option value="all">كل الحالات</option>
            <option value="In stock">متوفر</option>
            <option value="Low stock">مخزون منخفض</option>
            <option value="Out of stock">غير متوفر</option>
          </select>
        </div>
      </section>

      <Table
        columns={[
          { key: "name", label: "المنتج", sortable: true },
          { key: "sku", label: "SKU", sortable: true },
          { key: "warehouse", label: "المستودع", sortable: true },
          { key: "stock", label: "المتاح", sortable: true },
          { key: "reserved", label: "محجوز", sortable: true },
          { key: "incoming", label: "وارد", sortable: true },
          { key: "threshold", label: "حد إعادة الطلب", sortable: true },
          { key: "value", label: "القيمة" },
          { key: "actions", label: "إجراءات" },
        ]}
        rows={filtered}
        sort={sort}
        onSort={toggleSort}
        renderRow={(item) => {
          const state = stockState(item);
          const low = state !== "In stock";
          return (
            <tr key={item.id} className={low ? "bg-amber-50/70 dark:bg-amber-950/10" : "hover:bg-slate-50 dark:hover:bg-slate-900/60"}>
              <td className="px-4 py-4">
                <p className="font-black text-slate-950 dark:text-white">{item.name}</p>
                <p className="text-xs text-slate-500">{categoryLabel(item.category)} · {item.supplier} · {item.bin}</p>
              </td>
              <td className="px-4 py-4 text-slate-500">{item.sku}</td>
              <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.warehouse}</td>
              <td className="px-4 py-4"><Badge tone={statusTone(state)}>{statusLabel(state)}: {item.stock}</Badge></td>
              <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.reserved}</td>
              <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.incoming}</td>
              <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.threshold}</td>
              <td className="px-4 py-4">
                <p className="font-black text-slate-950 dark:text-white">{money(item.stock * item.price)}</p>
                <ProgressBar value={(item.stock / Math.max(1, item.threshold * 4)) * 100} tone={item.stock === 0 ? "bg-danger" : item.stock <= item.threshold ? "bg-warning" : "bg-success"} className="mt-2 w-36" />
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setAdjusting(item)}><Plus size={15} />تسوية</Button>
                  <Button size="sm" variant="secondary" onClick={() => setTransfer(item)}><ArrowLeftRight size={15} />تحويل</Button>
                </div>
              </td>
            </tr>
          );
        }}
      />

      <section className="card p-5">
        <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">سجل حركات المخزون</h2>
        <div className="mt-4 grid gap-3">
          {movements.slice(0, 8).map((movement) => (
            <div key={movement.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 text-sm md:grid-cols-[1fr_120px_120px_140px] md:items-center dark:border-slate-800">
              <div><p className="font-black text-slate-950 dark:text-white">{movement.product}</p><p className="text-xs text-slate-500">{movement.user} · {movement.date}</p></div>
              <Badge tone={movement.quantity > 0 ? "success" : "warning"}>{movement.type}</Badge>
              <p className={`font-black ${movement.quantity > 0 ? "text-success" : "text-danger"}`}>{movement.quantity > 0 ? "+" : ""}{movement.quantity}</p>
              <p className="text-slate-500">{movement.warehouse}</p>
            </div>
          ))}
        </div>
      </section>

      <AdjustmentModal product={adjusting} onClose={() => setAdjusting(null)} onApply={applyAdjustment} />
      <TransferModal product={transfer} onClose={() => setTransfer(null)} onApply={applyTransfer} />
      <PurchaseOrderModal open={purchaseOrder} items={items.filter((item) => item.stock <= item.threshold)} onClose={() => setPurchaseOrder(false)} onCreate={createPurchaseOrder} />
    </div>
  );
}

function AdjustmentModal({ product, onClose, onApply }) {
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("تسوية");
  if (!product) return null;
  return (
    <Modal open={!!product} title="تسوية كمية المخزون" onClose={onClose}>
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <Info label="المنتج" value={product.name} />
        <Info label="المتاح الحالي" value={product.stock} />
        <label><span className="text-sm font-bold text-slate-600 dark:text-slate-300">الكمية (+ أو -)</span><input type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" /></label>
        <label><span className="text-sm font-bold text-slate-600 dark:text-slate-300">سبب الحركة</span><select value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white">{reasons.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-200 p-5 dark:border-slate-800"><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={() => onApply({ product, quantity, reason, date: new Date().toISOString().slice(0, 10) })}><Save size={17} />حفظ التسوية</Button></div>
    </Modal>
  );
}

function TransferModal({ product, onClose, onApply }) {
  const [quantity, setQuantity] = useState(1);
  const [to, setTo] = useState(warehouses[1]);
  if (!product) return null;
  return (
    <Modal open={!!product} title="تحويل مخزون بين المستودعات" onClose={onClose}>
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <Info label="المنتج" value={product.name} />
        <Info label="من مستودع" value={product.warehouse} />
        <label><span className="text-sm font-bold text-slate-600 dark:text-slate-300">الكمية</span><input type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" /></label>
        <label><span className="text-sm font-bold text-slate-600 dark:text-slate-300">إلى مستودع</span><select value={to} onChange={(event) => setTo(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white">{warehouses.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-200 p-5 dark:border-slate-800"><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={() => onApply({ product, quantity, from: product.warehouse, to, date: new Date().toISOString().slice(0, 10) })}><ArrowLeftRight size={17} />تنفيذ التحويل</Button></div>
    </Modal>
  );
}

function PurchaseOrderModal({ open, items, onClose, onCreate }) {
  const [selected, setSelected] = useState([]);
  return (
    <Modal open={open} title="إنشاء أمر توريد" onClose={onClose}>
      <div className="p-5">
        {items.length ? <div className="grid gap-3">{items.map((item) => <label key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div><p className="font-black text-slate-950 dark:text-white">{item.name}</p><p className="text-sm text-slate-500">متاح {item.stock} · حد التنبيه {item.threshold} · كمية مقترحة {item.reorderQty}</p></div><input type="checkbox" checked={selected.includes(item.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} /></label>)}</div> : <EmptyState title="لا توجد منتجات منخفضة" text="كل المنتجات أعلى من حد إعادة الطلب." />}
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-200 p-5 dark:border-slate-800"><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={() => onCreate(selected)}><ClipboardList size={17} />إنشاء أمر التوريد</Button></div>
    </Modal>
  );
}

function SummaryCard({ title, value, icon: Icon, tone }) {
  return <div className="card p-5"><div className="flex items-center gap-3"><div className={`rounded-2xl p-3 ${tone}`}><Icon size={23} /></div><div><p className="text-sm font-bold text-slate-500">{title}</p><p className="font-heading text-2xl font-black text-slate-950 dark:text-white">{value}</p></div></div></div>;
}

function Info({ label, value }) {
  return <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p></div>;
}
