import { Mail, MessageSquare, Phone, Plus, Save, Tag, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import SearchInput from "../components/SearchInput";
import Table from "../components/Table";
import { useToast } from "../context/ToastContext";
import { customers as seedCustomers } from "../data/customers";
import { orders } from "../data/orders";
import { fetchCustomers, saveCustomer as saveBackendCustomer } from "../services/storeBackendService";
import { initials, money, sortBy, statusTone } from "../utils/formatters";
import { categoryLabel, tierLabel } from "../utils/labels";
import { zeroCustomerMetrics, zeroOrderMetrics } from "../utils/zeroDataMetrics";

const segments = ["الكل", "كبار العملاء", "عملاء نشطون", "عملاء معرضون للفقد", "جدد"];
const channels = ["البريد", "الهاتف", "واتساب", "رسائل SMS"];

const crmCustomersSeed = seedCustomers.map(zeroCustomerMetrics).map((customer, index) => ({
  ...customer,
  status: index % 8 === 0 ? "at-risk" : index % 5 === 0 ? "new" : "active",
  segment: index % 6 === 0 ? "كبار العملاء" : index % 5 === 0 ? "جدد" : index % 4 === 0 ? "عملاء معرضون للفقد" : "عملاء نشطون",
  tags: [customer.tier, customer.favoriteCategory].filter(Boolean),
  marketingConsent: index % 3 !== 0,
  lastSeen: `2026-04-${String(20 - (index % 16)).padStart(2, "0")}`,
  acquisition: ["إعلانات البحث", "الشبكات الاجتماعية", "إحالة", "البريد", "زيارة مباشرة"][index % 5],
  address: `${100 + index} شارع التجارة، ${customer.city}`,
  notes: index % 4 === 0 ? "يفضل عروض الأجهزة الاحترافية والشحن السريع." : "عميل منتظم، يستجيب للعروض الموسمية.",
}));

const statusMeta = {
  active: { label: "نشط", tone: "success" },
  "at-risk": { label: "معرض للفقد", tone: "warning" },
  new: { label: "جديد", tone: "accent" },
};

const emptyCustomer = {
  name: "",
  email: "",
  phone: "",
  city: "",
  address: "",
  tier: "Bronze",
  segment: "جدد",
  favoriteCategory: "Accessories",
  totalSpent: 0,
  orders: 0,
  status: "new",
  tags: [],
  marketingConsent: true,
  notes: "",
  acquisition: "زيارة مباشرة",
  lastSeen: "2026-04-20",
};

export default function Customers() {
  const [items, setItems] = useState(crmCustomersSeed);
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState("الكل");
  const [sort, setSort] = useState({ key: "totalSpent", direction: "desc" });
  const [selected, setSelected] = useState(crmCustomersSeed[0]);
  const [editing, setEditing] = useState(null);
  const [note, setNote] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetchCustomers()
      .then((rows) => {
        if (!cancelled && rows.length) {
          setItems(rows);
          setSelected(rows[0]);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const list = items.filter((customer) => {
      const haystack = [customer.name, customer.email, customer.phone, customer.city, customer.segment, customer.tags.join(" ")].join(" ").toLowerCase();
      return haystack.includes(query.toLowerCase()) && (segment === "الكل" || customer.segment === segment);
    });
    return sortBy(list, sort);
  }, [items, query, segment, sort]);

  const recent = orders.map(zeroOrderMetrics).filter((order) => order.customerId === selected?.id).slice(0, 5);
  const stats = {
    total: items.length,
    vip: items.filter((customer) => customer.segment === "كبار العملاء").length,
    active: items.filter((customer) => customer.status === "active").length,
    atRisk: items.filter((customer) => customer.status === "at-risk").length,
  };

  const toggleSort = (key) => setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));

  const saveCustomer = async (customer) => {
    if (!customer.name.trim() || !customer.email.trim()) {
      showToast("بيانات ناقصة", "اسم العميل والبريد الإلكتروني مطلوبان.", "error");
      return;
    }

    let persisted = customer;
    try {
      persisted = await saveBackendCustomer(customer);
    } catch {
      persisted = customer;
    }

    setItems((current) => {
      if (customer.id) {
        return current.map((item) => (item.id === customer.id ? persisted : item));
      }
      const nextId = current.reduce((max, item) => Math.max(max, item.id), 0) + 1;
      return [{ ...persisted, id: persisted.id || nextId }, ...current];
    });
    setSelected(persisted.id ? persisted : { ...persisted, id: items.length + 1 });
    setEditing(null);
    showToast("تم حفظ العميل", "تم تحديث ملف العميل داخل نظام CRM.", "success");
  };

  const addNote = () => {
    if (!note.trim()) return;
    const next = `${selected.notes}\n- ${note.trim()}`;
    const updated = { ...selected, notes: next };
    setSelected(updated);
    setItems((current) => current.map((item) => (item.id === selected.id ? updated : item)));
    setNote("");
    showToast("تمت إضافة الملاحظة", "تم تحديث سجل التواصل مع العميل.", "success");
  };

  const sendCampaign = (channel) => {
    showToast("تم إنشاء حملة", `تم تجهيز رسالة ${channel} للعميل ${selected.name}.`, "success");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="كل العملاء" value={stats.total} icon={Users} />
          <Stat label="كبار العملاء" value={stats.vip} icon={Tag} tone="accent" />
          <Stat label="نشطون" value={stats.active} icon={UserPlus} tone="success" />
          <Stat label="معرضون للفقد" value={stats.atRisk} icon={MessageSquare} tone="warning" />
        </div>

        <section className="card p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">إدارة العملاء CRM</h2>
              <p className="mt-1 text-sm text-slate-500">شرائح العملاء، سجل الطلبات، الملاحظات، القنوات التسويقية، وحالة الولاء.</p>
            </div>
            <Button onClick={() => setEditing({ ...emptyCustomer })}><UserPlus size={18} />إضافة عميل</Button>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
            <SearchInput value={query} onChange={setQuery} placeholder="ابحث بالاسم أو البريد أو الهاتف أو الوسوم" />
            <select value={segment} onChange={(event) => setSegment(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              {segments.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </section>

        <Table
          columns={[
            { key: "name", label: "العميل", sortable: true },
            { key: "segment", label: "الشريحة", sortable: true },
            { key: "totalSpent", label: "إجمالي الإنفاق", sortable: true },
            { key: "orders", label: "الطلبات", sortable: true },
            { key: "tier", label: "الولاء", sortable: true },
            { key: "status", label: "الحالة", sortable: true },
            { key: "lastSeen", label: "آخر نشاط", sortable: true },
          ]}
          rows={filtered}
          sort={sort}
          onSort={toggleSort}
          renderRow={(customer) => (
            <tr key={customer.id} onClick={() => setSelected(customer)} className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 ${selected?.id === customer.id ? "bg-indigo-500/5" : ""}`}>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-base text-sm font-black text-white dark:bg-white dark:text-base">{initials(customer.name)}</div>
                  <div>
                    <p className="font-black text-slate-950 dark:text-white">{customer.name}</p>
                    <p className="text-sm text-slate-500">{customer.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{customer.segment}</td>
              <td className="px-4 py-4 font-black text-slate-950 dark:text-white">{money(customer.totalSpent)}</td>
              <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{customer.orders}</td>
              <td className="px-4 py-4"><Badge tone={statusTone(customer.tier)}>{tierLabel(customer.tier)}</Badge></td>
              <td className="px-4 py-4"><Badge tone={statusMeta[customer.status].tone}>{statusMeta[customer.status].label}</Badge></td>
              <td className="px-4 py-4 text-slate-500">{customer.lastSeen}</td>
            </tr>
          )}
          renderMobileCard={(customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => setSelected(customer)}
              className={`w-full rounded-2xl border p-4 text-right transition ${
                selected?.id === customer.id
                  ? "border-accent bg-accent/5"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-base text-sm font-black text-white dark:bg-white dark:text-base">
                  {initials(customer.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black text-slate-950 dark:text-white">{customer.name}</p>
                    <Badge tone={statusMeta[customer.status].tone}>{statusMeta[customer.status].label}</Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">{customer.email}</p>
                  <p className="mt-1 text-xs text-slate-500">{customer.phone}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Info label="الشريحة" value={customer.segment} />
                <Info label="الإنفاق" value={money(customer.totalSpent)} />
                <Info label="الطلبات" value={customer.orders} />
                <Info label="آخر نشاط" value={customer.lastSeen} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={statusTone(customer.tier)}>{tierLabel(customer.tier)}</Badge>
                {customer.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} tone="neutral">{categoryLabel(tag) || tag}</Badge>
                ))}
              </div>
            </button>
          )}
        />
      </div>

      {selected ? (
        <aside className="card h-fit p-5 xl:sticky xl:top-24">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent to-violetAccent font-heading text-lg font-black text-white">{initials(selected.name)}</div>
              <div>
                <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">{selected.name}</h2>
                <p className="text-sm text-slate-500">{selected.email}</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setEditing(selected)}>تعديل</Button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Info label="إجمالي الإنفاق" value={money(selected.totalSpent)} />
            <Info label="الطلبات" value={selected.orders} />
            <Info label="الشريحة" value={selected.segment} />
            <Info label="مصدر الاكتساب" value={selected.acquisition} />
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <Line icon={Phone} label="الهاتف" value={selected.phone} />
            <Line icon={Mail} label="البريد" value={selected.email} />
            <Line icon={Tag} label="التصنيف المفضل" value={categoryLabel(selected.favoriteCategory)} />
          </div>

          <div className="mt-6">
            <h3 className="font-heading font-black text-slate-950 dark:text-white">قنوات التواصل</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {channels.map((channel) => <Button key={channel} variant="secondary" size="sm" onClick={() => sendCampaign(channel)}>{channel}</Button>)}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-heading font-black text-slate-950 dark:text-white">ملاحظات العميل</h3>
            <p className="mt-2 whitespace-pre-line rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600 dark:bg-slate-900 dark:text-slate-300">{selected.notes}</p>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="أضف ملاحظة تواصل جديدة" className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            <Button onClick={addNote} className="mt-3 w-full"><Plus size={17} />إضافة ملاحظة</Button>
          </div>

          <h3 className="mt-6 font-heading font-black text-slate-950 dark:text-white">أحدث الطلبات</h3>
          <div className="mt-3 space-y-2">
            {(recent.length ? recent : orders.map(zeroOrderMetrics).slice(0, 3)).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                <div><p className="font-bold text-slate-950 dark:text-white">{order.id}</p><p className="text-xs text-slate-500">{order.date}</p></div>
                <p className="font-black text-slate-950 dark:text-white">{money(order.total)}</p>
              </div>
            ))}
          </div>
        </aside>
      ) : (
        <EmptyState title="اختر عميلًا" text="اختر عميلًا من الجدول لعرض ملف CRM كامل." />
      )}

      <CustomerEditor open={!!editing} customer={editing} onClose={() => setEditing(null)} onSave={saveCustomer} />
    </div>
  );
}

function CustomerEditor({ open, customer, onClose, onSave }) {
  const [form, setForm] = useState(customer || emptyCustomer);

  useEffect(() => {
    if (customer) setForm(customer);
  }, [customer]);

  if (!customer) return null;
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <Modal open={open} title={form.id ? "تعديل العميل" : "إضافة عميل"} onClose={onClose}>
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <Field label="اسم العميل" value={form.name} onChange={(value) => update("name", value)} />
        <Field label="البريد الإلكتروني" value={form.email} onChange={(value) => update("email", value)} />
        <Field label="الهاتف" value={form.phone} onChange={(value) => update("phone", value)} />
        <Field label="المدينة" value={form.city} onChange={(value) => update("city", value)} />
        <Field label="العنوان" value={form.address} onChange={(value) => update("address", value)} className="md:col-span-2" />
        <Select label="شريحة العميل" value={form.segment} onChange={(value) => update("segment", value)} options={segments.filter((item) => item !== "الكل")} />
        <Select label="مستوى الولاء" value={form.tier} onChange={(value) => update("tier", value)} options={["Platinum", "Gold", "Silver", "Bronze"]} render={tierLabel} />
        <Select label="الحالة" value={form.status} onChange={(value) => update("status", value)} options={["active", "at-risk", "new"]} render={(value) => statusMeta[value].label} />
        <Select label="التصنيف المفضل" value={form.favoriteCategory} onChange={(value) => update("favoriteCategory", value)} options={["Laptops", "Phones", "Headphones", "Cameras", "Tablets", "Accessories"]} render={categoryLabel} />
        <textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} rows={4} className="md:col-span-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-200 p-5 dark:border-slate-800">
        <Button variant="secondary" onClick={onClose}>إلغاء</Button>
        <Button onClick={() => onSave(form)}><Save size={17} />حفظ العميل</Button>
      </div>
    </Modal>
  );
}

function Stat({ label, value, icon: Icon, tone = "accent" }) {
  const tones = {
    accent: "bg-indigo-500/10 text-accent",
    success: "bg-emerald-500/10 text-success",
    warning: "bg-amber-500/10 text-warning",
  };
  return <div className="card p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-slate-500">{label}</p><p className="font-heading text-3xl font-black text-slate-950 dark:text-white">{value}</p></div><div className={`rounded-2xl p-3 ${tones[tone]}`}><Icon size={22} /></div></div></div>;
}

function Info({ label, value }) {
  return <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 font-heading text-lg font-black text-slate-950 dark:text-white">{value}</p></div>;
}

function Line({ icon: Icon, label, value }) {
  return <div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-slate-500"><Icon size={15} />{label}</span><span className="font-bold text-slate-800 dark:text-slate-200">{value}</span></div>;
}

function Field({ label, value, onChange, className = "" }) {
  return <label className={className}><span className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" /></label>;
}

function Select({ label, value, onChange, options, render = (item) => item }) {
  return <label><span className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white">{options.map((item) => <option key={item} value={item}>{render(item)}</option>)}</select></label>;
}
