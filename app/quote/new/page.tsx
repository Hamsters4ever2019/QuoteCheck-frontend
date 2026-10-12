"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, Box, Typography, TextField, Button,
  Alert, CircularProgress, Paper, MenuItem, Stack,
} from "@mui/material";
import { createQuote, QuoteInput } from "../../lib/api";

const JOB_TYPES = [
  { id: 1, name: "Rewire", hours: 16, materials: 450, travel: 24 },
  { id: 2, name: "Consumer Unit", hours: 4, materials: 120, travel: 12 },
  { id: 3, name: "EICR", hours: 3, materials: 0, travel: 12 },
  { id: 4, name: "Fault Finding", hours: 2, materials: 0, travel: 12 },
  { id: 5, name: "Lighting Install", hours: 6, materials: 200, travel: 12 },
  { id: 6, name: "EV Charger", hours: 5, materials: 600, travel: 16 },
];

const DEFAULTS: QuoteInput = {
  job_type_id: 1,
  estimated_hours: 16,
  materials_cost: 450,
  travel_distance: 24,
  hourly_rate: 45,
  vehicle_cost_per_mile: 0.45,
  overhead_pct: 15,
  target_margin_pct: 25,
  quote_price: 1500,
};

export default function NewQuotePage() {
  const router = useRouter();
  const [form, setForm] = useState<QuoteInput>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof QuoteInput, value: string) => {
    setForm((f) => ({ ...f, [key]: value === "" ? 0 : parseFloat(value) }));
  };

  const handleJobType = (id: number) => {
    const jt = JOB_TYPES.find((j) => j.id === id);
    if (!jt) return;
    setForm((f) => ({
      ...f,
      job_type_id: id,
      estimated_hours: jt.hours,
      materials_cost: jt.materials,
      travel_distance: jt.travel,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await createQuote(form);
      router.push(`/quote/${result.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err.message ?? "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>New Quote</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              select fullWidth label="Job type"
              value={form.job_type_id ?? 1}
              onChange={(e) => handleJobType(parseInt(e.target.value))}
            >
              {JOB_TYPES.map((jt) => (
                <MenuItem key={jt.id} value={jt.id}>{jt.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth label="Estimated hours" type="number"
              slotProps={{ htmlInput: { step: "0.5", min: "0", inputMode: "decimal" } }}
              value={form.estimated_hours || ""}
              onChange={(e) => update("estimated_hours", e.target.value)}
              required
            />

            <TextField
              fullWidth label="Materials cost (£)" type="number"
              slotProps={{ htmlInput: { step: "0.01", min: "0", inputMode: "decimal" } }}
              value={form.materials_cost || ""}
              onChange={(e) => update("materials_cost", e.target.value)}
              required
            />

            <TextField
              fullWidth label="Travel distance (miles)" type="number"
              slotProps={{ htmlInput: { step: "0.1", min: "0", inputMode: "decimal" } }}
              value={form.travel_distance || ""}
              onChange={(e) => update("travel_distance", e.target.value)}
              required
            />

            <TextField
              fullWidth label="Your quote price (£)" type="number"
              slotProps={{ htmlInput: { step: "0.01", min: "0", inputMode: "decimal" } }}
              value={form.quote_price || ""}
              onChange={(e) => update("quote_price", e.target.value)}
              required
            />

            <Typography variant="caption" color="text.secondary">
              Defaults: £{form.hourly_rate}/hr · £{form.vehicle_cost_per_mile}/mi ·{" "}
              {form.overhead_pct}% overhead · {form.target_margin_pct}% target
            </Typography>

            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading} sx={{ py: 2, fontSize: "1.05rem" }}
            >
              {loading ? <CircularProgress size={24} /> : "Check Profitability"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}