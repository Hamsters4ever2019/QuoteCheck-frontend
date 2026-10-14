"use client";

import { Suspense, useEffect, useState } from "react";
import {
  Container, Typography, Paper, TextField, Button, Stack, MenuItem, Alert, CircularProgress,
} from "@mui/material";
import { getSettings, getTradeSetting, setTradeSetting } from "../lib/api";

const TRADES = ["Electrician", "Plumber", "Carpenter", "Decorator", "Bricklayer", "General"];

function SettingsContent() {
  const [hourlyRate, setHourlyRate] = useState("45");
  const [vehicleCost, setVehicleCost] = useState("0.45");
  const [overhead, setOverhead] = useState("15");
  const [targetMargin, setTargetMargin] = useState("25");
  const [trade, setTrade] = useState("Electrician");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getSettings(), getTradeSetting()])
      .then(([s, t]) => {
        if (s.hourly_rate !== undefined) setHourlyRate(String(s.hourly_rate));
        if (s.vehicle_cost_per_mile !== undefined) setVehicleCost(String(s.vehicle_cost_per_mile));
        if (s.overhead_pct !== undefined) setOverhead(String(s.overhead_pct));
        if (s.target_margin_pct !== undefined) setTargetMargin(String(s.target_margin_pct));
        setTrade(t.trade_category);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message ?? "Failed to load settings");
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      // Save trade first (it triggers the profile)
      await setTradeSetting(trade);
      setMessage(`Trade updated to ${trade}. Reloading app data…`);
      // Give the backend a moment, then reload the page
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err.message ?? "Save failed");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 12 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Settings
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <TextField
            select
            fullWidth
            label="Your Trade"
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            helperText="This loads default job types and expense categories for your trade."
          >
            {TRADES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            type="number"
            label="Hourly rate (£)"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            slotProps={{ htmlInput: { step: "0.5", min: 0 } }}
          />

          <TextField
            fullWidth
            type="number"
            label="Vehicle cost per mile (£)"
            value={vehicleCost}
            onChange={(e) => setVehicleCost(e.target.value)}
            slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
          />

          <TextField
            fullWidth
            type="number"
            label="Overhead %"
            value={overhead}
            onChange={(e) => setOverhead(e.target.value)}
            slotProps={{ htmlInput: { step: "0.5", min: 0 } }}
          />

          <TextField
            fullWidth
            type="number"
            label="Target margin %"
            value={targetMargin}
            onChange={(e) => setTargetMargin(e.target.value)}
            slotProps={{ htmlInput: { step: "0.5", min: 0 } }}
          />

          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<Container sx={{ py: 4 }}><CircularProgress /></Container>}>
      <SettingsContent />
    </Suspense>
  );
}