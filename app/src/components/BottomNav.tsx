"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MascotAvatar from "./MascotAvatar";
import { useLocale } from "./LocaleContext";

interface BottomNavProps {
  onChatOpen: () => void;
}

export default function BottomNav({ onChatOpen }: BottomNavProps) {
  const pathname = usePathname();
  const { t } = useLocale();

  const navItems = [
    {
      label: t.home,
      href: "/",
      icon: (active: boolean) => (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={active ? "#F97316" : "none"}
          stroke={active ? "#F97316" : "#94A3B8"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: t.notes,
      href: "/notes",
      icon: (active: boolean) => (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={active ? "#F97316" : "#94A3B8"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      label: t.agenda,
      href: "/agenda",
      icon: (active: boolean) => (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={active ? "#F97316" : "#94A3B8"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <rect x="7" y="14" width="4" height="4" rx="0.5" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border z-40">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-1 px-3"
            >
              {item.icon(isActive)}
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-primary" : "text-text-muted"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Mascot / Chatbot button */}
        <button
          onClick={onChatOpen}
          className="flex flex-col items-center gap-0.5 py-1 px-3"
        >
          <MascotAvatar size="sm" />
          <span className="text-xs font-medium text-text-muted">{t.chat}</span>
        </button>
      </div>
    </nav>
  );
}
