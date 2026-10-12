import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
});

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
  actual_cost: number;
  actual_profit: number;
  actual_margin: number;
  quoted_margin: number;
  delta: number;
  engine_note: string;
}

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