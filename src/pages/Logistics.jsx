import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Boxes,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  MapPin,
  PackageCheck,
  Plus,
  Printer,
  Radio,
  Route,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, NavLink, Route as RouterRoute, Routes, useNavigate, useParams } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import SearchInput from "../components/SearchInput";
import Table from "../components/Table";
import ToggleSwitch from "../components/ToggleSwitch";
import { useSettings } from "../context/SettingsContext";
import { useToast } from "../context/ToastContext";
import { orders } from "../data/orders";
import { money } from "../utils/formatters";

const logisticsTabs = [
  { path: "/admin/logistics", label: "طرق الشحن", icon: Truck, end: true },
  { path: "/admin/logistics/tracking", label: "تتبع الشحنات", icon: Route },
  { path: "/admin/logistics/operations", label: "سجل العمليات", icon: Activity },
  { path: "/admin/logistics/labels", label: "باقات البوليصات", icon: FileText },
];

const labelPlans = [
  { id: "starter", name: "باقة البداية", labels: 500, used: 318, price: 0, status: "active", renewal: "2026-05-01" },
  { id: "growth", name: "باقة النمو", labels: 2500, used: 740, price: 149, status: "available", renewal: "شهري" },
  { id: "enterprise", name: "باقة الشركات", labels: 10000, used: 0, price: 499, status: "available", renewal: "شهري" },
];

export default function Logistics() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-black text-slate-950 dark:text-white">الشحن والتوصيل</h1>
          <p className="mt-1 text-sm text-slate-500">إدارة طرق الشحن، التتبع، العمليات، وباقات البوليصات من مسارات فعلية داخل النظام.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/logistics/guide">
            <Button variant="secondary">
              <ExternalLink size={17} />
              دليل الربط
            </Button>
          </Link>
          <Link to="/admin/logistics/labels/create">
            <Button>
              <Plus size={17} />
              إنشاء بوليصة
            </Button>
          </Link>
        </div>
      </section>

      <section className="card p-3">
        <nav className="flex flex-wrap gap-2">
          {logisticsTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black transition ${
                    isActive
                      ? "bg-accent text-white shadow-lg shadow-indigo-500/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-950 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={17} />
                {tab.label}
              </NavLink>
            );
          })}
        </nav>
      </section>

      <Routes>
        <RouterRoute index element={<ShippingMethods />} />
        <RouterRoute path="tracking" element={<TrackingShipments />} />
        <RouterRoute path="tracking/:shipmentId" element={<ShipmentDetails />} />
        <RouterRoute path="operations" element={<OperationLog />} />
        <RouterRoute path="labels" element={<LabelPackages />} />
        <RouterRoute path="labels/create" element={<CreateLabel />} />
        <RouterRoute path="providers/new" element={<ProviderConnection />} />
        <RouterRoute path="providers/:providerId" element={<ProviderConnection />} />
        <RouterRoute path="zones" element={<ShippingZones />} />
        <RouterRoute path="guide" element={<IntegrationGuide />} />
        <RouterRoute path="*" element={<Navigate to="/admin/logistics" replace />} />
      </Routes>
    </div>
  );
}

function ShippingMethods() {
  const { settings, replaceSection, saveSection } = useSettings();
  const { showToast } = useToast();
  const shipping = settings.shipping || {};
  const providers = shipping.providers || [];
  const zones = shipping.zones || [];

  const connected = providers.filter((provider) => provider.status === "connected").length;
  const activeServices = providers.flatMap((provider) => provider.services || []).filter((service) => service.enabled).length;

  const updateProvider = (providerId, updater) => {
    replaceSection("shipping", {
      ...shipping,
      providers: providers.map((provider) => (provider.id === providerId ? updater(provider) : provider)),
    });
  };

  const setProviderStatus = (providerId, status) => {
    updateProvider(providerId, (provider) => ({
      ...provider,
      status,
      enabled: status === "connected" ? true : provider.enabled,
    }));
    showToast(status === "connected" ? "تم ربط شركة الشحن" : "تم إرسال اختبار الربط", "تم تحديث حالة الشركة داخل اللوجستيات.", "success");
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="شركات مرتبطة" value={connected} icon={ShieldCheck} tone="success" />
        <Metric label="خدمات مفعلة" value={activeServices} icon={Truck} tone="accent" />
        <Metric label="مناطق الشحن" value={zones.length} icon={MapPin} tone="neutral" />
        <Metric label="حد الشحن المجاني" value={money(Number(shipping.freeShippingThreshold || 0))} icon={PackageCheck} tone="warning" />
      </section>

      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">تفعيل خدمات الشحن</h2>
            <p className="mt-1 text-sm text-slate-500">كل خطوة لها مسار مستقل: ربط شركة، اختبار الاتصال، إعداد المناطق، وإنشاء البوليصات.</p>
          </div>
          <Button onClick={() => saveSection("shipping")}>حفظ إعدادات الشحن</Button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Link to="/admin/logistics/providers/new">
            <SetupCard icon={Truck} title="فعّل شركة شحن" text="اختر مزود الشحن وأدخل بيانات API والحساب والويب هوك." />
          </Link>
          <Link to={`/admin/logistics/providers/${providers[0]?.id || "new"}`}>
            <SetupCard icon={Radio} title="اختبر الاتصال" text="اختبر مفاتيح الربط وحالة البيئة التجريبية قبل التشغيل." />
          </Link>
          <Link to="/admin/logistics/zones">
            <SetupCard icon={Route} title="اربط المناطق" text="حدد المدن والرسوم والخدمة الافتراضية لكل منطقة." />
          </Link>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">شركات الشحن</h2>
            <p className="text-sm text-slate-500">ربط، اختبار، وتفعيل خدمات كل شركة شحن من مسارات إعداد منفصلة.</p>
          </div>
          <Link to="/admin/logistics/providers/new">
            <Button>
              <Plus size={17} />
              ربط شركة جديدة
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {providers.map((provider) => (
            <article key={provider.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">{provider.name}</h3>
                    <p className="text-xs font-bold text-slate-500">{provider.code}</p>
                  </div>
                </div>
                <ProviderBadge status={provider.status} />
              </div>

              <div className="mt-4 grid gap-3">
                {(provider.services || []).map((service) => (
                  <div key={service.key} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-slate-950 dark:text-white">{service.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{service.eta} · {money(Number(service.fee || 0))}</p>
                      </div>
                      <ToggleSwitch
                        checked={service.enabled}
                        onChange={(enabled) =>
                          updateProvider(provider.id, (current) => ({
                            ...current,
                            services: current.services.map((item) => (item.key === service.key ? { ...item, enabled } : item)),
                          }))
                        }
                        label={service.label}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/admin/logistics/providers/${provider.id}`}>
                  <Button variant="secondary">الإعدادات</Button>
                </Link>
                <Button variant="secondary" onClick={() => setProviderStatus(provider.id, "pending")}>اختبار الربط</Button>
                <Button onClick={() => setProviderStatus(provider.id, "connected")}>تفعيل</Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">مناطق الشحن والرسوم</h2>
            <p className="mt-1 text-sm text-slate-500">تحرير المناطق أصبح في مسار حقيقي مستقل لإدارة المدن، الرسوم، والدفع عند الاستلام.</p>
          </div>
          <Link to="/admin/logistics/zones">
            <Button variant="secondary">
              <MapPin size={17} />
              إدارة المناطق
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function ProviderConnection() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { settings, replaceSection, saveSection } = useSettings();
  const { showToast } = useToast();
  const shipping = settings.shipping || {};
  const providers = shipping.providers || [];
  const isNew = providerId === "new";
  const current = providers.find((provider) => provider.id === providerId);
  const [provider, setProvider] = useState(
    current || {
      id: "new-provider",
      name: "",
      code: "",
      status: "disconnected",
      enabled: false,
      sandbox: true,
      apiKey: "",
      accountNumber: "",
      webhookSecret: "",
      trackingUrl: "",
      services: [{ key: "standard", label: "الشحن القياسي", eta: "2-4 أيام عمل", fee: "12", enabled: true }],
    },
  );

  if (!isNew && !current) {
    return (
      <EmptyState
        title="شركة الشحن غير موجودة"
        text="المسار المطلوب لا يطابق أي شركة شحن مسجلة."
        action={
          <Link to="/admin/logistics">
            <Button>العودة للشحن</Button>
          </Link>
        }
      />
    );
  }

  const update = (field, value) => setProvider((prev) => ({ ...prev, [field]: value }));
  const updateService = (index, field, value) => {
    setProvider((prev) => ({
      ...prev,
      services: prev.services.map((service, serviceIndex) => (serviceIndex === index ? { ...service, [field]: value } : service)),
    }));
  };

  const saveProvider = () => {
    const normalized = {
      ...provider,
      id: isNew ? provider.name.trim().toLowerCase().replace(/\s+/g, "-") || "shipping-provider" : provider.id,
      code: provider.code || provider.name.slice(0, 4).toUpperCase(),
    };
    replaceSection("shipping", {
      ...shipping,
      providers: isNew ? [...providers, normalized] : providers.map((item) => (item.id === provider.id ? normalized : item)),
    });
    saveSection("shipping");
    showToast("تم حفظ شركة الشحن", "بيانات الربط والخدمات جاهزة للاستخدام.", "success");
    navigate(`/admin/logistics/providers/${normalized.id}`);
  };

  return (
    <div className="space-y-6">
      <BackLink to="/admin/logistics" label="العودة لطرق الشحن" />
      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-black text-slate-950 dark:text-white">{isNew ? "ربط شركة شحن جديدة" : `إعدادات ${provider.name}`}</h2>
            <p className="mt-1 text-sm text-slate-500">بيانات الحساب، مفاتيح API، رابط التتبع، والخدمات التي تظهر في الدفع.</p>
          </div>
          <ProviderBadge status={provider.status} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="اسم الشركة" value={provider.name} onChange={(value) => update("name", value)} />
          <Field label="كود الشركة" value={provider.code} onChange={(value) => update("code", value)} />
          <SelectField label="حالة الربط" value={provider.status} options={["connected", "pending", "disconnected"]} onChange={(value) => update("status", value)} />
          <Field label="API Key" value={provider.apiKey} onChange={(value) => update("apiKey", value)} />
          <Field label="رقم الحساب" value={provider.accountNumber} onChange={(value) => update("accountNumber", value)} />
          <Field label="Webhook Secret" value={provider.webhookSecret} onChange={(value) => update("webhookSecret", value)} />
          <Field className="xl:col-span-2" label="رابط التتبع" value={provider.trackingUrl} onChange={(value) => update("trackingUrl", value)} />
          <ToggleRow label="وضع تجريبي Sandbox" checked={provider.sandbox} onChange={(value) => update("sandbox", value)} />
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">خدمات الشركة</h2>
            <p className="mt-1 text-sm text-slate-500">كل خدمة لها تكلفة، مدة توصيل، وحالة ظهور داخل صفحة الدفع.</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setProvider((prev) => ({ ...prev, services: [...prev.services, { key: "new_service", label: "خدمة جديدة", eta: "2-3 أيام", fee: "15", enabled: true }] }))}
          >
            <Plus size={17} />
            إضافة خدمة
          </Button>
        </div>
        <div className="mt-5 grid gap-4">
          {provider.services.map((service, index) => (
            <div key={`${service.key}-${index}`} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_.8fr_auto]">
                <Field label="كود الخدمة" value={service.key} onChange={(value) => updateService(index, "key", value)} />
                <Field label="اسم الخدمة" value={service.label} onChange={(value) => updateService(index, "label", value)} />
                <Field label="زمن التوصيل" value={service.eta} onChange={(value) => updateService(index, "eta", value)} />
                <Field label="الرسوم" value={service.fee} onChange={(value) => updateService(index, "fee", value)} />
                <ToggleRow label="مفعلة" checked={service.enabled} onChange={(value) => updateService(index, "enabled", value)} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={saveProvider}>حفظ شركة الشحن</Button>
          <Button variant="secondary" onClick={() => showToast("اختبار الربط ناجح", "تم قبول مفاتيح الربط التجريبية.", "success")}>اختبار الاتصال</Button>
        </div>
      </section>
    </div>
  );
}

function ShippingZones() {
  const { settings, replaceSection, saveSection } = useSettings();
  const { showToast } = useToast();
  const shipping = settings.shipping || {};
  const providers = shipping.providers || [];
  const zones = shipping.zones || [];

  const updateZone = (zoneId, field, value) => {
    replaceSection("shipping", {
      ...shipping,
      zones: zones.map((zone) => (zone.id === zoneId ? { ...zone, [field]: value } : zone)),
    });
  };

  const addZone = () => {
    replaceSection("shipping", {
      ...shipping,
      zones: [
        ...zones,
        { id: `zone-${Date.now()}`, name: "منطقة جديدة", cities: ["الرياض"], providerId: providers[0]?.id || "", serviceKey: providers[0]?.services?.[0]?.key || "standard", fee: "20", cod: true },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <BackLink to="/admin/logistics" label="العودة لطرق الشحن" />
      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-black text-slate-950 dark:text-white">مناطق الشحن والرسوم</h2>
            <p className="mt-1 text-sm text-slate-500">اربط كل منطقة جغرافية بشركة شحن وخدمة ورسوم واضحة تظهر في الدفع.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={addZone}>
              <Plus size={17} />
              إضافة منطقة
            </Button>
            <Button
              onClick={() => {
                saveSection("shipping");
                showToast("تم حفظ مناطق الشحن", "سيتم استخدامها مباشرة في حساب التوصيل.", "success");
              }}
            >
              حفظ المناطق
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {zones.map((zone) => {
            const provider = providers.find((item) => item.id === zone.providerId) || providers[0];
            const serviceOptions = (provider?.services || []).map((service) => service.key);
            return (
              <div key={zone.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="grid gap-4 xl:grid-cols-[1fr_1fr_.9fr_.9fr_.7fr_auto]">
                  <Field label="اسم المنطقة" value={zone.name} onChange={(value) => updateZone(zone.id, "name", value)} />
                  <Field label="المدن" value={zone.cities.join("، ")} onChange={(value) => updateZone(zone.id, "cities", value.split("،").map((item) => item.trim()).filter(Boolean))} />
                  <SelectField label="شركة الشحن" value={zone.providerId} options={providers.map((providerItem) => providerItem.id)} onChange={(value) => updateZone(zone.id, "providerId", value)} />
                  <SelectField label="الخدمة" value={zone.serviceKey} options={serviceOptions.length ? serviceOptions : ["standard"]} onChange={(value) => updateZone(zone.id, "serviceKey", value)} />
                  <Field label="الرسوم" value={zone.fee} onChange={(value) => updateZone(zone.id, "fee", value)} />
                  <ToggleRow label="COD" checked={zone.cod} onChange={(value) => updateZone(zone.id, "cod", value)} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function TrackingShipments() {
  const [query, setQuery] = useState("");
  const shipments = useMemo(
    () =>
      orders.map((order) => ({
        id: order.shipmentNumber,
        orderId: order.id,
        customer: order.customer,
        provider: order.shipping.provider,
        trackingNumber: order.shipping.trackingNumber,
        city: order.shippingAddress.city,
        status: order.status,
        promisedDelivery: order.shipping.promisedDelivery,
        packages: order.shipping.packageCount,
      })),
    [],
  );

  const filtered = shipments.filter((shipment) =>
    [shipment.id, shipment.orderId, shipment.customer, shipment.trackingNumber, shipment.provider, shipment.city].join(" ").toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
          <SearchInput value={query} onChange={setQuery} placeholder="ابحث برقم الشحنة أو الطلب أو التتبع أو العميل" />
          <Button variant="secondary">
            <Search size={17} />
            بحث متقدم
          </Button>
        </div>
      </section>

      <Table
        columns={[
          { key: "id", label: "رقم الشحنة" },
          { key: "order", label: "الطلب" },
          { key: "customer", label: "العميل" },
          { key: "provider", label: "شركة الشحن" },
          { key: "tracking", label: "التتبع" },
          { key: "city", label: "المدينة" },
          { key: "packages", label: "الطرود" },
          { key: "status", label: "الحالة" },
        ]}
        rows={filtered}
        renderRow={(shipment) => (
          <tr key={shipment.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
            <td className="px-4 py-4 font-black text-slate-950 dark:text-white">
              <Link to={`/admin/logistics/tracking/${shipment.id}`} className="transition hover:text-accent">
                {shipment.id}
              </Link>
            </td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{shipment.orderId}</td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{shipment.customer}</td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{shipment.provider}</td>
            <td className="px-4 py-4 font-bold text-accent">{shipment.trackingNumber}</td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{shipment.city}</td>
            <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{shipment.packages}</td>
            <td className="px-4 py-4"><ShipmentBadge status={shipment.status} /></td>
          </tr>
        )}
      />
    </div>
  );
}

function ShipmentDetails() {
  const { shipmentId } = useParams();
  const order = orders.find((item) => item.shipmentNumber === shipmentId);

  if (!order) {
    return (
      <EmptyState
        title="الشحنة غير موجودة"
        text="رقم الشحنة غير مرتبط بأي طلب داخل البيانات الحالية."
        action={
          <Link to="/admin/logistics/tracking">
            <Button>العودة للتتبع</Button>
          </Link>
        }
      />
    );
  }

  const events = order.timeline || [
    { label: "تم إنشاء الطلب", date: order.createdAt, done: true },
    { label: "تم تجهيز الطلب", date: order.fulfillment?.packedAt || order.createdAt, done: true },
    { label: "تم التسليم لشركة الشحن", date: order.shipping?.shippedAt || order.createdAt, done: order.status !== "Pending" },
    { label: "تم التسليم للعميل", date: order.shipping?.deliveredAt || order.shipping?.promisedDelivery, done: order.status === "Delivered" },
  ];

  return (
    <div className="space-y-6">
      <BackLink to="/admin/logistics/tracking" label="العودة لتتبع الشحنات" />
      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-black text-slate-950 dark:text-white">{order.shipmentNumber}</h2>
              <p className="mt-1 text-sm text-slate-500">طلب {order.id} · {order.shipping.provider} · {order.shipping.trackingNumber}</p>
            </div>
            <ShipmentBadge status={order.status} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoBox label="العميل" value={order.customer} />
            <InfoBox label="المدينة" value={order.shippingAddress.city} />
            <InfoBox label="عدد الطرود" value={order.shipping.packageCount} />
            <InfoBox label="تاريخ التسليم المتوقع" value={order.shipping.promisedDelivery} />
          </div>
          <div className="mt-6 space-y-3">
            {events.map((event, index) => (
              <div key={`${event.label}-${index}`} className="flex gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${event.done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-900"}`}>
                  {event.done ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}
                </div>
                <div>
                  <p className="font-black text-slate-950 dark:text-white">{event.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatEventDate(event.at || event.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="card h-fit p-5">
          <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">عنوان التوصيل</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p className="font-black text-slate-950 dark:text-white">{order.shippingAddress.recipient || order.customer}</p>
            <p>{[order.shippingAddress.street, order.shippingAddress.building, order.shippingAddress.apartment].filter(Boolean).join("، ")}</p>
            <p>{order.shippingAddress.district} · {order.shippingAddress.city} · {order.shippingAddress.country}</p>
            <p>{order.shippingAddress.phone}</p>
          </div>
          <div className="mt-5 grid gap-2">
            <Link to="/admin/logistics/labels/create">
              <Button className="w-full">
                <Printer size={17} />
                طباعة بوليصة جديدة
              </Button>
            </Link>
            <Button variant="secondary" className="w-full">تحديث حالة الشحنة</Button>
          </div>
        </aside>
      </section>
    </div>
  );
}

function CreateLabel() {
  const { settings } = useSettings();
  const { showToast } = useToast();
  const [orderId, setOrderId] = useState(orders[0]?.id || "");
  const [weight, setWeight] = useState("1.5");
  const [dimensions, setDimensions] = useState("30x20x12");
  const [packageCount, setPackageCount] = useState("1");
  const selectedOrder = orders.find((order) => order.id === orderId) || orders[0];
  const providers = settings.shipping?.providers || [];
  const [providerId, setProviderId] = useState(providers[0]?.id || "");
  const provider = providers.find((item) => item.id === providerId) || providers[0];
  const labelNumber = `SILA-LBL-${selectedOrder.id.replace(/\D/g, "")}-${packageCount}`;

  return (
    <div className="space-y-6">
      <BackLink to="/admin/logistics/labels" label="العودة لباقات البوليصات" />
      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="card p-5 sm:p-6">
          <h2 className="font-heading text-2xl font-black text-slate-950 dark:text-white">إنشاء بوليصة شحن</h2>
          <p className="mt-1 text-sm text-slate-500">اختر الطلب، شركة الشحن، وبيانات الطرد ثم أنشئ بوليصة جاهزة للطباعة.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <SelectField label="الطلب" value={orderId} options={orders.slice(0, 20).map((order) => order.id)} onChange={setOrderId} />
            <SelectField label="شركة الشحن" value={providerId} options={providers.map((item) => item.id)} onChange={setProviderId} />
            <Field label="الوزن بالكيلو" value={weight} onChange={setWeight} />
            <Field label="الأبعاد" value={dimensions} onChange={setDimensions} />
            <Field label="عدد الطرود" value={packageCount} onChange={setPackageCount} />
          </div>
          <div className="mt-6">
            <Button onClick={() => showToast("تم إنشاء البوليصة", `رقم البوليصة ${labelNumber} جاهز للطباعة.`, "success")}>
              <Printer size={17} />
              إنشاء وطباعة
            </Button>
          </div>
        </div>
        <aside className="card p-5">
          <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">معاينة البوليصة</h3>
          <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-300 p-5 dark:border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500">SILA SHIPPING LABEL</p>
                <p className="mt-1 font-heading text-xl font-black text-slate-950 dark:text-white">{labelNumber}</p>
              </div>
              <Truck className="text-accent" size={28} />
            </div>
            <Barcode value={labelNumber} />
            <div className="mt-5 grid gap-3 text-sm">
              <InfoBox label="العميل" value={selectedOrder.customer} />
              <InfoBox label="المدينة" value={selectedOrder.shippingAddress.city} />
              <InfoBox label="الشركة" value={provider?.name || "-"} />
              <InfoBox label="الوزن والأبعاد" value={`${weight} كجم · ${dimensions}`} />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function OperationLog() {
  const rows = useMemo(
    () =>
      orders.slice(0, 24).map((order, index) => ({
        id: `LOG-${index + 1000}`,
        time: new Date(order.createdAt).toLocaleString("ar-SA"),
        orderId: order.id,
        actor: order.fulfillment.picker,
        action: ["إنشاء بوليصة", "تحديث تتبع", "تسليم لشركة الشحن", "فحص جودة", "إعادة جدولة"][index % 5],
        provider: order.shipping.provider,
        result: index % 7 === 0 ? "تحذير" : "نجاح",
      })),
    [],
  );

  return (
    <Table
      columns={[
        { key: "id", label: "رقم العملية" },
        { key: "time", label: "الوقت" },
        { key: "order", label: "الطلب" },
        { key: "actor", label: "المستخدم" },
        { key: "action", label: "الإجراء" },
        { key: "provider", label: "شركة الشحن" },
        { key: "result", label: "النتيجة" },
      ]}
      rows={rows}
      renderRow={(row) => (
        <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
          <td className="px-4 py-4 font-black text-slate-950 dark:text-white">{row.id}</td>
          <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{row.time}</td>
          <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{row.orderId}</td>
          <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{row.actor}</td>
          <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{row.action}</td>
          <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{row.provider}</td>
          <td className="px-4 py-4"><Badge tone={row.result === "نجاح" ? "success" : "warning"}>{row.result}</Badge></td>
        </tr>
      )}
    />
  );
}

function LabelPackages() {
  const activePlan = labelPlans.find((plan) => plan.status === "active");

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="الباقة الحالية" value={activePlan?.name || "-"} icon={FileText} tone="accent" />
        <Metric label="المتبقي" value={(activePlan.labels - activePlan.used).toLocaleString("en-US")} icon={Printer} tone="success" />
        <Metric label="المستخدم" value={activePlan.used.toLocaleString("en-US")} icon={Boxes} tone="warning" />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {labelPlans.map((plan) => {
          const percent = Math.round((plan.used / plan.labels) * 100);
          return (
            <article key={plan.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-xl font-black text-slate-950 dark:text-white">{plan.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{plan.labels.toLocaleString("en-US")} بوليصة</p>
                </div>
                <Badge tone={plan.status === "active" ? "success" : "neutral"}>{plan.status === "active" ? "نشطة" : "متاحة"}</Badge>
              </div>
              <div className="mt-5">
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, percent)}%` }} />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-500">استخدمت {percent}% من الباقة</p>
              </div>
              <div className="mt-5 flex items-end justify-between gap-3">
                <div>
                  <p className="font-heading text-2xl font-black text-slate-950 dark:text-white">{plan.price ? money(plan.price) : "مجانية"}</p>
                  <p className="text-xs text-slate-500">تجديد: {plan.renewal}</p>
                </div>
                {plan.status === "active" ? (
                  <Link to="/admin/logistics/labels/create">
                    <Button variant="secondary">إنشاء بوليصة</Button>
                  </Link>
                ) : (
                  <Button>اشترك</Button>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function IntegrationGuide() {
  const steps = [
    ["1", "أنشئ حساب شركة الشحن", "احصل على رقم الحساب ومفاتيح API من بوابة الشركة."],
    ["2", "أدخل بيانات الربط", "استخدم مسار ربط شركة جديدة واحفظ المفاتيح في النظام."],
    ["3", "اختبر الاتصال", "تأكد من إنشاء بوليصة تجريبية واستقبال Webhook التتبع."],
    ["4", "اربط المناطق", "حدد المدن والخدمات والرسوم التي تظهر في صفحة الدفع."],
  ];

  return (
    <div className="space-y-6">
      <BackLink to="/admin/logistics" label="العودة للشحن" />
      <section className="card p-5 sm:p-6">
        <h2 className="font-heading text-2xl font-black text-slate-950 dark:text-white">دليل ربط شركات الشحن</h2>
        <p className="mt-1 text-sm text-slate-500">مسار تشغيلي واضح لربط أي مزود شحن داخل SILA بدون تغيير بنية النظام.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(([number, title, text]) => (
            <div key={number} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white">{number}</div>
              <h3 className="mt-4 font-heading text-lg font-black text-slate-950 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <CodeCard title="Webhook التتبع" code="POST https://admin.sila.store/webhooks/shipping/status" />
        <CodeCard title="قالب رابط التتبع" code="https://track.sila.store/{tracking_number}" />
      </section>
    </div>
  );
}

function SetupCard({ icon: Icon, title, text }) {
  return (
    <div className="h-full rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-800 dark:hover:border-indigo-500/40 dark:hover:shadow-black/20">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-accent">
        <Icon size={18} />
      </div>
      <h3 className="mt-4 font-heading text-lg font-black text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function Metric({ label, value, icon: Icon, tone = "accent" }) {
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
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-1 font-heading text-2xl font-black text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <input
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      />
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      <ToggleSwitch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function ProviderBadge({ status }) {
  const tone = status === "connected" ? "success" : status === "pending" ? "warning" : "neutral";
  const label = status === "connected" ? "مرتبط" : status === "pending" ? "قيد التهيئة" : "غير مرتبط";
  return <Badge tone={tone}>{label}</Badge>;
}

function ShipmentBadge({ status }) {
  const tone = status === "Delivered" ? "success" : status === "Shipped" ? "info" : status === "Cancelled" ? "danger" : "warning";
  const label = status === "Delivered" ? "تم التسليم" : status === "Shipped" ? "في الطريق" : status === "Cancelled" ? "ملغي" : "قيد التجهيز";
  return <Badge tone={tone}>{label}</Badge>;
}

function BackLink({ to, label }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-accent">
      <ArrowLeft size={16} />
      {label}
    </Link>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-2 break-words font-black text-slate-950 dark:text-white">{value || "-"}</p>
    </div>
  );
}

function Barcode({ value }) {
  const bars = value.split("").map((char, index) => ((char.charCodeAt(0) + index) % 4) + 1);
  return (
    <div className="mt-5 rounded-xl bg-white p-3">
      <div className="flex h-16 items-end gap-1">
        {bars.map((width, index) => (
          <span key={`${value}-${index}`} className="block bg-slate-950" style={{ width: `${width * 2}px`, height: `${28 + (index % 5) * 7}px` }} />
        ))}
      </div>
      <p className="mt-2 text-center font-mono text-xs font-bold text-slate-700">{value}</p>
    </div>
  );
}

function CodeCard({ title, code }) {
  return (
    <div className="card p-5">
      <h3 className="font-heading text-lg font-black text-slate-950 dark:text-white">{title}</h3>
      <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-left text-sm font-bold text-emerald-300" dir="ltr">{code}</pre>
    </div>
  );
}

function formatEventDate(value) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("ar-SA");
}
