import React, { useEffect, useMemo, useState } from "react";
import type {
  BudgetCategory,
  BudgetItem,
  Guest,
  GuestSide,
  PaymentStatus,
  Person,
  RsvpStatus,
  SectionKey,
  Task,
  TaskPriority,
  TaskStatus,
} from "./types";
import { supabaseRequest } from "./lib/supabase";
import {
  formatDate,
  getBudgetStats,
  getGuestStats,
  getRemaining,
  getTaskStats,
  normalizeGuestConfirmed,
  normalizePaymentStatus,
  sortBudget,
  sortTasks,
} from "./lib/utils";
import {
  badgeRowStyle,
  badgeStyle,
  buttonRowStyle,
  cardListStyle,
  cardStyle,
  cardTitleStyle,
  checkboxLineStyle,
  checkboxRowStyle,
  chipStyle,
  chipsWrapStyle,
  containerStyle,
  dangerButtonStyle,
  emptyStyle,
  errorStyle,
  filterCardStyle,
  filterLabelStyle,
  filterTitleStyle,
  formStackStyle,
  inputStyle,
  loadingStyle,
  metaGridStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  sectionStyle,
  sectionToggleStyle,
  statBoxStyle,
  statsWrapStyle,
  statusStyle,
  titleStyle,
  topBarStyle,
} from "./ui";

const people: Person[] = ["Ondra", "Kája", "Oba"];
const taskStatuses: TaskStatus[] = ["To do", "Rozdělané", "Čeká", "Hotovo"];
const taskPriorities: TaskPriority[] = ["Nízká", "Střední", "Vysoká"];
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
const guestSides: GuestSide[] = ["Ondra", "Kája", "Společní"];
const rsvpStatuses: RsvpStatus[] = ["Bez odpovědi", "Potvrzeno", "Odmítl"];

export default function App() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  const [sectionsOpen, setSectionsOpen] = useState<Record<SectionKey, boolean>>({
    dashboard: true,
    tasks: true,
    budget: true,
    guests: true,
  });

  const [taskInput, setTaskInput] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskOwner, setTaskOwner] = useState<Person>("Oba");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("To do");
  const [taskNote, setTaskNote] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("Střední");
  const [taskUpdatedBy, setTaskUpdatedBy] = useState<Person>("Oba");
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
  const [budgetUpdatedBy, setBudgetUpdatedBy] = useState<Person>("Oba");
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestNote, setGuestNote] = useState("");
  const [guestSide, setGuestSide] = useState<GuestSide>("Společní");
  const [guestRsvp, setGuestRsvp] = useState<RsvpStatus>("Bez odpovědi");
  const [guestCount, setGuestCount] = useState("1");
  const [guestAccommodation, setGuestAccommodation] = useState(false);
  const [guestChild, setGuestChild] = useState(false);
  const [guestUpdatedBy, setGuestUpdatedBy] = useState<Person>("Oba");
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);

  const [taskOwnerFilter, setTaskOwnerFilter] = useState<Person | "Vše">("Vše");
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | "Vše">("Vše");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<TaskPriority | "Vše">("Vše");
  const [taskSort, setTaskSort] = useState<"deadline" | "owner" | "priority">("deadline");

  const [budgetCategoryFilter, setBudgetCategoryFilter] = useState<BudgetCategory | "Vše">("Vše");
  const [budgetPaymentFilter, setBudgetPaymentFilter] = useState<PaymentStatus | "Vše">("Vše");
  const [budgetOwnerFilter, setBudgetOwnerFilter] = useState<Person | "Vše">("Vše");
  const [budgetSort, setBudgetSort] = useState<"due_date" | "category" | "remaining">("due_date");

  const [guestSideFilter, setGuestSideFilter] = useState<GuestSide | "Vše">("Vše");
  const [guestRsvpFilter, setGuestRsvpFilter] = useState<RsvpStatus | "Vše">("Vše");

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

  function toggleSection(section: SectionKey) {
    setSectionsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  function resetTaskForm() {
    setTaskInput("");
    setTaskDeadline("");
    setTaskOwner("Oba");
    setTaskStatus("To do");
    setTaskNote("");
    setTaskPriority("Střední");
    setTaskUpdatedBy("Oba");
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
    setBudgetUpdatedBy("Oba");
    setEditingBudgetId(null);
  }

  function resetGuestForm() {
    setGuestName("");
    setGuestNote("");
    setGuestSide("Společní");
    setGuestRsvp("Bez odpovědi");
    setGuestCount("1");
    setGuestAccommodation(false);
    setGuestChild(false);
    setGuestUpdatedBy("Oba");
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
      priority: taskPriority,
      updated_by: taskUpdatedBy,
      updated_at: new Date().toISOString(),
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
          body: JSON.stringify([{ ...payload, created_at: new Date().toISOString() }]),
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
      const nextDone = !(task.done || task.status === "Hotovo");
      const updated = await supabaseRequest(`tasks?id=eq.${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          done: nextDone,
          status: nextDone ? "Hotovo" : "To do",
          updated_at: new Date().toISOString(),
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
    setTaskStatus(task.status || "To do");
    setTaskNote(task.note || "");
    setTaskPriority(task.priority || "Střední");
    setTaskUpdatedBy((task.updated_by as Person) || "Oba");
    setEditingTaskId(task.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveBudgetItem() {
    if (!budgetName.trim()) return;
    if ((Number(planned) || 0) < 0 || (Number(actual) || 0) < 0 || (Number(deposit) || 0) < 0) {
      setError("Částky nesmí být záporné.");
      return;
    }

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
      payment_status: normalizePaymentStatus(
        fullyPaid,
        Number(deposit) || 0,
        paymentStatus
      ),
      note: budgetNote.trim() || null,
      updated_by: budgetUpdatedBy,
      updated_at: new Date().toISOString(),
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
          body: JSON.stringify([{ ...payload, created_at: new Date().toISOString() }]),
        });
        const row = inserted?.[0] as BudgetItem;
        setBudgetItems((prev) => [row, ...prev]);
      }

      resetBudgetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při ukládání rozpočtu");
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
      setError(err instanceof Error ? err.message : "Chyba při mazání rozpočtu");
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
    setBudgetUpdatedBy((item.updated_by as Person) || "Oba");
    setEditingBudgetId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveGuest() {
    if (!guestName.trim()) return;
    if ((Number(guestCount) || 1) < 1) {
      setError("Počet osob musí být alespoň 1.");
      return;
    }

    const payload = {
      name: guestName.trim(),
      confirmed: normalizeGuestConfirmed(guestRsvp),
      note: guestNote.trim() || null,
      side: guestSide,
      rsvp_status: guestRsvp,
      guest_count: Number(guestCount) || 1,
      accommodation: guestAccommodation,
      child: guestChild,
      updated_by: guestUpdatedBy,
      updated_at: new Date().toISOString(),
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
          body: JSON.stringify([{ ...payload, created_at: new Date().toISOString() }]),
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
      const nextConfirmed = !guest.confirmed;
      const updated = await supabaseRequest(`guests?id=eq.${guest.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          confirmed: nextConfirmed,
          rsvp_status: nextConfirmed ? "Potvrzeno" : "Bez odpovědi",
          updated_at: new Date().toISOString(),
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
    setGuestNote(guest.note || "");
    setGuestSide(guest.side || "Společní");
    setGuestRsvp(guest.rsvp_status || "Bez odpovědi");
    setGuestCount(String(guest.guest_count || 1));
    setGuestAccommodation(Boolean(guest.accommodation));
    setGuestChild(Boolean(guest.child));
    setGuestUpdatedBy((guest.updated_by as Person) || "Oba");
    setEditingGuestId(guest.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (taskOwnerFilter !== "Vše") list = list.filter((t) => t.owner === taskOwnerFilter);
    if (taskStatusFilter !== "Vše") list = list.filter((t) => t.status === taskStatusFilter);
    if (taskPriorityFilter !== "Vše") list = list.filter((t) => t.priority === taskPriorityFilter);
    return sortTasks(list, taskSort);
  }, [tasks, taskOwnerFilter, taskStatusFilter, taskPriorityFilter, taskSort]);

  const filteredBudget = useMemo(() => {
    let list = [...budgetItems];
    if (budgetCategoryFilter !== "Vše") list = list.filter((b) => b.category === budgetCategoryFilter);
    if (budgetPaymentFilter !== "Vše") list = list.filter((b) => b.payment_status === budgetPaymentFilter);
    if (budgetOwnerFilter !== "Vše") list = list.filter((b) => b.owner === budgetOwnerFilter);
    return sortBudget(list, budgetSort);
  }, [budgetItems, budgetCategoryFilter, budgetPaymentFilter, budgetOwnerFilter, budgetSort]);

  const filteredGuests = useMemo(() => {
    let list = [...guests];
    if (guestSideFilter !== "Vše") list = list.filter((g) => g.side === guestSideFilter);
    if (guestRsvpFilter !== "Vše") list = list.filter((g) => g.rsvp_status === guestRsvpFilter);
    return list;
  }, [guests, guestSideFilter, guestRsvpFilter]);

  const taskStats = useMemo(() => getTaskStats(tasks), [tasks]);
  const budgetStats = useMemo(() => getBudgetStats(budgetItems), [budgetItems]);
  const guestStats = useMemo(() => getGuestStats(guests), [guests]);

  const recentItems = useMemo(() => {
    return {
      task: tasks[0]?.text || "-",
      budget: budgetItems[0]?.name || "-",
      guest: guests[0]?.name || "-",
    };
  }, [tasks, budgetItems, guests]);

  if (loading) return <div style={loadingStyle}>Načítám data ze Supabase…</div>;

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>💍 Svatba planner</h1>

      <div style={topBarStyle}>
        <button onClick={loadAll} style={primaryButtonStyle} disabled={loading || saving}>
          Obnovit data
        </button>
        <span style={statusStyle}>{saving ? "Ukládám…" : "Připraveno"}</span>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      <section style={sectionStyle}>
        <button onClick={() => toggleSection("dashboard")} style={sectionToggleStyle}>
          Přehled pro vás dva {sectionsOpen.dashboard ? "▲" : "▼"}
        </button>
        {sectionsOpen.dashboard && (
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

      <section style={sectionStyle}>
        <button onClick={() => toggleSection("tasks")} style={sectionToggleStyle}>
          Checklist {sectionsOpen.tasks ? "▲" : "▼"}
        </button>
        {sectionsOpen.tasks && (
          <>
            <div style={statsWrapStyle}>
              <div style={statBoxStyle}>Úkolů: {taskStats.total}</div>
              <div style={statBoxStyle}>Hotovo: {taskStats.completed}</div>
              <div style={statBoxStyle}>Zbývá: {taskStats.pending}</div>
              <div style={statBoxStyle}>Čeká: {taskStats.waiting}</div>
            </div>

            <div style={formStackStyle}>
              <input value={taskInput} onChange={(e) => setTaskInput(e.target.value)} placeholder="Např. zamluvit místo" style={inputStyle} />
              <select value={taskOwner} onChange={(e) => setTaskOwner(e.target.value as Person)} style={inputStyle}>
                {people.map((person) => <option key={person} value={person}>{person}</option>)}
              </select>
              <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value as TaskStatus)} style={inputStyle}>
                {taskStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as TaskPriority)} style={inputStyle}>
                {taskPriorities.map((priority) => <option key={priority} value={priority}>Priorita: {priority}</option>)}
              </select>
              <select value={taskUpdatedBy} onChange={(e) => setTaskUpdatedBy(e.target.value as Person)} style={inputStyle}>
                {people.map((person) => <option key={person} value={person}>Update dělal: {person}</option>)}
              </select>
              <input type="date" value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} style={inputStyle} />
              <input value={taskNote} onChange={(e) => setTaskNote(e.target.value)} placeholder="Komentář / poznámka" style={inputStyle} />
              <div style={buttonRowStyle}>
                <button onClick={saveTask} style={primaryButtonStyle} disabled={saving}>
                  {editingTaskId ? "Uložit" : "Přidat"}
                </button>
                {editingTaskId && <button onClick={resetTaskForm} style={secondaryButtonStyle}>Zrušit</button>}
              </div>
            </div>

            <div style={filterCardStyle}>
              <div style={filterTitleStyle}>Filtry a řazení</div>
              <div style={chipsWrapStyle}>
                <span style={filterLabelStyle}>Vlastník:</span>
                <button style={chipStyle(taskOwnerFilter === "Vše")} onClick={() => setTaskOwnerFilter("Vše")}>Vše</button>
                {people.map((person) => (
                  <button key={person} style={chipStyle(taskOwnerFilter === person)} onClick={() => setTaskOwnerFilter(person)}>
                    {person}
                  </button>
                ))}
              </div>
              <div style={chipsWrapStyle}>
                <span style={filterLabelStyle}>Stav:</span>
                <button style={chipStyle(taskStatusFilter === "Vše")} onClick={() => setTaskStatusFilter("Vše")}>Vše</button>
                {taskStatuses.map((status) => (
                  <button key={status} style={chipStyle(taskStatusFilter === status)} onClick={() => setTaskStatusFilter(status)}>
                    {status}
                  </button>
                ))}
              </div>
              <div style={chipsWrapStyle}>
                <span style={filterLabelStyle}>Priorita:</span>
                <button style={chipStyle(taskPriorityFilter === "Vše")} onClick={() => setTaskPriorityFilter("Vše")}>Vše</button>
                {taskPriorities.map((priority) => (
                  <button key={priority} style={chipStyle(taskPriorityFilter === priority)} onClick={() => setTaskPriorityFilter(priority)}>
                    {priority}
                  </button>
                ))}
              </div>
              <select value={taskSort} onChange={(e) => setTaskSort(e.target.value as typeof taskSort)} style={inputStyle}>
                <option value="deadline">Řadit podle deadline</option>
                <option value="owner">Řadit podle vlastníka</option>
                <option value="priority">Řadit podle priority</option>
              </select>
            </div>

            <div style={cardListStyle}>
              {filteredTasks.length === 0 && <div style={emptyStyle}>Žádné úkoly pro aktuální filtr.</div>}
              {filteredTasks.map((task) => (
                <div key={task.id} style={cardStyle}>
                  <div style={badgeRowStyle}>
                    <span style={badgeStyle}>{task.owner}</span>
                    <span style={badgeStyle}>{task.status}</span>
                    <span style={badgeStyle}>{task.priority}</span>
                  </div>
                  <div style={cardTitleStyle}>{task.text}</div>
                  <div style={metaGridStyle}>
                    <div>Deadline: <strong>{formatDate(task.deadline)}</strong></div>
                    <div>Komentář: <strong>{task.note || "-"}</strong></div>
                    <div>Poslední update: <strong>{task.updated_by || "-"}</strong></div>
                    <div>Upraveno: <strong>{formatDate(task.updated_at)}</strong></div>
                  </div>
                  <div style={buttonRowStyle}>
                    <button onClick={() => toggleTask(task)} style={secondaryButtonStyle}>
                      {task.done || task.status === "Hotovo" ? "Označit zpět" : "Označit hotovo"}
                    </button>
                    <button onClick={() => startEditTask(task)} style={secondaryButtonStyle}>Upravit</button>
                    <button onClick={() => deleteTask(task.id)} style={dangerButtonStyle}>Smazat</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section style={sectionStyle}>
        <button onClick={() => toggleSection("budget")} style={sectionToggleStyle}>
          Rozpočet {sectionsOpen.budget ? "▲" : "▼"}
        </button>
        {sectionsOpen.budget && (
          <>
            <div style={statsWrapStyle}>
              <div style={statBoxStyle}>Plán: {budgetStats.totalPlanned} Kč</div>
              <div style={statBoxStyle}>Skutečnost: {budgetStats.totalActual} Kč</div>
              <div style={statBoxStyle}>Zaplaceno: {budgetStats.totalPaid} Kč</div>
              <div style={statBoxStyle}>Zbývá: {budgetStats.totalRemaining} Kč</div>
              <div style={statBoxStyle}>Po splatnosti: {budgetStats.overdue}</div>
            </div>

            <div style={formStackStyle}>
              <select value={category} onChange={(e) => setCategory(e.target.value as BudgetCategory)} style={inputStyle}>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input value={budgetName} onChange={(e) => setBudgetName(e.target.value)} placeholder="Položka" style={inputStyle} />
              <select value={budgetOwner} onChange={(e) => setBudgetOwner(e.target.value as Person)} style={inputStyle}>
                {people.map((person) => <option key={person} value={person}>Řeší: {person}</option>)}
              </select>
              <input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Dodavatel / kontakt" style={inputStyle} />
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)} style={inputStyle}>
                {paymentStatuses.map((status) => <option key={status} value={status}>Stav platby: {status}</option>)}
              </select>
              <input type="number" value={planned} onChange={(e) => setPlanned(e.target.value)} placeholder="Plánovaná cena" style={inputStyle} />
              <input type="number" value={actual} onChange={(e) => setActual(e.target.value)} placeholder="Skutečná cena" style={inputStyle} />
              <input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="Záloha" style={inputStyle} />
              <label style={checkboxLineStyle}>
                <input type="checkbox" checked={fullyPaid} onChange={(e) => setFullyPaid(e.target.checked)} />
                Zaplaceno celé
              </label>
              <select value={budgetUpdatedBy} onChange={(e) => setBudgetUpdatedBy(e.target.value as Person)} style={inputStyle}>
                {people.map((person) => <option key={person} value={person}>Update dělal: {person}</option>)}
              </select>
              <input value={budgetNote} onChange={(e) => setBudgetNote(e.target.value)} placeholder="Komentář / poznámka" style={inputStyle} />
              <div style={buttonRowStyle}>
                <button onClick={saveBudgetItem} style={primaryButtonStyle} disabled={saving}>
                  {editingBudgetId ? "Uložit" : "Přidat"}
                </button>
                {editingBudgetId && <button onClick={resetBudgetForm} style={secondaryButtonStyle}>Zrušit</button>}
              </div>
            </div>

            <div style={filterCardStyle}>
              <div style={filterTitleStyle}>Filtry a řazení</div>
              <div style={chipsWrapStyle}>
                <span style={filterLabelStyle}>Kategorie:</span>
                <button style={chipStyle(budgetCategoryFilter === "Vše")} onClick={() => setBudgetCategoryFilter("Vše")}>Vše</button>
                {categories.map((cat) => (
                  <button key={cat} style={chipStyle(budgetCategoryFilter === cat)} onClick={() => setBudgetCategoryFilter(cat)}>
                    {cat}
                  </button>
                ))}
              </div>
              <div style={chipsWrapStyle}>
                <span style={filterLabelStyle}>Platba:</span>
                <button style={chipStyle(budgetPaymentFilter === "Vše")} onClick={() => setBudgetPaymentFilter("Vše")}>Vše</button>
                {paymentStatuses.map((status) => (
                  <button key={status} style={chipStyle(budgetPaymentFilter === status)} onClick={() => setBudgetPaymentFilter(status)}>
                    {status}
                  </button>
                ))}
              </div>
              <div style={chipsWrapStyle}>
                <span style={filterLabelStyle}>Řeší:</span>
                <button style={chipStyle(budgetOwnerFilter === "Vše")} onClick={() => setBudgetOwnerFilter("Vše")}>Vše</button>
                {people.map((person) => (
                  <button key={person} style={chipStyle(budgetOwnerFilter === person)} onClick={() => setBudgetOwnerFilter(person)}>
                    {person}
                  </button>
                ))}
              </div>
              <select value={budgetSort} onChange={(e) => setBudgetSort(e.target.value as typeof budgetSort)} style={inputStyle}>
                <option value="due_date">Řadit podle splatnosti</option>
                <option value="category">Řadit podle kategorie</option>
                <option value="remaining">Řadit podle zbývá doplatit</option>
              </select>
            </div>

            <div style={cardListStyle}>
              {filteredBudget.length === 0 && <div style={emptyStyle}>Žádné položky rozpočtu pro aktuální filtr.</div>}
              {filteredBudget.map((item) => (
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
                    <div>Zbývá: <strong>{getRemaining(item)} Kč</strong></div>
                    <div>Komentář: <strong>{item.note || "-"}</strong></div>
                    <div>Poslední update: <strong>{item.updated_by || "-"}</strong></div>
                    <div>Upraveno: <strong>{formatDate(item.updated_at)}</strong></div>
                  </div>
                  <div style={buttonRowStyle}>
                    <button onClick={() => startEditBudgetItem(item)} style={secondaryButtonStyle}>Upravit</button>
                    <button onClick={() => deleteBudgetItem(item.id)} style={dangerButtonStyle}>Smazat</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section style={sectionStyle}>
        <button onClick={() => toggleSection("guests")} style={sectionToggleStyle}>
          Hosté {sectionsOpen.guests ? "▲" : "▼"}
        </button>
        {sectionsOpen.guests && (
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
              <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Jméno hosta" style={inputStyle} />
              <select value={guestSide} onChange={(e) => setGuestSide(e.target.value as GuestSide)} style={inputStyle}>
                {guestSides.map((side) => <option key={side} value={side}>Strana: {side}</option>)}
              </select>
              <select value={guestRsvp} onChange={(e) => setGuestRsvp(e.target.value as RsvpStatus)} style={inputStyle}>
                {rsvpStatuses.map((status) => <option key={status} value={status}>RSVP: {status}</option>)}
              </select>
              <input type="number" min="1" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} placeholder="Počet osob" style={inputStyle} />
              <label style={checkboxLineStyle}>
                <input type="checkbox" checked={guestAccommodation} onChange={(e) => setGuestAccommodation(e.target.checked)} />
                Bude přespávat
              </label>
              <label style={checkboxLineStyle}>
                <input type="checkbox" checked={guestChild} onChange={(e) => setGuestChild(e.target.checked)} />
                Je to dítě
              </label>
              <select value={guestUpdatedBy} onChange={(e) => setGuestUpdatedBy(e.target.value as Person)} style={inputStyle}>
                {people.map((person) => <option key={person} value={person}>Update dělal: {person}</option>)}
              </select>
              <input value={guestNote} onChange={(e) => setGuestNote(e.target.value)} placeholder="Komentář / poznámka" style={inputStyle} />
              <div style={buttonRowStyle}>
                <button onClick={saveGuest} style={primaryButtonStyle} disabled={saving}>
                  {editingGuestId ? "Uložit" : "Přidat"}
                </button>
                {editingGuestId && <button onClick={resetGuestForm} style={secondaryButtonStyle}>Zrušit</button>}
              </div>
            </div>

            <div style={filterCardStyle}>
              <div style={filterTitleStyle}>Filtry</div>
              <div style={chipsWrapStyle}>
                <span style={filterLabelStyle}>Strana:</span>
                <button style={chipStyle(guestSideFilter === "Vše")} onClick={() => setGuestSideFilter("Vše")}>Vše</button>
                {guestSides.map((side) => (
                  <button key={side} style={chipStyle(guestSideFilter === side)} onClick={() => setGuestSideFilter(side)}>
                    {side}
                  </button>
                ))}
              </div>
              <div style={chipsWrapStyle}>
                <span style={filterLabelStyle}>RSVP:</span>
                <button style={chipStyle(guestRsvpFilter === "Vše")} onClick={() => setGuestRsvpFilter("Vše")}>Vše</button>
                {rsvpStatuses.map((status) => (
                  <button key={status} style={chipStyle(guestRsvpFilter === status)} onClick={() => setGuestRsvpFilter(status)}>
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
                    <button onClick={() => startEditGuest(guest)} style={secondaryButtonStyle}>Upravit</button>
                    <button onClick={() => deleteGuest(guest.id)} style={dangerButtonStyle}>Smazat</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
