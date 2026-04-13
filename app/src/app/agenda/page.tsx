"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { getWeekTasks, weekDays, type Task } from "@/data/mockData";
import MascotAvatar from "@/components/MascotAvatar";
import { useLocale } from "@/components/LocaleContext";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  date: string;
  time: string;
  allDay: boolean;
  description: string;
  location: string;
}

interface WeekDate {
  day: string;
  date: number;
  dateKey: string;
  isToday: boolean;
}

function getWeekDates(): WeekDate[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return {
      day: weekDays[i],
      date: date.getDate(),
      dateKey: date.toDateString(),
      isToday: date.toDateString() === today.toDateString(),
    };
  });
}

export default function AgendaPage() {
  const { t } = useLocale();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  const weekDates = useMemo(() => getWeekDates(), []);
  const mockTasks = useMemo(() => getWeekTasks(), []);

  const todayKey = weekDates.find((d) => d.isToday)?.dateKey || weekDates[0].dateKey;
  const [selectedDay, setSelectedDay] = useState(todayKey);

  // Google Calendar events (agrupados por dateKey)
  const [calendarEvents, setCalendarEvents] = useState<Record<string, Task[]>>({});
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  // Local tasks adicionadas pelo usuario (complementam os eventos do Google)
  const [localTasks, setLocalTasks] = useState<Record<string, Task[]>>({});

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTime, setEditTime] = useState("");

  // Fetch eventos do Google Calendar
  const fetchCalendar = useCallback(async () => {
    setCalendarLoading(true);
    setCalendarError(null);

    try {
      const res = await fetch("/api/calendar");
      const data = await res.json();

      if (!res.ok) {
        setCalendarError(data.error || "Erro ao carregar agenda");
        return;
      }

      // Agrupar eventos por dateKey
      const grouped: Record<string, Task[]> = {};
      (data.events as CalendarEvent[]).forEach((event) => {
        const key = event.date;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({
          id: event.id || `gcal-${Date.now()}-${Math.random()}`,
          title: event.title,
          time: event.allDay ? t.allDay : event.time,
          completed: false,
        });
      });

      setCalendarEvents(grouped);
    } catch {
      setCalendarError("Erro de rede ao buscar calendario");
    } finally {
      setCalendarLoading(false);
    }
  }, [t.allDay]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCalendar();
    }
  }, [isAuthenticated, fetchCalendar]);

  // Combinar eventos Google + locais, ou usar mock se nao autenticado
  const tasks = useMemo(() => {
    if (!isAuthenticated) {
      return mockTasks[selectedDay] || [];
    }
    const google = calendarEvents[selectedDay] || [];
    const local = localTasks[selectedDay] || [];
    return [...google, ...local];
  }, [isAuthenticated, calendarEvents, localTasks, mockTasks, selectedDay]);

  // Funcoes para tarefas locais
  const setLocalTasksForDay = (updater: (prev: Task[]) => Task[]) => {
    setLocalTasks((prev) => ({
      ...prev,
      [selectedDay]: updater(prev[selectedDay] || []),
    }));
  };

  // Se nao autenticado, manipula os mocks diretamente
  const [allMockTasks, setAllMockTasks] = useState(mockTasks);

  const setMockTasksForDay = (updater: (prev: Task[]) => Task[]) => {
    setAllMockTasks((prev) => ({
      ...prev,
      [selectedDay]: updater(prev[selectedDay] || []),
    }));
  };

  const mockTasksForDay = allMockTasks[selectedDay] || [];

  const displayTasks = isAuthenticated ? tasks : mockTasksForDay;

  const toggleTask = (id: string) => {
    if (isAuthenticated) {
      // Toggle em calendarEvents ou localTasks
      setCalendarEvents((prev) => {
        const dayEvents = prev[selectedDay];
        if (dayEvents?.some((e) => e.id === id)) {
          return {
            ...prev,
            [selectedDay]: dayEvents.map((e) =>
              e.id === id ? { ...e, completed: !e.completed } : e
            ),
          };
        }
        return prev;
      });
      setLocalTasks((prev) => {
        const dayTasks = prev[selectedDay];
        if (dayTasks?.some((t) => t.id === id)) {
          return {
            ...prev,
            [selectedDay]: dayTasks.map((t) =>
              t.id === id ? { ...t, completed: !t.completed } : t
            ),
          };
        }
        return prev;
      });
    } else {
      setMockTasksForDay((prev) =>
        prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
      );
    }
  };

  const deleteTask = (id: string) => {
    if (isAuthenticated) {
      setCalendarEvents((prev) => ({
        ...prev,
        [selectedDay]: (prev[selectedDay] || []).filter((e) => e.id !== id),
      }));
      setLocalTasks((prev) => ({
        ...prev,
        [selectedDay]: (prev[selectedDay] || []).filter((t) => t.id !== id),
      }));
    } else {
      setMockTasksForDay((prev) => prev.filter((task) => task.id !== id));
    }
  };

  const addTask = () => {
    if (!newTaskTitle.trim() || !newTaskTime.trim()) return;
    const newTask: Task = {
      id: `local-${Date.now()}`,
      time: newTaskTime,
      title: newTaskTitle,
      completed: false,
    };
    if (isAuthenticated) {
      setLocalTasksForDay((prev) =>
        [...prev, newTask].sort((a, b) => a.time.localeCompare(b.time))
      );
    } else {
      setMockTasksForDay((prev) =>
        [...prev, newTask].sort((a, b) => a.time.localeCompare(b.time))
      );
    }
    setNewTaskTitle("");
    setNewTaskTime("");
    setShowAddForm(false);
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditTime(task.time);
  };

  const saveEdit = () => {
    if (!editTitle.trim() || !editTime.trim()) return;
    const updater = (prev: Task[]) =>
      prev.map((task) =>
        task.id === editingId ? { ...task, title: editTitle, time: editTime } : task
      );

    if (isAuthenticated) {
      setCalendarEvents((prev) => ({
        ...prev,
        [selectedDay]: updater(prev[selectedDay] || []),
      }));
      setLocalTasks((prev) => ({
        ...prev,
        [selectedDay]: updater(prev[selectedDay] || []),
      }));
    } else {
      setMockTasksForDay(updater);
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const isSelectedToday = selectedDay === todayKey;
  const scheduleLabel = isSelectedToday
    ? t.todaysSchedule
    : weekDates.find((d) => d.dateKey === selectedDay)?.day || "";

  // ==================== RENDER ====================

  // Estado de loading da sessao
  if (isLoading) {
    return (
      <div className="px-4 py-20 flex flex-col items-center gap-4">
        <MascotAvatar size="xl" floating />
        <p className="text-sm text-text-muted">{t.loadingCalendar}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Banner de conexao Google (se nao autenticado) */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-br from-accent-light to-primary-light rounded-2xl p-5 text-center space-y-4">
          <MascotAvatar size="xl" className="mx-auto" />
          <p className="text-sm text-text-secondary leading-relaxed">
            {t.calendarConnect}
          </p>
          <button
            onClick={() => signIn("google")}
            className="inline-flex items-center gap-3 px-6 py-3 bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-all text-sm font-medium text-text-primary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t.signInGoogle}
          </button>
          <p className="text-[11px] text-text-muted">
            {isAuthenticated ? "" : "* Dados mockados sendo exibidos abaixo"}
          </p>
        </div>
      )}

      {/* Erro do calendario */}
      {calendarError && isAuthenticated && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {calendarError}
        </div>
      )}

      {/* Calendar strip */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-1">
            {t.agenda}
            {isAuthenticated && (
              <span className="ml-2 text-[10px] font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                Google
              </span>
            )}
          </h2>
        </div>

        <div className="flex justify-between">
          {weekDates.map((d) => {
            const isSelected = d.dateKey === selectedDay;
            const hasEvents = isAuthenticated
              ? (calendarEvents[d.dateKey]?.length || 0) > 0
              : (allMockTasks[d.dateKey]?.length || 0) > 0;

            return (
              <button
                key={d.dateKey}
                onClick={() => setSelectedDay(d.dateKey)}
                className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all relative ${
                  isSelected
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : d.isToday
                      ? "bg-primary-light text-primary"
                      : "text-text-secondary hover:bg-surface-muted"
                }`}
              >
                <span className="text-[10px] font-medium uppercase">{d.day}</span>
                <span className={`text-sm font-bold ${isSelected ? "text-white" : ""}`}>
                  {d.date}
                </span>
                {/* Dot indicator for days with events */}
                {hasEvents && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text-primary">
            {scheduleLabel}
            <span className="text-primary ml-1">+</span>
          </h2>
        </div>

        {/* Loading do calendario */}
        {calendarLoading && isAuthenticated ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-text-muted">{t.loadingCalendar}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayTasks.length === 0 && (
              <div className="text-center py-8 text-text-muted text-sm flex flex-col items-center gap-3">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {t.calendarEmpty}
              </div>
            )}
            {displayTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between px-4 py-3 bg-surface rounded-xl border transition-all ${
                  task.completed
                    ? "border-green-200 bg-green-50/50"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {editingId === task.id ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="w-24 px-2 py-1 text-sm border border-primary/40 rounded-lg outline-none focus:border-primary bg-surface-muted"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                        className="flex-1 px-2 py-1 text-sm border border-primary/40 rounded-lg outline-none focus:border-primary bg-surface-muted"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1 bg-primary text-white text-xs rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        {t.save}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-surface-muted text-text-secondary text-xs rounded-lg border border-border hover:bg-border/50 transition-colors"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(task)}
                        className="text-text-muted hover:text-primary transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-text-muted hover:text-red-500 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Task Form */}
        {showAddForm && (
          <div className="mt-3 bg-surface rounded-xl border border-primary/30 p-4 space-y-3">
            <input
              type="text"
              placeholder={t.taskTitle}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary"
              autoFocus
            />
            <input
              type="text"
              placeholder={t.timePlaceholder}
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={addTask}
                className="flex-1 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
              >
                {t.add}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 bg-surface-muted text-text-secondary text-sm rounded-lg border border-border hover:bg-border/50 transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowAddForm(true)}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]"
        >
          {t.addTask}
        </button>
      </section>

      {/* Mascot */}
      <div className="flex justify-end pr-2 pt-2">
        <MascotAvatar size="xl" floating />
      </div>
    </div>
  );
}
