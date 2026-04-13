"use client";

import { useLocale } from "@/components/LocaleContext";
import MascotAvatar from "@/components/MascotAvatar";

export default function ProfilePage() {
  const { t } = useLocale();

  return (
    <div className="px-4 py-8 flex flex-col items-center gap-6">
      <MascotAvatar size="xl" />
      <h2 className="text-xl font-semibold text-text-primary">{t.profile}</h2>
      <div className="w-full bg-surface rounded-2xl border border-border p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-light to-accent-light flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-4">
          U
        </div>
        <p className="text-sm text-text-secondary mb-1">usuario@empresa.com</p>
        <span className="inline-block px-3 py-1 bg-primary-light text-primary text-xs font-medium rounded-full">
          Novo Funcionario
        </span>
      </div>
      <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p className="text-sm text-amber-700 font-medium">Em construcao</p>
        <p className="text-xs text-amber-600 mt-1">Esta pagina sera implementada em breve.</p>
      </div>
    </div>
  );
}
