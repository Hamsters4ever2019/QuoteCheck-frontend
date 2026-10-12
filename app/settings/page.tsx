"use client";

import { useEffect, useState } from "react";
import {
  Container, Typography, Paper, TextField, Button,
  Alert, CircularProgress, Stack,
} from "@mui/material";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000/api/v1" });

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/settings")
      .then((r) => setValues(r.data))
      .catch(() => setValues({ hourly_rate: 45, vehicle_cost_per_mile: 0.45, overhead_pct: 15, target_margin_pct: 25 }))
      .finally(() => setLoading(false));
  }, []);

  const update = (key: string, v: string) =>
    setValues((s) => ({ ...s, [key]: parseFloat(v) || 0 }));

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <Container sx={{ py: 4 }}><CircularProgress /></Container>;

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Settings</Typography>
      {saved && <Alert severity="success" sx={{ mb: 2 }}>Saved.</Alert>}
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <TextField fullWidth label="Hourly rate (£)" type="number"
            slotProps={{ htmlInput: { inputMode: "decimal" } }}
            value={values.hourly_rate ?? 45}
            onChange={(e) => update("hourly_rate", e.target.value)} />
          <TextField fullWidth label="Vehicle cost per mile (£)" type="number"
            slotProps={{ htmlInput: { step: "0.01", inputMode: "decimal" } }}
            value={values.vehicle_cost_per_mile ?? 0.45}
            onChange={(e) => update("vehicle_cost_per_mile", e.target.value)} />
          <TextField fullWidth label="Overhead %" type="number"
            slotProps={{ htmlInput: { inputMode: "decimal" } }}
            value={values.overhead_pct ?? 15}
            onChange={(e) => update("overhead_pct", e.target.value)} />
          <TextField fullWidth label="Target margin %" type="number"
            slotProps={{ htmlInput: { inputMode: "decimal" } }}
            value={values.target_margin_pct ?? 25}
            onChange={(e) => update("target_margin_pct", e.target.value)} />
          <Button variant="contained" size="large" onClick={save} sx={{ py: 1.5 }}>Save</Button>
        </Stack>
      </Paper>
    </Container>
  );
}