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

const SUPABASE_URL = "https://tdnfyudautpjopvqlmzm.supabase.co";
const SUPABASE_KEY =
  "sb_publishable_1aWgzmfptC6nmEqjDyxGNg_HzW-Ejd0";

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
        setTasks((prev) => [...prev, row]);
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
        const updated = await supabaseRequest(
          `budget?id=eq.${editingBudgetId}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          }
        );

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
        setBudgetItems((prev) => [...prev, row]);
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
        setGuests((prev) => [...prev, row]);
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
    return <div style={{ padding: 24 }}>Načítám data ze Supabase…</div>;
  }

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Arial, sans-serif",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <h1>💍 Svatba planner</h1>

      <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={loadAll}>Obnovit data</button>
        <span>{saving ? "Ukládám…" : "Připraveno"}</span>
      </div>

      {error && (
        <div
          style={{
            background: "#ffe5e5",
            color: "#900",
            padding: 12,
            marginBottom: 16,
            border: "1px solid #f0b3b3",
          }}
        >
          {error}
        </div>
      )}

      <section style={{ marginBottom: 40 }}>
        <h2>Checklist</h2>

        <div style={statsRow}>
          <div>Úkolů celkem: {taskStats.total}</div>
          <div>Hotovo: {taskStats.completed}</div>
          <div>Zbývá: {taskStats.pending}</div>
        </div>

        <div style={taskFormGrid}>
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
          <button onClick={saveTask}>
            {editingTaskId ? "Uložit" : "Přidat"}
          </button>
          {editingTaskId && <button onClick={resetTaskForm}>Zrušit</button>}
        </div>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Hotovo</th>
              <th style={thStyle}>Úkol</th>
              <th style={thStyle}>Deadline</th>
              <th style={thStyle}>Akce</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task)}
                  />
                </td>
                <td style={tdStyle}>{task.text}</td>
                <td style={tdStyle}>{task.deadline || "-"}</td>
                <td style={tdStyle}>
                  <div style={actionRow}>
                    <button onClick={() => startEditTask(task)}>Upravit</button>
                    <button onClick={() => deleteTask(task.id)}>Smazat</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2>Rozpočet</h2>

        <div style={statsRow}>
          <div>Plán celkem: {budgetStats.totalPlanned} Kč</div>
          <div>Skutečnost celkem: {budgetStats.totalActual} Kč</div>
          <div>Zálohy celkem: {budgetStats.totalDeposit} Kč</div>
          <div>Zbývá doplatit: {budgetStats.totalRemaining} Kč</div>
        </div>

        <div style={budgetFormGrid}>
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
            placeholder="Plán"
            style={inputStyle}
          />

          <input
            type="number"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            placeholder="Skutečnost"
            style={inputStyle}
          />

          <input
            type="number"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="Záloha"
            style={inputStyle}
          />

          <label style={checkboxLabel}>
            <input
              type="checkbox"
              checked={fullyPaid}
              onChange={(e) => setFullyPaid(e.target.checked)}
            />
            Zaplaceno celé
          </label>

          <button onClick={saveBudgetItem}>
            {editingBudgetId ? "Uložit" : "Přidat"}
          </button>
          {editingBudgetId && <button onClick={resetBudgetForm}>Zrušit</button>}
        </div>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Kategorie</th>
              <th style={thStyle}>Položka</th>
              <th style={thStyle}>Plán</th>
              <th style={thStyle}>Skutečnost</th>
              <th style={thStyle}>Záloha</th>
              <th style={thStyle}>Zaplaceno celé</th>
              <th style={thStyle}>Zbývá</th>
              <th style={thStyle}>Akce</th>
            </tr>
          </thead>
          <tbody>
            {budgetItems.map((item) => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.category}</td>
                <td style={tdStyle}>{item.name}</td>
                <td style={tdStyle}>{item.planned} Kč</td>
                <td style={tdStyle}>{item.actual} Kč</td>
                <td style={tdStyle}>{item.deposit} Kč</td>
                <td style={tdStyle}>{item.fully_paid ? "Ano" : "Ne"}</td>
                <td style={tdStyle}>{remaining(item)} Kč</td>
                <td style={tdStyle}>
                  <div style={actionRow}>
                    <button onClick={() => startEditBudgetItem(item)}>
                      Upravit
                    </button>
                    <button onClick={() => deleteBudgetItem(item.id)}>
                      Smazat
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Hosté</h2>

        <div style={statsRow}>
          <div>Hostů celkem: {guestStats.total}</div>
          <div>Potvrzeno: {guestStats.confirmed}</div>
          <div>Čeká: {guestStats.pending}</div>
        </div>

        <div style={guestFormGrid}>
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

          <button onClick={saveGuest}>
            {editingGuestId ? "Uložit" : "Přidat"}
          </button>
          {editingGuestId && <button onClick={resetGuestForm}>Zrušit</button>}
        </div>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Potvrzeno</th>
              <th style={thStyle}>Jméno</th>
              <th style={thStyle}>Skupina</th>
              <th style={thStyle}>Poznámka</th>
              <th style={thStyle}>Akce</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id}>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={guest.confirmed}
                    onChange={() => toggleGuest(guest)}
                  />
                </td>
                <td style={tdStyle}>{guest.name}</td>
                <td style={tdStyle}>{guest.group}</td>
                <td style={tdStyle}>{guest.note || "-"}</td>
                <td style={tdStyle}>
                  <div style={actionRow}>
                    <button onClick={() => startEditGuest(guest)}>Upravit</button>
                    <button onClick={() => deleteGuest(guest.id)}>Smazat</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 16,
};

const thStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: 8,
  textAlign: "left",
  background: "#f4f4f4",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: 8,
  verticalAlign: "top",
};

const inputStyle: React.CSSProperties = {
  padding: 8,
  width: "100%",
  boxSizing: "border-box",
};

const statsRow: React.CSSProperties = {
  display: "flex",
  gap: 16,
  flexWrap: "wrap",
  fontWeight: "bold",
};

const actionRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const checkboxLabel: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const taskFormGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr auto auto",
  gap: 8,
  marginTop: 16,
};

const budgetFormGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 1fr auto auto",
  gap: 8,
  marginTop: 16,
  alignItems: "center",
};

const guestFormGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.5fr 1fr 1.5fr auto auto",
  gap: 8,
  marginTop: 16,
};