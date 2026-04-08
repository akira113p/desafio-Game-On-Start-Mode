# =============================================================================
# Game On: Start Mode -- Prototipo Streamlit
# Rode com: streamlit run app.py
# Requer:   pip install streamlit groq python-dotenv
# =============================================================================

import sys
import os
import random

# Adiciona o diretorio do app ao path para imports locais
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import streamlit as st
from dotenv import load_dotenv

from dados.missoes import MISSOES
from dados.agenda import AGENDA_MOCK
from dados.pilulas import PILULAS
from ia.chatbot import gerar_resposta_ia

# Carrega variaveis de ambiente (.env)
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURACAO DA PAGINA
# ─────────────────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Game On: Start Mode",
    page_icon="",
    layout="centered",
)

# ─────────────────────────────────────────────────────────────────────────────
# INICIALIZACAO DO SESSION STATE
# ─────────────────────────────────────────────────────────────────────────────
if "dia_atual" not in st.session_state:
    st.session_state.dia_atual = 1

if "missoes_completas" not in st.session_state:
    st.session_state.missoes_completas = set()

if "mensagens_chat" not in st.session_state:
    st.session_state.mensagens_chat = [
        {
            "role": "assistant",
            "content": (
                "Oi! Eu sou seu tutor por aqui. Pode me perguntar qualquer coisa sobre "
                "o seu novo trabalho -- nenhuma duvida e boba demais!\n\n"
                "So um combinado: em vez de te dar tudo mastigado, vou te ajudar a pensar "
                "no caminho. Assim voce ganha confianca de verdade. Beleza?"
            ),
        }
    ]

if "nome_usuario" not in st.session_state:
    st.session_state.nome_usuario = ""


# ─────────────────────────────────────────────────────────────────────────────
# SIDEBAR -- Navegacao + Identidade
# ─────────────────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("prototipo 1")
    st.caption("Seu guia para a primeira semana.")
    st.divider()

    nome = st.text_input("Como posso te chamar?", value=st.session_state.nome_usuario)
    if nome != st.session_state.nome_usuario:
        st.session_state.nome_usuario = nome

    st.divider()

    pagina = st.radio(
        "Navegacao",
        ["Meu Dia", "Chatbot Tutor"],
        label_visibility="collapsed",
    )

    st.divider()

    # Progresso geral
    total = len(MISSOES)
    feitas = len(st.session_state.missoes_completas)
    st.caption(f"Progresso geral: {feitas}/{total} missoes")
    st.progress(feitas / total if total > 0 else 0)

    # Seletor do dia (para navegar entre dias no prototipo)
    st.divider()
    st.session_state.dia_atual = st.slider(
        "Simular dia da jornada", min_value=1, max_value=30, value=st.session_state.dia_atual
    )


# ─────────────────────────────────────────────────────────────────────────────
# PAGINA: MEU DIA (Agenda + Missoes + Pilulas)
# ─────────────────────────────────────────────────────────────────────────────
if pagina == "Meu Dia":
    saudacao = f", {st.session_state.nome_usuario}" if st.session_state.nome_usuario else ""
    st.title(f"Bom dia{saudacao}!")
    st.caption(f"Dia {st.session_state.dia_atual} da sua jornada")

    # -- Missao do dia --------------------------------------------------------
    st.subheader("Missao do Dia")
    dia = st.session_state.dia_atual
    missao = MISSOES.get(dia)

    if missao:
        concluida = dia in st.session_state.missoes_completas

        col1, col2 = st.columns([5, 1])
        with col1:
            if concluida:
                st.success(f"**{missao['titulo']}** -- Concluida!")
            else:
                st.info(f"**{missao['titulo']}**")
            st.caption(missao["desc"])
        with col2:
            if not concluida:
                if st.button("Concluir", key=f"btn_missao_{dia}"):
                    st.session_state.missoes_completas.add(dia)
                    st.rerun()

    # -- Roadmap visual (proximos dias) ----------------------------------------
    with st.expander("Roadmap -- Proximas missoes", expanded=False):
        for d in range(dia, min(dia + 5, 31)):
            m = MISSOES.get(d)
            if m:
                status = "[x]" if d in st.session_state.missoes_completas else "[ ]"
                st.markdown(f"{status} **Dia {d}** -- {m['titulo']}")

    st.divider()

    # -- Agenda do dia ---------------------------------------------------------
    st.subheader("Sua Agenda de Hoje")
    st.caption("(Dados simulados para o prototipo)")

    for item in AGENDA_MOCK:
        st.markdown(f"**{item['hora']}** -- {item['evento']}")
        with st.expander(f"Dica para: {item['evento']}", expanded=False):
            st.write(item["dica"])

    st.divider()

    # -- Pilula de Sabedoria ---------------------------------------------------
    st.subheader("Pilula de Sabedoria")
    st.caption("Uma frase de quem ja passou por isso:")

    # Seleciona pilula do dia (deterministico por dia para consistencia)
    pilula_do_dia = PILULAS[dia % len(PILULAS)]
    st.info(f'*"{pilula_do_dia["frase"]}"*\n\n-- {pilula_do_dia["autor"]}')

    if st.button("Outra pilula"):
        outra = random.choice(PILULAS)
        st.info(f'*"{outra["frase"]}"*\n\n-- {outra["autor"]}')


# ─────────────────────────────────────────────────────────────────────────────
# PAGINA: CHATBOT TUTOR
# ─────────────────────────────────────────────────────────────────────────────
elif pagina == "Chatbot Tutor":
    st.title("Seu Tutor")
    st.caption(
        "Pergunte qualquer coisa sobre seu novo trabalho. "
        "Eu vou te ajudar a pensar no caminho -- sem dar resposta mastigada!"
    )

    # Exibe historico de mensagens
    for msg in st.session_state.mensagens_chat:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    # Input do usuario
    if prompt := st.chat_input("Digite sua duvida aqui..."):
        # Adiciona mensagem do usuario
        st.session_state.mensagens_chat.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        # Gera e exibe resposta da IA (Groq API)
        with st.chat_message("assistant"):
            with st.spinner("Pensando..."):
                resposta = gerar_resposta_ia(prompt, st.session_state.mensagens_chat)
            st.markdown(resposta)

        st.session_state.mensagens_chat.append({"role": "assistant", "content": resposta})

#feito por Akira 2emfb