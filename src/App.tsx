import React, { useEffect, useMemo, useState } from "react";

type Task = {
  id: string;
  text: string;
  deadline: string | null;
  done: boolean;
};

type BudgetCategory =
  | "Místo"
  | "Fotograf"
  | "Prstýnky"
  | "Oblečení"
  | "Hudba"
  | "Jídlo"
  | "Dekorace"
  | "Dort"
  | "Doprava"
  | "Ostatní";

type BudgetItem = {
  id: string;
  category: BudgetCategory;
  name: string;
  planned: number;
  actual: number;
  deposit: number;
  fully_paid: boolean;
};

type GuestGroup = "Rodina" | "Kamarádi" | "Práce" | "Ostatní";

type Guest = {
  id: string;
  name: string;
  group: GuestGroup;
  confirmed: boolean;
  note: string | null;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

const categories: BudgetCategory[] = [
  "Místo",
  "Fotograf",
  "Prstýnky",
  "Oblečení",
  "Hudba",
  "Jídlo",
  "Dekorace",
  "Dort",
  "Doprava",
  "Ostatní",
];

const guestGroups: GuestGroup[] = [
  "Rodina",
  "Kamarádi",
  "Práce",
  "Ostatní",
];

async function supabaseRequest(
  path: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Supabase request failed");
  }

  if (response.status === 204) return null;
  return response.json();
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  const [taskInput, setTaskInput] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [category, setCategory] = useState<BudgetCategory>("Ostatní");
  const [budgetName, setBudgetName] = useState("");
  const [planned, setPlanned] = useState("");
  const [actual, setActual] = useState("");
  const [deposit, setDeposit] = useState("");
  const [fullyPaid, setFullyPaid] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestGroup, setGuestGroup] = useState<GuestGroup>("Rodina");
  const [guestNote, setGuestNote] = useState("");
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [tasksData, budgetData, guestsData] = await Promise.all([
        supabaseRequest("tasks?select=*"),
        supabaseRequest("budget?select=*"),
        supabaseRequest("guests?select=*"),
      ]);

      setTasks((tasksData || []) as Task[]);
      setBudgetItems((budgetData || []) as BudgetItem[]);
      setGuests((guestsData || []) as Guest[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při načítání");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function resetTaskForm() {
    setTaskInput("");
    setTaskDeadline("");
    setEditingTaskId(null);
  }

  function resetBudgetForm() {
    setCategory("Ostatní");
    setBudgetName("");
    setPlanned("");
    setActual("");
    setDeposit("");
    setFullyPaid(false);
    setEditingBudgetId(null);
  }

  function resetGuestForm() {
    setGuestName("");
    setGuestGroup("Rodina");
    setGuestNote("");
    setEditingGuestId(null);
  }

  async function saveTask() {
    if (!taskInput.trim()) return;

    try {
      setSaving(true);
      setError("");

      if (editingTaskId) {
        const updated = await supabaseRequest(`tasks?id=eq.${editingTaskId}`, {
          method: "PATCH",
          body: JSON.stringify({
            text: taskInput.trim(),
            deadline: taskDeadline || null,
          }),
        });

        const row = updated?.[0] as Task;
        setTasks((prev) => prev.map((t) => (t.id === row.id ? row : t)));
      } else {
        const inserted = await supabaseRequest("tasks", {
          method: "POST",
          body: JSON.stringify([
            {
              text: taskInput.trim(),
              deadline: taskDeadline || null,
              done: false,
            },
          ]),
        });

        const row = inserted?.[0] as Task;
        setTasks((prev) => [row, ...prev]);
      }

      resetTaskForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při ukládání úkolu");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: Task) {
    try {
      setError("");
      const updated = await supabaseRequest(`tasks?id=eq.${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ done: !task.done }),
      });

      const row = updated?.[0] as Task;
      setTasks((prev) => prev.map((t) => (t.id === row.id ? row : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při změně úkolu");
    }
  }

  async function deleteTask(id: string) {
    try {
      setError("");
      await supabaseRequest(`tasks?id=eq.${id}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });

      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (editingTaskId === id) resetTaskForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při mazání úkolu");
    }
  }

  function startEditTask(task: Task) {
    setTaskInput(task.text);
    setTaskDeadline(task.deadline || "");
    setEditingTaskId(task.id);
  }

  async function saveBudgetItem() {
    if (!budgetName.trim()) return;

    const payload = {
      category,
      name: budgetName.trim(),
      planned: Number(planned) || 0,
      actual: Number(actual) || 0,
      deposit: Number(deposit) || 0,
      fully_paid: fullyPaid,
    };

    try {
      setSaving(true);
      setError("");

      if (editingBudgetId) {
        const updated = await supabaseRequest(`budget?id=eq.${editingBudgetId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        const row = updated?.[0] as BudgetItem;
        setBudgetItems((prev) =>
          prev.map((item) => (item.id === row.id ? row : item))
        );
      } else {
        const inserted = await supabaseRequest("budget", {
          method: "POST",
          body: JSON.stringify([payload]),
        });

        const row = inserted?.[0] as BudgetItem;
        setBudgetItems((prev) => [row, ...prev]);
      }

      resetBudgetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Chyba při ukládání rozpočtu"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteBudgetItem(id: string) {
    try {
      setError("");
      await supabaseRequest(`budget?id=eq.${id}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });

      setBudgetItems((prev) => prev.filter((item) => item.id !== id));
      if (editingBudgetId === id) resetBudgetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Chyba při mazání rozpočtu"
      );
    }
  }

  function startEditBudgetItem(item: BudgetItem) {
    setCategory(item.category);
    setBudgetName(item.name);
    setPlanned(String(item.planned));
    setActual(String(item.actual));
    setDeposit(String(item.deposit));
    setFullyPaid(item.fully_paid);
    setEditingBudgetId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveGuest() {
    if (!guestName.trim()) return;

    const payload = {
      name: guestName.trim(),
      group: guestGroup,
      confirmed: false,
      note: guestNote.trim() || null,
    };

    try {
      setSaving(true);
      setError("");

      if (editingGuestId) {
        const existing = guests.find((g) => g.id === editingGuestId);
        const updated = await supabaseRequest(`guests?id=eq.${editingGuestId}`, {
          method: "PATCH",
          body: JSON.stringify({
            ...payload,
            confirmed: existing?.confirmed ?? false,
          }),
        });

        const row = updated?.[0] as Guest;
        setGuests((prev) => prev.map((g) => (g.id === row.id ? row : g)));
      } else {
        const inserted = await supabaseRequest("guests", {
          method: "POST",
          body: JSON.stringify([payload]),
        });

        const row = inserted?.[0] as Guest;
        setGuests((prev) => [row, ...prev]);
      }

      resetGuestForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při ukládání hosta");
    } finally {
      setSaving(false);
    }
  }

  async function toggleGuest(guest: Guest) {
    try {
      setError("");
      const updated = await supabaseRequest(`guests?id=eq.${guest.id}`, {
        method: "PATCH",
        body: JSON.stringify({ confirmed: !guest.confirmed }),
      });

      const row = updated?.[0] as Guest;
      setGuests((prev) => prev.map((g) => (g.id === row.id ? row : g)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při změně hosta");
    }
  }

  async function deleteGuest(id: string) {
    try {
      setError("");
      await supabaseRequest(`guests?id=eq.${id}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });

      setGuests((prev) => prev.filter((g) => g.id !== id));
      if (editingGuestId === id) resetGuestForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při mazání hosta");
    }
  }

  function startEditGuest(guest: Guest) {
    setGuestName(guest.name);
    setGuestGroup(guest.group);
    setGuestNote(guest.note || "");
    setEditingGuestId(guest.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEditTask(task: Task) {
    setTaskInput(task.text);
    setTaskDeadline(task.deadline || "");
    setEditingTaskId(task.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function remaining(item: BudgetItem) {
    if (item.fully_paid) return 0;
    return Math.max(item.actual - item.deposit, 0);
  }

  const taskStats = useMemo(() => {
    const completed = tasks.filter((t) => t.done).length;
    return {
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
    };
  }, [tasks]);

  const budgetStats = useMemo(() => {
    const totalPlanned = budgetItems.reduce((s, i) => s + i.planned, 0);
    const totalActual = budgetItems.reduce((s, i) => s + i.actual, 0);
    const totalDeposit = budgetItems.reduce((s, i) => s + i.deposit, 0);
    const totalRemaining = budgetItems.reduce((s, i) => s + remaining(i), 0);

    return { totalPlanned, totalActual, totalDeposit, totalRemaining };
  }, [budgetItems]);

  const guestStats = useMemo(() => {
    const confirmed = guests.filter((g) => g.confirmed).length;
    return {
      total: guests.length,
      confirmed,
      pending: guests.length - confirmed,
    };
  }, [guests]);

  if (loading) {
    return <div style={loadingStyle}>Načítám data ze Supabase…</div>;
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>💍 Svatba planner</h1>

      <div style={topBarStyle}>
        <button onClick={loadAll} style={primaryButtonStyle}>Obnovit data</button>
        <span style={statusStyle}>{saving ? "Ukládám…" : "Připraveno"}</span>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Checklist</h2>

        <div style={statsWrapStyle}>
          <div style={statBoxStyle}>Úkolů celkem: {taskStats.total}</div>
          <div style={statBoxStyle}>Hotovo: {taskStats.completed}</div>
          <div style={statBoxStyle}>Zbývá: {taskStats.pending}</div>
        </div>

        <div style={formStackStyle}>
          <input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Např. zamluvit místo"
            style={inputStyle}
          />
          <input
            type="date"
            value={taskDeadline}
            onChange={(e) => setTaskDeadline(e.target.value)}
            style={inputStyle}
          />
          <div style={buttonRowStyle}>
            <button onClick={saveTask} style={primaryButtonStyle}>
              {editingTaskId ? "Uložit" : "Přidat"}
            </button>
            {editingTaskId && (
              <button onClick={resetTaskForm} style={secondaryButtonStyle}>
                Zrušit
              </button>
            )}
          </div>
        </div>

        <div style={cardListStyle}>
          {tasks.length === 0 && <div style={emptyStyle}>Zatím žádné úkoly.</div>}

          {tasks.map((task) => (
            <div key={task.id} style={cardStyle}>
              <div style={cardTopRowStyle}>
                <label style={checkboxRowStyle}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task)}
                  />
                  <span
                    style={{
                      ...cardTitleStyle,
                      textDecoration: task.done ? "line-through" : "none",
                      opacity: task.done ? 0.7 : 1,
                    }}
                  >
                    {task.text}
                  </span>
                </label>
              </div>

              <div style={metaStyle}>
                Deadline:{" "}
                <strong>
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString("cs-CZ")
                    : "-"}
                </strong>
              </div>

              <div style={buttonRowStyle}>
                <button
                  onClick={() => startEditTask(task)}
                  style={secondaryButtonStyle}
                >
                  Upravit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={dangerButtonStyle}
                >
                  Smazat
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Rozpočet</h2>

        <div style={statsWrapStyle}>
          <div style={statBoxStyle}>Plán: {budgetStats.totalPlanned} Kč</div>
          <div style={statBoxStyle}>Skutečnost: {budgetStats.totalActual} Kč</div>
          <div style={statBoxStyle}>Zálohy: {budgetStats.totalDeposit} Kč</div>
          <div style={statBoxStyle}>Zbývá: {budgetStats.totalRemaining} Kč</div>
        </div>

        <div style={formStackStyle}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as BudgetCategory)}
            style={inputStyle}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            value={budgetName}
            onChange={(e) => setBudgetName(e.target.value)}
            placeholder="Položka"
            style={inputStyle}
          />

          <input
            type="number"
            value={planned}
            onChange={(e) => setPlanned(e.target.value)}
            placeholder="Plánovaná cena"
            style={inputStyle}
          />

          <input
            type="number"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            placeholder="Skutečná cena"
            style={inputStyle}
          />

          <input
            type="number"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="Záloha"
            style={inputStyle}
          />

          <label style={checkboxLineStyle}>
            <input
              type="checkbox"
              checked={fullyPaid}
              onChange={(e) => setFullyPaid(e.target.checked)}
            />
            Zaplaceno celé
          </label>

          <div style={buttonRowStyle}>
            <button onClick={saveBudgetItem} style={primaryButtonStyle}>
              {editingBudgetId ? "Uložit" : "Přidat"}
            </button>
            {editingBudgetId && (
              <button onClick={resetBudgetForm} style={secondaryButtonStyle}>
                Zrušit
              </button>
            )}
          </div>
        </div>

        <div style={cardListStyle}>
          {budgetItems.length === 0 && (
            <div style={emptyStyle}>Zatím žádné položky rozpočtu.</div>
          )}

          {budgetItems.map((item) => (
            <div key={item.id} style={cardStyle}>
              <div style={badgeStyle}>{item.category}</div>

              <div style={cardTitleStyle}>{item.name}</div>

              <div style={metaGridStyle}>
                <div>Plán: <strong>{item.planned} Kč</strong></div>
                <div>Skutečnost: <strong>{item.actual} Kč</strong></div>
                <div>Záloha: <strong>{item.deposit} Kč</strong></div>
                <div>Zbývá: <strong>{remaining(item)} Kč</strong></div>
                <div>
                  Stav: <strong>{item.fully_paid ? "Zaplaceno" : "Nezaplaceno"}</strong>
                </div>
              </div>

              <div style={buttonRowStyle}>
                <button
                  onClick={() => startEditBudgetItem(item)}
                  style={secondaryButtonStyle}
                >
                  Upravit
                </button>
                <button
                  onClick={() => deleteBudgetItem(item.id)}
                  style={dangerButtonStyle}
                >
                  Smazat
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Hosté</h2>

        <div style={statsWrapStyle}>
          <div style={statBoxStyle}>Hostů celkem: {guestStats.total}</div>
          <div style={statBoxStyle}>Potvrzeno: {guestStats.confirmed}</div>
          <div style={statBoxStyle}>Čeká: {guestStats.pending}</div>
        </div>

        <div style={formStackStyle}>
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Jméno hosta"
            style={inputStyle}
          />

          <select
            value={guestGroup}
            onChange={(e) => setGuestGroup(e.target.value as GuestGroup)}
            style={inputStyle}
          >
            {guestGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          <input
            value={guestNote}
            onChange={(e) => setGuestNote(e.target.value)}
            placeholder="Poznámka"
            style={inputStyle}
          />

          <div style={buttonRowStyle}>
            <button onClick={saveGuest} style={primaryButtonStyle}>
              {editingGuestId ? "Uložit" : "Přidat"}
            </button>
            {editingGuestId && (
              <button onClick={resetGuestForm} style={secondaryButtonStyle}>
                Zrušit
              </button>
            )}
          </div>
        </div>

        <div style={cardListStyle}>
          {guests.length === 0 && <div style={emptyStyle}>Zatím žádní hosté.</div>}

          {guests.map((guest) => (
            <div key={guest.id} style={cardStyle}>
              <div style={cardTopRowStyle}>
                <label style={checkboxRowStyle}>
                  <input
                    type="checkbox"
                    checked={guest.confirmed}
                    onChange={() => toggleGuest(guest)}
                  />
                  <span style={cardTitleStyle}>{guest.name}</span>
                </label>
              </div>

              <div style={metaGridStyle}>
                <div>Skupina: <strong>{guest.group}</strong></div>
                <div>Stav: <strong>{guest.confirmed ? "Potvrzeno" : "Čeká"}</strong></div>
                <div>Poznámka: <strong>{guest.note || "-"}</strong></div>
              </div>

              <div style={buttonRowStyle}>
                <button
                  onClick={() => startEditGuest(guest)}
                  style={secondaryButtonStyle}
                >
                  Upravit
                </button>
                <button
                  onClick={() => deleteGuest(guest.id)}
                  style={dangerButtonStyle}
                >
                  Smazat
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  padding: 16,
  fontFamily: "Arial, sans-serif",
  maxWidth: 760,
  margin: "0 auto",
};

const titleStyle: React.CSSProperties = {
  fontSize: 28,
  marginBottom: 12,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 24,
  marginBottom: 12,
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 36,
};

const topBarStyle: React.CSSProperties = {
  marginBottom: 16,
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
};

const statusStyle: React.CSSProperties = {
  fontWeight: 600,
};

const loadingStyle: React.CSSProperties = {
  padding: 24,
  fontFamily: "Arial, sans-serif",
};

const errorStyle: React.CSSProperties = {
  background: "#ffe5e5",
  color: "#900",
  padding: 12,
  marginBottom: 16,
  border: "1px solid #f0b3b3",
  borderRadius: 10,
};

const statsWrapStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 14,
};

const statBoxStyle: React.CSSProperties = {
  background: "#f3f3f3",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 14,
};

const formStackStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  marginBottom: 16,
};

const inputStyle: React.CSSProperties = {
  padding: 12,
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 10,
  border: "1px solid #ccc",
  fontSize: 16,
};

const checkboxLineStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 600,
};

const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "#111",
  color: "#fff",
  fontWeight: 700,
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #bbb",
  background: "#f6f6f6",
  fontWeight: 700,
};

const dangerButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #d99",
  background: "#fff5f5",
  color: "#900",
  fontWeight: 700,
};

const cardListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 14,
  padding: 14,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const cardTopRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  marginBottom: 10,
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
};

const checkboxRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
};

const metaStyle: React.CSSProperties = {
  marginBottom: 12,
  color: "#444",
};

const metaGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  marginBottom: 12,
  color: "#333",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  background: "#eef2ff",
  color: "#334",
  padding: "6px 10px",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 13,
  marginBottom: 10,
};

const emptyStyle: React.CSSProperties = {
  color: "#666",
  padding: 8,
};
