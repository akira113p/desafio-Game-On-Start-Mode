import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const BASE_SYSTEM_PROMPT = `Voce e um assistente virtual de onboarding corporativo amigavel em formato de robo mascote. Sua missao e ajudar novos funcionarios com duvidas sobre a empresa, processos e organizacao de rotina.

Regra de Ouro: Nunca de apenas a resposta pronta de forma robotica. Sempre ensine, estimule a autonomia e sugira tecnicas de gestao de tempo ou priorizacao, mantendo um tom de encorajamento.

Diretrizes:
- Responda de forma concisa (2-4 paragrafos no maximo)
- Use linguagem simples e acolhedora, sem jargoes corporativos
- Quando possivel, faca perguntas para estimular o pensamento critico
- Sugira proximos passos praticos
- Seja encorajador e positivo`;

const CALENDAR_CONTEXT_WITH_EVENTS = `

--- CONTEXTO DA AGENDA DO USUARIO (Google Calendar) ---
REGRA ABSOLUTA: NUNCA invente compromissos, reunioes ou horarios. Baseie-se ESTRITAMENTE nos dados abaixo. Se o usuario perguntar sobre algo que nao esta na agenda, diga que nao ha nada registrado.

Use essas informacoes para:
- Sugerir alocacao de tempo quando o usuario perguntar sobre tarefas ou horarios disponiveis
- Identificar janelas livres entre reunioes
- Recomendar priorizacao baseada na agenda real
- Alertar sobre possiveis conflitos de horario

Compromissos reais:
`;

const CALENDAR_CONTEXT_EMPTY = `

--- CONTEXTO DA AGENDA DO USUARIO (Google Calendar) ---
O calendario Google do usuario esta conectado mas NAO possui nenhum compromisso agendado para o periodo atual.

REGRA ABSOLUTA: NUNCA invente compromissos, reunioes ou horarios. A agenda esta vazia.

Ao responder:
- Informe que nao ha compromissos registrados no calendario
- Sugira atividades proativas como: revisar materiais de treinamento, explorar documentacao da empresa, agendar 1:1 com o gestor, organizar anotacoes, ou fazer cursos internos
- Ensine tecnicas de gestao de tempo livre (ex: Pomodoro, time-blocking, planejamento semanal)
- Incentive o usuario a adicionar tarefas no calendario para criar uma rotina
`;

interface ChatMessagePayload {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[/api/chat] GROQ_API_KEY nao encontrada nas variaveis de ambiente.");
    return NextResponse.json(
      { error: "Chave da API nao configurada. Verifique o .env.local." },
      { status: 500 }
    );
  }

  let messages: ChatMessagePayload[];
  let calendarData: string | undefined;

  try {
    const body = await request.json();
    messages = body.messages;
    calendarData = body.calendarData;
  } catch (parseError) {
    console.error("[/api/chat] Erro ao parsear body:", parseError);
    return NextResponse.json(
      { error: "Corpo da requisicao invalido." },
      { status: 400 }
    );
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Array de mensagens e obrigatorio." },
      { status: 400 }
    );
  }

  // Montar system prompt com contexto do calendario
  let systemPrompt = BASE_SYSTEM_PROMPT;

  if (calendarData === "__EMPTY__") {
    // Usuario esta autenticado mas sem eventos
    systemPrompt += CALENDAR_CONTEXT_EMPTY;
    console.log("[/api/chat] Calendario conectado mas VAZIO - prompt de agenda vazia injetado");
  } else if (calendarData && calendarData.trim().length > 0) {
    // Usuario autenticado com eventos reais
    systemPrompt += CALENDAR_CONTEXT_WITH_EVENTS + calendarData;
    console.log("[/api/chat] Contexto de calendario injetado (" + calendarData.length + " chars)");
  } else {
    // Usuario nao autenticado - sem contexto de calendario
    console.log("[/api/chat] Sem contexto de calendario (usuario nao autenticado)");
  }

  try {
    const groq = new Groq({ apiKey });

    console.log("[/api/chat] Enviando", messages.length, "mensagens para Groq...");

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply =
      chatCompletion.choices[0]?.message?.content ||
      "Desculpe, nao consegui gerar uma resposta. Tente novamente.";

    console.log("[/api/chat] Resposta recebida:", reply.slice(0, 80) + "...");

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("[/api/chat] === ERRO DETALHADO ===");

    if (error instanceof Error) {
      console.error("[/api/chat] Mensagem:", error.message);

      const groqError = error as Error & {
        status?: number;
        error?: unknown;
      };

      if (groqError.status) {
        console.error("[/api/chat] HTTP Status:", groqError.status);
      }
      if (groqError.error) {
        console.error("[/api/chat] API Error body:", JSON.stringify(groqError.error, null, 2));
      }

      return NextResponse.json(
        {
          error: `Erro da API Groq: ${error.message}`,
          status: groqError.status || 500,
        },
        { status: groqError.status || 500 }
      );
    }

    console.error("[/api/chat] Erro desconhecido:", error);
    return NextResponse.json(
      { error: "Erro desconhecido ao conectar com a IA." },
      { status: 500 }
    );
  }
}
