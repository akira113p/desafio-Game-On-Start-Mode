"use client";

import { useState } from "react";
import { notes as initialNotes, type Note } from "@/data/mockData";
import { useLocale } from "@/components/LocaleContext";

export default function NotesPage() {
  const { t } = useLocale();
  const [notesList, setNotesList] = useState<Note[]>(initialNotes);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteType, setNewNoteType] = useState<"note" | "checklist">("note");
  const [checklistTitle, setChecklistTitle] = useState("");
  const [checklistItems, setChecklistItems] = useState<string[]>([""]);

  const colors = ["#FFF9C4", "#C8E6C9", "#BBDEFB", "#F8BBD0", "#E1BEE7", "#FFE0B2"];

  const toggleCheckItem = (noteId: string, itemIndex: number) => {
    setNotesList((prev) =>
      prev.map((note) => {
        if (note.id !== noteId || !note.checkItems) return note;
        const updated = [...note.checkItems];
        updated[itemIndex] = { ...updated[itemIndex], checked: !updated[itemIndex].checked };
        return { ...note, checkItems: updated };
      })
    );
  };

  const deleteNote = (id: string) => {
    setNotesList((prev) => prev.filter((n) => n.id !== id));
  };

  const resetForm = () => {
    setNewNoteContent("");
    setNewNoteType("note");
    setChecklistTitle("");
    setChecklistItems([""]);
    setShowAddNote(false);
  };

  const addNote = () => {
    const color = colors[Math.floor(Math.random() * colors.length)];

    if (newNoteType === "checklist") {
      const validItems = checklistItems.filter((item) => item.trim() !== "");
      if (!checklistTitle.trim() || validItems.length === 0) return;
      const newNote: Note = {
        id: `note-${Date.now()}`,
        content: checklistTitle,
        color,
        type: "checklist",
        checkItems: validItems.map((text) => ({ text, checked: false })),
      };
      setNotesList((prev) => [...prev, newNote]);
    } else {
      if (!newNoteContent.trim()) return;
      const newNote: Note = {
        id: `note-${Date.now()}`,
        content: newNoteContent,
        color,
        type: "note",
      };
      setNotesList((prev) => [...prev, newNote]);
    }

    resetForm();
  };

  const updateChecklistItem = (index: number, value: string) => {
    setChecklistItems((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addChecklistItem = () => {
    setChecklistItems((prev) => [...prev, ""]);
  };

  const removeChecklistItem = (index: number) => {
    if (checklistItems.length <= 1) return;
    setChecklistItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="px-4 py-4">
      {/* Cork board */}
      <div
        className="rounded-2xl p-4 min-h-[70vh] relative"
        style={{
          background: "linear-gradient(135deg, #D4A574 0%, #C49A6C 50%, #B8956A 100%)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        {/* Cork texture overlay */}
        <div
          className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #8B6914 1px, transparent 1px)`,
            backgroundSize: "8px 8px",
          }}
        />

        {/* Wooden frame */}
        <div className="absolute inset-0 rounded-2xl border-4 border-amber-800/40 pointer-events-none" />

        {/* Post-its grid */}
        <div className="relative grid grid-cols-2 gap-4 p-2">
          {notesList.map((note, index) => {
            const rotation = (index % 2 === 0 ? -2 : 2) + (index % 3 - 1);
            return (
              <div
                key={note.id}
                className="post-it-shadow rounded-sm p-3 min-h-[120px] relative group"
                style={{
                  backgroundColor: note.color,
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                {/* Pin */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 border-2 border-red-700 shadow-sm z-10" />

                {/* Delete button */}
                <button
                  onClick={() => deleteNote(note.id)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-400/80 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  x
                </button>

                {/* Content */}
                {note.type === "checklist" && note.checkItems ? (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-gray-700 mb-2 underline">
                      {note.content}
                    </p>
                    <div className="space-y-1.5">
                      {note.checkItems.map((item, i) => (
                        <label
                          key={i}
                          className="flex items-start gap-1.5 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleCheckItem(note.id, i)}
                            className="mt-0.5 accent-primary"
                          />
                          <span
                            className={`text-[11px] text-gray-700 leading-tight ${
                              item.checked ? "line-through opacity-60" : ""
                            }`}
                          >
                            {item.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p
                    className="text-xs text-gray-700 pt-3 leading-relaxed"
                    style={{ fontFamily: "'Patrick Hand', 'Comic Sans MS', cursive" }}
                  >
                    {note.content}
                  </p>
                )}

                {/* Linked meeting badge */}
                {note.linkedMeetingId && (
                  <div className="absolute bottom-1.5 right-1.5">
                    <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add note card */}
          {showAddNote ? (
            <div className="post-it-shadow rounded-sm p-3 min-h-[120px] bg-white/95 flex flex-col gap-2 col-span-2">
              {/* Type selector */}
              <div className="flex gap-1 mb-1">
                <button
                  onClick={() => setNewNoteType("note")}
                  className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                    newNoteType === "note"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t.textNote}
                </button>
                <button
                  onClick={() => setNewNoteType("checklist")}
                  className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                    newNoteType === "checklist"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t.checklist}
                </button>
              </div>

              {newNoteType === "note" ? (
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder={t.writeNote}
                  className="flex-1 text-xs bg-transparent outline-none resize-none text-gray-700 min-h-[60px]"
                  autoFocus
                />
              ) : (
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={checklistTitle}
                    onChange={(e) => setChecklistTitle(e.target.value)}
                    placeholder={t.listTitle}
                    className="w-full text-xs font-bold bg-transparent outline-none text-gray-700 border-b border-gray-300 pb-1"
                    autoFocus
                  />
                  <div className="space-y-1">
                    {checklistItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <input type="checkbox" disabled className="opacity-40 accent-primary" />
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateChecklistItem(i, e.target.value)}
                          placeholder={t.itemPlaceholder}
                          className="flex-1 text-[11px] bg-transparent outline-none text-gray-700"
                        />
                        {checklistItems.length > 1 && (
                          <button
                            onClick={() => removeChecklistItem(i)}
                            className="text-gray-400 hover:text-red-400 text-xs"
                          >
                            x
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addChecklistItem}
                    className="text-[11px] text-primary font-medium hover:underline"
                  >
                    {t.addItem}
                  </button>
                </div>
              )}

              <div className="flex gap-1 mt-1">
                <button
                  onClick={addNote}
                  className="flex-1 py-1.5 bg-primary text-white text-[11px] rounded font-medium hover:bg-primary-dark transition-colors"
                >
                  {t.save}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 py-1.5 bg-gray-200 text-gray-600 text-[11px] rounded font-medium hover:bg-gray-300 transition-colors"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddNote(true)}
              className="rounded-sm border-2 border-dashed border-white/40 min-h-[120px] flex flex-col items-center justify-center gap-2 hover:border-white/70 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="text-white/70 text-xs font-medium">{t.addNote}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
