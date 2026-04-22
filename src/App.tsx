import React, { useEffect, useMemo, useState } from "react";

type Person = "Ondra" | "Kája" | "Oba";

type TaskStatus = "To do" | "Rozdělané" | "Čeká" | "Hotovo";

type Task = {
  id: string;
  text: string;
  deadline: string | null;
  done: boolean;
  owner: Person;
  status: TaskStatus;
  note: string | null;
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

type PaymentStatus = "Nezaplaceno" | "Záloha" | "Zaplaceno";

type BudgetItem = {
  id: string;
  category: BudgetCategory;
  name: string;
  planned: number;
  actual: number;
  deposit: number;
  fully_paid: boolean;
  owner: Person;
  vendor: string | null;
  due_date: string | null;
  payment_status: PaymentStatus;
  note: string | null;
};

type GuestGroup = "Rodina" | "Kamarádi" | "Práce" | "Ostatní";
type GuestSide = "Ondra" | "Kája" | "Společní";
type RsvpStatus = "Bez odpovědi" | "Potvrzeno" | "Odmítl";

type Guest = {
  id: string;
  name: string;
  group: GuestGroup;
  confirmed: boolean;
  note: string | null;
  side: GuestSide;
  rsvp_status: RsvpStatus;
  guest_count: number;
  accommodation: boolean;
  transport: boolean;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

const people: Person[] = ["Ondra", "Kája", "Oba"];
const taskStatuses: TaskStatus[] = ["To do", "Rozdělané", "Čeká", "Hotovo"];
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
const paymentStatuses: PaymentStatus[] = ["Nezaplaceno", "Záloha", "Zaplaceno"];
const guestGroups: GuestGroup[] = ["Rodina", "Kamarádi", "Práce", "Ostatní"];
const guestSides: GuestSide[] = ["Ondra", "Kája", "Společní"];
const rsvpStatuses: RsvpStatus[] = ["Bez odpovědi", "Potvrzeno", "Odmítl"];

async function supabaseRequest(path: string, options: RequestInit = {}) {
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

function formatDate(date: string | null | undefined) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("cs-CZ");
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
  const [taskOwner, setTaskOwner] = useState<Person>("Oba");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("To do");
  const [taskNote, setTaskNote] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [category, setCategory] = useState<BudgetCategory>("Ostatní");
  const [budgetName, setBudgetName] = useState("");
  const [planned, setPlanned] = useState("");
  const [actual, setActual] = useState("");
  const [deposit, setDeposit] = useState("");
  const [fullyPaid, setFullyPaid] = useState(false);
  const [budgetOwner, setBudgetOwner] = useState<Person>("Oba");
  const [vendor, setVendor] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>("Nezaplaceno");
  const [budgetNote, setBudgetNote] = useState("");
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestGroup, setGuestGroup] = useState<GuestGroup>("Rodina");
  const [guestNote, setGuestNote] = useState("");
  const [guestSide, setGuestSide] = useState<GuestSide>("Společní");
  const [guestRsvp, setGuestRsvp] =
    useState<RsvpStatus>("Bez odpovědi");
  const [guestCount, setGuestCount] = useState("1");
  const [guestAccommodation, setGuestAccommodation] = useState(false);
  const [guestTransport, setGuestTransport] = useState(false);
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
    setTaskOwner("Oba");
    setTaskStatus("To do");
    setTaskNote("");
    setEditingTaskId(null);
  }

  function resetBudgetForm() {
    setCategory("Ostatní");
    setBudgetName("");
    setPlanned("");
    setActual("");
    setDeposit("");
    setFullyPaid(false);
    setBudgetOwner("Oba");
    setVendor("");
    setDueDate("");
    setPaymentStatus("Nezaplaceno");
    setBudgetNote("");
    setEditingBudgetId(null);
  }

  function resetGuestForm() {
    setGuestName("");
    setGuestGroup("Rodina");
    setGuestNote("");
    setGuestSide("Společní");
    setGuestRsvp("Bez odpovědi");
    setGuestCount("1");
    setGuestAccommodation(false);
    setGuestTransport(false);
    setEditingGuestId(null);
  }

  async function saveTask() {
    if (!taskInput.trim()) return;

    const payload = {
      text: taskInput.trim(),
      deadline: taskDeadline || null,
      done: taskStatus === "Hotovo",
      owner: taskOwner,
      status: taskStatus,
      note: taskNote.trim() || null,
    };

    try {
      setSaving(true);
      setError("");

      if (editingTaskId) {
        const updated = await supabaseRequest(`tasks?id=eq.${editingTaskId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        const row = updated?.[0] as Task;
        setTasks((prev) => prev.map((t) => (t.id === row.id ? row : t)));
      } else {
        const inserted = await supabaseRequest("tasks", {
          method: "POST",
          body: JSON.stringify([payload]),
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
    const nextDone = !task.done;
    const nextStatus: TaskStatus = nextDone ? "Hotovo" : "To do";

    try {
      setError("");
      const updated = await supabaseRequest(`tasks?id=eq.${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          done: nextDone,
          status: nextStatus,
        }),
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
    setTaskOwner(task.owner || "Oba");
    setTaskStatus(task.status || (task.done ? "Hotovo" : "To do"));
    setTaskNote(task.note || "");
    setEditingTaskId(task.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveBudgetItem() {
    if (!budgetName.trim()) return;

    const resolvedPaymentStatus: PaymentStatus = fullyPaid
      ? "Zaplaceno"
      : Number(deposit) > 0
      ? "Záloha"
      : paymentStatus;

    const payload = {
      category,
      name: budgetName.trim(),
      planned: Number(planned) || 0,
      actual: Number(actual) || 0,
      deposit: Number(deposit) || 0,
      fully_paid: fullyPaid,
      owner: budgetOwner,
      vendor: vendor.trim() || null,
      due_date: dueDate || null,
      payment_status: resolvedPaymentStatus,
      note: budgetNote.trim() || null,
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
    setBudgetOwner(item.owner || "Oba");
    setVendor(item.vendor || "");
    setDueDate(item.due_date || "");
    setPaymentStatus(item.payment_status || "Nezaplaceno");
    setBudgetNote(item.note || "");
    setEditingBudgetId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveGuest() {
    if (!guestName.trim()) return;

    const payload = {
      name: guestName.trim(),
      group: guestGroup,
      confirmed: guestRsvp === "Potvrzeno",
      note: guestNote.trim() || null,
      side: guestSide,
      rsvp_status: guestRsvp,
      guest_count: Number(guestCount) || 1,
      accommodation: guestAccommodation,
      transport: guestTransport,
    };

    try {
      setSaving(true);
      setError("");

      if (editingGuestId) {
        const updated = await supabaseRequest(`guests?id=eq.${editingGuestId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
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
    const nextConfirmed = !guest.confirmed;
    const nextRsvp: RsvpStatus = nextConfirmed ? "Potvrzeno" : "Bez odpovědi";

    try {
      setError("");
      const updated = await supabaseRequest(`guests?id=eq.${guest.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          confirmed: nextConfirmed,
          rsvp_status: nextRsvp,
        }),
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
    setGuestSide(guest.side || "Společní");
    setGuestRsvp(
      guest.rsvp_status || (guest.confirmed ? "Potvrzeno" : "Bez odpovědi")
    );
    setGuestCount(String(guest.guest_count || 1));
    setGuestAccommodation(Boolean(guest.accommodation));
    setGuestTransport(Boolean(guest.transport));
    setEditingGuestId(guest.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function remaining(item: BudgetItem) {
    if (item.fully_paid || item.payment_status === "Zaplaceno") return 0;
    return Math.max(item.actual - item.deposit, 0);
  }

  const taskStats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === "Hotovo" || t.done).length;
    const waiting = tasks.filter((t) => t.status === "Čeká").length;
    const byOwner = {
      Ondra: tasks.filter((t) => t.owner === "Ondra").length,
      Kája: tasks.filter((t) => t.owner === "Kája").length,
      Oba: tasks.filter((t) => t.owner === "Oba").length,
    };
    return {
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
      waiting,
      byOwner,
    };
  }, [tasks]);

  const budgetStats = useMemo(() => {
    const totalPlanned = budgetItems.reduce((s, i) => s + i.planned, 0);
    const totalActual = budgetItems.reduce((s, i) => s + i.actual, 0);
    const totalDeposit = budgetItems.reduce((s, i) => s + i.deposit, 0);
    const totalRemaining = budgetItems.reduce((s, i) => s + remaining(i), 0);
    const dueSoon = budgetItems.filter(
      (i) => i.due_date && new Date(i.due_date).getTime() >= Date.now()
    ).length;

    return { totalPlanned, totalActual, totalDeposit, totalRemaining, dueSoon };
  }, [budgetItems]);

  const guestStats = useMemo(() => {
    const confirmed = guests.filter((g) => g.rsvp_status === "Potvrzeno").length;
    const pending = guests.filter((g) => g.rsvp_status === "Bez odpovědi").length;
    const declined = guests.filter((g) => g.rsvp_status === "Odmítl").length;
    const totalPeople = guests.reduce((sum, g) => sum + (g.guest_count || 1), 0);

    return {
      total: guests.length,
      confirmed,
      pending,
      declined,
      totalPeople,
    };
  }, [guests]);

  const recentItems = useMemo(() => {
    return {
      task: tasks[0]?.text || "-",
      budget: budgetItems[0]?.name || "-",
      guest: guests[0]?.name || "-",
    };
  }, [tasks, budgetItems, guests]);

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
        <h2 style={sectionTitleStyle}>Přehled pro vás dva</h2>
        <div style={cardListStyle}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Co hoří</div>
            <div style={metaGridStyle}>
              <div>Úkoly čekající na posun: <strong>{taskStats.pending}</strong></div>
              <div>Úkoly ve stavu Čeká: <strong>{taskStats.waiting}</strong></div>
              <div>Položky se splatností: <strong>{budgetStats.dueSoon}</strong></div>
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
            <div style={cardTitleStyle}>Poslední změny</div>
            <div style={metaGridStyle}>
              <div>Poslední úkol: <strong>{recentItems.task}</strong></div>
              <div>Poslední rozpočet: <strong>{recentItems.budget}</strong></div>
              <div>Poslední host: <strong>{recentItems.guest}</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Checklist</h2>

        <div style={statsWrapStyle}>
          <div style={statBoxStyle}>Úkolů: {taskStats.total}</div>
          <div style={statBoxStyle}>Hotovo: {taskStats.completed}</div>
          <div style={statBoxStyle}>Zbývá: {taskStats.pending}</div>
          <div style={statBoxStyle}>Čeká: {taskStats.waiting}</div>
        </div>

        <div style={formStackStyle}>
          <input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Např. zamluvit místo"
            style={inputStyle}
          />

          <select
            value={taskOwner}
            onChange={(e) => setTaskOwner(e.target.value as Person)}
            style={inputStyle}
          >
            {people.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>

          <select
            value={taskStatus}
            onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
            style={inputStyle}
          >
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={taskDeadline}
            onChange={(e) => setTaskDeadline(e.target.value)}
            style={inputStyle}
          />

          <input
            value={taskNote}
            onChange={(e) => setTaskNote(e.target.value)}
            placeholder="Poznámka"
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
              <div style={badgeRowStyle}>
                <span style={badgeStyle}>{task.owner}</span>
                <span style={badgeStyle}>{task.status}</span>
              </div>

              <div style={cardTopRowStyle}>
                <label style={checkboxRowStyle}>
                  <input
                    type="checkbox"
                    checked={task.done || task.status === "Hotovo"}
                    onChange={() => toggleTask(task)}
                  />
                  <span
                    style={{
                      ...cardTitleStyle,
                      textDecoration:
                        task.done || task.status === "Hotovo"
                          ? "line-through"
                          : "none",
                      opacity: task.done || task.status === "Hotovo" ? 0.7 : 1,
                    }}
                  >
                    {task.text}
                  </span>
                </label>
              </div>

              <div style={metaGridStyle}>
                <div>Deadline: <strong>{formatDate(task.deadline)}</strong></div>
                <div>Poznámka: <strong>{task.note || "-"}</strong></div>
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

          <select
            value={budgetOwner}
            onChange={(e) => setBudgetOwner(e.target.value as Person)}
            style={inputStyle}
          >
            {people.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>

          <input
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="Dodavatel / kontakt"
            style={inputStyle}
          />

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={inputStyle}
          />

          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            style={inputStyle}
          >
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

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

          <input
            value={budgetNote}
            onChange={(e) => setBudgetNote(e.target.value)}
            placeholder="Poznámka"
            style={inputStyle}
          />

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
              <div style={badgeRowStyle}>
                <span style={badgeStyle}>{item.category}</span>
                <span style={badgeStyle}>{item.owner || "Oba"}</span>
                <span style={badgeStyle}>{item.payment_status || "Nezaplaceno"}</span>
              </div>

              <div style={cardTitleStyle}>{item.name}</div>

              <div style={metaGridStyle}>
                <div>Dodavatel: <strong>{item.vendor || "-"}</strong></div>
                <div>Splatnost: <strong>{formatDate(item.due_date)}</strong></div>
                <div>Plán: <strong>{item.planned} Kč</strong></div>
                <div>Skutečnost: <strong>{item.actual} Kč</strong></div>
                <div>Záloha: <strong>{item.deposit} Kč</strong></div>
                <div>Zbývá: <strong>{remaining(item)} Kč</strong></div>
                <div>Poznámka: <strong>{item.note || "-"}</strong></div>
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
          <div style={statBoxStyle}>Hostů: {guestStats.total}</div>
          <div style={statBoxStyle}>Potvrzeno: {guestStats.confirmed}</div>
          <div style={statBoxStyle}>Bez odpovědi: {guestStats.pending}</div>
          <div style={statBoxStyle}>Odmítlo: {guestStats.declined}</div>
          <div style={statBoxStyle}>Lidí celkem: {guestStats.totalPeople}</div>
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

          <select
            value={guestSide}
            onChange={(e) => setGuestSide(e.target.value as GuestSide)}
            style={inputStyle}
          >
            {guestSides.map((side) => (
              <option key={side} value={side}>
                {side}
              </option>
            ))}
          </select>

          <select
            value={guestRsvp}
            onChange={(e) => setGuestRsvp(e.target.value as RsvpStatus)}
            style={inputStyle}
          >
            {rsvpStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
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
            Potřebuje ubytování
          </label>

          <label style={checkboxLineStyle}>
            <input
              type="checkbox"
              checked={guestTransport}
              onChange={(e) => setGuestTransport(e.target.checked)}
            />
            Potřebuje odvoz
          </label>

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
              <div style={badgeRowStyle}>
                <span style={badgeStyle}>{guest.side || "Společní"}</span>
                <span style={badgeStyle}>{guest.group}</span>
                <span style={badgeStyle}>{guest.rsvp_status || "Bez odpovědi"}</span>
              </div>

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
                <div>Počet osob: <strong>{guest.guest_count || 1}</strong></div>
                <div>Ubytování: <strong>{guest.accommodation ? "Ano" : "Ne"}</strong></div>
                <div>Odvoz: <strong>{guest.transport ? "Ano" : "Ne"}</strong></div>
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
};

const badgeRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 10,
};

const emptyStyle: React.CSSProperties = {
  color: "#666",
  padding: 8,
};
