import { customers } from "./customers";
import { products } from "./products";

export const orderStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
export const paymentMethods = ["Visa", "Mastercard", "Apple Pay", "PayPal", "Amex", "Mada", "Cash"];

const cities = ["الرياض", "جدة", "الدمام", "القاهرة", "الإسكندرية", "دبي"];
const districts = ["حي النرجس", "الروضة", "الصفا", "المعادي", "سموحة", "الخليج التجاري"];
const couriers = [
  { name: "SILA Express", service: "توصيل سريع", code: "SILA" },
  { name: "Aramex", service: "شحن اقتصادي", code: "ARX" },
  { name: "SMSA", service: "شحن باب لباب", code: "SMSA" },
  { name: "DHL", service: "شحن دولي", code: "DHL" },
];

export const orders = Array.from({ length: 50 }, (_, index) => {
  const customer = customers[index % customers.length];
  const orderProducts = products.slice(index % 14, (index % 14) + 3);
  const lineItems = orderProducts.map((product, itemIndex) => {
    const quantity = 1 + ((index + itemIndex) % 3);
    const discount = itemIndex === 1 ? Math.round(product.price * 0.06) : 0;
    return {
      id: `${product.id}-${index}`,
      productId: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      image: product.image,
      unitPrice: product.price,
      quantity,
      discount,
      taxRate: 0.15,
      weight: product.category === "Laptops" ? 1.6 : product.category === "Phones" ? 0.22 : 0.65,
    };
  });
  const subtotal = lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemDiscount = lineItems.reduce((sum, item) => sum + item.discount * item.quantity, 0);
  const couponDiscount = index % 6 === 0 ? Math.round(subtotal * 0.07) : 0;
  const shippingFee = index % 5 === 0 ? 0 : 18 + (index % 4) * 7;
  const tax = Math.round((subtotal - itemDiscount - couponDiscount) * 0.15);
  const total = subtotal - itemDiscount - couponDiscount + shippingFee + tax;
  const status = orderStatuses[(index * 2 + 1) % orderStatuses.length];
  const courier = couriers[index % couriers.length];
  const date = new Date(2026, 3, 20 - (index % 28), 10 + (index % 8), 15 + (index % 30));
  const trackingNumber = `${courier.code}-${202604}${String(2000 + index).padStart(4, "0")}`;
  const paid = !["Pending", "Cancelled"].includes(status);

  return {
    id: `ORD-${10420 + index}`,
    invoiceNumber: `INV-${202604}-${String(1000 + index).padStart(4, "0")}`,
    shipmentNumber: `SHP-${202604}-${String(3000 + index).padStart(4, "0")}`,
    customer: customer.name,
    customerId: customer.id,
    date: date.toISOString().slice(0, 10),
    createdAt: date.toISOString(),
    items: lineItems.reduce((sum, item) => sum + item.quantity, 0),
    total,
    subtotal,
    itemDiscount,
    couponDiscount,
    shippingFee,
    tax,
    currency: "SAR",
    payment: paymentMethods[index % paymentMethods.length],
    paymentStatus: paid ? "paid" : status === "Cancelled" ? "void" : "pending",
    transactionId: paid ? `TXN-${date.getTime().toString().slice(-9)}` : "",
    status,
    priority: index % 9 === 0 ? "high" : index % 4 === 0 ? "medium" : "normal",
    source: ["المتجر", "لوحة الإدارة", "حملة تسويقية", "رابط مباشر"][index % 4],
    products: lineItems.map((item) => item.name),
    lineItems,
    customerInfo: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      tier: customer.tier,
    },
    shippingAddress: {
      recipient: customer.name,
      phone: customer.phone,
      country: index % 5 === 0 ? "مصر" : "السعودية",
      city: cities[index % cities.length],
      district: districts[index % districts.length],
      street: `شارع الملك ${20 + index}`,
      building: `${100 + index}`,
      apartment: index % 3 === 0 ? `شقة ${index + 3}` : "",
      postalCode: `${11500 + index}`,
      landmark: index % 2 === 0 ? "بالقرب من مركز الأعمال" : "مدخل جانبي",
    },
    billingAddress: {
      company: index % 4 === 0 ? "SILA Business Buyer" : "",
      taxNumber: index % 4 === 0 ? `3${String(10000000000000 + index)}` : "",
      sameAsShipping: index % 4 !== 0,
    },
    shipping: {
      provider: courier.name,
      service: courier.service,
      trackingNumber,
      trackingUrl: `https://tracking.example.com/${trackingNumber}`,
      warehouse: ["رصيف الشمال", "المركز الرئيسي", "منطقة الأولوية", "بوابة الشحن السريع"][index % 4],
      packageCount: Math.max(1, Math.ceil(lineItems.length / 2)),
      totalWeight: Number(lineItems.reduce((sum, item) => sum + item.weight * item.quantity, 0).toFixed(2)),
      dimensions: "40 x 30 x 18 سم",
      promisedDelivery: new Date(date.getTime() + (2 + (index % 4)) * 86400000).toISOString().slice(0, 10),
    },
    fulfillment: {
      picker: ["أحمد", "سارة", "محمود", "ليلى"][index % 4],
      packer: ["خالد", "منى", "ياسر", "هند"][index % 4],
      packingStatus: ["Pending", "Processing"].includes(status) ? "قيد التجهيز" : "تم التغليف",
      qualityCheck: ["Shipped", "Delivered"].includes(status),
      giftWrap: index % 10 === 0,
      fragile: lineItems.some((item) => item.category === "Cameras"),
    },
    notes: {
      customer: index % 3 === 0 ? "يرجى الاتصال قبل الوصول." : "لا توجد ملاحظات من العميل.",
      internal: index % 5 === 0 ? "تحقق من الرقم الضريبي قبل إصدار الفاتورة." : "طلب طبيعي بدون ملاحظات تشغيلية.",
    },
    timeline: createTimeline(status, date, courier.name, trackingNumber),
  };
});

function createTimeline(status, date, courierName, trackingNumber) {
  const steps = [
    { key: "created", label: "تم إنشاء الطلب", at: date, done: true },
    { key: "paid", label: "تم تأكيد الدفع", at: addHours(date, 1), done: !["Pending", "Cancelled"].includes(status) },
    { key: "processing", label: "بدأ تجهيز الطلب", at: addHours(date, 3), done: ["Processing", "Shipped", "Delivered"].includes(status) },
    { key: "packed", label: "تم التغليف وفحص الجودة", at: addHours(date, 8), done: ["Shipped", "Delivered"].includes(status) },
    { key: "shipped", label: `تم التسليم إلى ${courierName}`, at: addHours(date, 14), done: ["Shipped", "Delivered"].includes(status), meta: trackingNumber },
    { key: "delivered", label: "تم التسليم للعميل", at: addHours(date, 50), done: status === "Delivered" },
  ];

  if (status === "Cancelled") {
    return [
      steps[0],
      { key: "cancelled", label: "تم إلغاء الطلب", at: addHours(date, 2), done: true, meta: "إلغاء من الإدارة" },
    ];
  }

  return steps;
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString();
}
