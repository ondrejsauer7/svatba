import React from "react";
import type { BudgetCategory, BudgetItem, PaymentStatus, Person } from "../types";
import { formatDate, getRemaining } from "../lib/utils";
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
  checkboxLineStyle,
} from "../ui";

function isBudgetOverdue(item: BudgetItem) {
  if (!item.due_date || item.payment_status === "Zaplaceno") return false;

  const today = new Date();
  const target = new Date(item.due_date);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return target.getTime() < today.getTime();
}

function isBudgetDueSoon(item: BudgetItem) {
  if (!item.due_date || item.payment_status === "Zaplaceno") return false;

  const today = new Date();
  const target = new Date(item.due_date);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= 7;
}

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  categories: BudgetCategory[];
  paymentStatuses: PaymentStatus[];
  people: Person[];
  budgetStats: {
    totalPlanned: number;
    totalActual: number;
    totalPaid: number;
    totalRemaining: number;
    overdue: number;
  };
  category: BudgetCategory;
  setCategory: (v: BudgetCategory) => void;
  budgetName: string;
  setBudgetName: (v: string) => void;
  budgetOwner: Person;
  setBudgetOwner: (v: Person) => void;
  vendor: string;
  setVendor: (v: string) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  paymentStatus: PaymentStatus;
  setPaymentStatus: (v: PaymentStatus) => void;
  planned: string;
  setPlanned: (v: string) => void;
  actual: string;
  setActual: (v: string) => void;
  deposit: string;
  setDeposit: (v: string) => void;
  fullyPaid: boolean;
  setFullyPaid: (v: boolean) => void;
  budgetUpdatedBy: Person;
  setBudgetUpdatedBy: (v: Person) => void;
  budgetNote: string;
  setBudgetNote: (v: string) => void;
  editingBudgetId: string | null;
  saveBudgetItem: () => void;
  resetBudgetForm: () => void;
  saving: boolean;
  budgetCategoryFilter: BudgetCategory | "Vše";
  setBudgetCategoryFilter: (v: BudgetCategory | "Vše") => void;
  budgetPaymentFilter: PaymentStatus | "Vše";
  setBudgetPaymentFilter: (v: PaymentStatus | "Vše") => void;
  budgetOwnerFilter: Person | "Vše";
  setBudgetOwnerFilter: (v: Person | "Vše") => void;
  budgetSort: "due_date" | "category" | "remaining";
  setBudgetSort: (v: "due_date" | "category" | "remaining") => void;
  budgetSearch: string;
  setBudgetSearch: (v: string) => void;
  filteredBudget: BudgetItem[];
  startEditBudgetItem: (item: BudgetItem) => void;
  deleteBudgetItem: (id: string) => void;
  quickToggleBudgetPaid: (item: BudgetItem) => void;
};

export default function BudgetSection(props: Props) {
  const {
    isOpen,
    onToggle,
    categories,
    paymentStatuses,
    people,
    budgetStats,
    category,
    setCategory,
    budgetName,
    setBudgetName,
    budgetOwner,
    setBudgetOwner,
    vendor,
    setVendor,
    dueDate,
    setDueDate,
    paymentStatus,
    setPaymentStatus,
    planned,
    setPlanned,
    actual,
    setActual,
    deposit,
    setDeposit,
    fullyPaid,
    setFullyPaid,
    budgetUpdatedBy,
    setBudgetUpdatedBy,
    budgetNote,
    setBudgetNote,
    editingBudgetId,
    saveBudgetItem,
    resetBudgetForm,
    saving,
    budgetCategoryFilter,
    setBudgetCategoryFilter,
    budgetPaymentFilter,
    setBudgetPaymentFilter,
    budgetOwnerFilter,
    setBudgetOwnerFilter,
    budgetSort,
    setBudgetSort,
    budgetSearch,
    setBudgetSearch,
    filteredBudget,
    startEditBudgetItem,
    deleteBudgetItem,
    quickToggleBudgetPaid,
  } = props;

  return (
    <section style={sectionStyle}>
      <button onClick={onToggle} style={sectionToggleStyle}>
        Rozpočet {isOpen ? "▲" : "▼"}
      </button>

      {isOpen && (
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
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <input
              value={budgetName}
              onChange={(e) => setBudgetName(e.target.value)}
              placeholder="Položka"
              style={inputStyle}
            />

            <select value={budgetOwner} onChange={(e) => setBudgetOwner(e.target.value as Person)} style={inputStyle}>
              {people.map((person) => (
                <option key={person} value={person}>Řeší: {person}</option>
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

            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)} style={inputStyle}>
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>Stav platby: {status}</option>
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

            <select value={budgetUpdatedBy} onChange={(e) => setBudgetUpdatedBy(e.target.value as Person)} style={inputStyle}>
              {people.map((person) => (
                <option key={person} value={person}>Update dělal: {person}</option>
              ))}
            </select>

            <input
              value={budgetNote}
              onChange={(e) => setBudgetNote(e.target.value)}
              placeholder="Komentář / poznámka"
              style={inputStyle}
            />

            <div style={buttonRowStyle}>
              <button onClick={saveBudgetItem} style={primaryButtonStyle} disabled={saving}>
                {editingBudgetId ? "Uložit" : "Přidat"}
              </button>
              {editingBudgetId && (
                <button onClick={resetBudgetForm} style={secondaryButtonStyle}>
                  Zrušit
                </button>
              )}
            </div>
          </div>

          <div style={filterCardStyle}>
            <div style={filterTitleStyle}>Filtry a řazení</div>

            <input
              value={budgetSearch}
              onChange={(e) => setBudgetSearch(e.target.value)}
              placeholder="Hledat v rozpočtu, dodavateli a poznámkách"
              style={inputStyle}
            />

            <div style={chipsWrapStyle}>
              <span style={filterLabelStyle}>Kategorie:</span>
              <button style={chipStyle(budgetCategoryFilter === "Vše")} onClick={() => setBudgetCategoryFilter("Vše")}>
                Vše
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  style={chipStyle(budgetCategoryFilter === cat)}
                  onClick={() => setBudgetCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={chipsWrapStyle}>
              <span style={filterLabelStyle}>Platba:</span>
              <button style={chipStyle(budgetPaymentFilter === "Vše")} onClick={() => setBudgetPaymentFilter("Vše")}>
                Vše
              </button>
              {paymentStatuses.map((status) => (
                <button
                  key={status}
                  style={chipStyle(budgetPaymentFilter === status)}
                  onClick={() => setBudgetPaymentFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <div style={chipsWrapStyle}>
              <span style={filterLabelStyle}>Řeší:</span>
              <button style={chipStyle(budgetOwnerFilter === "Vše")} onClick={() => setBudgetOwnerFilter("Vše")}>
                Vše
              </button>
              {people.map((person) => (
                <button
                  key={person}
                  style={chipStyle(budgetOwnerFilter === person)}
                  onClick={() => setBudgetOwnerFilter(person)}
                >
                  {person}
                </button>
              ))}
            </div>

            <select
              value={budgetSort}
              onChange={(e) => setBudgetSort(e.target.value as "due_date" | "category" | "remaining")}
              style={inputStyle}
            >
              <option value="due_date">Řadit podle splatnosti</option>
              <option value="category">Řadit podle kategorie</option>
              <option value="remaining">Řadit podle zbývá doplatit</option>
            </select>
          </div>

          <div style={cardListStyle}>
            {filteredBudget.length === 0 && (
              <div style={emptyStyle}>Žádné položky rozpočtu pro aktuální filtr.</div>
            )}

            {filteredBudget.map((item) => {
              const overdue = isBudgetOverdue(item);
              const dueSoon = isBudgetDueSoon(item);

              return (
                <div
                  key={item.id}
                  style={{
                    ...cardStyle,
                    borderLeft:
                      item.payment_status === "Zaplaceno"
                        ? "6px solid green"
                        : overdue
                        ? "6px solid red"
                        : dueSoon
                        ? "6px solid orange"
                        : "6px solid transparent",
                  }}
                >
                  <div style={badgeRowStyle}>
                    <span style={badgeStyle}>{item.category}</span>
                    <span style={badgeStyle}>{item.owner || "Oba"}</span>
                    <span style={badgeStyle}>{item.payment_status || "Nezaplaceno"}</span>
                    {overdue && (
                      <span style={{ ...badgeStyle, background: "#ffe5e5", color: "#900" }}>
                        Po splatnosti
                      </span>
                    )}
                    {!overdue && dueSoon && (
                      <span style={{ ...badgeStyle, background: "#fff2e5", color: "#8a4b00" }}>
                        Do 7 dnů
                      </span>
                    )}
                    {item.payment_status === "Zaplaceno" && (
                      <span style={{ ...badgeStyle, background: "#e8f7e8", color: "#146314" }}>
                        Zaplaceno
                      </span>
                    )}
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
                    <button onClick={() => quickToggleBudgetPaid(item)} style={secondaryButtonStyle}>
                      {item.payment_status === "Zaplaceno" ? "Označit nezaplaceno" : "Označit zaplaceno"}
                    </button>
                    <button onClick={() => startEditBudgetItem(item)} style={secondaryButtonStyle}>
                      Upravit
                    </button>
                    <button onClick={() => deleteBudgetItem(item.id)} style={dangerButtonStyle}>
                      Smazat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
