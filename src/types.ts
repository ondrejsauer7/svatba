export type Person = "Ondra" | "Kája" | "Oba";
export type SectionKey = "dashboard" | "tasks" | "budget" | "guests" | "notes";

export type TaskStatus = "To do" | "Rozdělané" | "Čeká" | "Hotovo";
export type TaskPriority = "Nízká" | "Střední" | "Vysoká";

export type Task = {
  id: string;
  text: string;
  deadline: string | null;
  done: boolean;
  owner: Person;
  status: TaskStatus;
  note: string | null;
  priority: TaskPriority;
  updated_by: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BudgetCategory =
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

export type PaymentStatus = "Nezaplaceno" | "Záloha" | "Zaplaceno";

export type BudgetItem = {
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
  updated_by: string | null;
  created_at?: string;
  updated_at?: string;
};

export type GuestSide = "Ondra" | "Kája" | "Společní";
export type RsvpStatus = "Bez odpovědi" | "Potvrzeno" | "Odmítl";

export type Guest = {
  id: string;
  name: string;
  confirmed: boolean;
  note: string | null;
  side: GuestSide;
  rsvp_status: RsvpStatus;
  guest_count: number;
  accommodation: boolean;
  child: boolean;
  updated_by: string | null;
  created_at?: string;
  updated_at?: string;
};
export type Note = {
  id: string;
  text: string;
  author: Person;
  created_at?: string;
  updated_at?: string;
};
