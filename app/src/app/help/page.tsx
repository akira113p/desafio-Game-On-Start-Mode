"use client";

import { useLocale } from "@/components/LocaleContext";
import MascotAvatar from "@/components/MascotAvatar";

export default function HelpPage() {
  const { t } = useLocale();

  const faqs = [
    { q: "Como uso o app?", a: "Navegue pelas abas Inicio, Notas e Agenda na barra inferior." },
    { q: "O chatbot pode me ajudar?", a: "Sim! Clique no icone do mascote para tirar duvidas." },
    { q: "Posso editar minha agenda?", a: "Sim, use os botoes de editar e excluir em cada tarefa." },
    { q: "Como crio uma checklist?", a: "Em Notas, clique em Adicionar Nota e escolha Checklist." },
  ];

  return (
    <div className="px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <MascotAvatar size="lg" />
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{t.help}</h2>
          <p className="text-sm text-text-secondary">Perguntas frequentes</p>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <details key={faq.q} className="bg-surface rounded-xl border border-border group">
            <summary className="px-4 py-3 text-sm font-medium text-text-primary cursor-pointer list-none flex items-center justify-between">
              {faq.q}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-180">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div className="px-4 pb-3">
              <p className="text-sm text-text-secondary">{faq.a}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p className="text-sm text-amber-700 font-medium">Em construcao</p>
        <p className="text-xs text-amber-600 mt-1">Mais conteudo sera adicionado em breve.</p>
      </div>
    </div>
  );
}
