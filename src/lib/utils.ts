import type {
  BudgetItem,
  Guest,
  PaymentStatus,
  Task,
  TaskPriority,
  TaskStatus,
} from "../types";

export function formatDate(date: string | null | undefined) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("cs-CZ");
}

export function isTaskDone(task: Task) {
  return task.done || task.status === "Hotovo";
}

export function normalizeTaskStatus(done: boolean): TaskStatus {
  return done ? "Hotovo" : "To do";
}

export function normalizePaymentStatus(
  fullyPaid: boolean,
  deposit: number,
  fallback: PaymentStatus
): PaymentStatus {
  if (fullyPaid) return "Zaplaceno";
  if (deposit > 0) return "Záloha";
  return fallback;
}

export function getRemaining(item: BudgetItem) {
  if (item.fully_paid || item.payment_status === "Zaplaceno") return 0;
  return Math.max(item.actual - item.deposit, 0);
}

export function getTaskPriorityWeight(priority: TaskPriority) {
  const map: Record<TaskPriority, number> = {
    Vysoká: 0,
    Střední: 1,
    Nízká: 2,
  };
  return map[priority];
}

export function normalizeGuestConfirmed(status: Guest["rsvp_status"]) {
  return status === "Potvrzeno";
}

export function sortTasks(
  list: Task[],
  sortBy: "deadline" | "owner" | "priority"
) {
  const copy = [...list];
  copy.sort((a, b) => {
    if (sortBy === "deadline") {
      return (a.deadline || "9999-12-31").localeCompare(
        b.deadline || "9999-12-31"
      );
    }
    if (sortBy === "owner") {
      return a.owner.localeCompare(b.owner);
    }
    return getTaskPriorityWeight(a.priority) - getTaskPriorityWeight(b.priority);
  });
  return copy;
}

export function sortBudget(
  list: BudgetItem[],
  sortBy: "due_date" | "category" | "remaining"
) {
  const copy = [...list];
  copy.sort((a, b) => {
    if (sortBy === "due_date") {
      return (a.due_date || "9999-12-31").localeCompare(
        b.due_date || "9999-12-31"
      );
    }
    if (sortBy === "category") {
      return a.category.localeCompare(b.category);
    }
    return getRemaining(b) - getRemaining(a);
  });
  return copy;
}

export function getTaskStats(tasks: Task[]) {
  const completed = tasks.filter(isTaskDone).length;
  const waiting = tasks.filter((t) => t.status === "Čeká").length;
  const high = tasks.filter((t) => t.priority === "Vysoká").length;

  return {
    total: tasks.length,
    completed,
    pending: tasks.length - completed,
    waiting,
    high,
    byOwner: {
      Ondra: tasks.filter((t) => t.owner === "Ondra").length,
      Kája: tasks.filter((t) => t.owner === "Kája").length,
      Oba: tasks.filter((t) => t.owner === "Oba").length,
    },
  };
}

export function getBudgetStats(items: BudgetItem[]) {
  const totalPlanned = items.reduce((s, i) => s + i.planned, 0);
  const totalActual = items.reduce((s, i) => s + i.actual, 0);
  const totalDeposit = items.reduce((s, i) => s + i.deposit, 0);
  const totalRemaining = items.reduce((s, i) => s + getRemaining(i), 0);
  const totalPaid = totalActual - totalRemaining;
  const overdue = items.filter(
    (i) =>
      i.due_date &&
      new Date(i.due_date).getTime() < Date.now() &&
      i.payment_status !== "Zaplaceno"
  ).length;

  return {
    totalPlanned,
    totalActual,
    totalDeposit,
    totalRemaining,
    totalPaid,
    overdue,
  };
}

export function getGuestStats(guests: Guest[]) {
  const confirmed = guests.filter((g) => g.rsvp_status === "Potvrzeno").length;
  const pending = guests.filter((g) => g.rsvp_status === "Bez odpovědi").length;
  const declined = guests.filter((g) => g.rsvp_status === "Odmítl").length;
  const totalPeople = guests.reduce((sum, g) => sum + (g.guest_count || 1), 0);
  const sleeping = guests.filter((g) => g.accommodation).length;
  const children = guests.filter((g) => g.child).length;

  return {
    total: guests.length,
    confirmed,
    pending,
    declined,
    totalPeople,
    sleeping,
    children,
  };
}
