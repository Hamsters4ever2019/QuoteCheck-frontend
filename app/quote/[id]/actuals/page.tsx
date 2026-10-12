"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container, Typography, Paper, TextField, Button,
  Alert, CircularProgress, Box, Stack,
} from "@mui/material";
import { logActuals, ActualResponse } from "../../../lib/api";

function ActualsContent() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const [hours, setHours] = useState("");
  const [materials, setMaterials] = useState("");
  const [travel, setTravel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ActualResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await logActuals(Number(id), {
        actual_hours: parseFloat(hours),
        actual_materials: parseFloat(materials),
        actual_travel: parseFloat(travel),
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <>
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Actuals Logged</Typography>
          <Stack spacing={1}>
            <Row label="Actual cost" value={`£${result.actual_cost.toFixed(2)}`} />
            <Row label="Actual profit" value={`£${result.actual_profit.toFixed(2)}`} negative={result.actual_profit < 0} />
            <Row label="Actual margin" value={`${result.actual_margin.toFixed(2)}%`} negative={result.actual_margin < 0} />
            <Row label="Quoted margin" value={`${result.quoted_margin.toFixed(2)}%`} />
            <Row label="Delta" value={`${result.delta.toFixed(2)}%`} negative={result.delta < 0} />
          </Stack>
          <Alert severity="info" sx={{ mt: 3 }}>{result.engine_note}</Alert>
        </Paper>
        <Button variant="contained" fullWidth size="large" onClick={() => router.push("/")} sx={{ py: 1.5 }}>
          Back to Quotes
        </Button>
      </>
    );
  }

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth label="Actual hours" type="number"
              slotProps={{ htmlInput: { step: "0.5", min: "0", inputMode: "decimal" } }}
              value={hours} onChange={(e) => setHours(e.target.value)} required
            />
            <TextField
              fullWidth label="Actual materials (£)" type="number"
              slotProps={{ htmlInput: { step: "0.01", min: "0", inputMode: "decimal" } }}
              value={materials} onChange={(e) => setMaterials(e.target.value)} required
            />
            <TextField
              fullWidth label="Actual travel (miles)" type="number"
              slotProps={{ htmlInput: { step: "0.1", min: "0", inputMode: "decimal" } }}
              value={travel} onChange={(e) => setTravel(e.target.value)} required
            />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ py: 1.5 }}>
              {loading ? <CircularProgress size={24} /> : "Log Actuals"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </>
  );
}

export default function ActualsPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Job Complete — Log Actuals</Typography>
      <Suspense fallback={<CircularProgress />}>
        <ActualsContent />
      </Suspense>
    </Container>
  );
}

function Row({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: negative ? "error.main" : "text.primary" }}>
        {value}
      </Typography>
    </Box>
  );
}