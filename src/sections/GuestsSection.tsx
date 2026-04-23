import React from "react";
import type { Guest, GuestSide, Person, RsvpStatus } from "../types";
import {
  badgeRowStyle,
  badgeStyle,
  buttonRowStyle,
  cardListStyle,
  cardStyle,
  cardTitleStyle,
  chipStyle,
  chipsWrapStyle,
  dangerButtonStyle,
  emptyStyle,
  filterCardStyle,
  filterLabelStyle,
  filterTitleStyle,
  formStackStyle,
  inputStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  sectionStyle,
  statBoxStyle,
  statsWrapStyle,
  metaGridStyle,
  checkboxLineStyle,
} from "../ui";
import { formatDate } from "../lib/utils";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  guestSides: GuestSide[];
  rsvpStatuses: RsvpStatus[];
  people: Person[];
  guestStats: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
    totalPeople: number;
    sleeping: number;
    children: number;
  };
  guestName: string;
  setGuestName: (v: string) => void;
  guestSide: GuestSide;
  setGuestSide: (v: GuestSide) => void;
  guestRsvp: RsvpStatus;
  setGuestRsvp: (v: RsvpStatus) => void;
  guestCount: string;
  setGuestCount: (v: string) => void;
  guestAccommodation: boolean;
  setGuestAccommodation: (v: boolean) => void;
  guestChild: boolean;
  setGuestChild: (v: boolean) => void;
  guestUpdatedBy: Person;
  setGuestUpdatedBy: (v: Person) => void;
  guestNote: string;
  setGuestNote: (v: string) => void;
  editingGuestId: string | null;
  saveGuest: () => void;
  resetGuestForm: () => void;
  saving: boolean;
  guestSideFilter: GuestSide | "Vše";
  setGuestSideFilter: (v: GuestSide | "Vše") => void;
  guestRsvpFilter: RsvpStatus | "Vše";
  setGuestRsvpFilter: (v: RsvpStatus | "Vše") => void;
  guestSearch: string;
  setGuestSearch: (v: string) => void;
  filteredGuests: Guest[];
  toggleGuest: (guest: Guest) => void;
  startEditGuest: (guest: Guest) => void;
  deleteGuest: (id: string) => void;
  quickToggleGuestAccommodation: (guest: Guest) => void;
  quickToggleGuestChild: (guest: Guest) => void;
};

export default function GuestsSection(props: Props) {
  const {
    isOpen,
    onToggle,
    guestSides,
    rsvpStatuses,
    people,
    guestStats,
    guestName,
    setGuestName,
    guestSide,
    setGuestSide,
    guestRsvp,
    setGuestRsvp,
    guestCount,
    setGuestCount,
    guestAccommodation,
    setGuestAccommodation,
    guestChild,
    setGuestChild,
    guestUpdatedBy,
    setGuestUpdatedBy,
    guestNote,
    setGuestNote,
    editingGuestId,
    saveGuest,
    resetGuestForm,
    saving,
    guestSideFilter,
    setGuestSideFilter,
    guestRsvpFilter,
    setGuestRsvpFilter,
    guestSearch,
    setGuestSearch,
    filteredGuests,
    toggleGuest,
    startEditGuest,
    deleteGuest,
    quickToggleGuestAccommodation,
    quickToggleGuestChild,
  } = props;

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
          background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
          boxShadow: "0 8px 20px rgba(22, 163, 74, 0.25)",
        }}
      >
        👨‍👩‍👧‍👦 Hosté {isOpen ? "▲" : "▼"}
      </button>

      {isOpen && (
        <>
          <div style={statsWrapStyle}>
            <div style={statBoxStyle}>Hostů: {guestStats.total}</div>
            <div style={statBoxStyle}>Potvrzeno: {guestStats.confirmed}</div>
            <div style={statBoxStyle}>Bez odpovědi: {guestStats.pending}</div>
            <div style={statBoxStyle}>Odmítlo: {guestStats.declined}</div>
            <div style={statBoxStyle}>Lidí celkem: {guestStats.totalPeople}</div>
            <div style={statBoxStyle}>Přespání: {guestStats.sleeping}</div>
            <div style={statBoxStyle}>Děti: {guestStats.children}</div>
          </div>

          <div style={formStackStyle}>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Jméno hosta"
              style={inputStyle}
            />

            <select value={guestSide} onChange={(e) => setGuestSide(e.target.value as GuestSide)} style={inputStyle}>
              {guestSides.map((side) => (
                <option key={side} value={side}>Strana: {side}</option>
              ))}
            </select>

            <select value={guestRsvp} onChange={(e) => setGuestRsvp(e.target.value as RsvpStatus)} style={inputStyle}>
              {rsvpStatuses.map((status) => (
                <option key={status} value={status}>RSVP: {status}</option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              placeholder="Počet osob"
              style={inputStyle}
            />

            <label style={checkboxLineStyle}>
              <input
                type="checkbox"
                checked={guestAccommodation}
                onChange={(e) => setGuestAccommodation(e.target.checked)}
              />
              Bude přespávat
            </label>

            <label style={checkboxLineStyle}>
              <input
                type="checkbox"
                checked={guestChild}
                onChange={(e) => setGuestChild(e.target.checked)}
              />
              Je to dítě
            </label>

            <select value={guestUpdatedBy} onChange={(e) => setGuestUpdatedBy(e.target.value as Person)} style={inputStyle}>
              {people.map((person) => (
                <option key={person} value={person}>Update dělal: {person}</option>
              ))}
            </select>

            <input
              value={guestNote}
              onChange={(e) => setGuestNote(e.target.value)}
              placeholder="Komentář / poznámka"
              style={inputStyle}
            />

            <div style={buttonRowStyle}>
              <button onClick={saveGuest} style={primaryButtonStyle} disabled={saving}>
                {editingGuestId ? "Uložit" : "Přidat"}
              </button>
              {editingGuestId && (
                <button onClick={resetGuestForm} style={secondaryButtonStyle}>
                  Zrušit
                </button>
              )}
            </div>
          </div>

          <div style={filterCardStyle}>
            <div style={filterTitleStyle}>Filtry</div>

            <input
              value={guestSearch}
              onChange={(e) => setGuestSearch(e.target.value)}
              placeholder="Hledat hosta nebo poznámku"
              style={inputStyle}
            />

            <div style={chipsWrapStyle}>
              <span style={filterLabelStyle}>Strana:</span>
              <button style={chipStyle(guestSideFilter === "Vše")} onClick={() => setGuestSideFilter("Vše")}>
                Vše
              </button>
              {guestSides.map((side) => (
                <button
                  key={side}
                  style={chipStyle(guestSideFilter === side)}
                  onClick={() => setGuestSideFilter(side)}
                >
                  {side}
                </button>
              ))}
            </div>

            <div style={chipsWrapStyle}>
              <span style={filterLabelStyle}>RSVP:</span>
              <button style={chipStyle(guestRsvpFilter === "Vše")} onClick={() => setGuestRsvpFilter("Vše")}>
                Vše
              </button>
              {rsvpStatuses.map((status) => (
                <button
                  key={status}
                  style={chipStyle(guestRsvpFilter === status)}
                  onClick={() => setGuestRsvpFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div style={cardListStyle}>
            {filteredGuests.length === 0 && <div style={emptyStyle}>Žádní hosté pro aktuální filtr.</div>}

            {filteredGuests.map((guest) => (
              <div key={guest.id} style={cardStyle}>
                <div style={badgeRowStyle}>
                  <span style={badgeStyle}>Rodina</span>
                  <span style={badgeStyle}>{guest.side || "Společní"}</span>
                  <span style={badgeStyle}>{guest.rsvp_status || "Bez odpovědi"}</span>
                </div>

                <div style={cardTitleStyle}>{guest.name}</div>

                <div style={metaGridStyle}>
                  <div>Počet osob: <strong>{guest.guest_count || 1}</strong></div>
                  <div>Přespání: <strong>{guest.accommodation ? "Ano" : "Ne"}</strong></div>
                  <div>Dítě: <strong>{guest.child ? "Ano" : "Ne"}</strong></div>
                  <div>Komentář: <strong>{guest.note || "-"}</strong></div>
                  <div>Poslední update: <strong>{guest.updated_by || "-"}</strong></div>
                  <div>Upraveno: <strong>{formatDate(guest.updated_at)}</strong></div>
                </div>

                <div style={buttonRowStyle}>
                  <button onClick={() => toggleGuest(guest)} style={secondaryButtonStyle}>
                    {guest.confirmed ? "Zrušit potvrzení" : "Potvrdit"}
                  </button>
                  <button onClick={() => quickToggleGuestAccommodation(guest)} style={secondaryButtonStyle}>
                    {guest.accommodation ? "Zrušit přespání" : "Nastavit přespání"}
                  </button>
                  <button onClick={() => quickToggleGuestChild(guest)} style={secondaryButtonStyle}>
                    {guest.child ? "Není dítě" : "Je dítě"}
                  </button>
                  <button onClick={() => startEditGuest(guest)} style={secondaryButtonStyle}>
                    Upravit
                  </button>
                  <button onClick={() => deleteGuest(guest.id)} style={dangerButtonStyle}>
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
