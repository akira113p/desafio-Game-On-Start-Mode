  "use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import MascotAvatar from "./MascotAvatar";
import { useLocale } from "./LocaleContext";
import type { ChatMessage } from "@/data/mockData";

interface CalendarEvent {
  title: string;
  time: string;
  allDay: boolean;
  date: string;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const { t } = useLocale();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [calendarData, setCalendarData] = useState<string | null>(null);
  const [calendarSynced, setCalendarSynced] = useState(false);
  const calendarFetched = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const displayMessages: ChatMessage[] = [
    { id: "welcome", sender: "bot", text: t.chatWelcome },
    ...messages,
  ];

  // Buscar eventos do calendario ao abrir o chat
  const fetchCalendarContext = useCallback(async () => {
    console.log("[ChatbotModal] fetchCalendarContext chamado", {
      alreadyFetched: calendarFetched.current,
      isAuthenticated,
      status,
    });

    if (calendarFetched.current) {
      console.log("[ChatbotModal] Ja buscou antes, pulando (calendarData atual:", calendarData ? calendarData.slice(0, 80) + "..." : "null", ")");
      return;
    }

    if (!isAuthenticated) {
      console.log("[ChatbotModal] Usuario nao autenticado, pulando fetch do calendario");
      return;
    }

    calendarFetched.current = true;
    console.log("[ChatbotModal] Iniciando GET /api/calendar...");

    try {
      const res = await fetch("/api/calendar");
      console.log("[ChatbotModal] Resposta /api/calendar - status:", res.status);

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("[ChatbotModal] Erro na resposta /api/calendar:", res.status, errorBody);
        calendarFetched.current = false; // permitir retry
        return;
      }

      const data = await res.json();
      console.log("[ChatbotModal] Dados recebidos do /api/calendar:", JSON.stringify(data).slice(0, 500));

      const events = data.events as CalendarEvent[];

      if (!events || events.length === 0) {
        console.log("[ChatbotModal] Nenhum evento retornado - enviando sinal __EMPTY__ para blindar IA");
        setCalendarData("__EMPTY__");
        setCalendarSynced(true);
        return;
      }

      console.log("[ChatbotModal]", events.length, "eventos encontrados. Primeiro:", JSON.stringify(events[0]));

      // Formatar eventos como texto legivel para o system prompt
      const today = new Date().toDateString();
      console.log("[ChatbotModal] Filtrando eventos. today =", today, "| dates nos eventos:", events.map((e) => e.date));

      const todayEvents = events.filter((e) => e.date === today);
      const otherEvents = events.filter((e) => e.date !== today);

      console.log("[ChatbotModal] Eventos hoje:", todayEvents.length, "| Outros dias:", otherEvents.length);

      let summary = "";

      if (todayEvents.length > 0) {
        summary += "HOJE:\n";
        summary += todayEvents
          .map((e) => `- ${e.time}: ${e.title}`)
          .join("\n");
      }

      if (otherEvents.length > 0) {
        const byDate: Record<string, CalendarEvent[]> = {};
        otherEvents.forEach((e) => {
          if (!byDate[e.date]) byDate[e.date] = [];
          byDate[e.date].push(e);
        });

        for (const [date, evts] of Object.entries(byDate)) {
          const dayName = new Date(date).toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "short",
          });
          summary += `\n${dayName.toUpperCase()}:\n`;
          summary += evts
            .map((e) => `- ${e.time}: ${e.title}`)
            .join("\n");
        }
      }

      console.log("[ChatbotModal] Summary formatado:\n", summary);

      if (summary.trim().length > 0) {
        setCalendarData(summary);
        setCalendarSynced(true);
        console.log("[ChatbotModal] calendarData definido e calendarSynced = true");
      } else {
        console.log("[ChatbotModal] Summary vazio apos formatacao, nao atualizando estado");
      }
    } catch (err) {
      console.error("[ChatbotModal] ERRO no fetch /api/calendar:", err);
      calendarFetched.current = false; // permitir retry na proxima abertura
    }
  }, [isAuthenticated, status, calendarData]);

  useEffect(() => {
    if (isOpen) {
      fetchCalendarContext();
    }
  }, [isOpen, fetchCalendarContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = [...messages, userMsg].map((m) => ({
      role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));

    const payload = {
      messages: history,
      calendarData: calendarData || undefined,
    };

    console.log("[ChatbotModal] === ENVIANDO PARA /api/chat ===");
    console.log("[ChatbotModal] calendarData presente:", !!calendarData);
    console.log("[ChatbotModal] calendarData preview:", calendarData ? calendarData.slice(0, 200) : "(nenhum)");
    console.log("[ChatbotModal] messages count:", history.length);
    console.log("[ChatbotModal] payload completo:", JSON.stringify(payload).slice(0, 500));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("[ChatbotModal] Resposta /api/chat - status:", res.status);

      const data = await res.json();
      console.log("[ChatbotModal] Resposta /api/chat - body:", JSON.stringify(data).slice(0, 300));

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.reply || data.error || t.chatResponse,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("[ChatbotModal] ERRO no fetch /api/chat:", err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "bot",
        text: "Erro ao conectar com a IA. Tente novamente.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md h-[85vh] bg-surface rounded-t-3xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <MascotAvatar size="md" />
            {/* Sync indicator */}
            {calendarSynced && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-medium text-green-700">
                  {t.calendarSynced}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
          {displayMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} gap-2`}
            >
              {msg.sender === "bot" && <MascotAvatar size="sm" className="mt-1 shrink-0" />}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-accent-light text-text-primary rounded-bl-md"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start gap-2">
              <MascotAvatar size="sm" className="mt-1 shrink-0" />
              <div className="bg-accent-light text-text-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {/* Suggestion chips */}
          {messages.length === 0 && !loading && (
            <div className="space-y-2 mt-4">
              {t.chatSuggestions.slice(0, 3).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="w-full text-left px-4 py-3 bg-surface-muted border border-border rounded-2xl text-sm text-text-secondary hover:bg-primary-light hover:border-primary transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2 bg-surface-muted rounded-full px-4 py-2 border border-border">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder={t.chatPlaceholder}
              disabled={loading}
              className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-muted disabled:opacity-50"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-dark transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
