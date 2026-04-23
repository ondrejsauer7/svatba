import React, { useEffect, useMemo, useRef, useState } from "react";
import type {
  BudgetCategory,
  BudgetItem,
  Guest,
  GuestSide,
  Note,
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
  getBudgetStats,
  getGuestStats,
  getTaskStats,
  normalizeGuestConfirmed,
  normalizePaymentStatus,
  sortBudget,
  sortTasks,
} from "./lib/utils";
import {
  containerStyle,
  errorStyle,
  loadingStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  statusStyle,
  titleStyle,
  topBarStyle,
  toastStyle,
} from "./ui";
import DashboardSection from "./sections/DashboardSection";
import TasksSection from "./sections/TasksSection";
import BudgetSection from "./sections/BudgetSection";
import GuestsSection from "./sections/GuestsSection";
import NotesSection from "./sections/NotesSection";

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

type BackupFile = {
  tasks: Task[];
  budgetItems: BudgetItem[];
  guests: Guest[];
  notes: Note[];
  exportedAt: string;
};

function hasStringId(value: unknown): value is { id: string } {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as { id?: unknown }).id === "string"
  );
}

function safeArrayWithId<T extends { id: string }>(value: unknown): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter(hasStringId) as T[];
}

function getRecordTime(item: { updated_at?: string; created_at?: string }) {
  const source = item.updated_at || item.created_at;
  if (!source) return 0;
  const timestamp = Date.parse(source);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getLatestItem<T extends { updated_at?: string; created_at?: string }>(
  items: T[]
) {
  let latest: T | undefined;
  for (const item of items) {
    if (!latest || getRecordTime(item) > getRecordTime(latest)) {
      latest = item;
    }
  }
  return latest;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const [sectionsOpen, setSectionsOpen] = useState<Record<SectionKey, boolean>>({
    dashboard: true,
    tasks: true,
    budget: true,
    guests: true,
    notes: true,
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

  const [noteInput, setNoteInput] = useState("");
  const [noteAuthor, setNoteAuthor] = useState<Person>("Oba");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const [taskOwnerFilter, setTaskOwnerFilter] = useState<Person | "Vše">("Vše");
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | "Vše">("Vše");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<TaskPriority | "Vše">("Vše");
  const [taskSort, setTaskSort] = useState<"deadline" | "owner" | "priority">(
    "deadline"
  );
  const [taskSearch, setTaskSearch] = useState("");

  const [budgetCategoryFilter, setBudgetCategoryFilter] =
    useState<BudgetCategory | "Vše">("Vše");
  const [budgetPaymentFilter, setBudgetPaymentFilter] =
    useState<PaymentStatus | "Vše">("Vše");
  const [budgetOwnerFilter, setBudgetOwnerFilter] =
    useState<Person | "Vše">("Vše");
  const [budgetSort, setBudgetSort] = useState<
    "due_date" | "category" | "remaining"
  >("due_date");
  const [budgetSearch, setBudgetSearch] = useState("");

  const [guestSideFilter, setGuestSideFilter] =
    useState<GuestSide | "Vše">("Vše");
  const [guestRsvpFilter, setGuestRsvpFilter] =
    useState<RsvpStatus | "Vše">("Vše");
  const [guestSearch, setGuestSearch] = useState("");

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => {
      setToast("");
    }, 2200);
  }

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [tasksData, budgetData, guestsData, notesData] = await Promise.all([
        supabaseRequest(
          "tasks?select=*&order=updated_at.desc.nullslast,created_at.desc.nullslast"
        ),
        supabaseRequest(
          "budget?select=*&order=updated_at.desc.nullslast,created_at.desc.nullslast"
        ),
        supabaseRequest(
          "guests?select=*&order=updated_at.desc.nullslast,created_at.desc.nullslast"
        ),
        supabaseRequest(
          "notes?select=*&order=updated_at.desc.nullslast,created_at.desc.nullslast"
        ),
      ]);

      setTasks((tasksData || []) as Task[]);
      setBudgetItems((budgetData || []) as BudgetItem[]);
      setGuests((guestsData || []) as Guest[]);
      setNotes((notesData || []) as Note[]);
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

  function resetNoteForm() {
    setNoteInput("");
    setNoteAuthor("Oba");
    setEditingNoteId(null);
  }

  function exportData() {
    const data: BackupFile = {
      tasks,
      budgetItems,
      guests,
      notes,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "svatba-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Záloha exportována");
  }

  async function replaceTableData<T extends { id: string }>(
    tableName: "tasks" | "budget" | "guests" | "notes",
    items: T[]
  ) {
    await supabaseRequest(`${tableName}?id=not.is.null`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });

    if (items.length > 0) {
      await supabaseRequest(tableName, {
        method: "POST",
        body: JSON.stringify(items),
      });
    }
  }

  async function importData(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      setError("");

      const shouldReplace = window.confirm(
        "Import přepíše všechna současná data. Pokračovat?"
      );
      if (!shouldReplace) return;

      const text = await file.text();
      const data = JSON.parse(text) as Partial<BackupFile>;

      const importedTasks = safeArrayWithId<Task>(data.tasks);
      const importedBudget = safeArrayWithId<BudgetItem>(data.budgetItems);
      const importedGuests = safeArrayWithId<Guest>(data.guests);
      const importedNotes = safeArrayWithId<Note>(data.notes);

      const [previousTasks, previousBudget, previousGuests, previousNotes] =
        await Promise.all([
          supabaseRequest("tasks?select=*"),
          supabaseRequest("budget?select=*"),
          supabaseRequest("guests?select=*"),
          supabaseRequest("notes?select=*"),
        ]);

      try {
        await replaceTableData("tasks", importedTasks);
        await replaceTableData("budget", importedBudget);
        await replaceTableData("guests", importedGuests);
        await replaceTableData("notes", importedNotes);
      } catch (importError) {
        try {
          await replaceTableData("tasks", ((previousTasks || []) as Task[]));
          await replaceTableData(
            "budget",
            ((previousBudget || []) as BudgetItem[])
          );
          await replaceTableData("guests", ((previousGuests || []) as Guest[]));
          await replaceTableData("notes", ((previousNotes || []) as Note[]));
          await loadAll();
        } catch {
          const message =
            importError instanceof Error ? importError.message : "Import selhal";
          setError(
            `${message}. Pozor: puvodni data se nepodarilo plne obnovit.`
          );
          return;
        }

        const message =
          importError instanceof Error ? importError.message : "Import selhal";
        setError(`${message}. Puvodni data byla obnovena.`);
        return;
      }

      await loadAll();
      showToast("Import hotový");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import selhal");
    } finally {
      setSaving(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
        showToast("Úkol upraven");
      } else {
        const inserted = await supabaseRequest("tasks", {
          method: "POST",
          body: JSON.stringify([
            { ...payload, created_at: new Date().toISOString() },
          ]),
        });

        const row = inserted?.[0] as Task;
        setTasks((prev) => [row, ...prev]);
        showToast("Úkol přidán");
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
      showToast("Úkol změněn");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při změně úkolu");
    }
  }

  async function deleteTask(id: string) {
    try {
      setError("");
      const shouldDelete = window.confirm("Opravdu smazat úkol?");
      if (!shouldDelete) return;

      await supabaseRequest(`tasks?id=eq.${id}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });

      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (editingTaskId === id) resetTaskForm();
      showToast("Úkol smazán");
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
    if (
      (Number(planned) || 0) < 0 ||
      (Number(actual) || 0) < 0 ||
      (Number(deposit) || 0) < 0
    ) {
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
        showToast("Rozpočet upraven");
      } else {
        const inserted = await supabaseRequest("budget", {
          method: "POST",
          body: JSON.stringify([
            { ...payload, created_at: new Date().toISOString() },
          ]),
        });

        const row = inserted?.[0] as BudgetItem;
        setBudgetItems((prev) => [row, ...prev]);
        showToast("Položka rozpočtu přidána");
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
      const shouldDelete = window.confirm("Opravdu smazat položku rozpočtu?");
      if (!shouldDelete) return;

      await supabaseRequest(`budget?id=eq.${id}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });

      setBudgetItems((prev) => prev.filter((item) => item.id !== id));
      if (editingBudgetId === id) resetBudgetForm();
      showToast("Položka rozpočtu smazána");
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
    setBudgetUpdatedBy((item.updated_by as Person) || "Oba");
    setEditingBudgetId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function quickToggleBudgetPaid(item: BudgetItem) {
    try {
      setError("");
      const nextFullyPaid = !item.fully_paid;
      const updated = await supabaseRequest(`budget?id=eq.${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          fully_paid: nextFullyPaid,
          payment_status: normalizePaymentStatus(
            nextFullyPaid,
            Number(item.deposit) || 0,
            "Nezaplaceno"
          ),
          updated_at: new Date().toISOString(),
        }),
      });

      const row = updated?.[0] as BudgetItem;
      setBudgetItems((prev) => prev.map((b) => (b.id === row.id ? row : b)));
      showToast("Platba změněna");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při změně platby");
    }
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
        showToast("Host upraven");
      } else {
        const inserted = await supabaseRequest("guests", {
          method: "POST",
          body: JSON.stringify([
            { ...payload, created_at: new Date().toISOString() },
          ]),
        });

        const row = inserted?.[0] as Guest;
        setGuests((prev) => [row, ...prev]);
        showToast("Host přidán");
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
      showToast("RSVP změněno");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při změně hosta");
    }
  }

  async function quickToggleGuestAccommodation(guest: Guest) {
    try {
      setError("");
      const updated = await supabaseRequest(`guests?id=eq.${guest.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          accommodation: !guest.accommodation,
          updated_at: new Date().toISOString(),
        }),
      });

      const row = updated?.[0] as Guest;
      setGuests((prev) => prev.map((g) => (g.id === row.id ? row : g)));
      showToast("Přespání změněno");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při změně přespání");
    }
  }

  async function quickToggleGuestChild(guest: Guest) {
    try {
      setError("");
      const updated = await supabaseRequest(`guests?id=eq.${guest.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          child: !guest.child,
          updated_at: new Date().toISOString(),
        }),
      });

      const row = updated?.[0] as Guest;
      setGuests((prev) => prev.map((g) => (g.id === row.id ? row : g)));
      showToast("Dítě změněno");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při změně dítěte");
    }
  }

  async function deleteGuest(id: string) {
    try {
      setError("");
      const shouldDelete = window.confirm("Opravdu smazat hosta?");
      if (!shouldDelete) return;

      await supabaseRequest(`guests?id=eq.${id}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });

      setGuests((prev) => prev.filter((g) => g.id !== id));
      if (editingGuestId === id) resetGuestForm();
      showToast("Host smazán");
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

  async function saveNote() {
    if (!noteInput.trim()) return;

    const payload = {
      text: noteInput.trim(),
      author: noteAuthor,
      updated_at: new Date().toISOString(),
    };

    try {
      setSaving(true);
      setError("");

      if (editingNoteId) {
        const updated = await supabaseRequest(`notes?id=eq.${editingNoteId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        const row = updated?.[0] as Note;
        setNotes((prev) => prev.map((n) => (n.id === row.id ? row : n)));
        showToast("Poznámka upravena");
      } else {
        const inserted = await supabaseRequest("notes", {
          method: "POST",
          body: JSON.stringify([
            { ...payload, created_at: new Date().toISOString() },
          ]),
        });

        const row = inserted?.[0] as Note;
        setNotes((prev) => [row, ...prev]);
        showToast("Poznámka přidána");
      }

      resetNoteForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při ukládání poznámky");
    } finally {
      setSaving(false);
    }
  }

  function startEditNote(note: Note) {
    setNoteInput(note.text);
    setNoteAuthor(note.author || "Oba");
    setEditingNoteId(note.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteNote(id: string) {
    try {
      setError("");
      const shouldDelete = window.confirm("Opravdu smazat poznámku?");
      if (!shouldDelete) return;

      await supabaseRequest(`notes?id=eq.${id}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });

      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (editingNoteId === id) resetNoteForm();
      showToast("Poznámka smazána");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při mazání poznámky");
    }
  }

  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (taskOwnerFilter !== "Vše") {
      list = list.filter((t) => t.owner === taskOwnerFilter);
    }
    if (taskStatusFilter !== "Vše") {
      list = list.filter((t) => t.status === taskStatusFilter);
    }
    if (taskPriorityFilter !== "Vše") {
      list = list.filter((t) => t.priority === taskPriorityFilter);
    }
    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase();
      list = list.filter(
        (t) =>
          t.text.toLowerCase().includes(q) ||
          (t.note || "").toLowerCase().includes(q)
      );
    }
    return sortTasks(list, taskSort);
  }, [
    tasks,
    taskOwnerFilter,
    taskStatusFilter,
    taskPriorityFilter,
    taskSort,
    taskSearch,
  ]);

  const filteredBudget = useMemo(() => {
    let list = [...budgetItems];
    if (budgetCategoryFilter !== "Vše") {
      list = list.filter((b) => b.category === budgetCategoryFilter);
    }
    if (budgetPaymentFilter !== "Vše") {
      list = list.filter((b) => b.payment_status === budgetPaymentFilter);
    }
    if (budgetOwnerFilter !== "Vše") {
      list = list.filter((b) => b.owner === budgetOwnerFilter);
    }
    if (budgetSearch.trim()) {
      const q = budgetSearch.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.vendor || "").toLowerCase().includes(q) ||
          (b.note || "").toLowerCase().includes(q)
      );
    }
    return sortBudget(list, budgetSort);
  }, [
    budgetItems,
    budgetCategoryFilter,
    budgetPaymentFilter,
    budgetOwnerFilter,
    budgetSort,
    budgetSearch,
  ]);

  const filteredGuests = useMemo(() => {
    let list = [...guests];
    if (guestSideFilter !== "Vše") {
      list = list.filter((g) => g.side === guestSideFilter);
    }
    if (guestRsvpFilter !== "Vše") {
      list = list.filter((g) => g.rsvp_status === guestRsvpFilter);
    }
    if (guestSearch.trim()) {
      const q = guestSearch.toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          (g.note || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [guests, guestSideFilter, guestRsvpFilter, guestSearch]);

  const taskStats = useMemo(() => getTaskStats(tasks), [tasks]);
  const budgetStats = useMemo(() => getBudgetStats(budgetItems), [budgetItems]);
  const guestStats = useMemo(() => getGuestStats(guests), [guests]);

  const recentItems = useMemo(() => {
    const latestTask = getLatestItem(tasks);
    const latestBudgetItem = getLatestItem(budgetItems);
    const latestGuest = getLatestItem(guests);

    return {
      task: latestTask?.text || "-",
      budget: latestBudgetItem?.name || "-",
      guest: latestGuest?.name || "-",
    };
  }, [tasks, budgetItems, guests]);

  const nextTasks = useMemo(() => {
    return [...tasks]
      .filter((t) => t.deadline && t.status !== "Hotovo" && !t.done)
      .sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""))
      .slice(0, 3)
      .map((t) => ({
        id: t.id,
        text: t.text,
        deadline: t.deadline,
      }));
  }, [tasks]);

  const nextBudgetItems = useMemo(() => {
    return [...budgetItems]
      .filter((b) => b.due_date && b.payment_status !== "Zaplaceno")
      .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))
      .slice(0, 3)
      .map((b) => ({
        id: b.id,
        name: b.name,
        due_date: b.due_date,
        payment_status: b.payment_status,
      }));
  }, [budgetItems]);

  if (loading) {
    return <div style={loadingStyle}>Načítám data ze Supabase…</div>;
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>💍 Svatba planner</h1>

      <div style={topBarStyle}>
        <button
          onClick={loadAll}
          style={primaryButtonStyle}
          disabled={loading || saving}
        >
          Obnovit data
        </button>

        <button
          onClick={exportData}
          style={secondaryButtonStyle}
          disabled={saving}
        >
          Export dat
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          style={secondaryButtonStyle}
          disabled={saving}
        >
          Import dat
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={importData}
        />

        <span style={statusStyle}>{saving ? "Ukládám…" : "Připraveno"}</span>
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {toast && <div style={toastStyle}>{toast}</div>}

      <DashboardSection
        isOpen={sectionsOpen.dashboard}
        onToggle={() => toggleSection("dashboard")}
        taskStats={taskStats}
        budgetStats={budgetStats}
        guestStats={guestStats}
        recentItems={recentItems}
        nextTasks={nextTasks}
        nextBudgetItems={nextBudgetItems}
      />

      <TasksSection
        isOpen={sectionsOpen.tasks}
        onToggle={() => toggleSection("tasks")}
        people={people}
        taskStatuses={taskStatuses}
        taskPriorities={taskPriorities}
        taskStats={taskStats}
        taskInput={taskInput}
        setTaskInput={setTaskInput}
        taskOwner={taskOwner}
        setTaskOwner={setTaskOwner}
        taskStatus={taskStatus}
        setTaskStatus={setTaskStatus}
        taskPriority={taskPriority}
        setTaskPriority={setTaskPriority}
        taskUpdatedBy={taskUpdatedBy}
        setTaskUpdatedBy={setTaskUpdatedBy}
        taskDeadline={taskDeadline}
        setTaskDeadline={setTaskDeadline}
        taskNote={taskNote}
        setTaskNote={setTaskNote}
        editingTaskId={editingTaskId}
        saveTask={saveTask}
        resetTaskForm={resetTaskForm}
        saving={saving}
        taskOwnerFilter={taskOwnerFilter}
        setTaskOwnerFilter={setTaskOwnerFilter}
        taskStatusFilter={taskStatusFilter}
        setTaskStatusFilter={setTaskStatusFilter}
        taskPriorityFilter={taskPriorityFilter}
        setTaskPriorityFilter={setTaskPriorityFilter}
        taskSort={taskSort}
        setTaskSort={setTaskSort}
        taskSearch={taskSearch}
        setTaskSearch={setTaskSearch}
        filteredTasks={filteredTasks}
        toggleTask={toggleTask}
        startEditTask={startEditTask}
        deleteTask={deleteTask}
      />

      <BudgetSection
        isOpen={sectionsOpen.budget}
        onToggle={() => toggleSection("budget")}
        categories={categories}
        paymentStatuses={paymentStatuses}
        people={people}
        budgetStats={budgetStats}
        category={category}
        setCategory={setCategory}
        budgetName={budgetName}
        setBudgetName={setBudgetName}
        budgetOwner={budgetOwner}
        setBudgetOwner={setBudgetOwner}
        vendor={vendor}
        setVendor={setVendor}
        dueDate={dueDate}
        setDueDate={setDueDate}
        paymentStatus={paymentStatus}
        setPaymentStatus={setPaymentStatus}
        planned={planned}
        setPlanned={setPlanned}
        actual={actual}
        setActual={setActual}
        deposit={deposit}
        setDeposit={setDeposit}
        fullyPaid={fullyPaid}
        setFullyPaid={setFullyPaid}
        budgetUpdatedBy={budgetUpdatedBy}
        setBudgetUpdatedBy={setBudgetUpdatedBy}
        budgetNote={budgetNote}
        setBudgetNote={setBudgetNote}
        editingBudgetId={editingBudgetId}
        saveBudgetItem={saveBudgetItem}
        resetBudgetForm={resetBudgetForm}
        saving={saving}
        budgetCategoryFilter={budgetCategoryFilter}
        setBudgetCategoryFilter={setBudgetCategoryFilter}
        budgetPaymentFilter={budgetPaymentFilter}
        setBudgetPaymentFilter={setBudgetPaymentFilter}
        budgetOwnerFilter={budgetOwnerFilter}
        setBudgetOwnerFilter={setBudgetOwnerFilter}
        budgetSort={budgetSort}
        setBudgetSort={setBudgetSort}
        budgetSearch={budgetSearch}
        setBudgetSearch={setBudgetSearch}
        filteredBudget={filteredBudget}
        startEditBudgetItem={startEditBudgetItem}
        deleteBudgetItem={deleteBudgetItem}
        quickToggleBudgetPaid={quickToggleBudgetPaid}
      />

      <GuestsSection
        isOpen={sectionsOpen.guests}
        onToggle={() => toggleSection("guests")}
        guestSides={guestSides}
        rsvpStatuses={rsvpStatuses}
        people={people}
        guestStats={guestStats}
        guestName={guestName}
        setGuestName={setGuestName}
        guestSide={guestSide}
        setGuestSide={setGuestSide}
        guestRsvp={guestRsvp}
        setGuestRsvp={setGuestRsvp}
        guestCount={guestCount}
        setGuestCount={setGuestCount}
        guestAccommodation={guestAccommodation}
        setGuestAccommodation={setGuestAccommodation}
        guestChild={guestChild}
        setGuestChild={setGuestChild}
        guestUpdatedBy={guestUpdatedBy}
        setGuestUpdatedBy={setGuestUpdatedBy}
        guestNote={guestNote}
        setGuestNote={setGuestNote}
        editingGuestId={editingGuestId}
        saveGuest={saveGuest}
        resetGuestForm={resetGuestForm}
        saving={saving}
        guestSideFilter={guestSideFilter}
        setGuestSideFilter={setGuestSideFilter}
        guestRsvpFilter={guestRsvpFilter}
        setGuestRsvpFilter={setGuestRsvpFilter}
        guestSearch={guestSearch}
        setGuestSearch={setGuestSearch}
        filteredGuests={filteredGuests}
        toggleGuest={toggleGuest}
        startEditGuest={startEditGuest}
        deleteGuest={deleteGuest}
        quickToggleGuestAccommodation={quickToggleGuestAccommodation}
        quickToggleGuestChild={quickToggleGuestChild}
      />

      <NotesSection
        isOpen={sectionsOpen.notes}
        onToggle={() => toggleSection("notes")}
        people={people}
        noteInput={noteInput}
        setNoteInput={setNoteInput}
        noteAuthor={noteAuthor}
        setNoteAuthor={setNoteAuthor}
        editingNoteId={editingNoteId}
        saveNote={saveNote}
        resetNoteForm={resetNoteForm}
        saving={saving}
        notes={notes}
        startEditNote={startEditNote}
        deleteNote={deleteNote}
      />
    </div>
  );
}
