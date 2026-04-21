import {
  Bot,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  UserRoundCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import MessageBubble from "../components/livechat/MessageBubble";
import ToggleSwitch from "../components/ToggleSwitch";
import { useLiveChat } from "../context/LiveChatContext";

export default function LiveChatAdmin() {
  const {
    activeConversation,
    agentSettings,
    closeSession,
    connection,
    conversations,
    selectConversation,
    sendMessage,
    stats,
    toggleConnection,
    updateConversation,
    updateSettings,
  } = useLiveChat();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [reply, setReply] = useState("");

  const filtered = useMemo(() => {
    return conversations.filter((conversation) => {
      const matchesQuery = [conversation.customer.name, conversation.customer.email, conversation.id]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStatus = status === "all" || conversation.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [conversations, query, status]);

  const submitReply = (event) => {
    event.preventDefault();
    if (!reply.trim()) return;
    sendMessage({ text: reply, conversationId: activeConversation.id });
    setReply("");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">Customer Support Center</p>
            <h1 className="font-heading text-2xl font-black text-slate-950 dark:text-white">مركز الدعم والشات الحي</h1>
            <p className="mt-1 text-sm text-slate-500">إدارة المحادثات، إعدادات الوكيل الذكي، وتجهيز التكامل مع WebSocket وAI API.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={connection.online ? "secondary" : "danger"} onClick={toggleConnection}>
              {connection.online ? <Wifi size={17} /> : <WifiOff size={17} />}
              {connection.online ? "متصل" : "غير متصل"}
            </Button>
            <Button onClick={() => updateSettings({ enabled: !agentSettings.enabled })}>
              <Bot size={17} />
              {agentSettings.enabled ? "تعطيل الوكيل" : "تفعيل الوكيل"}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SupportStat title="المحادثات" value={stats.conversations} icon={MessageSquareText} />
        <SupportStat title="الرسائل" value={stats.messages} icon={Send} />
        <SupportStat title="متوسط الرد" value={stats.avgResponse} icon={Clock3} />
        <SupportStat title="مفتوحة" value={stats.open} icon={CheckCircle2} />
        <SupportStat title="تحويل بشري" value={stats.handoff} icon={UserRoundCheck} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)_420px]">
        <section className="card overflow-hidden">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">المحادثات</h2>
            <div className="mt-3 grid gap-2">
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-800">
                <Search size={16} className="text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="بحث باسم العميل أو رقم الجلسة" className="w-full bg-transparent text-sm outline-none dark:text-white" />
              </label>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                <option value="all">كل الحالات</option>
                <option value="open">مفتوحة</option>
                <option value="handoff">تحويل بشري</option>
                <option value="closed">مغلقة</option>
              </select>
            </div>
          </div>
          <div className="max-h-[720px] overflow-y-auto p-3">
            {filtered.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => selectConversation(conversation.id)}
                className={`mb-2 w-full rounded-2xl border p-3 text-right transition ${
                  activeConversation?.id === conversation.id
                    ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30"
                    : "border-slate-200 hover:border-indigo-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-black text-slate-950 dark:text-white">{conversation.customer.name}</p>
                    <p className="text-xs text-slate-500">{conversation.id}</p>
                  </div>
                  <Badge tone={conversation.status === "open" ? "success" : conversation.status === "handoff" ? "warning" : "neutral"}>{conversation.status}</Badge>
                </div>
                <p className="mt-2 line-clamp-1 text-sm text-slate-500">{conversation.messages.at(-1)?.text}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="card flex min-h-[720px] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
            <div>
              <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">{activeConversation?.customer.name}</h2>
              <p className="text-xs text-slate-500">{activeConversation?.customer.email || activeConversation?.id}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => updateConversation(activeConversation.id, { status: "handoff", assignedTo: "Human queue" })}>
                تحويل لبشري
              </Button>
              <Button variant="danger" size="sm" onClick={() => closeSession(activeConversation.id)}>
                إغلاق
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-900/40">
            {activeConversation?.messages.map((message) => (
              <MessageBubble key={message.id} message={message} onRetry={() => {}} />
            ))}
            {activeConversation?.typing && <p className="text-sm font-bold text-slate-400">{agentSettings.name} يكتب الآن...</p>}
          </div>
          <form onSubmit={submitReply} className="flex gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
            <input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="رد داخلي أو رسالة للعميل..." className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
            <Button type="submit"><Send size={16} />إرسال</Button>
          </form>
        </section>

        <section className="space-y-4">
          <AgentSettingsCard settings={agentSettings} updateSettings={updateSettings} />
          <IntegrationCard connection={connection} />
        </section>
      </div>
    </div>
  );
}

function SupportStat({ title, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <Icon size={22} className="text-indigo-500" />
      <p className="mt-4 text-sm font-bold text-slate-500">{title}</p>
      <p className="font-heading text-2xl font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function AgentSettingsCard({ settings, updateSettings }) {
  return (
    <section className="card p-5">
      <div className="flex items-center gap-2">
        <Settings2 size={20} className="text-indigo-500" />
        <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">إعدادات AI Agent</h2>
      </div>
      <div className="mt-4 grid gap-3">
        <ToggleSwitch checked={settings.enabled} onChange={(enabled) => updateSettings({ enabled })} label="تفعيل الوكيل الذكي" />
        <Field label="اسم الوكيل" value={settings.name} onChange={(name) => updateSettings({ name })} />
        <Field label="الدور الوظيفي" value={settings.role} onChange={(role) => updateSettings({ role })} />
        <Field label="صورة الوكيل" value={settings.avatar} onChange={(avatar) => updateSettings({ avatar })} />
        <Field label="نبرة الرد" value={settings.tone} onChange={(tone) => updateSettings({ tone })} />
        <TextArea label="رسالة الترحيب" value={settings.welcomeMessage} onChange={(welcomeMessage) => updateSettings({ welcomeMessage })} />
        <TextArea label="رسالة خارج أوقات العمل" value={settings.offlineMessage} onChange={(offlineMessage) => updateSettings({ offlineMessage })} />
        <TextArea label="Fallback" value={settings.fallbackMessage} onChange={(fallbackMessage) => updateSettings({ fallbackMessage })} />
        <TextArea label="Prompt داخلي" value={settings.customPrompt} onChange={(customPrompt) => updateSettings({ customPrompt })} />
        <Field label="كلمات مفتاحية" value={settings.keywords.join(", ")} onChange={(value) => updateSettings({ keywords: parseList(value) })} />
        <Field label="أسئلة جاهزة" value={settings.cannedQuestions.join(", ")} onChange={(value) => updateSettings({ cannedQuestions: parseList(value) })} />
        <select value={settings.mode} onChange={(event) => updateSettings({ mode: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white">
          <option value="ai">AI only</option>
          <option value="hybrid">Hybrid AI + Human</option>
          <option value="human">Human handoff</option>
        </select>
      </div>
    </section>
  );
}

function IntegrationCard({ connection }) {
  return (
    <section className="card p-5">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={20} className="text-indigo-500" />
        <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">التكاملات الجاهزة</h2>
      </div>
      <div className="mt-4 grid gap-3 text-sm">
        <IntegrationRow label="REST API" value={connection.apiBaseUrl} />
        <IntegrationRow label="Realtime" value={connection.realtimeProvider} />
        <IntegrationRow label="AI Provider" value={connection.aiProvider} />
        <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300">
          <ShieldCheck size={18} />
          <p className="mt-2 font-bold">البنية جاهزة للربط مع Laravel Echo / Pusher / Socket.IO وCRM لاحقًا.</p>
        </div>
      </div>
    </section>
  );
}

function IntegrationRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-300">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-black text-slate-500">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-black text-slate-500">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-[92px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
    </label>
  );
}

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
