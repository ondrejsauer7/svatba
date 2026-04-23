import React from "react";
import type { Note, Person } from "../types";
import { formatDate } from "../lib/utils";
import {
  badgeRowStyle,
  badgeStyle,
  buttonRowStyle,
  cardListStyle,
  cardStyle,
  cardTitleStyle,
  dangerButtonStyle,
  emptyStyle,
  formStackStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  sectionStyle,
  textareaStyle,
  inputStyle,
  metaGridStyle,
} from "../ui";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  people: Person[];
  noteInput: string;
  setNoteInput: (v: string) => void;
  noteAuthor: Person;
  setNoteAuthor: (v: Person) => void;
  editingNoteId: string | null;
  saveNote: () => void;
  resetNoteForm: () => void;
  saving: boolean;
  notes: Note[];
  startEditNote: (note: Note) => void;
  deleteNote: (id: string) => void;
};

export default function NotesSection(props: Props) {
  const {
    isOpen,
    onToggle,
    people,
    noteInput,
    setNoteInput,
    noteAuthor,
    setNoteAuthor,
    editingNoteId,
    saveNote,
    resetNoteForm,
    saving,
    notes,
    startEditNote,
    deleteNote,
  } = props;
  const editFormRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!editingNoteId || !isOpen || !editFormRef.current) return;

    const scrollToForm = () => {
      const node = editFormRef.current;
      if (!node) return;
      const top = window.scrollY + node.getBoundingClientRect().top - 20;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    };

    const rafId = window.requestAnimationFrame(scrollToForm);
    const timeoutId = window.setTimeout(scrollToForm, 260);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [editingNoteId, isOpen]);

  const canSaveNote = noteInput.trim().length > 0;

  function handleNoteKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    const shouldSave = (event.ctrlKey || event.metaKey) && event.key === "Enter";
    if (!shouldSave) return;
    event.preventDefault();
    if (!saving && canSaveNote) {
      saveNote();
    }
  }

  return (
    <section style={sectionStyle}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "14px 16px",
          borderRadius: 16,
          border: "none",
          fontWeight: 800,
          fontSize: 20,
          marginBottom: 12,
          cursor: "pointer",
          color: "#ffffff",
          background: "linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)",
          boxShadow: "0 8px 20px rgba(147, 51, 234, 0.25)",
        }}
      >
        📝 Poznámky / Nápady {isOpen ? "▲" : "▼"}
      </button>

      {isOpen && (
        <>
          <div ref={editFormRef} style={formStackStyle}>
            {editingNoteId && (
              <div
                style={{
                  border: "1px solid #d8b4fe",
                  background: "#faf5ff",
                  color: "#6b21a8",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontWeight: 700,
                }}
              >
                Editacni rezim: upravujes existujici poznamku.
              </div>
            )}
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              onKeyDown={handleNoteKeyDown}
              placeholder="Sem si pište nápady, co probrat, co dokoupit, co rozhodnout..."
              style={textareaStyle}
            />

            <div style={{ color: "#6b7280", fontSize: 13 }}>
              Tip: Ctrl/Cmd + Enter ulozi poznamku.
            </div>

            <select
              value={noteAuthor}
              onChange={(e) => setNoteAuthor(e.target.value as Person)}
              style={inputStyle}
            >
              {people.map((person) => (
                <option key={person} value={person}>
                  Autor: {person}
                </option>
              ))}
            </select>

            <div style={buttonRowStyle}>
              <button
                onClick={saveNote}
                style={primaryButtonStyle}
                disabled={saving || !canSaveNote}
              >
                {saving
                  ? "Ukladam..."
                  : editingNoteId
                  ? "Ulozit zmeny"
                  : "Pridat poznamku"}
              </button>

              {editingNoteId && (
                <button
                  onClick={resetNoteForm}
                  style={secondaryButtonStyle}
                  disabled={saving}
                >
                  Zrušit
                </button>
              )}
            </div>
          </div>

          <div style={cardListStyle}>
            {notes.length === 0 && (
              <div style={emptyStyle}>Zatím žádné poznámky.</div>
            )}

            {notes.map((note) => (
              <div key={note.id} style={cardStyle}>
                <div style={badgeRowStyle}>
                  <span style={badgeStyle}>{note.author}</span>
                </div>

                <div style={cardTitleStyle}>Poznámka</div>

                <div style={metaGridStyle}>
                  <div>{note.text}</div>
                  <div>
                    Upraveno: <strong>{formatDate(note.updated_at)}</strong>
                  </div>
                </div>

                <div style={buttonRowStyle}>
                  <button
                    onClick={() => startEditNote(note)}
                    style={secondaryButtonStyle}
                  >
                    Upravit
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    style={dangerButtonStyle}
                  >
                    Smazat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

