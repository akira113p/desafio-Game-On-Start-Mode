"use client";

import { useLocale } from "@/components/LocaleContext";

export default function SettingsPage() {
  const { t } = useLocale();

  return (
    <div className="px-4 py-8 space-y-4">
      <h2 className="text-xl font-semibold text-text-primary">{t.settings}</h2>

      <div className="bg-surface rounded-2xl border border-border divide-y divide-border">
        {[t.profile, t.language, "Notificacoes", "Tema", "Sobre"].map((item) => (
          <div key={item} className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm text-text-primary">{item}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p className="text-sm text-amber-700 font-medium">Em construcao</p>
        <p className="text-xs text-amber-600 mt-1">Esta pagina sera implementada em breve.</p>
      </div>
    </div>
  );
}
