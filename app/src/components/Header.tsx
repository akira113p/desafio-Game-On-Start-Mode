"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import MascotAvatar from "./MascotAvatar";
import { useLocale } from "./LocaleContext";
import type { Locale } from "@/data/i18n";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const getTitle = () => {
    if (pathname === "/agenda") return t.agenda;
    if (pathname === "/notes") return t.postItsNotes;
    if (pathname === "/profile") return t.profile;
    if (pathname === "/settings") return t.settings;
    if (pathname === "/help") return t.help;
    return t.appName;
  };

  const showBack = pathname !== "/";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setDrawerOpen(false);
    router.push("/");
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const menuItems = [
    { label: t.profile, href: "/profile" },
    { label: t.settings, href: "/settings" },
    { label: t.help, href: "/help" },
  ];

  return (
    <>
      <header className="sticky top-0 glass border-b border-border z-30">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {showBack ? (
              <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </Link>
            ) : (
              <button
                onClick={() => setDrawerOpen(true)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            <h1 className="text-lg font-semibold text-text-primary">{getTitle()}</h1>
          </div>

          <div className="flex items-center gap-2">
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="px-2 py-1 text-xs font-bold rounded-lg border border-border bg-surface-muted text-text-secondary hover:border-primary hover:text-primary transition-colors uppercase"
              >
                {locale}
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-surface rounded-xl border border-border shadow-lg overflow-hidden z-50 min-w-[120px]">
                  {([
                    { code: "pt" as Locale, label: "Portugues" },
                    { code: "en" as Locale, label: "English" },
                  ]).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLocale(lang.code);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        locale === lang.code
                          ? "bg-primary-light text-primary font-medium"
                          : "text-text-secondary hover:bg-surface-muted"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <MascotAvatar size="sm" />
          </div>
        </div>
      </header>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-surface shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
            {/* Drawer header */}
            <div className="px-5 py-6 bg-gradient-to-br from-primary to-primary-dark">
              <div className="flex items-center gap-3">
                <MascotAvatar size="lg" />
                <div>
                  <p className="text-white font-semibold">Game On</p>
                  <p className="text-white/70 text-xs">Start Mode</p>
                </div>
              </div>
            </div>

            {/* Menu items with real navigation */}
            <nav className="flex-1 py-3">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
                >
                  {item.label === t.profile && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                  {item.label === t.settings && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  )}
                  {item.label === t.help && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  )}
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Logout - separate with divider */}
              <div className="border-t border-border mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>{t.logout}</span>
                </button>
              </div>
            </nav>

            {/* Drawer footer */}
            <div className="px-5 py-4 border-t border-border">
              <p className="text-xs text-text-muted">Game On: Start Mode v1.0</p>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] animate-[slideDown_0.3s_ease-out]">
          <div className="bg-text-primary text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Sessao encerrada (Mock)
          </div>
        </div>
      )}
    </>
  );
}
