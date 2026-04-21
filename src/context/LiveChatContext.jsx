import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createConversation,
  createMessage,
  defaultAgentSettings,
  generateAgentReply,
  getChatStats,
  mockConversations,
  sendMessageApi,
} from "../services/liveChatService";
import { useToast } from "./ToastContext";

const LiveChatContext = createContext(null);
const storageKey = "sila-live-chat-state";

export function LiveChatProvider({ children }) {
  const { showToast } = useToast();
  const [state, setState] = useState(() => readState());
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const activeConversation = useMemo(
    () => state.conversations.find((item) => item.id === state.activeConversationId) || state.conversations[0],
    [state.activeConversationId, state.conversations],
  );

  const unreadCount = useMemo(
    () => state.conversations.reduce((total, item) => total + (item.unread || 0), 0),
    [state.conversations],
  );

  const updateSettings = useCallback((updates) => {
    setState((current) => ({ ...current, agentSettings: { ...current.agentSettings, ...updates } }));
  }, []);

  const updateConversation = useCallback((conversationId, updates) => {
    setState((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, ...updates, updatedAt: Date.now() } : conversation,
      ),
    }));
  }, []);

  const selectConversation = useCallback((conversationId) => {
    setState((current) => ({
      ...current,
      activeConversationId: conversationId,
      conversations: current.conversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation,
      ),
    }));
  }, []);

  const startConversation = useCallback(() => {
    const conversation = createConversation();
    setState((current) => ({
      ...current,
      activeConversationId: conversation.id,
      conversations: [conversation, ...current.conversations],
    }));
    setWidgetOpen(true);
    return conversation.id;
  }, []);

  const appendMessage = useCallback((conversationId, message) => {
    setState((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, message],
              unread: message.sender === "agent" && !widgetOpen ? (conversation.unread || 0) + 1 : conversation.unread,
              updatedAt: Date.now(),
            }
          : conversation,
      ),
    }));
  }, [widgetOpen]);

  const replaceMessage = useCallback((conversationId, messageId, nextMessage) => {
    setState((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: conversation.messages.map((message) => (message.id === messageId ? nextMessage : message)),
              updatedAt: Date.now(),
            }
          : conversation,
      ),
    }));
  }, []);

  const setTyping = useCallback((conversationId, typing) => {
    updateConversation(conversationId, { typing });
  }, [updateConversation]);

  const sendMessage = useCallback(async ({ text, attachments = [], conversationId = activeConversation?.id }) => {
    if (!text.trim() && !attachments.length) return;
    const targetId = conversationId || startConversation();
    const optimistic = createMessage({ sender: "customer", text, attachments, status: "sending" });
    appendMessage(targetId, optimistic);

    try {
      const sent = await sendMessageApi(optimistic);
      replaceMessage(targetId, optimistic.id, sent);
      setTyping(targetId, true);

      const latestConversation = state.conversations.find((item) => item.id === targetId) || activeConversation || createConversation();
      const reply = await generateAgentReply({
        message: sent,
        conversation: { ...latestConversation, messages: [...latestConversation.messages, sent] },
        settings: state.agentSettings,
        online: state.connection.online,
      });
      setTyping(targetId, false);
      appendMessage(targetId, reply);
      if (reply.meta?.handoff) updateConversation(targetId, { status: "handoff", assignedTo: "Human queue" });
    } catch (error) {
      replaceMessage(targetId, optimistic.id, { ...optimistic, status: "failed", error: error.message });
      setTyping(targetId, false);
      showToast("تعذر إرسال الرسالة", error.message, "error");
    }
  }, [activeConversation, appendMessage, replaceMessage, setTyping, showToast, startConversation, state.agentSettings, state.connection.online, state.conversations, updateConversation]);

  const retryMessage = useCallback((conversationId, message) => {
    replaceMessage(conversationId, message.id, { ...message, status: "sending" });
    sendMessage({ text: message.text, attachments: message.attachments, conversationId });
  }, [replaceMessage, sendMessage]);

  const closeSession = useCallback((conversationId) => {
    updateConversation(conversationId, { status: "closed", typing: false });
    appendMessage(conversationId, createMessage({ sender: "system", text: "تم إنهاء الجلسة. يمكنك بدء محادثة جديدة في أي وقت." }));
  }, [appendMessage, updateConversation]);

  const toggleConnection = useCallback(() => {
    setState((current) => ({ ...current, connection: { ...current.connection, online: !current.connection.online } }));
  }, []);

  const value = useMemo(() => ({
    conversations: state.conversations,
    activeConversation,
    activeConversationId: state.activeConversationId,
    agentSettings: state.agentSettings,
    connection: state.connection,
    stats: getChatStats(state.conversations),
    widgetOpen,
    minimized,
    unreadCount,
    setWidgetOpen,
    setMinimized,
    selectConversation,
    startConversation,
    sendMessage,
    retryMessage,
    closeSession,
    updateSettings,
    updateConversation,
    toggleConnection,
  }), [activeConversation, closeSession, minimized, retryMessage, selectConversation, sendMessage, startConversation, state, toggleConnection, unreadCount, updateConversation, updateSettings, widgetOpen]);

  return <LiveChatContext.Provider value={value}>{children}</LiveChatContext.Provider>;
}

export function useLiveChat() {
  const context = useContext(LiveChatContext);
  if (!context) throw new Error("useLiveChat must be used within LiveChatProvider");
  return context;
}

function readState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore corrupt local storage and restore defaults.
  }
  const starter = mockConversations.length ? mockConversations : [createConversation()];
  return {
    conversations: starter,
    activeConversationId: starter[0]?.id,
    agentSettings: defaultAgentSettings,
    connection: {
      online: true,
      realtimeProvider: "websocket-placeholder",
      apiBaseUrl: "/api/support/live-chat",
      aiProvider: "ai-provider-placeholder",
    },
  };
}
