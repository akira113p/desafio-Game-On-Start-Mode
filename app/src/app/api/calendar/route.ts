import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { authOptions } from "@/lib/auth";

export async function GET() {
  // 1. Verificar autenticacao
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    console.error("[/api/calendar] Sem sessao ou accessToken");
    return NextResponse.json(
      { error: "Nao autenticado. Faca login com Google." },
      { status: 401 }
    );
  }

  console.log("[/api/calendar] Usuario autenticado:", session.user?.email);

  // 2. Configurar client do Google Calendar
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: session.accessToken });

  const calendar = google.calendar({ version: "v3", auth });

  // 3. Detectar fuso horario do usuario via Google Calendar
  let userTimeZone = "America/Sao_Paulo";
  try {
    const calSettings = await calendar.settings.get({ setting: "timezone" });
    if (calSettings.data.value) {
      userTimeZone = calSettings.data.value;
    }
  } catch {
    console.log("[/api/calendar] Nao conseguiu ler timezone do usuario, usando", userTimeZone);
  }

  console.log("[/api/calendar] Timezone do usuario:", userTimeZone);

  // 4. Calcular intervalo da semana no fuso do usuario
  // Usando Intl para obter a data local do usuario
  const nowLocal = new Date(
    new Date().toLocaleString("en-US", { timeZone: userTimeZone })
  );
  const dayOfWeek = nowLocal.getDay();

  // Domingo da semana atual, 00:00 local
  const startOfWeek = new Date(nowLocal);
  startOfWeek.setDate(nowLocal.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  // Sabado da semana atual, 23:59 local
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  console.log("[/api/calendar] Range:", startOfWeek.toISOString(), "->", endOfWeek.toISOString());

  // 5. Buscar eventos (passando timeZone para a API interpretar corretamente)
  try {
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: startOfWeek.toISOString(),
      timeMax: endOfWeek.toISOString(),
      timeZone: userTimeZone,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 50,
    });

    const events = (response.data.items || []).map((event) => {
      const start = event.start?.dateTime || event.start?.date || "";
      const end = event.end?.dateTime || event.end?.date || "";

      return {
        id: event.id,
        title: event.summary || "(Sem titulo)",
        start,
        end,
        date: start ? new Date(start).toDateString() : "",
        time: start
          ? new Date(start).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Dia inteiro",
        allDay: !event.start?.dateTime,
        description: event.description || "",
        location: event.location || "",
      };
    });

    console.log("[/api/calendar]", events.length, "eventos encontrados na semana");

    return NextResponse.json({ events });
  } catch (error: unknown) {
    console.error("[/api/calendar] === ERRO ===");

    if (error instanceof Error) {
      const gError = error as Error & { code?: number; errors?: unknown[] };
      console.error("[/api/calendar] Mensagem:", error.message);

      if (gError.code === 401) {
        return NextResponse.json(
          { error: "Token expirado. Faca login novamente." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: `Erro Google Calendar: ${error.message}` },
        { status: gError.code || 500 }
      );
    }

    console.error("[/api/calendar] Erro desconhecido:", error);
    return NextResponse.json(
      { error: "Erro desconhecido ao buscar calendario." },
      { status: 500 }
    );
  }
}
