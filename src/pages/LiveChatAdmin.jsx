import {
  Archive,
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  Mail,
  MessageSquareText,
  Mic,
  Paperclip,
  Pin,
  Radio,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Smile,
  Sparkles,
  Tag,
  Ticket,
  UserRoundCheck,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Badge from "../components/Badge";
import Button from "../components/Button";
import MessageBubble from "../components/livechat/MessageBubble";
import ToggleSwitch from "../components/ToggleSwitch";
import { useLiveChat } from "../context/LiveChatContext";

const trendData = [
  { label: "09:00", messages: 18, response: 55 },
  { label: "11:00", messages: 31, response: 42 },
  { label: "13:00", messages: 27, response: 47 },
  { label: "15:00", messages: 44, response: 38 },
  { label: "17:00", messages: 36, response: 41 },
  { label: "19:00", messages: 52, response: 34 },
];

const ratioData = [
  { name: "AI", value: 68, color: "#6366f1" },
  { name: "Human", value: 32, color: "#14b8a6" },
];

const agents = [
  { name: "سارة AI", role: "AI Agent", status: "online", load: 7 },
  { name: "محمد دعم", role: "Human Support", status: "online", load: 3 },
  { name: "ليلى عمليات", role: "Orders Specialist", status: "away", load: 2 },
];

const automationRules = [
  ["Auto reply", "بعد 8 ثوان بدون رد", true],
  ["Keyword routing", "تحويل الدفع والشحن للقسم المختص", true],
  ["Angry user detection", "تصعيد عند كلمات غضب أو شكوى", true],
  ["Inactive auto-close", "إغلاق بعد 48 ساعة بدون نشاط", false],
];

export default function LiveChatAdmin() {
  const {
    activeConversation,
    agentSettings,
    closeSession,
    connection,
    conversations,
    retryMessage,
    selectConversation,
    sendMessage,
    stats,
    toggleConnection,
    updateConversation,
    updateSettings,
  } = useLiveChat();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [handler, setHandler] = useState("all");
  const [priority, setPriority] = useState("all");
  const [reply, setReply] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [notes, setNotes] = useState([]);

  const supportMetrics = useMemo(() => buildSupportMetrics(conversations, stats), [conversations, stats]);
  const customerProfile = useMemo(() => buildCustomerProfile(activeConversation), [activeConversation]);
  const ticket = useMemo(() => buildTicket(activeConversation), [activeConversation]);

  const filtered = useMemo(() => {
    return conversations.filter((conversation) => {
      const searchable = [conversation.customer.name, conversation.customer.email, conversation.id, conversation.assignedTo, conversation.priority]
        .join(" ")
        .toLowerCase();
      const matchesQuery = searchable.includes(query.toLowerCase());
      const matchesStatus = status === "all" || conversation.status === status;
      const matchesHandler = handler === "all" || (handler === "ai" ? conversation.assignedTo?.includes("AI") : !conversation.assignedTo?.includes("AI"));
      const matchesPriority = priority === "all" || conversation.priority === priority;
      return matchesQuery && matchesStatus && matchesHandler && matchesPriority && !conversation.archived;
    });
  }, [conversations, handler, priority, query, status]);

  const submitReply = (event) => {
    event.preventDefault();
    if (!reply.trim() || !activeConversation) return;
    sendMessage({ text: reply, conversationId: activeConversation.id });
    setReply("");
  };

  const addInternalNote = () => {
    if (!internalNote.trim() || !activeConversation) return;
    setNotes((current) => [
      { id: `note-${Date.now()}`, conversationId: activeConversation.id, text: internalNote, author: "Admin", createdAt: Date.now() },
      ...current,
    ]);
    setInternalNote("");
  };

  const conversationNotes = notes.filter((note) => note.conversationId === activeConversation?.id);

  return (
    <div className="space-y-6">
      <SupportHero agentSettings={agentSettings} connection={connection} toggleConnection={toggleConnection} updateSettings={updateSettings} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <SupportStat title="Active Chats" value={supportMetrics.activeChats} icon={MessageSquareText} helper="مباشر الآن" tone="accent" />
        <SupportStat title="Total Messages" value={supportMetrics.messages} icon={Send} helper="اليوم" tone="info" />
        <SupportStat title="Avg Response" value={supportMetrics.avgResponse} icon={Clock3} helper="SLA" tone="warning" />
        <SupportStat title="SLA Compliance" value={`${supportMetrics.sla}%`} icon={ShieldCheck} helper="ملتزم" tone="success" />
        <SupportStat title="AI Resolved" value={`${supportMetrics.aiResolved}%`} icon={Bot} helper="بدون تدخل" tone="accent" />
        <SupportStat title="Escalations" value={supportMetrics.escalations} icon={UserRoundCheck} helper="بشري" tone="neutral" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr_360px]">
        <ChartCard title="Messages Over Time" description="حجم الرسائل خلال اليوم.">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="messagesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="messages" stroke="#6366f1" fill="url(#messagesGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Response Time Trends" description="متوسط الرد بالثواني.">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="response" fill="#14b8a6" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="AI vs Human" description="نسبة المعالجة.">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={ratioData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={4}>
                {ratioData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 flex justify-center gap-3">
            {ratioData.map((item) => (
              <Badge key={item.name} tone={item.name === "AI" ? "accent" : "success"}>{item.name} {item.value}%</Badge>
            ))}
          </div>
        </ChartCard>
      </section>

      <section className="grid items-start gap-4 2xl:grid-cols-[360px_minmax(0,1fr)_340px]">
        <div className="grid gap-4">
          <ConversationsSidebar
            activeConversation={activeConversation}
            conversations={filtered}
            handler={handler}
            priority={priority}
            query={query}
            selectConversation={selectConversation}
            setHandler={setHandler}
            setPriority={setPriority}
            setQuery={setQuery}
            setStatus={setStatus}
            status={status}
            updateConversation={updateConversation}
          />
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-1">
            <AgentManagementCard />
            <SlaSettingsCard />
            <AutomationRulesCard />
          </div>
        </div>

        <div className="grid gap-4">
          <ConversationPanel
            activeConversation={activeConversation}
            agentSettings={agentSettings}
            closeSession={closeSession}
            reply={reply}
            retryMessage={retryMessage}
            setReply={setReply}
            submitReply={submitReply}
            updateConversation={updateConversation}
          />
          <AgentSettingsCard settings={agentSettings} updateSettings={updateSettings} />
          <ConversationOperationsPanel
            activeConversation={activeConversation}
            addInternalNote={addInternalNote}
            customer={customerProfile}
            internalNote={internalNote}
            notes={conversationNotes}
            setInternalNote={setInternalNote}
          />
        </div>

        <CustomerProfilePanel
          activeConversation={activeConversation}
          addInternalNote={addInternalNote}
          customer={customerProfile}
          internalNote={internalNote}
          notes={conversationNotes}
          setInternalNote={setInternalNote}
          ticket={ticket}
          updateConversation={updateConversation}
        />
      </section>

    </div>
  );
}

function SupportHero({ agentSettings, connection, toggleConnection, updateSettings }) {
  return (
    <section className="card overflow-hidden p-0">
      <div className="grid gap-5 border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-accent">Enterprise Support Platform</p>
          <h1 className="mt-2 font-heading text-3xl font-black text-slate-950 dark:text-white">مركز دعم العملاء والتذاكر</h1>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-500">
            نظام دعم متكامل يجمع الشات الحي، الوكيل الذكي، التحويل البشري، التذاكر، SLA، والتحليلات في مساحة تشغيل واحدة.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={connection.online ? "secondary" : "danger"} onClick={toggleConnection}>
            {connection.online ? <Wifi size={17} /> : <WifiOff size={17} />}
            {connection.online ? "متصل" : "غير متصل"}
          </Button>
          <Button onClick={() => updateSettings({ enabled: !agentSettings.enabled })}>
            <Bot size={17} />
            {agentSettings.enabled ? "تعطيل AI" : "تفعيل AI"}
          </Button>
        </div>
      </div>
      <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3 md:grid-cols-3">
          <OperationalPill icon={Radio} label="Realtime" value={connection.realtimeProvider} />
          <OperationalPill icon={Sparkles} label="AI Provider" value={connection.aiProvider} />
          <OperationalPill icon={Headphones} label="Support Mode" value={agentSettings.mode} />
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/60">
          <img src={agentSettings.avatar} alt={agentSettings.name} className="h-14 w-14 rounded-2xl object-cover" />
          <div className="min-w-0">
            <p className="truncate font-heading text-lg font-black text-slate-950 dark:text-white">{agentSettings.name}</p>
            <p className="text-sm font-bold text-slate-500">{agentSettings.role}</p>
          </div>
          <Badge tone={agentSettings.enabled ? "success" : "warning"}>{agentSettings.enabled ? "AI نشط" : "AI متوقف"}</Badge>
        </div>
      </div>
    </section>
  );
}

function OperationalPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <Icon size={18} className="text-accent" />
      <p className="mt-3 text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function SupportStat({ title, value, icon: Icon, helper, tone }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500/10 text-accent">
          <Icon size={21} />
        </span>
        <Badge tone={tone}>{helper}</Badge>
      </div>
      <p className="mt-4 text-sm font-bold text-slate-500">{title}</p>
      <p className="font-heading text-2xl font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <section className="card p-5">
      <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ConversationsSidebar({ activeConversation, conversations, handler, priority, query, selectConversation, setHandler, setPriority, setQuery, setStatus, status, updateConversation }) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-black text-slate-950 dark:text-white">Inbox</h2>
            <p className="mt-0.5 text-[11px] font-bold text-slate-500">{conversations.length} محادثة</p>
          </div>
          <Badge tone="accent" className="px-2 py-0.5">Live</Badge>
        </div>
        <div className="mt-3 grid gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-800">
            <Search size={14} className="text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="بحث باسم العميل أو رقم التذكرة" className="w-full bg-transparent text-sm outline-none dark:text-white" />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <SelectMini value={status} onChange={setStatus} options={[["all", "الحالة"], ["open", "مفتوح"], ["handoff", "بشري"], ["closed", "مغلق"]]} />
            <SelectMini value={handler} onChange={setHandler} options={[["all", "المعالج"], ["ai", "AI"], ["human", "Human"]]} />
            <SelectMini value={priority} onChange={setPriority} options={[["all", "الأولوية"], ["high", "High"], ["medium", "Medium"], ["normal", "Normal"], ["low", "Low"]]} />
          </div>
        </div>
      </div>
      <div className="max-h-[440px] overflow-y-auto p-2.5">
        {conversations.length ? (
          conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              active={activeConversation?.id === conversation.id}
              conversation={conversation}
              onArchive={() => updateConversation(conversation.id, { archived: true })}
              onClick={() => selectConversation(conversation.id)}
              onPin={() => updateConversation(conversation.id, { pinned: !conversation.pinned })}
              onUnread={() => updateConversation(conversation.id, { unread: 1 })}
            />
          ))
        ) : (
          <EmptyPanel title="لا توجد محادثات" text="غيّر الفلاتر أو انتظر محادثات جديدة." />
        )}
      </div>
    </section>
  );
}

function SelectMini({ value, onChange, options }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 rounded-xl border border-slate-200 bg-white px-2 py-2 text-[11px] font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white">
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>{label}</option>
      ))}
    </select>
  );
}

function ConversationListItem({ active, conversation, onArchive, onClick, onPin, onUnread }) {
  const lastMessage = conversation.messages.at(-1);
  return (
    <article className={`mb-2 rounded-2xl border p-2.5 transition ${active ? "border-indigo-400 bg-indigo-50 shadow-sm dark:bg-indigo-950/30" : "border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-950"}`}>
      <button type="button" onClick={onClick} className="w-full text-right">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {conversation.pinned ? <Pin size={14} className="text-accent" /> : null}
              {conversation.unread ? <span className="h-2 w-2 rounded-full bg-red-500" /> : null}
              <p className="truncate font-heading text-sm font-black text-slate-950 dark:text-white">{conversation.customer.name}</p>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-500">{conversation.id}</p>
          </div>
          <Badge tone={conversation.status === "open" ? "success" : conversation.status === "handoff" ? "warning" : "neutral"} className="px-2 py-0.5">{conversation.status}</Badge>
        </div>
        <p className="mt-1.5 line-clamp-1 text-xs leading-5 text-slate-500">{lastMessage?.text}</p>
        <div className="mt-2 flex items-center justify-between gap-3 text-[11px] font-bold text-slate-400">
          <span>{conversation.assignedTo}</span>
          <span>{conversation.priority}</span>
        </div>
      </button>
      <div className="mt-2 flex gap-1.5">
        <IconAction label="Pin" icon={Pin} onClick={onPin} />
        <IconAction label="Unread" icon={Mail} onClick={onUnread} />
        <IconAction label="Archive" icon={Archive} onClick={onArchive} />
      </div>
    </article>
  );
}

function IconAction({ icon: Icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} title={label} className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-accent dark:border-slate-800">
      <Icon size={13} />
    </button>
  );
}

function ConversationPanel({ activeConversation, agentSettings, closeSession, reply, retryMessage, setReply, submitReply, updateConversation }) {
  if (!activeConversation) {
    return <EmptyPanel title="اختر محادثة للبدء" text="ستظهر الرسائل وحالة الوكيل وأدوات التذكرة هنا." compact />;
  }

  return (
    <section className="card flex h-[600px] max-h-[calc(100vh-150px)] min-h-[520px] flex-col overflow-hidden">
      <div className="border-b border-slate-200 p-3 dark:border-slate-800">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-xs font-black text-white dark:bg-white dark:text-slate-950">
              {getInitials(activeConversation.customer.name)}
            </div>
            <div>
              <h2 className="font-heading text-base font-black text-slate-950 dark:text-white">{activeConversation.customer.name}</h2>
              <p className="text-xs font-bold text-slate-500">{activeConversation.customer.email || activeConversation.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={activeConversation.status === "open" ? "success" : activeConversation.status === "handoff" ? "warning" : "neutral"}>{activeConversation.status}</Badge>
            <Button variant="secondary" size="sm" onClick={() => updateConversation(activeConversation.id, { status: "handoff", assignedTo: "Human queue" })}>
              <UserRoundCheck size={16} />
              Manual takeover
            </Button>
            <Button variant="danger" size="sm" onClick={() => closeSession(activeConversation.id)}>إغلاق</Button>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">{activeConversation.status === "handoff" ? "Waiting for human" : activeConversation.assignedTo?.includes("AI") ? "AI handling" : "Human active"}</Badge>
          <Badge tone="info">Assigned: {activeConversation.assignedTo}</Badge>
          <Badge tone="neutral">SLA: 08:42 remaining</Badge>
          <Badge tone={activeConversation.priority === "high" ? "danger" : "neutral"}>Priority: {activeConversation.priority}</Badge>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-slate-50 p-3 dark:bg-slate-900/40">
        <TimeDivider label="اليوم" />
        {activeConversation.messages.map((message) => (
          <MessageBubble key={message.id} message={message} onRetry={() => retryMessage(activeConversation.id, message)} />
        ))}
        {activeConversation.typing ? <TypingRow name={agentSettings.name} /> : null}
      </div>

      <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-2 flex flex-wrap gap-2">
          {agentSettings.cannedQuestions.slice(0, 4).map((item) => (
            <button key={item} type="button" onClick={() => setReply(item)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-black text-slate-600 hover:border-indigo-300 hover:text-accent dark:border-slate-800 dark:text-slate-300">
              {item}
            </button>
          ))}
        </div>
        <form onSubmit={submitReply} className="flex gap-2">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 dark:border-slate-800"><Paperclip size={16} /></button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 dark:border-slate-800"><Smile size={16} /></button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 dark:border-slate-800"><Mic size={16} /></button>
          <input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="اكتب ردك للعميل..." className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
          <Button type="submit"><Send size={16} />إرسال</Button>
        </form>
      </div>
    </section>
  );
}

function TimeDivider({ label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-400 dark:bg-slate-950">{label}</span>
      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

function TypingRow({ name }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-500 shadow-sm dark:bg-slate-950">
      <span>{name} يكتب الآن</span>
      <span className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:120ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:240ms]" />
      </span>
    </div>
  );
}

function CustomerProfilePanel({ activeConversation, addInternalNote, customer, internalNote, notes, setInternalNote, ticket, updateConversation }) {
  if (!activeConversation) return <EmptyPanel title="ملف العميل" text="اختر محادثة لعرض بيانات العميل." />;

  return (
    <aside className="space-y-4">
      <WhatsAppPreviewCard activeConversation={activeConversation} customer={customer} />

      <section className="card p-4">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">{getInitials(customer.name)}</div>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">{customer.name}</h2>
            <p className="break-all text-sm font-bold text-slate-500">{customer.email}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          <ProfileRow label="Phone" value={customer.phone} />
          <ProfileRow label="Country" value={customer.country} />
          <ProfileRow label="Total spent" value={customer.totalSpent} />
          <ProfileRow label="Last activity" value={customer.lastActivity} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {customer.tags.map((tag) => <Badge key={tag} tone="neutral">{tag}</Badge>)}
        </div>
      </section>

      <section className="card p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">Ticket</h2>
          <Badge tone={ticket.priority === "high" ? "danger" : "warning"}>{ticket.priority}</Badge>
        </div>
        <div className="mt-4 grid gap-3">
          <ProfileRow label="Ticket ID" value={ticket.id} />
          <ProfileRow label="Status" value={ticket.status} />
          <ProfileRow label="Assigned" value={ticket.assignedAgent} />
          <ProfileRow label="Related order" value={ticket.relatedOrder} />
          <ProfileRow label="SLA" value={ticket.sla} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => updateConversation(activeConversation.id, { priority: "high" })}><Ticket size={15} />تصعيد</Button>
          <Button size="sm" variant="secondary" onClick={() => updateConversation(activeConversation.id, { status: "closed" })}>حل التذكرة</Button>
        </div>
      </section>

    </aside>
  );
}

function ConversationOperationsPanel({ activeConversation, addInternalNote, customer, internalNote, notes, setInternalNote }) {
  if (!activeConversation) return null;

  return (
    <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="card p-4">
        <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">Internal Notes</h2>
        <textarea value={internalNote} onChange={(event) => setInternalNote(event.target.value)} placeholder="ملاحظة داخلية لا تظهر للعميل..." className="mt-3 min-h-[70px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white" />
        <Button type="button" size="sm" className="mt-3" onClick={addInternalNote}><FileText size={15} />إضافة ملاحظة</Button>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {notes.length ? notes.map((note) => <NoteItem key={note.id} note={note} />) : <p className="text-sm text-slate-500">لا توجد ملاحظات داخلية بعد.</p>}
        </div>
      </section>

      <section className="card p-4">
        <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">Orders History</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {customer.orders.map((order) => <OrderItem key={order.id} order={order} />)}
        </div>
      </section>
    </section>
  );
}

function WhatsAppPreviewCard({ activeConversation, customer }) {
  const messages = activeConversation?.messages?.slice(-3) || [];

  return (
    <section className="card overflow-hidden p-0">
      <div className="bg-[#075e54] p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-sm font-black">{getInitials(customer.name)}</div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-heading font-black">{customer.name}</h2>
            <p className="text-xs font-bold text-white/75">معاينة واتساب</p>
          </div>
          <Badge tone="success">online</Badge>
        </div>
      </div>
      <div className="max-h-[190px] min-h-[170px] space-y-2 overflow-hidden bg-[#efeae2] bg-[radial-gradient(circle_at_10%_20%,rgba(11,92,84,.05)_0_1px,transparent_1px)] bg-[length:20px_20px] p-3">
        <div className="mx-auto w-fit rounded-xl bg-[#fff3cd] px-3 py-2 text-center text-[11px] font-bold text-[#54656f] shadow-sm">
          معاينة شكل الرسائل داخل واتساب
        </div>
        {messages.length ? (
          messages.map((message) => (
            <MessageBubble key={`preview-${message.id}`} message={message} onRetry={() => {}} />
          ))
        ) : (
          <div className="rounded-[18px] rounded-tl-sm bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">ابدأ محادثة لعرض المعاينة هنا.</div>
        )}
      </div>
      <div className="flex items-center gap-2 bg-[#f0f2f5] p-2">
        <span className="h-9 flex-1 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-400">اكتب رسالة</span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25d366] text-white">
          <Send size={16} />
        </span>
      </div>
    </section>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900/60">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="font-black text-slate-950 dark:text-white">{value}</span>
    </div>
  );
}

function NoteItem({ note }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-3 text-sm dark:border-slate-800">
      <p className="font-bold leading-6 text-slate-600 dark:text-slate-300">{note.text}</p>
      <p className="mt-2 text-xs font-black text-slate-400">{note.author} · {new Date(note.createdAt).toLocaleTimeString("ar-SA")}</p>
    </div>
  );
}

function OrderItem({ order }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex items-center justify-between gap-3">
        <p className="font-black text-slate-950 dark:text-white">{order.id}</p>
        <Badge tone={order.status === "delivered" ? "success" : "warning"}>{order.status}</Badge>
      </div>
      <p className="mt-2 text-sm font-bold text-slate-500">{order.total}</p>
    </div>
  );
}

function AgentSettingsCard({ settings, updateSettings }) {
  return (
    <section className="card p-5">
      <div className="flex items-center gap-2">
        <Settings2 size={20} className="text-indigo-500" />
        <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">AI Settings</h2>
      </div>
      <div className="mt-4 grid gap-3">
        <ToggleSwitch checked={settings.enabled} onChange={(enabled) => updateSettings({ enabled })} label="Enable AI Agent" />
        <Field label="Agent name" value={settings.name} onChange={(name) => updateSettings({ name })} />
        <Field label="Tone" value={settings.tone} onChange={(tone) => updateSettings({ tone })} />
        <TextArea label="Custom prompt" value={settings.customPrompt} onChange={(customPrompt) => updateSettings({ customPrompt })} />
        <select value={settings.mode} onChange={(event) => updateSettings({ mode: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white">
          <option value="ai">AI only</option>
          <option value="hybrid">Hybrid AI + Human</option>
          <option value="human">Human handoff</option>
        </select>
      </div>
    </section>
  );
}

function AgentManagementCard() {
  return (
    <section className="card p-4">
      <div className="flex items-center gap-2">
        <Users size={20} className="text-indigo-500" />
        <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">Agent Management</h2>
      </div>
      <div className="mt-3 space-y-2">
        {agents.map((agent) => (
          <div key={agent.name} className="rounded-2xl border border-slate-200 p-2.5 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-slate-950 dark:text-white">{agent.name}</p>
                <p className="text-xs font-bold text-slate-500">{agent.role}</p>
              </div>
              <Badge tone={agent.status === "online" ? "success" : "warning"}>{agent.status}</Badge>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${agent.load * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SlaSettingsCard() {
  return (
    <section className="card p-4">
      <div className="flex items-center gap-2">
        <Clock3 size={20} className="text-indigo-500" />
        <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">SLA Settings</h2>
      </div>
      <div className="mt-3 grid gap-2">
        <ProfileRow label="First response" value="60 sec" />
        <ProfileRow label="Escalation" value="5 min" />
        <ProfileRow label="Resolution" value="4 hours" />
        <ProfileRow label="Auto close" value="48 hours" />
      </div>
    </section>
  );
}

function AutomationRulesCard() {
  return (
    <section className="card p-4">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-indigo-500" />
        <h2 className="font-heading text-lg font-black text-slate-950 dark:text-white">Automation Rules</h2>
      </div>
      <div className="mt-3 space-y-2">
        {automationRules.map(([title, text, enabled]) => (
          <div key={title} className="rounded-2xl border border-slate-200 p-2.5 dark:border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-slate-950 dark:text-white">{title}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{text}</p>
              </div>
              <Badge tone={enabled ? "success" : "neutral"}>{enabled ? "On" : "Off"}</Badge>
            </div>
          </div>
        ))}
      </div>
    </section>
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

function EmptyPanel({ title, text, compact = false, tall = false }) {
  return (
    <section className={`card grid place-items-center p-8 text-center ${compact ? "min-h-[520px]" : tall ? "min-h-[620px]" : "min-h-[220px]"}`}>
      <MessageSquareText size={42} className="text-slate-300" />
      <h2 className="mt-4 font-heading text-2xl font-black text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{text}</p>
    </section>
  );
}

function buildSupportMetrics(conversations, stats) {
  const escalations = conversations.filter((item) => item.status === "handoff").length;
  const closed = conversations.filter((item) => item.status === "closed").length;
  const aiHandled = conversations.filter((item) => item.assignedTo?.includes("AI")).length;
  return {
    activeChats: conversations.filter((item) => item.status !== "closed").length,
    messages: stats.messages,
    avgResponse: stats.avgResponse,
    sla: 94,
    aiResolved: conversations.length ? Math.round((aiHandled / conversations.length) * 100) : 0,
    escalations,
    closed,
  };
}

function buildCustomerProfile(conversation) {
  const name = conversation?.customer?.name || "عميل";
  return {
    name,
    email: conversation?.customer?.email || "customer@example.com",
    phone: "+966 55 800 4400",
    country: name.includes("Sara") ? "United States" : "Saudi Arabia",
    totalSpent: name.includes("Sara") ? "$460" : "1,840 ر.س",
    lastActivity: "منذ 4 دقائق",
    tags: ["vip", "repeat-buyer", conversation?.priority || "normal"],
    orders: [
      { id: "ORD-SILA-1042", status: "processing", total: "349 ر.س" },
      { id: "ORD-SILA-0998", status: "delivered", total: "1,491 ر.س" },
    ],
  };
}

function buildTicket(conversation) {
  return {
    id: conversation ? `TCK-${conversation.id.replace("conv-", "")}` : "TCK-0000",
    priority: conversation?.priority || "normal",
    status: conversation?.status === "closed" ? "resolved" : conversation?.status === "handoff" ? "pending" : "open",
    assignedAgent: conversation?.assignedTo || "AI Agent",
    relatedOrder: "ORD-SILA-1042",
    sla: conversation?.priority === "high" ? "00:18:00" : "02:40:00",
  };
}

function getInitials(name) {
  return String(name || "CU")
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
