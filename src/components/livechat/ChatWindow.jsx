import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ChevronDown,
  ImagePlus,
  Maximize2,
  Minimize2,
  Paperclip,
  Send,
  ShieldCheck,
  UserRoundPlus,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLiveChat } from "../../context/LiveChatContext";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow() {
  const {
    activeConversation,
    agentSettings,
    connection,
    closeSession,
    minimized,
    retryMessage,
    sendMessage,
    setMinimized,
    setWidgetOpen,
    startConversation,
    toggleConnection,
    updateConversation,
  } = useLiveChat();
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef(null);

  useEffect(() => {
    if (!autoScroll || !listRef.current) return;
    listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [activeConversation?.messages, activeConversation?.typing, autoScroll]);

  const submit = (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value && !attachments.length) return;
    sendMessage({ text: value, attachments });
    setText("");
    setAttachments([]);
  };

  const onScroll = () => {
    const node = listRef.current;
    if (!node) return;
    const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
    setAutoScroll(distance < 80);
  };

  const quickReplies = activeConversation?.messages?.at(-1)?.meta?.suggestions || agentSettings.cannedQuestions;

  if (!activeConversation) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={`fixed bottom-24 left-4 z-50 w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 dark:border-slate-800 dark:bg-slate-950 sm:left-6 sm:w-[440px] ${minimized ? "h-[92px]" : "h-[680px] max-h-[calc(100vh-8rem)]"}`}
      dir="rtl"
    >
      <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-l from-indigo-600 to-violet-600 p-4 text-white dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.22),transparent_34%)]" />
        <div className="relative flex items-center gap-3">
          <img src={agentSettings.avatar} alt={agentSettings.name} className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white/60" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-heading text-lg font-black">{agentSettings.name}</h2>
              <Bot size={17} />
            </div>
            <p className="flex items-center gap-1 text-xs font-bold text-white/80">
              {connection.online ? <Wifi size={13} /> : <WifiOff size={13} />}
              {activeConversation.typing ? "يكتب الآن" : connection.online ? "متصل الآن / متاح" : "خارج الاتصال"}
            </p>
          </div>
          <button type="button" onClick={toggleConnection} className="rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20" title="محاكاة الاتصال">
            {connection.online ? <Wifi size={18} /> : <WifiOff size={18} />}
          </button>
          <button type="button" onClick={() => setMinimized(!minimized)} className="rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20">
            {minimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button type="button" onClick={() => setWidgetOpen(false)} className="rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20">
            <X size={18} />
          </button>
        </div>
      </header>

      <AnimatePresence initial={false}>
        {!minimized && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-[calc(100%-81px)] flex-col">
            <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-600">
                  <ShieldCheck size={13} />
                  {agentSettings.mode === "ai" ? "AI only" : agentSettings.mode === "human" ? "Human" : "Hybrid AI + Human"}
                </span>
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-indigo-600">{agentSettings.role}</span>
                <span className="rounded-full bg-slate-200/70 px-2.5 py-1 dark:bg-slate-800">{activeConversation.status}</span>
              </div>
            </div>

            <div ref={listRef} onScroll={onScroll} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4 dark:bg-slate-950">
              {activeConversation.messages.map((message) => (
                <MessageBubble key={message.id} message={message} onRetry={(failed) => retryMessage(activeConversation.id, failed)} />
              ))}
              {activeConversation.typing && <TypingIndicator agentName={agentSettings.name} />}
              {!autoScroll && (
                <button type="button" onClick={() => setAutoScroll(true)} className="sticky bottom-2 mx-auto flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-black text-white shadow-lg">
                  <ChevronDown size={14} />
                  آخر الرسائل
                </button>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              {!!quickReplies?.length && (
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => setText(reply)}
                      className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-300"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {!!attachments.length && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {attachments.map((file) => (
                    <span key={file.id} className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600">{file.name}</span>
                  ))}
                </div>
              )}

              <form onSubmit={submit} className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => setAttachments((items) => [...items, { id: Date.now(), name: "attachment.png", type: "image/mock" }])}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800"
                >
                  <Paperclip size={19} />
                </button>
                <button type="button" className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 sm:grid dark:border-slate-800">
                  <ImagePlus size={19} />
                </button>
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) submit(event);
                  }}
                  placeholder="اكتب رسالتك هنا..."
                  className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                <button type="submit" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-600">
                  <Send size={18} />
                </button>
              </form>
              <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <button type="button" onClick={startConversation} className="hover:text-indigo-600">بدء محادثة جديدة</button>
                <button type="button" onClick={() => updateConversation(activeConversation.id, { status: "handoff", assignedTo: "Human queue" })} className="inline-flex items-center gap-1 hover:text-indigo-600">
                  <UserRoundPlus size={13} />
                  تحويل لموظف
                </button>
                <button type="button" onClick={() => closeSession(activeConversation.id)} className="hover:text-red-500">إنهاء الجلسة</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
