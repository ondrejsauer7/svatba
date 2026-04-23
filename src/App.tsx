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
  heroStatCardStyle,
  heroStatLabelStyle,
  heroStatValueStyle,
  heroStatsGridStyle,
  heroStyle,
  loadingStyle,
  primaryButtonStyle,
  quickNavButtonStyle,
  quickNavStyle,
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
const sectionsStorageKey = "svatba.sections.open.v2";
const sectionOrder: SectionKey[] = [
  "dashboard",
  "tasks",
  "budget",
  "guests",
  "notes",
];
const sectionLabels: Record<SectionKey, string> = {
  dashboard: "Přehled",
  tasks: "Checklist",
  budget: "Rozpočet",
  guests: "Hosté",
  notes: "Poznámky",
};

type BackupFile = {
  version: number;
  tasks: Task[];
  budgetItems: BudgetItem[];
  guests: Guest[];
  notes: Note[];
  exportedAt: string;
};

type UndoEntry =
  | { kind: "task"; item: Task }
  | { kind: "budget"; item: BudgetItem }
  | { kind: "guest"; item: Guest }
  | { kind: "note"; item: Note };

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

function parseRequiredArrayWithId<T extends { id: string }>(
  value: unknown,
  fieldName: string
): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`Neplatna zaloha: chybi pole "${fieldName}".`);
  }

  const parsed = safeArrayWithId<T>(value);
  if (parsed.length !== value.length) {
    throw new Error(
      `Neplatna zaloha: pole "${fieldName}" obsahuje zaznam bez id.`
    );
  }

  return parsed;
}

function formatBackupFileName(date: Date) {
  const parts = new Intl.DateTimeFormat("cs-CZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  return `svatba-backup-${get("year")}-${get("month")}-${get("day")}_${get(
    "hour"
  )}-${get("minute")}.json`;
}

function formatImportSourceDate(source: string | undefined) {
  if (!source) return "neznamy cas exportu";
  const date = new Date(source);
  if (Number.isNaN(date.getTime())) return "neznamy cas exportu";
  return date.toLocaleString("cs-CZ");
}

function getImportSummary(
  importedTasks: Task[],
  importedBudget: BudgetItem[],
  importedGuests: Guest[],
  importedNotes: Note[]
) {
  return `ukoly: ${importedTasks.length}, rozpocet: ${importedBudget.length}, hoste: ${importedGuests.length}, poznamky: ${importedNotes.length}`;
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
  const [busyTopBar, setBusyTopBar] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);
  const [savingGuest, setSavingGuest] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [taskLastSavedAt, setTaskLastSavedAt] = useState<number | null>(null);
  const [budgetLastSavedAt, setBudgetLastSavedAt] = useState<number | null>(null);
  const [guestLastSavedAt, setGuestLastSavedAt] = useState<number | null>(null);
  const [noteLastSavedAt, setNoteLastSavedAt] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [undoEntry, setUndoEntry] = useState<UndoEntry | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard");
  const undoTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const tasksRef = useRef<HTMLDivElement | null>(null);
  const budgetRef = useRef<HTMLDivElement | null>(null);
  const guestsRef = useRef<HTMLDivElement | null>(null);
  const notesRef = useRef<HTMLDivElement | null>(null);

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

  function clearUndoTimer() {
    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }

  function stageUndo(entry: UndoEntry, label: string) {
    clearUndoTimer();
    setUndoEntry(entry);
    showToast(`${label} smazán. Můžeš ho vrátit tlačítkem Obnovit.`);
    undoTimerRef.current = window.setTimeout(() => {
      setUndoEntry(null);
      undoTimerRef.current = null;
    }, 9000);
  }

  async function restoreLastDeleted() {
    if (!undoEntry) return;

    const entry = undoEntry;
    clearUndoTimer();
    setUndoEntry(null);
    setError("");

    try {
      setBusyTopBar(true);

      if (entry.kind === "task") {
        const inserted = await supabaseRequest("tasks", {
          method: "POST",
          body: JSON.stringify([entry.item]),
        });
        const row = inserted?.[0] as Task;
        setTasks((prev) => [row, ...prev]);
        showToast("Úkol obnoven");
        return;
      }

      if (entry.kind === "budget") {
        const inserted = await supabaseRequest("budget", {
          method: "POST",
          body: JSON.stringify([entry.item]),
        });
        const row = inserted?.[0] as BudgetItem;
        setBudgetItems((prev) => [row, ...prev]);
        showToast("Položka rozpočtu obnovena");
        return;
      }

      if (entry.kind === "guest") {
        const inserted = await supabaseRequest("guests", {
          method: "POST",
          body: JSON.stringify([entry.item]),
        });
        const row = inserted?.[0] as Guest;
        setGuests((prev) => [row, ...prev]);
        showToast("Host obnoven");
        return;
      }

      const inserted = await supabaseRequest("notes", {
        method: "POST",
        body: JSON.stringify([entry.item]),
      });
      const row = inserted?.[0] as Note;
      setNotes((prev) => [row, ...prev]);
      showToast("Poznámka obnovena");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Obnoveni smazane polozky selhalo");
    } finally {
      setBusyTopBar(false);
    }
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
      setLastLoadedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při načítání");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem(sectionsStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Record<SectionKey, unknown>>;
        const readOpen = (key: SectionKey) =>
          typeof parsed[key] === "boolean" ? (parsed[key] as boolean) : true;

        setSectionsOpen({
          dashboard: readOpen("dashboard"),
          tasks: readOpen("tasks"),
          budget: readOpen("budget"),
          guests: readOpen("guests"),
          notes: readOpen("notes"),
        });
      }
    } catch {
      // fallback to defaults when local storage contains invalid value
    }

    loadAll();
  }, []);

  useEffect(() => {
    return () => {
      clearUndoTimer();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(sectionsStorageKey, JSON.stringify(sectionsOpen));
    } catch {
      // ignore browser storage errors
    }
  }, [sectionsOpen]);

  function getSectionRef(section: SectionKey) {
    if (section === "dashboard") return dashboardRef;
    if (section === "tasks") return tasksRef;
    if (section === "budget") return budgetRef;
    if (section === "guests") return guestsRef;
    return notesRef;
  }

  function safeScrollIntoViewStart(target: HTMLElement) {
    try {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      target.scrollIntoView();
    }
  }

  function scrollToSection(section: SectionKey) {
    setActiveSection(section);
    setSectionsOpen((prev) => ({ ...prev, [section]: true }));

    window.requestAnimationFrame(() => {
      const target = getSectionRef(section).current;
      if (!target) return;
      safeScrollIntoViewStart(target);
    });
  }

  function toggleSection(section: SectionKey) {
    setActiveSection(section);
    setSectionsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  function setAllSections(nextOpen: boolean) {
    setSectionsOpen({
      dashboard: nextOpen,
      tasks: nextOpen,
      budget: nextOpen,
      guests: nextOpen,
      notes: nextOpen,
    });
  }

  useEffect(() => {
    if (loading) return;
    if (typeof window === "undefined") return;
    if (typeof window.IntersectionObserver !== "function") return;

    const observed = sectionOrder
      .map((section) => ({ section, node: getSectionRef(section).current }))
      .filter(
        (item): item is { section: SectionKey; node: HTMLDivElement } =>
          Boolean(item.node)
      );

    if (observed.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { section: SectionKey; ratio: number } | null = null;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const match = observed.find((item) => item.node === entry.target);
          if (!match) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { section: match.section, ratio: entry.intersectionRatio };
          }
        }

        if (best) {
          setActiveSection(best.section);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.7],
        rootMargin: "-24% 0px -52% 0px",
      }
    );

    for (const item of observed) {
      observer.observe(item.node);
    }

    return () => observer.disconnect();
  }, [loading]);

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

  function resetAllFilters() {
    setTaskOwnerFilter("Vše");
    setTaskStatusFilter("Vše");
    setTaskPriorityFilter("Vše");
    setTaskSort("deadline");
    setTaskSearch("");

    setBudgetCategoryFilter("Vše");
    setBudgetPaymentFilter("Vše");
    setBudgetOwnerFilter("Vše");
    setBudgetSort("due_date");
    setBudgetSearch("");

    setGuestSideFilter("Vše");
    setGuestRsvpFilter("Vše");
    setGuestSearch("");
    showToast("Filtry vyčištěny");
  }

  function exportData() {
    const data: BackupFile = {
      version: 1,
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
    a.download = formatBackupFileName(new Date());
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      `Záloha exportovana (${getImportSummary(tasks, budgetItems, guests, notes)})`
    );
  }

  function confirmDestructiveAction(label: string, detail?: string) {
    const firstMessage = detail
      ? `Opravdu smazat ${label}: "${detail}"?`
      : `Opravdu smazat ${label}?`;
    const firstConfirmation = window.confirm(firstMessage);
    if (!firstConfirmation) return false;

    return window.confirm("Tuto akci nejde vratit. Potvrdit trvale smazani?");
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
      setBusyTopBar(true);
      setError("");

      const text = await file.text();
      const data = JSON.parse(text) as unknown;
      if (!data || typeof data !== "object") {
        throw new Error("Neplatny format zalohy.");
      }

      const typedData = data as Partial<BackupFile>;
      const importedTasks = parseRequiredArrayWithId<Task>(
        typedData.tasks,
        "tasks"
      );
      const importedBudget = parseRequiredArrayWithId<BudgetItem>(
        typedData.budgetItems,
        "budgetItems"
      );
      const importedGuests = parseRequiredArrayWithId<Guest>(
        typedData.guests,
        "guests"
      );
      const importedNotes = parseRequiredArrayWithId<Note>(
        typedData.notes,
        "notes"
      );
      const importSummary = getImportSummary(
        importedTasks,
        importedBudget,
        importedGuests,
        importedNotes
      );
      const exportTime = formatImportSourceDate(typedData.exportedAt);

      const shouldReplace = window.confirm(
        `Import nahraje data (${importSummary}). Zdrojova zaloha: ${exportTime}. Pokracovat?`
      );
      if (!shouldReplace) return;

      const shouldConfirmDanger = window.confirm(
        "Import prepise vsechna aktualni data. Opravdu provest import?"
      );
      if (!shouldConfirmDanger) return;

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
      showToast(`Import hotovy (${importSummary})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import selhal");
    } finally {
      setBusyTopBar(false);
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
      setSavingTask(true);
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

      setTaskLastSavedAt(Date.now());
      resetTaskForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při ukládání úkolu");
    } finally {
      setSavingTask(false);
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
      const taskToDelete = tasks.find((t) => t.id === id);
      if (!taskToDelete) return;
      const shouldDelete = confirmDestructiveAction("ukol", taskToDelete?.text);
      if (!shouldDelete) return;

      await supabaseRequest(`tasks?id=eq.${id}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });

      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (editingTaskId === id) resetTaskForm();
      stageUndo({ kind: "task", item: taskToDelete }, "Úkol");
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
      setSavingBudget(true);
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

      setBudgetLastSavedAt(Date.now());
      resetBudgetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Chyba při ukládání rozpočtu"
      );
    } finally {
      setSavingBudget(false);
    }
  }

  async function deleteBudgetItem(id: string) {
    try {
      setError("");
      const budgetItemToDelete = budgetItems.find((item) => item.id === id);
      if (!budgetItemToDelete) return;
      const shouldDelete = confirmDestructiveAction("položku rozpočtu", budgetItemToDelete?.name);
      if (!shouldDelete) return;

      await supabaseRequest(`budget?id=eq.${id}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });

      setBudgetItems((prev) => prev.filter((item) => item.id !== id));
      if (editingBudgetId === id) resetBudgetForm();
      stageUndo({ kind: "budget", item: budgetItemToDelete }, "Položka rozpočtu");
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
      setSavingGuest(true);
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

      setGuestLastSavedAt(Date.now());
      resetGuestForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při ukládání hosta");
    } finally {
      setSavingGuest(false);
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
      const guestToDelete = guests.find((g) => g.id === id);
      if (!guestToDelete) return;
      const shouldDelete = confirmDestructiveAction("hosta", guestToDelete?.name);
      if (!shouldDelete) return;

      await supabaseRequest(`guests?id=eq.${id}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });

      setGuests((prev) => prev.filter((g) => g.id !== id));
      if (editingGuestId === id) resetGuestForm();
      stageUndo({ kind: "guest", item: guestToDelete }, "Host");
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
  }

  async function saveNote() {
    if (!noteInput.trim()) return;

    const payload = {
      text: noteInput.trim(),
      author: noteAuthor,
      updated_at: new Date().toISOString(),
    };

    try {
      setSavingNote(true);
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

      setNoteLastSavedAt(Date.now());
      resetNoteForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba při ukládání poznámky");
    } finally {
      setSavingNote(false);
    }
  }

  function startEditNote(note: Note) {
    setNoteInput(note.text);
    setNoteAuthor(note.author || "Oba");
    setEditingNoteId(note.id);
  }

  async function deleteNote(id: string) {
    try {
      setError("");
      const noteToDelete = notes.find((n) => n.id === id);
      if (!noteToDelete) return;
      const preview = noteToDelete?.text
        ? `${noteToDelete.text.slice(0, 40)}${noteToDelete.text.length > 40 ? "..." : ""}`
        : undefined;
      const shouldDelete = confirmDestructiveAction("poznámku", preview);
      if (!shouldDelete) return;

      await supabaseRequest(`notes?id=eq.${id}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });

      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (editingNoteId === id) resetNoteForm();
      stageUndo({ kind: "note", item: noteToDelete }, "Poznámka");
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

  const taskCompletionRate =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;
  const budgetPaidRate =
    budgetStats.totalActual > 0
      ? Math.round((budgetStats.totalPaid / budgetStats.totalActual) * 100)
      : 0;
  const lastSyncLabel = lastLoadedAt
    ? lastLoadedAt.toLocaleTimeString("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";
  const activeSectionSaveLabel = savingTask
    ? "Ukládám checklist..."
    : savingBudget
    ? "Ukládám rozpočet..."
    : savingGuest
    ? "Ukládám hosty..."
    : savingNote
    ? "Ukládám poznámky..."
    : "";
  const anySectionSaving = savingTask || savingBudget || savingGuest || savingNote;
  const anySaving = busyTopBar || anySectionSaving;
  const statusText = busyTopBar
    ? "Probíhá hromadná operace..."
    : activeSectionSaveLabel || `Připraveno - sync ${lastSyncLabel}`;

  if (loading) {
    return <div style={loadingStyle}>Načítám data ze Supabase...</div>;
  }

  return (
    <div style={containerStyle}>
      <header style={heroStyle} className="wedding-reveal">
        <h1 style={titleStyle}>Svatba</h1>
        <div style={heroStatsGridStyle}>
          <div style={heroStatCardStyle}>
            <p style={heroStatLabelStyle}>Postup checklistu</p>
            <p style={heroStatValueStyle}>{taskCompletionRate} %</p>
          </div>
          <div style={heroStatCardStyle}>
            <p style={heroStatLabelStyle}>Hostů potvrzeno</p>
            <p style={heroStatValueStyle}>{guestStats.confirmed}</p>
          </div>
          <div style={heroStatCardStyle}>
            <p style={heroStatLabelStyle}>Zbývá doplatit</p>
            <p style={heroStatValueStyle}>{budgetStats.totalRemaining} Kc</p>
          </div>
          <div style={heroStatCardStyle}>
            <p style={heroStatLabelStyle}>Poslední sync</p>
            <p style={heroStatValueStyle}>{lastSyncLabel}</p>
          </div>
        </div>
        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 700, color: "#334155", fontSize: 14 }}>
            Checklist: {taskCompletionRate} %
          </div>
          <div
            style={{
              height: 10,
              background: "rgba(148, 163, 184, 0.25)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${taskCompletionRate}%`,
                background: "linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)",
                borderRadius: 999,
                transition: "width 220ms ease",
              }}
            />
          </div>
          <div style={{ fontWeight: 700, color: "#334155", fontSize: 14 }}>
            Uhrazený rozpočet: {budgetPaidRate} %
          </div>
          <div
            style={{
              height: 10,
              background: "rgba(148, 163, 184, 0.25)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${budgetPaidRate}%`,
                background: "linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)",
                borderRadius: 999,
                transition: "width 220ms ease",
              }}
            />
          </div>
        </div>
      </header>

      <div style={quickNavStyle} className="wedding-reveal">
        {sectionOrder.map((section) => (
          <button
            key={section}
            onClick={() => scrollToSection(section)}
            style={quickNavButtonStyle(activeSection === section)}
          >
            {sectionLabels[section]}
          </button>
        ))}
      </div>

      <div style={topBarStyle} className="wedding-reveal">
        <button
          onClick={loadAll}
          style={primaryButtonStyle}
          disabled={loading || anySaving}
        >
          Obnovit data
        </button>

        <button
          onClick={exportData}
          style={secondaryButtonStyle}
          disabled={anySaving}
        >
          Export dat
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          style={secondaryButtonStyle}
          disabled={anySaving}
        >
          Import dat
        </button>

        <button
          onClick={resetAllFilters}
          style={secondaryButtonStyle}
          disabled={anySaving}
        >
          Vycistit filtry
        </button>

        <button
          onClick={() => setAllSections(true)}
          style={secondaryButtonStyle}
          disabled={anySaving}
        >
          Rozbalit vse
        </button>

        <button
          onClick={() => setAllSections(false)}
          style={secondaryButtonStyle}
          disabled={anySaving}
        >
          Sbalit vse
        </button>

        {undoEntry && (
          <button
            onClick={restoreLastDeleted}
            style={secondaryButtonStyle}
            disabled={anySaving}
          >
            Obnovit smazané
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={importData}
        />

        <span style={statusStyle}>
          {statusText}
        </span>
      </div>

      {error && <div style={errorStyle}>{error}</div>}
      {toast && <div style={toastStyle}>{toast}</div>}

      <div ref={dashboardRef} className="wedding-section-anchor wedding-reveal">
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
      </div>

      <div ref={tasksRef} className="wedding-section-anchor wedding-reveal">
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
          lastSavedAt={taskLastSavedAt}
          saveTask={saveTask}
          resetTaskForm={resetTaskForm}
          saving={savingTask}
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
      </div>

      <div ref={budgetRef} className="wedding-section-anchor wedding-reveal">
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
          lastSavedAt={budgetLastSavedAt}
          saveBudgetItem={saveBudgetItem}
          resetBudgetForm={resetBudgetForm}
          saving={savingBudget}
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
      </div>

      <div ref={guestsRef} className="wedding-section-anchor wedding-reveal">
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
          lastSavedAt={guestLastSavedAt}
          saveGuest={saveGuest}
          resetGuestForm={resetGuestForm}
          saving={savingGuest}
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
      </div>

      <div ref={notesRef} className="wedding-section-anchor wedding-reveal">
        <NotesSection
          isOpen={sectionsOpen.notes}
          onToggle={() => toggleSection("notes")}
          people={people}
          noteInput={noteInput}
          setNoteInput={setNoteInput}
          noteAuthor={noteAuthor}
          setNoteAuthor={setNoteAuthor}
          editingNoteId={editingNoteId}
          lastSavedAt={noteLastSavedAt}
          saveNote={saveNote}
          resetNoteForm={resetNoteForm}
          saving={savingNote}
          notes={notes}
          startEditNote={startEditNote}
          deleteNote={deleteNote}
        />
      </div>
    </div>
  );
}





