# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Game On: Start Mode" -- app web Streamlit para ajudar jovens no primeiro emprego a ganharem autonomia e confianca no primeiro mes de trabalho. O app NAO deve gerar dependencia; deve ensinar a pensar e se organizar.

## Running

```bash
cd prototipo
pip install -r requirements.txt
streamlit run app.py
```

## Project Structure

```
prototipo/
  app.py              # Entry point -- paginas e UI Streamlit
  requirements.txt    # Dependencias (streamlit, groq, python-dotenv)
  .env                # Chave da API Groq (GROQ_API_KEY)
  dados/
    missoes.py        # 30 missoes diarias da Jornada do Novato
    agenda.py         # Eventos mock da agenda do dia
    pilulas.py        # Frases de veteranos (Pilulas de Sabedoria)
  ia/
    chatbot.py        # Integracao com Groq API (LLaMA) + fallback local
```

## Architecture

- **UI (app.py):** Duas paginas via sidebar -- "Meu Dia" (missoes + agenda + pilulas) e "Chatbot Tutor". Estado mantido em `st.session_state`.
- **IA (ia/chatbot.py):** `gerar_resposta_ia()` chama Groq API (modelo llama-3.3-70b-versatile) com system prompt que impoe a "Regra de Ouro" (nunca dar resposta mastigada). Fallback local por palavras-chave se a API falhar.
- **Dados (dados/):** Mocks em dicionarios/listas Python. Sem banco de dados.

## Design Principles

- Linguagem simples, sem jargoes corporativos
- IA segue a "Regra de Ouro": nunca da resposta mastigada, ensina o caminho
- Interface acolhedora e limpa, visual amigavel para jovens
- Sem emojis na interface
