import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useLiveChat } from "../../context/LiveChatContext";
import ChatWindow from "./ChatWindow";

export default function ChatWidget() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  const { widgetOpen, setWidgetOpen, setMinimized, unreadCount, agentSettings, startConversation, activeConversation } = useLiveChat();

  useEffect(() => {
    if (previousPath.current !== pathname) {
      setWidgetOpen(false);
      setMinimized(false);
      previousPath.current = pathname;
    }
  }, [pathname, setMinimized, setWidgetOpen]);

  if (pathname === "/login" || pathname === "/register") return null;

  const open = () => {
    if (!activeConversation) startConversation();
    setWidgetOpen(true);
  };

  return (
    <>
      <AnimatePresence>{widgetOpen && <ChatWindow />}</AnimatePresence>
      {!widgetOpen && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          onClick={open}
          className="fixed bottom-5 left-5 z-50 hidden items-center gap-3 rounded-3xl bg-slate-950 px-4 py-3 text-white shadow-2xl shadow-slate-900/25 dark:bg-white dark:text-slate-950 sm:flex"
          dir="rtl"
        >
          <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-accent text-white shadow-lg shadow-indigo-500/35">
            <MessageCircle size={24} />
            {unreadCount > 0 && (
              <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-danger px-1 text-xs font-black text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </span>
          <span className="hidden text-right sm:block">
            <span className="block text-sm font-black">الدعم المباشر</span>
            <span className="block text-xs text-white/70 dark:text-slate-500">{agentSettings.name} متاح الآن</span>
          </span>
          <span className="absolute inset-0 -z-10 animate-ping rounded-3xl bg-indigo-500/20" />
        </motion.button>
      )}
    </>
  );
}
