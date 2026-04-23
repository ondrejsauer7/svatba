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
  sectionToggleStyle,
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
    filteredTasks,
    toggleTask,
    startEditTask,
    deleteTask,
  } = props;

  const todayTasks = filteredTasks.filter(
    (task) => getTaskBucket(task.deadline) === "today"
  );

  const soonTasks = filteredTasks.filter(
    (task) => getTaskBucket(task.deadline) === "soon"
  );

  const laterTasks = filteredTasks.filter(
    (task) => getTaskBucket(task.deadline) === "later"
  );

  const noDeadlineTasks = filteredTasks.filter(
    (task) => getTaskBucket(task.deadline) === "no_deadline"
  );

  function renderTaskCard(task: Task) {
    return (
      <div
        key={task.id}
        style={{
          ...cardStyle,
          borderLeft:
            task.status === "Hotovo"
              ? "6px solid green"
              : task.priority === "Vysoká"
              ? "6px solid orange"
              : task.deadline && new Date(task.deadline) < new Date()
              ? "6px solid red"
              : "6px solid transparent",
        }}
      >
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
      <button onClick={onToggle} style={sectionToggleStyle}>
        Checklist {isOpen ? "▲" : "▼"}
      </button>

      {isOpen && (
        <>
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

            <select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
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
              style={inputStyle}
            />

            <input
              value={taskNote}
              onChange={(e) => setTaskNote(e.target.value)}
              placeholder="Komentář / poznámka"
              style={inputStyle}
            />

            <div style={buttonRowStyle}>
              <button
                onClick={saveTask}
                style={primaryButtonStyle}
                disabled={saving}
              >
                {editingTaskId ? "Uložit" : "Přidat"}
              </button>

              {editingTaskId && (
                <button onClick={resetTaskForm} style={secondaryButtonStyle}>
                  Zrušit
                </button>
              )}
            </div>
          </div>

          <div style={filterCardStyle}>
            <div style={filterTitleStyle}>Filtry a řazení</div>

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
              style={inputStyle}
            >
              <option value="deadline">Řadit podle deadline</option>
              <option value="owner">Řadit podle vlastníka</option>
              <option value="priority">Řadit podle priority</option>
            </select>
          </div>

          <div style={cardListStyle}>
            {filteredTasks.length === 0 && (
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
