import { products } from "../data/products";

const latency = (ms = 650) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const defaultAgentSettings = {
  enabled: true,
  mode: "hybrid",
  name: "سارة AI",
  role: "وكيل دعم المتجر",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  tone: "مهني ومختصر",
  welcomeMessage: "أهلًا بك في دعم سيلا. أقدر أساعدك في الطلبات، المنتجات، الشحن، الدفع، أو تحويلك لموظف بشري.",
  offlineMessage: "نحن خارج ساعات العمل الآن، لكن الوكيل الذكي متاح لتسجيل طلبك وسيتابع الفريق لاحقًا.",
  fallbackMessage: "أحتاج توضيحًا أكثر حتى أساعدك بدقة. هل سؤالك عن طلب، منتج، شحن، دفع، أو تريد التحدث مع موظف؟",
  handoffMode: "keywords",
  customPrompt: "أنت موظف دعم رسمي لمنصة تجارة إلكترونية. أجب باختصار وبأسلوب مهني.",
  keywords: ["طلب", "شحن", "دفع", "استرجاع", "منتج", "order", "shipping", "payment", "refund", "product"],
  departments: ["orders", "products", "shipping", "payments"],
  cannedQuestions: [
    "أريد معرفة حالة طلبي",
    "ما مدة الشحن؟",
    "هل الدفع آمن؟",
    "أريد التحدث مع موظف",
  ],
};

export const mockConversations = [
  {
    id: "conv-1001",
    customer: { name: "محمد علي", email: "mohamed@example.com" },
    channel: "storefront",
    status: "open",
    priority: "high",
    assignedTo: "سارة AI",
    unread: 2,
    createdAt: Date.now() - 1000 * 60 * 32,
    updatedAt: Date.now() - 1000 * 60 * 3,
    messages: [
      createMessage({ sender: "agent", text: defaultAgentSettings.welcomeMessage, createdAt: Date.now() - 1000 * 60 * 32 }),
      createMessage({ sender: "customer", text: "أريد معرفة حالة طلبي", createdAt: Date.now() - 1000 * 60 * 30 }),
      createMessage({ sender: "agent", text: "أكيد. أرسل رقم الطلب وسأراجع لك آخر حالة متاحة.", createdAt: Date.now() - 1000 * 60 * 29 }),
    ],
  },
  {
    id: "conv-1002",
    customer: { name: "Sara Johnson", email: "sara@example.com" },
    channel: "dashboard",
    status: "handoff",
    priority: "medium",
    assignedTo: "Human queue",
    unread: 0,
    createdAt: Date.now() - 1000 * 60 * 120,
    updatedAt: Date.now() - 1000 * 60 * 44,
    messages: [
      createMessage({ sender: "customer", text: "I need help with a refund.", createdAt: Date.now() - 1000 * 60 * 120 }),
      createMessage({ sender: "agent", text: "I can help collect the details. I will also mark this for a human support follow-up.", createdAt: Date.now() - 1000 * 60 * 119 }),
    ],
  },
];

export function createConversation() {
  return {
    id: `conv-${Date.now()}`,
    customer: { name: "زائر المتجر", email: "" },
    channel: "storefront",
    status: "open",
    priority: "normal",
    assignedTo: defaultAgentSettings.name,
    unread: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [
      createMessage({ sender: "agent", text: defaultAgentSettings.welcomeMessage, status: "sent" }),
    ],
  };
}

export function createMessage({ sender, text, status = "sent", attachments = [], createdAt = Date.now(), meta = {} }) {
  return {
    id: `msg-${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
    sender,
    text,
    status,
    attachments,
    createdAt,
    meta,
  };
}

export async function sendMessageApi(message) {
  await latency(450);
  if (message.text.toLowerCase().includes("fail")) {
    throw new Error("تعذر إرسال الرسالة. تحقق من الاتصال وحاول مرة أخرى.");
  }
  return { ...message, status: "sent" };
}

export async function generateAgentReply({ message, conversation, settings, online = true }) {
  await latency(850 + Math.min(message.text.length * 12, 900));
  const intent = detectIntent(message.text);
  const language = isEnglish(message.text) ? "en" : "ar";

  if (!online) {
    return agentReply(settings.offlineMessage, { intent: "offline", suggestions: ["اترك بيانات التواصل", "ابدأ تذكرة دعم"] });
  }

  if (!settings.enabled) {
    return agentReply(
      language === "en" ? "The AI agent is currently disabled. I can queue this for a human teammate." : "الوكيل الذكي غير مفعل حاليًا. أستطيع تحويل المحادثة لموظف بشري.",
      { intent: "disabled", handoff: true, suggestions: ["تحويل لموظف", "ترك رسالة"] },
    );
  }

  if (intent === "handoff") {
    return agentReply(
      language === "en" ? "I will transfer this conversation to a human support teammate. Please keep the order number or email ready." : "سأحوّل المحادثة لموظف دعم بشري. جهّز رقم الطلب أو البريد المرتبط بالحساب.",
      { intent, handoff: true, suggestions: ["إرسال رقم الطلب", "شرح المشكلة"] },
    );
  }

  if (intent === "order") {
    return agentReply(
      language === "en" ? "Sure. Send the order number and I will check the latest status available." : "أكيد. أرسل رقم الطلب وسأوضح لك آخر حالة متاحة وخطوة الشحن التالية.",
      { intent, suggestions: ["رقم الطلب #1001", "تواصل مع موظف"] },
    );
  }

  if (intent === "shipping") {
    return agentReply(
      language === "en" ? "Shipping usually takes 24-72 hours depending on the city. Express delivery is available for selected products." : "الشحن عادة يستغرق من 24 إلى 72 ساعة حسب المدينة، وبعض المنتجات متاح لها تجهيز سريع خلال 24 ساعة.",
      { intent, suggestions: ["تكلفة الشحن", "تتبع الطلب"] },
    );
  }

  if (intent === "payment") {
    return agentReply(
      language === "en" ? "Payments are processed through secure checkout. You can use card payment or supported local methods." : "الدفع يتم عبر صفحة آمنة، ويمكن استخدام البطاقة أو وسائل الدفع المدعومة داخل المتجر.",
      { intent, suggestions: ["طرق الدفع", "مشكلة في الدفع"] },
    );
  }

  if (intent === "product") {
    const topProduct = products[0];
    return agentReply(
      language === "en" ? `A popular option is ${topProduct.name}. I can help compare products or check availability.` : `من الخيارات المتاحة حاليًا ${topProduct.name}. أقدر أساعدك في المقارنة أو معرفة التوفر.`,
      { intent, suggestions: ["أفضل المنتجات", "توفر منتج", "الأسعار"] },
    );
  }

  if (intent === "refund") {
    return agentReply(
      language === "en" ? "Refund and return requests can be reviewed within the policy window. Share the order number and reason." : "طلبات الاسترجاع تُراجع حسب سياسة المتجر. أرسل رقم الطلب وسبب الاسترجاع وسأجهز الخطوة التالية.",
      { intent, suggestions: ["سياسة الاسترجاع", "تحويل لموظف"] },
    );
  }

  const previousFallbacks = conversation.messages.filter((item) => item.meta?.intent === "fallback").length;
  if (previousFallbacks > 0) {
    return agentReply(
      language === "en" ? "I may need a human teammate for this. Would you like me to transfer the conversation?" : "قد يحتاج هذا الطلب لموظف بشري. هل تريد تحويل المحادثة الآن؟",
      { intent: "fallback", handoff: true, suggestions: ["نعم، حولني لموظف", "أعيد صياغة السؤال"] },
    );
  }

  return agentReply(settings.fallbackMessage, { intent: "fallback", suggestions: settings.cannedQuestions });
}

export function getChatStats(conversations) {
  const messages = conversations.flatMap((item) => item.messages);
  return {
    conversations: conversations.length,
    messages: messages.length,
    avgResponse: "42 ثانية",
    open: conversations.filter((item) => item.status === "open").length,
    closed: conversations.filter((item) => item.status === "closed").length,
    handoff: conversations.filter((item) => item.status === "handoff").length,
  };
}

function agentReply(text, meta) {
  return createMessage({ sender: "agent", text, status: "sent", meta });
}

function detectIntent(text) {
  const value = text.toLowerCase();
  if (/(موظف|بشري|human|agent|representative|support)/i.test(value)) return "handoff";
  if (/(طلب|اوردر|order|tracking|تتبع)/i.test(value)) return "order";
  if (/(شحن|توصيل|shipping|delivery)/i.test(value)) return "shipping";
  if (/(دفع|بطاقة|فيزا|payment|pay|card)/i.test(value)) return "payment";
  if (/(منتج|سعر|توفر|product|price|available)/i.test(value)) return "product";
  if (/(استرجاع|استبدال|refund|return)/i.test(value)) return "refund";
  return "fallback";
}

function isEnglish(text) {
  return /[a-zA-Z]/.test(text) && !/[\u0600-\u06FF]/.test(text);
}
