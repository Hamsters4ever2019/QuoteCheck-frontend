import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
});

// ---------- AUTH INTERCEPTORS ----------

// Attach token to every outgoing request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("qc_token");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 — clear token, redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("qc_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// ---------- TYPES ----------

export interface QuoteInput {
  customer_id?: number | null;
  job_type_id?: number | null;
  estimated_hours: number;
  materials_cost: number;
  travel_distance: number;
  hourly_rate: number;
  vehicle_cost_per_mile: number;
  overhead_pct: number;
  target_margin_pct: number;
  quote_price: number;
}

export interface QuoteResponse {
  id: number;
  verdict: "GOOD" | "THIN" | "LOSS";
  message: string;
  total_cost: number;
  required_quote: number;
  shortfall: number;
  headroom: number;
  profit: number;
  actual_margin: number;
  workings: string[];
  labour_cost: number;
  materials_cost: number;
  travel_cost: number;
  overhead: number;
}

export interface QuoteListItem {
  id: number;
  customer_name?: string;
  job_type_name?: string;
  quote_price: number;
  verdict: string;
  shortfall: number;
  actual_margin: number;
  created_at: string;
}

export interface ActualInput {
  actual_hours: number;
  actual_materials: number;
  actual_travel: number;
}

export interface ActualResponse {
  quote_id: number;
  actual_id: number;
  actual_cost: number;
  actual_profit: number;
  actual_margin: number;
  quoted_margin: number;
  delta: number;
  engine_note: string;
}

export interface JobType {
  id: number;
  name: string;
  trade_category: string;
  default_hours: number;
  default_materials: number;
  default_travel: number;
  default_hourly_rate: number;
}

export interface ExpenseType {
  id: number;
  name: string;
  category: string;
  trade_category: string;
}

export interface QuoteExpense {
  id: number;
  description: string;
  amount: number;
  category: string;
  created_at: string;
}

// --- Response type for add/delete expense (includes recalculated actuals) ---
export interface ExpenseRecalcResponse {
  id?: number;
  deleted?: number;
  message?: string;
  actual_cost?: number;
  actual_profit?: number;
  actual_margin?: number;
}

export interface SettingsResponse {
  hourly_rate?: number;
  vehicle_cost_per_mile?: number;
  overhead_pct?: number;
  target_margin_pct?: number;
  trade_category?: string;
  [key: string]: any;
}

// ---------- ACTUAL EXPENSES ----------

export const getExpenses = (actualId: number) =>
  api.get<QuoteExpense[]>(`/actuals/${actualId}/expenses`).then((r) => r.data);

export const addExpense = (
  actualId: number,
  data: { expense_type_id: number; description: string; amount: number }
) =>
  api
    .post<ExpenseRecalcResponse>(`/actuals/${actualId}/expenses`, data)
    .then((r) => r.data);

export const deleteExpense = (expenseId: number) =>
  api
    .delete<ExpenseRecalcResponse>(`/expenses/${expenseId}`)
    .then((r) => r.data);

// ---------- QUOTES ----------

export const createQuote = (data: QuoteInput) =>
  api.post<QuoteResponse>("/quotes", data).then((r) => r.data);

export const listQuotes = () =>
  api.get<QuoteListItem[]>("/quotes").then((r) => r.data);

export const getQuote = (id: number) =>
  api
    .get<QuoteResponse & { message: string; customer_name?: string; job_type_name?: string }>(
      `/quotes/${id}`
    )
    .then((r) => r.data);

export const logActuals = (id: number, data: ActualInput) =>
  api.post<ActualResponse>(`/quotes/${id}/actuals`, data).then((r) => r.data);

export const deleteQuote = (id: number) =>
  api.delete<{ deleted: number; message: string }>(`/quotes/${id}`).then((r) => r.data);

// ---------- DASHBOARD ----------

export interface DashboardResponse {
  month: {
    budgeted: {
      revenue: number;
      costs: number;
      profit: number;
      avg_margin: number;
    };
    actual: {
      revenue: number;
      costs: number;
      profit: number;
      avg_margin: number;
      completed_count: number;
    };
    total_quotes: number;
    good: number;
    thin: number;
    loss: number;
  };
  warning: {
    loss_count: number;
    loss_shortfall: number;
  };
  top_clients: {
    name: string;
    job_count: number;
    revenue: number;
    avg_margin: number;
  }[];
}

export const getDashboard = () =>
  api.get<DashboardResponse>("/dashboard").then((r) => r.data);

// ---------- CASH FLOW FORECAST ----------

export interface CashflowPeriod {
  revenue: number;
  costs: number;
  profit: number;
}

export interface CashflowResponse {
  currency: string;
  forecast: {
    "30_days": CashflowPeriod;
    "60_days": CashflowPeriod;
    "90_days": CashflowPeriod;
  };
  note: string;
}

export const getCashflow = () =>
  api.get<CashflowResponse>("/dashboard/cashflow").then((r) => r.data);

// ---------- SETTINGS ----------

export const getSettings = () =>
  api.get<SettingsResponse>("/settings").then((r) => r.data);

export const getTradeSetting = () =>
  api.get<{ trade_category: string }>("/settings/trade").then((r) => r.data);

export const setTradeSetting = (trade_category: string) =>
  api.post<{ trade_category: string }>("/settings/trade", { trade_category }).then((r) => r.data);

// ---------- JOB TYPES ----------

export const listJobTypes = (trade?: string) =>
  api
    .get<JobType[]>("/job-types", { params: trade ? { trade } : {} })
    .then((r) => r.data);

export const createJobType = (data: Partial<JobType>) =>
  api.post<JobType>("/job-types", data).then((r) => r.data);

export const deleteJobType = (id: number) =>
  api.delete(`/job-types/${id}`).then((r) => r.data);

// ---------- EXPENSE TYPES ----------

export const listExpenseTypes = (trade?: string) =>
  api
    .get<ExpenseType[]>("/expense-types", { params: trade ? { trade } : {} })
    .then((r) => r.data);

export const createExpenseType = (data: Partial<ExpenseType>) =>
  api.post<ExpenseType>("/expense-types", data).then((r) => r.data);

export const deleteExpenseType = (id: number) =>
  api.delete(`/expense-types/${id}`).then((r) => r.data);

// ---------- AUTH ----------

export interface LoginResponse {
  token: string;
  expires_at: string;
  hours: number;
}

export const login = (password: string) =>
  api.post<LoginResponse>("/auth/login", { password }).then((r) => r.data);

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("qc_token");
    window.location.href = "/login";
  }
};

export const getTrialExpiry = (): Date | null => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("qc_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
};