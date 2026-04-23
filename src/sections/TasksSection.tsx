import React from "react";
import type { Person, Task, TaskPriority, TaskStatus } from "../types";
import { formatDate } from "../lib/utils";
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
} from "../ui";

function getTaskBucket(deadline: string | null) {
  if (!deadline) return "no_deadline";

  const today = new Date();
  const target = new Date(deadline);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return "today";
  if (diffDays <= 7) return "soon";
  return "later";
}

function isOverdue(deadline: string | null) {
  if (!deadline) return false;

  const today = new Date();
  const target = new Date(deadline);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return target.getTime() < today.getTime();
}

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  people: Person[];
  taskStatuses: TaskStatus[];
  taskPriorities: TaskPriority[];
  taskStats: {
    total: number;
    completed: number;
    pending: number;
    waiting: number;
  };
  taskInput: string;
  setTaskInput: (v: string) => void;
  taskOwner: Person;
  setTaskOwner: (v: Person) => void;
  taskStatus: TaskStatus;
  setTaskStatus: (v: TaskStatus) => void;
  taskPriority: TaskPriority;
  setTaskPriority: (v: TaskPriority) => void;
  taskUpdatedBy: Person;
  setTaskUpdatedBy: (v: Person) => void;
  taskDeadline: string;
  setTaskDeadline: (v: string) => void;
  taskNote: string;
  setTaskNote: (v: string) => void;
  editingTaskId: string | null;
  lastSavedAt: number | null;
  saveTask: () => void;
  resetTaskForm: () => void;
  saving: boolean;
  taskOwnerFilter: Person | "Vše";
  setTaskOwnerFilter: (v: Person | "Vše") => void;
  taskStatusFilter: TaskStatus | "Vše";
  setTaskStatusFilter: (v: TaskStatus | "Vše") => void;
  taskPriorityFilter: TaskPriority | "Vše";
  setTaskPriorityFilter: (v: TaskPriority | "Vše") => void;
  taskSort: "deadline" | "owner" | "priority";
  setTaskSort: (v: "deadline" | "owner" | "priority") => void;
  taskSearch: string;
  setTaskSearch: (v: string) => void;
  filteredTasks: Task[];
  toggleTask: (task: Task) => void;
  startEditTask: (task: Task) => void;
  deleteTask: (id: string) => void;
};

export default function TasksSection(props: Props) {
  const {
    isOpen,
    onToggle,
    people,
    taskStatuses,
    taskPriorities,
    taskStats,
    taskInput,
    setTaskInput,
    taskOwner,
    setTaskOwner,
    taskStatus,
    setTaskStatus,
    taskPriority,
    setTaskPriority,
    taskUpdatedBy,
    setTaskUpdatedBy,
    taskDeadline,
    setTaskDeadline,
    taskNote,
    setTaskNote,
    editingTaskId,
    lastSavedAt,
    saveTask,
    resetTaskForm,
    saving,
    taskOwnerFilter,
    setTaskOwnerFilter,
    taskStatusFilter,
    setTaskStatusFilter,
    taskPriorityFilter,
    setTaskPriorityFilter,
    taskSort,
    setTaskSort,
    taskSearch,
    setTaskSearch,
    filteredTasks,
    toggleTask,
    startEditTask,
    deleteTask,
  } = props;

  const [showCompleted, setShowCompleted] = React.useState(false);
  const [showSaved, setShowSaved] = React.useState(false);
  const editFormRef = React.useRef<HTMLDivElement | null>(null);

  function safeSmoothScrollTo(top: number) {
    try {
      window.scrollTo({ top, behavior: "smooth" });
    } catch {
      window.scrollTo(0, top);
    }
  }

  React.useEffect(() => {
    if (!editingTaskId || !isOpen || !editFormRef.current) return;

    const scrollToForm = () => {
      const node = editFormRef.current;
      if (!node) return;
      const top = window.scrollY + node.getBoundingClientRect().top - 20;
      safeSmoothScrollTo(Math.max(0, top));
    };

    const rafId = window.requestAnimationFrame(scrollToForm);
    const timeoutId = window.setTimeout(scrollToForm, 260);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [editingTaskId, isOpen]);

  React.useEffect(() => {
    if (!lastSavedAt) return;
    setShowSaved(true);
    const timeoutId = window.setTimeout(() => setShowSaved(false), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [lastSavedAt]);

  const canSaveTask = taskInput.trim().length > 0;

  function handleTaskInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (!saving && canSaveTask) {
      saveTask();
    }
  }

  const visibleTasks = showCompleted
    ? filteredTasks
    : filteredTasks.filter((task) => task.status !== "Hotovo" && !task.done);

  const todayTasks = visibleTasks.filter(
    (task) => getTaskBucket(task.deadline) === "today"
  );

  const soonTasks = visibleTasks.filter(
    (task) => getTaskBucket(task.deadline) === "soon"
  );

  const laterTasks = visibleTasks.filter(
    (task) => getTaskBucket(task.deadline) === "later"
  );

  const noDeadlineTasks = visibleTasks.filter(
    (task) => getTaskBucket(task.deadline) === "no_deadline"
  );

  function renderTaskCard(task: Task) {
    const overdue = isOverdue(task.deadline);

    return (
      <div
        key={task.id}
        style={{
          ...cardStyle,
          borderLeft:
            task.status === "Hotovo"
              ? "6px solid #16a34a"
              : task.priority === "Vysoká"
              ? "6px solid #f59e0b"
              : overdue
              ? "6px solid #ef4444"
              : "6px solid transparent",
        }}
      >
        <div style={badgeRowStyle}>
          <span style={badgeStyle}>{task.owner}</span>
          <span style={badgeStyle}>{task.status}</span>
          <span style={badgeStyle}>{task.priority}</span>
          {overdue && task.status !== "Hotovo" && (
            <span
              style={{
                ...badgeStyle,
                background: "#fee2e2",
                color: "#991b1b",
                border: "1px solid #fecaca",
              }}
            >
              Po termínu
            </span>
          )}
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
            {task.done || task.status === "Hotovo"
              ? "Označit zpět"
              : "Označit hotovo"}
          </button>
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
    );
  }

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
          background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
          boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
        }}
      >
        ✅ Checklist {isOpen ? "▲" : "▼"}
      </button>

      {isOpen && (
        <>
          <div style={statsWrapStyle}>
            <div style={statBoxStyle}>Úkolů: {taskStats.total}</div>
            <div style={statBoxStyle}>Hotovo: {taskStats.completed}</div>
            <div style={statBoxStyle}>Zbývá: {taskStats.pending}</div>
            <div style={statBoxStyle}>Čeká: {taskStats.waiting}</div>
          </div>

          <div ref={editFormRef} style={formStackStyle}>
            {editingTaskId && (
              <div
                style={{
                  border: "1px solid #bfdbfe",
                  background: "#eff6ff",
                  color: "#1e3a8a",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontWeight: 700,
                }}
              >
                Editační režim: upravuješ existující úkol.
              </div>
            )}
            <input
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={handleTaskInputKeyDown}
              aria-label="Název úkolu"
              placeholder="Např. zamluvit místo"
              style={inputStyle}
            />

            <select
              value={taskOwner}
              onChange={(e) => setTaskOwner(e.target.value as Person)}
              aria-label="Vlastník úkolu"
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
              aria-label="Stav úkolu"
              style={inputStyle}
            >
              {taskStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
              aria-label="Priorita úkolu"
              style={inputStyle}
            >
              {taskPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  Priorita: {priority}
                </option>
              ))}
            </select>

            <select
              value={taskUpdatedBy}
              onChange={(e) => setTaskUpdatedBy(e.target.value as Person)}
              aria-label="Kdo upravoval úkol"
              style={inputStyle}
            >
              {people.map((person) => (
                <option key={person} value={person}>
                  Update dělal: {person}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={taskDeadline}
              onChange={(e) => setTaskDeadline(e.target.value)}
              aria-label="Deadline úkolu"
              style={inputStyle}
            />

            <input
              value={taskNote}
              onChange={(e) => setTaskNote(e.target.value)}
              aria-label="Poznámka k úkolu"
              placeholder="Komentář / poznámka"
              style={inputStyle}
            />

            <div style={buttonRowStyle}>
              <button
                onClick={saveTask}
                style={primaryButtonStyle}
                disabled={saving || !canSaveTask}
              >
                {saving
                  ? "Ukládám..."
                  : editingTaskId
                  ? "Uložit změny"
                  : "Přidat úkol"}
              </button>

              {editingTaskId && (
                <button
                  onClick={resetTaskForm}
                  style={secondaryButtonStyle}
                  disabled={saving}
                >
                  Zrušit
                </button>
              )}
            </div>
            {showSaved && (
              <div style={{ color: "#166534", fontWeight: 700, fontSize: 13 }}>
                Uloženo
              </div>
            )}
          </div>

          <div style={filterCardStyle}>
            <div style={filterTitleStyle}>Filtry a řazení</div>

            <input
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              aria-label="Hledat úkoly"
              placeholder="Hledat v úkolech a poznámkách"
              style={inputStyle}
            />

            <button
              onClick={() => setShowCompleted(!showCompleted)}
              style={secondaryButtonStyle}
            >
              {showCompleted ? "Skrýt hotové úkoly" : "Zobrazit hotové úkoly"}
            </button>

            <div style={chipsWrapStyle}>
              <span style={filterLabelStyle}>Vlastník:</span>
              <button
                style={chipStyle(taskOwnerFilter === "Vše")}
                onClick={() => setTaskOwnerFilter("Vše")}
              >
                Vše
              </button>
              {people.map((person) => (
                <button
                  key={person}
                  style={chipStyle(taskOwnerFilter === person)}
                  onClick={() => setTaskOwnerFilter(person)}
                >
                  {person}
                </button>
              ))}
            </div>

            <div style={chipsWrapStyle}>
              <span style={filterLabelStyle}>Stav:</span>
              <button
                style={chipStyle(taskStatusFilter === "Vše")}
                onClick={() => setTaskStatusFilter("Vše")}
              >
                Vše
              </button>
              {taskStatuses.map((status) => (
                <button
                  key={status}
                  style={chipStyle(taskStatusFilter === status)}
                  onClick={() => setTaskStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <div style={chipsWrapStyle}>
              <span style={filterLabelStyle}>Priorita:</span>
              <button
                style={chipStyle(taskPriorityFilter === "Vše")}
                onClick={() => setTaskPriorityFilter("Vše")}
              >
                Vše
              </button>
              {taskPriorities.map((priority) => (
                <button
                  key={priority}
                  style={chipStyle(taskPriorityFilter === priority)}
                  onClick={() => setTaskPriorityFilter(priority)}
                >
                  {priority}
                </button>
              ))}
            </div>

            <select
              value={taskSort}
              onChange={(e) =>
                setTaskSort(e.target.value as "deadline" | "owner" | "priority")
              }
              aria-label="Řazení úkolů"
              style={inputStyle}
            >
              <option value="deadline">Řadit podle deadline</option>
              <option value="owner">Řadit podle vlastníka</option>
              <option value="priority">Řadit podle priority</option>
            </select>
          </div>

          <div style={cardListStyle}>
            {visibleTasks.length === 0 && (
              <div style={emptyStyle}>Žádné úkoly pro aktuální filtr.</div>
            )}

            {todayTasks.length > 0 && (
              <div>
                <h3 style={{ marginBottom: 10 }}>🔥 Dnes / zítra</h3>
                <div style={cardListStyle}>{todayTasks.map(renderTaskCard)}</div>
              </div>
            )}

            {soonTasks.length > 0 && (
              <div>
                <h3 style={{ marginBottom: 10, marginTop: 18 }}>⏳ Do týdne</h3>
                <div style={cardListStyle}>{soonTasks.map(renderTaskCard)}</div>
              </div>
            )}

            {laterTasks.length > 0 && (
              <div>
                <h3 style={{ marginBottom: 10, marginTop: 18 }}>📅 Později</h3>
                <div style={cardListStyle}>{laterTasks.map(renderTaskCard)}</div>
              </div>
            )}

            {noDeadlineTasks.length > 0 && (
              <div>
                <h3 style={{ marginBottom: 10, marginTop: 18 }}>🕳️ Bez termínu</h3>
                <div style={cardListStyle}>{noDeadlineTasks.map(renderTaskCard)}</div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

