"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, Typography, Paper, TextField, Button, Stack, MenuItem, Alert, CircularProgress,
  Box, List, ListItem, ListItemText, Chip, Divider, Checkbox, ListItemButton
} from "@mui/material";
import {
  createQuote, listJobTypes, getSettings, getTradeSetting,
  listCustomers, JobType, SettingsResponse, CustomerSummary,
  getMaterialSuggestions, MaterialSuggestion
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

  // --- Predictive Engine State ---
  const [suggestedMaterials, setSuggestedMaterials] = useState<MaterialSuggestion[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  // --------------------------------

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

  // --- Trigger the Predictive Engine ---
  useEffect(() => {
    if (jobTypeId) {
      setLoadingSuggestions(true);
      setSelectedMaterials([]); // Reset selections when job type changes
      getMaterialSuggestions(Number(jobTypeId))
        .then((data) => setSuggestedMaterials(data))
        .catch((err) => console.error("Predictive Engine failed:", err))
        .finally(() => setLoadingSuggestions(false));
    } else {
      setSuggestedMaterials([]);
    }
  }, [jobTypeId]);

  // --- Toggle Selection Logic ---
  const handleToggleMaterial = (name: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // --- Calculate Total of ONLY Selected Items ---
  const selectedTotal = suggestedMaterials
    .filter((m) => selectedMaterials.includes(m.canonical_name))
    .reduce((sum, m) => sum + (m.last_known_price || 0), 0);

  const handleApplySelected = () => {
    setMaterials(selectedTotal.toFixed(2));
  };

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

            {/* --- THE PREDICTIVE ENGINE UI PANEL --- */}
            {loadingSuggestions && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">Consulting historical data...</Typography>
              </Box>
            )}

            {suggestedMaterials.length > 0 && !loadingSuggestions && (
              <Paper sx={{ p: 2, bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: '#0284c7', fontWeight: 700 }}>
                  🤖 Smart-Quote: Select Historical Materials
                </Typography>
                <List dense disablePadding sx={{ mb: 1 }}>
                  {suggestedMaterials.slice(0, 6).map((mat, idx) => {
                    const isSelected = selectedMaterials.includes(mat.canonical_name);
                    return (
                      <ListItem key={idx} disablePadding>
                        <ListItemButton 
                          onClick={() => handleToggleMaterial(mat.canonical_name)}
                          sx={{ py: 0.5, borderRadius: 1, '&:hover': { bgcolor: '#e0f2fe' } }}
                        >
                          <Checkbox 
                            edge="start" 
                            checked={isSelected} 
                            tabIndex={-1} 
                            disableRipple 
                            size="small"
                            sx={{ mr: 1, p: 0.5 }}
                          />
                          <ListItemText
                            primary={mat.canonical_name}
                            secondary={`Last paid: £${(mat.last_known_price || 0).toFixed(2)}`}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#0284c7' : 'text.primary' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                          {mat.usage_count > 0 && (
                            <Chip label={`${mat.usage_count}x`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem', ml: 1 }} />
                          )}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {selectedMaterials.length} item(s) selected
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={selectedMaterials.length === 0}
                    onClick={handleApplySelected}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Apply £{selectedTotal.toFixed(2)} to Materials
                  </Button>
                </Box>
              </Paper>
            )}
            {/* -------------------------------------- */}

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