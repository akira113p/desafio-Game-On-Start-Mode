import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Voce e um especialista em onboarding corporativo e gestao de tempo.

Sua tarefa: receber a descricao de uma vaga (Job Description) e uma lista de horarios livres na agenda do novo funcionario, e gerar uma trilha de aprendizagem personalizada que caiba nesses espacos.

REGRAS OBRIGATORIAS:
1. Responda EXCLUSIVAMENTE com um JSON valido, sem texto antes ou depois.
2. O JSON deve ser um array de objetos, cada um com: "title", "description", "durationMinutes", "suggestedSlot", "priority".
3. "suggestedSlot" deve conter "date", "start", "end" exatamente de um dos slots livres fornecidos.
4. "priority" deve ser "alta", "media" ou "baixa".
5. "durationMinutes" nao pode exceder a duracao do slot escolhido.
6. Ordene por prioridade (alta primeiro) e por data/horario.
7. Gere entre 5 e 10 tarefas, cobrindo: estudo de ferramentas, leitura de documentacao, reunioes sugeridas com equipe, treinamentos tecnicos, e soft skills.
8. Titulos e descricoes em portugues BR, concisos e praticos.
9. NAO inclua nenhum texto fora do JSON. Nenhum markdown, nenhum comentario.

Exemplo de formato:
[
  {
    "title": "Estudo da ferramenta Jira",
    "description": "Explorar o board do time, entender fluxo de tickets e prioridades",
    "durationMinutes": 60,
    "suggestedSlot": { "date": "2026-04-14", "start": "09:00", "end": "10:00" },
    "priority": "alta"
  }
]`;

interface FreeSlot {
  date: string;
  dayLabel: string;
  start: string;
  end: string;
  durationMinutes: number;
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY nao configurada." },
      { status: 500 }
    );
  }

  let jobDescription: string;
  let freeSlots: FreeSlot[];

  try {
    const body = await request.json();
    jobDescription = body.jobDescription;
    freeSlots = body.freeSlots;
  } catch {
    return NextResponse.json(
      { error: "Body invalido." },
      { status: 400 }
    );
  }

  if (!jobDescription || jobDescription.trim().length < 10) {
    return NextResponse.json(
      { error: "Descricao da vaga e obrigatoria (minimo 10 caracteres)." },
      { status: 400 }
    );
  }

  if (!freeSlots || freeSlots.length === 0) {
    return NextResponse.json(
      { error: "Nenhum horario livre disponivel na agenda." },
      { status: 400 }
    );
  }

  // Montar prompt do usuario com os dados
  const slotsText = freeSlots
    .map(
      (s) =>
        `- ${s.dayLabel}: ${s.start} ate ${s.end} (${s.durationMinutes}min)`
    )
    .join("\n");

  const userPrompt = `JOB DESCRIPTION:
${jobDescription.trim()}

HORARIOS LIVRES NA AGENDA:
${slotsText}

Gere a trilha de onboarding em JSON.`;

  console.log("[/api/generate-routine] Job desc:", jobDescription.slice(0, 80) + "...");
  console.log("[/api/generate-routine] Free slots:", freeSlots.length);

  try {
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const raw = completion.choices[0]?.message?.content || "";
    console.log("[/api/generate-routine] Resposta raw:", raw.slice(0, 200) + "...");

    // Extrair JSON da resposta (lidar com possivel markdown fence)
    let jsonStr = raw.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    }

    // Tentar encontrar o array JSON
    const bracketStart = jsonStr.indexOf("[");
    const bracketEnd = jsonStr.lastIndexOf("]");
    if (bracketStart !== -1 && bracketEnd !== -1) {
      jsonStr = jsonStr.slice(bracketStart, bracketEnd + 1);
    }

    const tasks = JSON.parse(jsonStr);

    if (!Array.isArray(tasks)) {
      throw new Error("Resposta da IA nao e um array");
    }

    console.log("[/api/generate-routine]", tasks.length, "tarefas geradas");

    return NextResponse.json({ tasks });
  } catch (error: unknown) {
    console.error("[/api/generate-routine] ERRO:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "A IA retornou um formato invalido. Tente novamente." },
        { status: 502 }
      );
    }

    if (error instanceof Error) {
      const groqError = error as Error & { status?: number };
      return NextResponse.json(
        { error: `Erro: ${error.message}` },
        { status: groqError.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Erro desconhecido." },
      { status: 500 }
    );
  }
}
