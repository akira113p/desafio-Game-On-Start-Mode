"use client";

import { useState } from "react";
import Header from "./Header";
import BottomNav from "./BottomNav";
import ChatbotModal from "./ChatbotModal";
import { LocaleProvider } from "./LocaleContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <LocaleProvider>
      <div className="min-h-screen max-w-md mx-auto bg-surface relative shadow-xl">
        <Header />
        <main className="pb-20">{children}</main>
        <BottomNav onChatOpen={() => setChatOpen(true)} />
        <ChatbotModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </LocaleProvider>
  );
}
