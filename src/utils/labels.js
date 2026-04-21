export const categoryLabel = (category) =>
  ({
    All: "الكل",
    Laptops: "لابتوبات",
    Phones: "هواتف",
    Headphones: "سماعات",
    Cameras: "كاميرات",
    Tablets: "تابلت",
    Accessories: "ملحقات",
  })[category] || category;

export const statusLabel = (status) =>
  ({
    All: "الكل",
    Pending: "قيد الانتظار",
    Processing: "قيد التجهيز",
    Shipped: "تم الشحن",
    Delivered: "تم التسليم",
    Cancelled: "ملغي",
    "In stock": "متوفر",
    "Low stock": "مخزون منخفض",
    "Out of stock": "غير متوفر",
  })[status] || status;

export const tierLabel = (tier) =>
  ({
    Platinum: "بلاتيني",
    Gold: "ذهبي",
    Silver: "فضي",
    Bronze: "برونزي",
  })[tier] || tier;

export const paymentLabel = (method) =>
  ({
    Visa: "فيزا",
    Mastercard: "ماستركارد",
    "Apple Pay": "آبل باي",
    PayPal: "باي بال",
    Amex: "أمريكان إكسبريس",
  })[method] || method;

export const trafficLabel = (source) =>
  ({
    Organic: "بحث طبيعي",
    "Paid Search": "إعلانات البحث",
    Social: "الشبكات الاجتماعية",
    Email: "البريد",
    Referral: "إحالات",
  })[source] || source;

export const monthLabel = (month) =>
  ({
    May: "مايو",
    Jun: "يونيو",
    Jul: "يوليو",
    Aug: "أغسطس",
    Sep: "سبتمبر",
    Oct: "أكتوبر",
    Nov: "نوفمبر",
    Dec: "ديسمبر",
    Jan: "يناير",
    Feb: "فبراير",
    Mar: "مارس",
    Apr: "أبريل",
  })[month] || month;

export const dayLabel = (day) =>
  ({
    Mon: "الإثنين",
    Tue: "الثلاثاء",
    Wed: "الأربعاء",
    Thu: "الخميس",
    Fri: "الجمعة",
    Sat: "السبت",
    Sun: "الأحد",
  })[day] || day;
