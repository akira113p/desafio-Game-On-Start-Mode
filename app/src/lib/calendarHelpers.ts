/**
 * Calcula blocos de tempo livre no horario comercial
 * a partir dos eventos existentes do Google Calendar.
 */

export interface CalendarEvent {
  start: string;
  end: string;
  title: string;
  allDay: boolean;
}

export interface FreeSlot {
  date: string;       // "2026-04-14"
  dayLabel: string;   // "Segunda-feira, 14 de abr"
  start: string;      // "09:00"
  end: string;        // "11:00"
  durationMinutes: number;
}

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
const MIN_SLOT_MINUTES = 60;

/**
 * Retorna os proximos N dias uteis a partir de hoje.
 */
function getNextBusinessDays(count: number): Date[] {
  const days: Date[] = [];
  const current = new Date();
  current.setHours(0, 0, 0, 0);

  // Comecar de hoje se ainda estiver no horario comercial, senao amanha
  const now = new Date();
  if (now.getHours() >= WORK_END_HOUR) {
    current.setDate(current.getDate() + 1);
  }

  while (days.length < count) {
    const dow = current.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
}

/**
 * Formata hora como "HH:MM"
 */
function formatTime(hours: number, minutes: number = 0): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Converte "HH:MM" para minutos desde meia-noite
 */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Converte minutos desde meia-noite para "HH:MM"
 */
function minutesToTime(mins: number): string {
  return formatTime(Math.floor(mins / 60), mins % 60);
}

/**
 * Calcula slots livres para os proximos dias uteis.
 *
 * @param events - Eventos do Google Calendar (semana inteira)
 * @param businessDays - Quantos dias uteis analisar (default 5)
 * @returns Array de FreeSlot com blocos >= 60min
 */
export function calculateFreeSlots(
  events: CalendarEvent[],
  businessDays: number = 5
): FreeSlot[] {
  const days = getNextBusinessDays(businessDays);
  const slots: FreeSlot[] = [];

  for (const day of days) {
    const dayStr = day.toISOString().split("T")[0]; // "2026-04-14"
    const dayLabel = day.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });

    // Filtrar eventos deste dia (excluindo all-day)
    const dayEvents = events
      .filter((e) => {
        if (e.allDay) return false;
        const eventDate = new Date(e.start).toISOString().split("T")[0];
        return eventDate === dayStr;
      })
      .map((e) => {
        const startDate = new Date(e.start);
        const endDate = new Date(e.end);
        return {
          startMin: startDate.getHours() * 60 + startDate.getMinutes(),
          endMin: endDate.getHours() * 60 + endDate.getMinutes(),
        };
      })
      .sort((a, b) => a.startMin - b.startMin);

    // Calcular gaps no horario comercial
    const workStart = WORK_START_HOUR * 60;
    const workEnd = WORK_END_HOUR * 60;

    let cursor = workStart;

    for (const event of dayEvents) {
      // Limitar evento ao horario comercial
      const evStart = Math.max(event.startMin, workStart);
      const evEnd = Math.min(event.endMin, workEnd);

      if (evStart > cursor) {
        const gap = evStart - cursor;
        if (gap >= MIN_SLOT_MINUTES) {
          slots.push({
            date: dayStr,
            dayLabel,
            start: minutesToTime(cursor),
            end: minutesToTime(evStart),
            durationMinutes: gap,
          });
        }
      }
      cursor = Math.max(cursor, evEnd);
    }

    // Gap final ate o fim do expediente
    if (workEnd > cursor) {
      const gap = workEnd - cursor;
      if (gap >= MIN_SLOT_MINUTES) {
        slots.push({
          date: dayStr,
          dayLabel,
          start: minutesToTime(cursor),
          end: minutesToTime(workEnd),
          durationMinutes: gap,
        });
      }
    }
  }

  return slots;
}
