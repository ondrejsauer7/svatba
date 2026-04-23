import React from "react";
import { formatDate } from "../lib/utils";
import {
  cardListStyle,
  cardStyle,
  cardTitleStyle,
  metaGridStyle,
  sectionStyle,
} from "../ui";

type DashboardTask = {
  id: string;
  text: string;
  deadline: string | null;
};

type DashboardBudget = {
  id: string;
  name: string;
  due_date: string | null;
  payment_status: string;
};

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
  nextTasks: DashboardTask[];
  nextBudgetItems: DashboardBudget[];
};

function dashboardCardStyle(
  background: string,
  borderColor: string
): React.CSSProperties {
  return {
    ...cardStyle,
    background,
    border: `1px solid ${borderColor}`,
  };
}

export default function DashboardSection({
  isOpen,
  onToggle,
  taskStats,
  budgetStats,
  guestStats,
  recentItems,
  nextTasks,
  nextBudgetItems,
}: Props) {
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
          background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.25)",
        }}
      >
        📊 Přehled pro vás dva {isOpen ? "▲" : "▼"}
      </button>

      {isOpen && (
        <div style={cardListStyle}>
          <div style={dashboardCardStyle("#eff6ff", "#bfdbfe")}>
            <div style={{ ...cardTitleStyle, color: "#1d4ed8" }}>🔥 Co hoří</div>
            <div style={metaGridStyle}>
              <div>Vysoká priorita: <strong>{taskStats.high}</strong></div>
              <div>Úkoly ve stavu Čeká: <strong>{taskStats.waiting}</strong></div>
              <div>Po splatnosti: <strong>{budgetStats.overdue}</strong></div>
              <div>Hosté bez odpovědi: <strong>{guestStats.pending}</strong></div>
            </div>
          </div>

          <div style={dashboardCardStyle("#eef2ff", "#c7d2fe")}>
            <div style={{ ...cardTitleStyle, color: "#4338ca" }}>👥 Kdo co řeší</div>
            <div style={metaGridStyle}>
              <div>Ondra má úkolů: <strong>{taskStats.byOwner.Ondra}</strong></div>
              <div>Kája má úkolů: <strong>{taskStats.byOwner.Kája}</strong></div>
              <div>Společných úkolů: <strong>{taskStats.byOwner.Oba}</strong></div>
            </div>
          </div>

          <div style={dashboardCardStyle("#fff7ed", "#fdba74")}>
            <div style={{ ...cardTitleStyle, color: "#c2410c" }}>💰 Finance</div>
            <div style={metaGridStyle}>
              <div>Plán: <strong>{budgetStats.totalPlanned} Kč</strong></div>
              <div>Skutečnost: <strong>{budgetStats.totalActual} Kč</strong></div>
              <div>Už zaplaceno: <strong>{budgetStats.totalPaid} Kč</strong></div>
              <div>Zbývá: <strong>{budgetStats.totalRemaining} Kč</strong></div>
            </div>
          </div>

          <div style={dashboardCardStyle("#ecfdf5", "#86efac")}>
            <div style={{ ...cardTitleStyle, color: "#15803d" }}>👨‍👩‍👧‍👦 Hosté</div>
            <div style={metaGridStyle}>
              <div>Lidí celkem: <strong>{guestStats.totalPeople}</strong></div>
              <div>Potvrzeno: <strong>{guestStats.confirmed}</strong></div>
              <div>Přespání: <strong>{guestStats.sleeping}</strong></div>
              <div>Děti: <strong>{guestStats.children}</strong></div>
            </div>
          </div>

          <div style={dashboardCardStyle("#fef2f2", "#fca5a5")}>
            <div style={{ ...cardTitleStyle, color: "#b91c1c" }}>📌 Nejbližší úkoly</div>
            <div style={metaGridStyle}>
              {nextTasks.length === 0 && <div>Žádné úkoly s termínem.</div>}
              {nextTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    padding: "8px 10px",
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: 10,
                  }}
                >
                  {task.text} — <strong>{formatDate(task.deadline)}</strong>
                </div>
              ))}
            </div>
          </div>

          <div style={dashboardCardStyle("#faf5ff", "#d8b4fe")}>
            <div style={{ ...cardTitleStyle, color: "#7e22ce" }}>🧾 Nejbližší platby</div>
            <div style={metaGridStyle}>
              {nextBudgetItems.length === 0 && <div>Žádné platby s termínem.</div>}
              {nextBudgetItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "8px 10px",
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: 10,
                  }}
                >
                  {item.name} — <strong>{formatDate(item.due_date)}</strong>
                </div>
              ))}
            </div>
          </div>

          <div style={dashboardCardStyle("#f8fafc", "#cbd5e1")}>
            <div style={{ ...cardTitleStyle, color: "#334155" }}>🕘 Poslední změny</div>
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
