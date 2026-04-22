import React from "react";
import {
  cardListStyle,
  cardStyle,
  cardTitleStyle,
  metaGridStyle,
  sectionStyle,
  sectionToggleStyle,
} from "../ui";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  taskStats: {
    high: number;
    waiting: number;
    byOwner: { Ondra: number; Kája: number; Oba: number };
  };
  budgetStats: {
    totalPlanned: number;
    totalActual: number;
    totalPaid: number;
    totalRemaining: number;
    overdue: number;
  };
  guestStats: {
    pending: number;
    totalPeople: number;
    confirmed: number;
    sleeping: number;
    children: number;
  };
  recentItems: {
    task: string;
    budget: string;
    guest: string;
  };
};

export default function DashboardSection({
  isOpen,
  onToggle,
  taskStats,
  budgetStats,
  guestStats,
  recentItems,
}: Props) {
  return (
    <section style={sectionStyle}>
      <button onClick={onToggle} style={sectionToggleStyle}>
        Přehled pro vás dva {isOpen ? "▲" : "▼"}
      </button>

      {isOpen && (
        <div style={cardListStyle}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Co hoří</div>
            <div style={metaGridStyle}>
              <div>Vysoká priorita: <strong>{taskStats.high}</strong></div>
              <div>Úkoly ve stavu Čeká: <strong>{taskStats.waiting}</strong></div>
              <div>Po splatnosti: <strong>{budgetStats.overdue}</strong></div>
              <div>Hosté bez odpovědi: <strong>{guestStats.pending}</strong></div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>Kdo co řeší</div>
            <div style={metaGridStyle}>
              <div>Ondra má úkolů: <strong>{taskStats.byOwner.Ondra}</strong></div>
              <div>Kája má úkolů: <strong>{taskStats.byOwner.Kája}</strong></div>
              <div>Společných úkolů: <strong>{taskStats.byOwner.Oba}</strong></div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>Finance</div>
            <div style={metaGridStyle}>
              <div>Plán: <strong>{budgetStats.totalPlanned} Kč</strong></div>
              <div>Skutečnost: <strong>{budgetStats.totalActual} Kč</strong></div>
              <div>Už zaplaceno: <strong>{budgetStats.totalPaid} Kč</strong></div>
              <div>Zbývá: <strong>{budgetStats.totalRemaining} Kč</strong></div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>Hosté</div>
            <div style={metaGridStyle}>
              <div>Lidí celkem: <strong>{guestStats.totalPeople}</strong></div>
              <div>Potvrzeno: <strong>{guestStats.confirmed}</strong></div>
              <div>Přespání: <strong>{guestStats.sleeping}</strong></div>
              <div>Děti: <strong>{guestStats.children}</strong></div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>Poslední změny</div>
            <div style={metaGridStyle}>
              <div>Úkol: <strong>{recentItems.task}</strong></div>
              <div>Rozpočet: <strong>{recentItems.budget}</strong></div>
              <div>Host: <strong>{recentItems.guest}</strong></div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
