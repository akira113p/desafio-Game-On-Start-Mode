# Chatbot Tutor -- integracao com Groq API (LLaMA)

import os
import random
from groq import Groq
from dados.pilulas import PILULAS

# Cliente Groq (inicializado sob demanda)
_client = None


def _get_client():
    global _client
    if _client is None:
        # Tenta Streamlit secrets (Cloud) primeiro, depois .env (local)
        api_key = ""
        try:
            import streamlit as st
            api_key = st.secrets.get("GROQ_API_KEY", "")
        except Exception:
            pass
        if not api_key:
            api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            return None
        _client = Groq(api_key=api_key)
    return _client


SYSTEM_PROMPT = """Voce e um tutor acolhedor chamado "Tutor". Sua missao e ajudar jovens no primeiro emprego.

REGRAS OBRIGATORIAS:
1. NUNCA de a resposta pronta/mastigada. Ensine o CAMINHO para o jovem resolver sozinho.
2. Se o usuario perguntar "como faco X?", responda com passos para ele descobrir, e pergunte se quer ajuda para o proximo passo.
3. Use linguagem simples, sem jargoes corporativos. Fale como um colega mais experiente, nao como um professor.
4. Sempre termine oferecendo ajuda para o proximo passo concreto (ex: "Quer que eu te ajude a montar essa mensagem?").
5. Suas respostas devem ser curtas (max 150 palavras).
6. Inclua no final da resposta uma frase de veterano caso achar necessario, para tranquilizar o usuario. Use o formato:
   [Dica de veterano] "frase aqui" -- Nome, cargo

FRASES DE VETERANOS DISPONIVEIS (escolha a mais relevante ao contexto):
{pilulas}

IMPORTANTE: Voce existe para dar autonomia, nao dependencia. Ajude o jovem a pensar por conta propria."""


def _montar_system_prompt():
    pilulas_texto = "\n".join(
        f'- "{p["frase"]}" -- {p["autor"]}' for p in PILULAS
    )
    return SYSTEM_PROMPT.format(pilulas=pilulas_texto)


def gerar_resposta_ia(mensagem: str, historico: list) -> str:
    """
    Gera resposta usando Groq API (LLaMA).
    Recebe a mensagem atual e o historico de mensagens.
    Retorna a resposta do tutor.
    """
    client = _get_client()

    if client is None:
        return _resposta_fallback(mensagem)

    # Monta mensagens para a API
    messages = [{"role": "system", "content": _montar_system_prompt()}]

    # Adiciona historico (ultimas 20 mensagens para contexto)
    for msg in historico[-20:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    # Adiciona mensagem atual
    messages.append({"role": "user", "content": mensagem})

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=512,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        # Se a API falhar, usa fallback local
        print("API error")
        return _resposta_fallback(mensagem)


# ─────────────────────────────────────────────────────────────────────────────
# Fallback local (caso a API esteja indisponivel)
# ─────────────────────────────────────────────────────────────────────────────
RESPOSTAS_FALLBACK = [
    {
        "palavras": ["ti", "computador", "sistema", "acesso", "senha", "login", "pc", "notebook"],
        "resposta": (
            "Boa pergunta! Geralmente o time de TI tem um canal proprio (e-mail, chat ou ate "
            "um balcao fisico). Que tal seguir estes passos?\n\n"
            "1. Procure no chat interno um canal com nome tipo 'suporte' ou 'helpdesk'.\n"
            "2. Se nao achar, pergunte ao seu gestor ou ao colega mais proximo.\n"
            "3. Quando encontrar, descreva o problema de forma simples.\n\n"
            "Quer ajuda para montar a mensagem que vai enviar para o TI?"
        ),
    },
    {
        "palavras": ["reuniao", "reuniao", "daily", "call", "apresentar", "falar"],
        "resposta": (
            "Reunioes podem ser intimidantes no comeco, mas voce nao precisa ser o centro "
            "das atencoes! Algumas dicas:\n\n"
            "1. Chegue uns minutinhos antes para se situar.\n"
            "2. Tenha papel e caneta (ou bloco de notas aberto) para anotar.\n"
            "3. Se quiser falar, comece com perguntas -- 'Posso entender melhor esse ponto?'\n\n"
            "Ninguem espera que voce domine tudo na primeira semana. "
            "Quer que eu te ajude a preparar algo para dizer?"
        ),
    },
    {
        "palavras": ["medo", "nervoso", "ansiedade", "receio", "inseguro", "vergonha", "errar", "erro"],
        "resposta": (
            "E completamente normal sentir isso! Quase todo mundo passa por essa fase.\n\n"
            "1. Lembre que voce foi escolhido(a) para estar ai -- confiaram em voce.\n"
            "2. Anote o que te deixa nervoso(a). Colocar no papel ja alivia.\n"
            "3. Converse com seu mentor/buddy sobre como se sente.\n\n"
            "O medo passa com o tempo e com pequenas conquistas do dia a dia. "
            "Quer conversar sobre alguma situacao especifica?"
        ),
    },
    {
        "palavras": ["e-mail", "email", "mensagem", "escrever", "mandar", "enviar"],
        "resposta": (
            "Escrever e-mails no trabalho e mais simples do que parece:\n\n"
            "1. Assunto: Seja direto (ex: 'Duvida sobre acesso ao sistema X').\n"
            "2. Corpo: Cumprimento breve, contexto em 1-2 frases, seu pedido claro.\n"
            "3. Fechamento: 'Obrigado(a)!' ja funciona.\n\n"
            "Observe como as outras pessoas escrevem e siga o tom. "
            "Quer que eu te ajude a rascunhar uma mensagem?"
        ),
    },
    {
        "palavras": ["gestor", "chefe", "lider", "feedback", "1:1", "avaliacao"],
        "resposta": (
            "Conversar com seu gestor(a) pode parecer tenso, mas normalmente eles querem "
            "te ajudar a se adaptar!\n\n"
            "1. Prepare 1-2 perguntas antes da conversa.\n"
            "2. Seja honesto(a): 'Estou gostando, mas tenho duvida sobre X.'\n"
            "3. Peca feedback direto: 'Tem algo que posso melhorar?'\n\n"
            "Tem alguma situacao especifica com seu gestor que quer discutir?"
        ),
    },
    {
        "palavras": ["colega", "equipe", "time", "amigo", "conhecer", "socializar"],
        "resposta": (
            "Construir relacoes no trabalho leva tempo -- e tudo bem! Comece pequeno:\n\n"
            "1. Um 'bom dia' animado ja abre portas.\n"
            "2. Aceite convites para cafe ou almoco.\n"
            "3. Pergunte sobre o trabalho da pessoa: 'O que voce faz aqui?'\n\n"
            "Conexoes genuinas se constroem aos poucos. Quer dicas para puxar assunto?"
        ),
    },
    {
        "palavras": ["tarefa", "atividade", "trabalho", "fazer", "entregar", "prazo", "demanda"],
        "resposta": (
            "Quando receber uma tarefa nova, experimente este passo a passo:\n\n"
            "1. Anote o que foi pedido com suas palavras.\n"
            "2. Confirme se entendeu: 'So para garantir -- voce quer que eu faca X, certo?'\n"
            "3. Pergunte o prazo e a prioridade.\n"
            "4. Se travar, tente 15 min sozinho(a) e depois peca ajuda sem culpa.\n\n"
            "Quer ajuda para organizar alguma tarefa especifica?"
        ),
    },
]

RESPOSTA_PADRAO = (
    "Entendi sua duvida! Antes de eu te dar uma resposta pronta, que tal a gente pensar "
    "juntos? Me conta com mais detalhes:\n\n"
    "- O que exatamente esta acontecendo?\n"
    "- Voce ja tentou alguma coisa?\n"
    "- Tem alguem no time que poderia ajudar?\n\n"
    "Assim consigo te guiar melhor pelo caminho, em vez de so dar a resposta."
)


def _resposta_fallback(mensagem: str) -> str:
    """Fallback local por palavras-chave quando a API nao esta disponivel."""
    msg_lower = mensagem.lower()

    for entrada in RESPOSTAS_FALLBACK:
        for palavra in entrada["palavras"]:
            if palavra in msg_lower:
                pilula = random.choice(PILULAS)
                return (
                    entrada["resposta"]
                    + f"\n\n---\n[Dica de veterano] "
                    + f'"{pilula["frase"]}" -- {pilula["autor"]}'
                )

    pilula = random.choice(PILULAS)
    return (
        RESPOSTA_PADRAO
        + f"\n\n---\n[Dica de veterano] "
        + f'"{pilula["frase"]}" -- {pilula["autor"]}'
    )
