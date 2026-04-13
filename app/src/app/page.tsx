"use client";

import { useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { dailyTasks, encouragements, type Task, type Encouragement } from "@/data/mockData";
import { calculateFreeSlots, type CalendarEvent } from "@/lib/calendarHelpers";
import MascotAvatar from "@/components/MascotAvatar";
import { useLocale } from "@/components/LocaleContext";

interface GeneratedTask {
  title: string;
  description: string;
  durationMinutes: number;
  suggestedSlot: { date: string; start: string; end: string };
  priority: "alta" | "media" | "baixa";
}

export default function LandingPage() {
  const { t } = useLocale();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  // Tarefas da rotina (mockadas ou geradas pela IA)
  const [tasks, setTasks] = useState<Task[]>(dailyTasks);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [showGenerated, setShowGenerated] = useState(false);

  // Encouragement state
  const [visibleEncouragements, setVisibleEncouragements] = useState<Encouragement[]>(
    encouragements.slice(0, 2)
  );
  const [encouragementIndex, setEncouragementIndex] = useState(2);

  // Onboarding engine state
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const handleLike = (id: string) => {
    setVisibleEncouragements((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, liked: !e.liked, likes: e.liked ? e.likes - 1 : e.likes + 1 }
          : e
      )
    );
  };

  const generateNewComment = () => {
    const next = encouragements[encouragementIndex % encouragements.length];
    setVisibleEncouragements((prev) => [...prev.slice(-1), { ...next, liked: false }]);
    setEncouragementIndex((i) => i + 1);
  };

  const priorityColor = (p: string) => {
    if (p === "alta") return "bg-red-100 text-red-700 border-red-200";
    if (p === "media") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  const priorityLabel = (p: string) => {
    if (p === "alta") return t.priorityHigh;
    if (p === "media") return t.priorityMedium;
    return t.priorityLow;
  };

  const handleAnalyze = useCallback(async () => {
    if (!jobDescription.trim() || analyzing) return;

    setAnalyzing(true);
    setAnalyzeError(null);

    try {
      // 1. Buscar eventos do calendario
      let calendarEvents: CalendarEvent[] = [];

      if (isAuthenticated) {
        const calRes = await fetch("/api/calendar");
        if (calRes.ok) {
          const calData = await calRes.json();
          calendarEvents = (calData.events || []).map((e: { start: string; end: string; title: string; allDay: boolean }) => ({
            start: e.start,
            end: e.end,
            title: e.title,
            allDay: e.allDay,
          }));
        }
      }

      // 2. Calcular slots livres
      const freeSlots = calculateFreeSlots(calendarEvents, 5);
      console.log("[Landing] Free slots calculados:", freeSlots.length);

      if (freeSlots.length === 0) {
        setAnalyzeError(t.noFreeSlots);
        setAnalyzing(false);
        return;
      }

      // 3. Chamar a rota de geracao
      const res = await fetch("/api/generate-routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          freeSlots,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAnalyzeError(data.error || "Erro ao gerar trilha.");
        return;
      }

      // 4. Armazenar tarefas geradas
      setGeneratedTasks(data.tasks);
      setShowGenerated(true);
      setShowOnboardingModal(false);

      // Converter para o formato Task para exibir na Daily Routine
      const aiTasks: Task[] = data.tasks.map((gt: GeneratedTask, i: number) => ({
        id: `ai-${i}-${Date.now()}`,
        time: gt.suggestedSlot.start,
        title: gt.title,
        completed: false,
      }));
      setTasks(aiTasks);
    } catch (err) {
      console.error("[Landing] Erro:", err);
      setAnalyzeError("Erro de conexao. Tente novamente.");
    } finally {
      setAnalyzing(false);
    }
  }, [jobDescription, analyzing, isAuthenticated, t.noFreeSlots]);

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Hero notebook illustration */}
      <div className="bg-gradient-to-br from-primary-light via-white to-accent-light rounded-2xl p-6 flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="140" viewBox="0 0 200 140">
            <rect x="30" y="10" width="140" height="120" rx="8" fill="white" stroke="#F97316" strokeWidth="2" />
            {[25, 40, 55, 70, 85, 100, 105].map((y) => (
              <circle key={y} cx="30" cy={y} r="4" fill="none" stroke="#F97316" strokeWidth="1.5" />
            ))}
            <line x1="50" y1="35" x2="150" y2="35" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="50" y1="50" x2="150" y2="50" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="50" y1="65" x2="150" y2="65" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="50" y1="80" x2="130" y2="80" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="50" y1="95" x2="120" y2="95" stroke="#E2E8F0" strokeWidth="1" />
            <rect x="140" y="85" width="6" height="40" rx="1" fill="#F97316" transform="rotate(-30 143 105)" />
            <polygon points="138,122 142,130 146,122" fill="#FFE4B5" transform="rotate(-30 143 105)" />
            <path d="M155 10 L155 40 L160 35 L165 40 L165 10" fill="#3B82F6" opacity="0.8" />
          </svg>
        </div>
      </div>

      {/* Onboarding CTA Button */}
      <button
        onClick={() => setShowOnboardingModal(true)}
        className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-accent to-accent-dark text-white rounded-2xl font-medium text-sm hover:shadow-lg hover:shadow-accent/25 transition-all active:scale-[0.98]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        {t.generateOnboarding}
      </button>

      {/* Daily Routine Suggestions (mock ou IA) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text-primary">
            {showGenerated ? t.onboardingGenerated : t.dailyRoutine}
            {showGenerated && (
              <span className="ml-2 text-[10px] font-normal text-accent bg-accent-light px-2 py-0.5 rounded-full">
                IA
              </span>
            )}
          </h2>
          {showGenerated && (
            <button
              onClick={() => {
                setShowGenerated(false);
                setTasks(dailyTasks);
                setGeneratedTasks([]);
              }}
              className="text-xs text-text-muted hover:text-text-primary"
            >
              Resetar
            </button>
          )}
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between px-4 py-3 bg-surface rounded-xl border transition-all ${
                task.completed
                  ? "border-green-200 bg-green-50/50"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                    task.completed
                      ? "bg-green-500 border-green-500"
                      : "border-text-muted hover:border-primary"
                  }`}
                >
                  {task.completed && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <span className="text-sm font-medium text-text-secondary">{task.time}</span>
                <span className={`text-sm ${task.completed ? "line-through text-text-muted" : "text-text-primary"}`}>
                  {task.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Generated task details (expanded cards) */}
      {showGenerated && generatedTasks.length > 0 && (
        <section className="space-y-3">
          {generatedTasks.map((gt, i) => (
            <div
              key={i}
              className="bg-surface rounded-xl border border-border p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-text-primary flex-1">{gt.title}</h3>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${priorityColor(gt.priority)}`}>
                  {priorityLabel(gt.priority)}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{gt.description}</p>
              <div className="flex items-center gap-3 text-[11px] text-text-muted">
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {gt.durationMinutes}min
                </span>
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {gt.suggestedSlot.date} | {gt.suggestedSlot.start}-{gt.suggestedSlot.end}
                </span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Encouragement from the Team */}
      <section>
        <h2 className="text-base font-semibold text-text-primary mb-3">
          {t.encouragement}
        </h2>

        <div className="space-y-3">
          {visibleEncouragements.map((enc) => (
            <div
              key={enc.id}
              className="bg-surface rounded-xl border border-border p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-light to-accent-light flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {enc.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary leading-relaxed">
                    <span className="font-semibold">{enc.name}</span>{" "}
                    {enc.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-text-muted">
                      {enc.name}.. {enc.role}
                    </span>
                    <button
                      onClick={() => handleLike(enc.id)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        enc.liked ? "text-primary" : "text-text-muted hover:text-primary"
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={enc.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                      {t.like}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={generateNewComment}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]"
        >
          {t.generateComment}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </section>

      <div className="flex justify-end pr-2">
        <MascotAvatar size="lg" floating />
      </div>

      {/* ===== ONBOARDING MODAL ===== */}
      {showOnboardingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => !analyzing && setShowOnboardingModal(false)}
          />
          <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-text-primary">{t.generateOnboarding}</h2>
              </div>
              <button
                onClick={() => !analyzing && setShowOnboardingModal(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-4">
              {!isAuthenticated && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div>
                    <p className="text-xs text-amber-800">{t.loginRequired}</p>
                    <button
                      onClick={() => signIn("google")}
                      className="mt-2 text-xs font-medium text-accent hover:underline"
                    >
                      {t.signInGoogle}
                    </button>
                  </div>
                </div>
              )}

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder={t.jobDescPlaceholder}
                rows={6}
                disabled={analyzing}
                className="w-full px-4 py-3 text-sm border border-border rounded-xl outline-none focus:border-accent resize-none bg-surface-muted placeholder:text-text-muted disabled:opacity-50"
              />

              {analyzeError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700">
                  {analyzeError}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={analyzing || jobDescription.trim().length < 10}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent to-accent-dark text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-accent/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.analyzingRoutine}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    {t.analyzeWithAI}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
