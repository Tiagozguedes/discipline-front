export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  tag: string;
  tagColor: string;
  dueDate: string | null;
  orderIndex: number;
  createdAt: string;
  subtasks: SubTask[];
}

export interface SubTask {
  id: number;
  title: string;
  completed: boolean;
}

export interface Habit {
  id: number;
  name: string;
  description: string;
  frequency: string;
  category: string;
  color: string;
  active: boolean;
  completions: HabitCompletion[];
}

export interface HabitCompletion {
  id: number;
  completedDate: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  color: string;
  allDay: boolean;
}

export interface PomodoroStats {
  totalMinutes: number;
  totalSessions: number;
  period: string;
}

export interface DashboardData {
  tasks: { total: number; todo: number; inProgress: number; done: number };
  pomodoro: { todayMinutes: number; todaySessions: number; weekMinutes: number };
  habits: { totalActive: number; completedToday: number };
  finance: {
    monthIncome: number;
    monthExpense: number;
    monthBalance: number;
    totalInvested: number;
    totalInvestmentValue: number;
  };
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: string;
  category: string;
  date: string;
}

export interface Investment {
  id: number;
  name: string;
  type: string;
  amountInvested: number;
  currentValue: number;
  purchaseDate: string;
  notes: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expensesByCategory: { category: string; amount: number }[];
  incomeByCategory: { category: string; amount: number }[];
}

export interface InvestmentSummary {
  totalInvested: number;
  totalCurrentValue: number;
  profit: number;
  profitPercentage: number;
  allocation: { type: string; value: number }[];
}
