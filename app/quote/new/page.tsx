"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, Typography, Paper, TextField, Button, Stack, MenuItem, Alert, CircularProgress,
} from "@mui/material";
import {
  createQuote, listJobTypes, getSettings, getTradeSetting,
  listCustomers, JobType, SettingsResponse, CustomerSummary,
} from "../../lib/api";

function NewQuoteContent() {
  const router = useRouter();

  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [jobTypeId, setJobTypeId] = useState<number | "">("");
  const [trade, setTrade] = useState<string>("Electrician");

  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [customerId, setCustomerId] = useState<number | "">("");

  const [hours, setHours] = useState("16");
  const [materials, setMaterials] = useState("450");
  const [travel, setTravel] = useState("24");
  const [quotePrice, setQuotePrice] = useState("1500");

  const [settings, setSettings] = useState<SettingsResponse>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [tradeRes, settingsRes, customersRes] = await Promise.all([
          getTradeSetting(),
          getSettings(),
          listCustomers(),
        ]);
        setTrade(tradeRes.trade_category);
        setSettings(settingsRes);
        setCustomers(customersRes);

        const jt = await listJobTypes(tradeRes.trade_category);
        setJobTypes(jt);
        if (jt.length > 0) setJobTypeId(jt[0].id);

        setLoading(false);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load data");
        setLoading(false);
      }
    })();
  }, []);

  const selectedJob = jobTypes.find((j) => j.id === jobTypeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await createQuote({
        customer_id: customerId === "" ? null : Number(customerId),
        job_type_id: jobTypeId === "" ? null : Number(jobTypeId),
        estimated_hours: parseFloat(hours),
        materials_cost: parseFloat(materials),
        travel_distance: parseFloat(travel),
        hourly_rate: Number(settings.hourly_rate ?? 45),
        vehicle_cost_per_mile: Number(settings.vehicle_cost_per_mile ?? 0.45),
        overhead_pct: Number(settings.overhead_pct ?? 15),
        target_margin_pct: Number(settings.target_margin_pct ?? 25),
        quote_price: parseFloat(quotePrice),
      });
      router.push(`/quote/${res.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? "Something went wrong");
      setSubmitting(false);
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
        New Quote
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              select
              fullWidth
              label="Client"
              value={customerId}
              onChange={(e) =>
                setCustomerId(e.target.value === "" ? "" : Number(e.target.value))
              }
              helperText={
                customers.length === 0
                  ? "No clients yet — add one from the Clients tab first (optional)"
                  : "Leave blank for a walk-in job"
              }
            >
              <MenuItem value="">
                <em>None (walk-in)</em>
              </MenuItem>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Job type"
              value={jobTypeId}
              onChange={(e) => setJobTypeId(Number(e.target.value))}
              helperText={`Filtered for: ${trade}`}
            >
              {jobTypes.map((jt) => (
                <MenuItem key={jt.id} value={jt.id}>
                  {jt.name}
                </MenuItem>
              ))}
            </TextField>

            {selectedJob && selectedJob.default_hourly_rate > 0 && (
              <Alert severity="info" icon={false} sx={{ py: 0.5 }}>
                {selectedJob.trade_category} default: £{selectedJob.default_hourly_rate}/hr
              </Alert>
            )}

            <TextField
              fullWidth
              required
              type="number"
              label="Estimated hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              slotProps={{ htmlInput: { step: "0.5", min: 0 } }}
            />
            <TextField
              fullWidth
              required
              type="number"
              label="Materials cost (£)"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              slotProps={{ htmlInput: { step: "1", min: 0 } }}
            />
            <TextField
              fullWidth
              required
              type="number"
              label="Travel distance (miles)"
              value={travel}
              onChange={(e) => setTravel(e.target.value)}
              slotProps={{ htmlInput: { step: "1", min: 0 } }}
            />
            <TextField
              fullWidth
              required
              type="number"
              label="Your quote price (£)"
              value={quotePrice}
              onChange={(e) => setQuotePrice(e.target.value)}
              slotProps={{ htmlInput: { step: "1", min: 0 } }}
            />

            <Typography variant="caption" color="text.secondary">
              Defaults: £{settings.hourly_rate ?? 45}/hr · £
              {settings.vehicle_cost_per_mile ?? 0.45}/mi ·{" "}
              {settings.overhead_pct ?? 15}% overhead ·{" "}
              {settings.target_margin_pct ?? 25}% target
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={submitting}
            >
              {submitting ? "Calculating…" : "Check Profitability"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense
      fallback={
        <Container sx={{ py: 4 }}>
          <CircularProgress />
        </Container>
      }
    >
      <NewQuoteContent />
    </Suspense>
  );
}