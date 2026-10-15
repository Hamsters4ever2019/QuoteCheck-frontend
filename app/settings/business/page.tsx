"use client";

import { Suspense, useEffect, useState } from "react";
import {
  Container, Typography, Paper, TextField, Button, Stack,
  Alert, CircularProgress, Box,
} from "@mui/material";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  getBusinessSettings,
  setBusinessSettings,
  BusinessSettings,
} from "../../lib/api";

const EMPTY: BusinessSettings = {
  business_name: "",
  business_tagline: "",
  business_address: "",
  business_phone: "",
  business_email: "",
  business_website: "",
  business_vat: "",
  business_terms: "",
};

function BusinessSettingsContent() {
  const [form, setForm] = useState<BusinessSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBusinessSettings()
      .then((data) => {
        setForm({ ...EMPTY, ...data });
        setLoading(false);
      })
      .catch((e) => {
        setError(e?.message ?? "Failed to load");
        setLoading(false);
      });
  }, []);

  const handleChange = (key: keyof BusinessSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await setBusinessSettings(form);
      setMessage("Business details saved.");
      setSaving(false);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e.message ?? "Save failed");
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
      <Button
        component={Link}
        href="/settings"
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 2 }}
      >
        Back to Settings
      </Button>

      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Business Details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        These appear on every quote PDF you send to clients.
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            label="Business name"
            value={form.business_name}
            onChange={(e) => handleChange("business_name", e.target.value)}
            helperText="Trading name as you want it to appear on the quote."
          />
          <TextField
            fullWidth
            label="Tagline"
            value={form.business_tagline}
            onChange={(e) => handleChange("business_tagline", e.target.value)}
            helperText="Optional. E.g. 'NICEIC Approved Electrician'"
          />
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Address"
            value={form.business_address}
            onChange={(e) => handleChange("business_address", e.target.value)}
          />
          <TextField
            fullWidth
            label="Phone"
            value={form.business_phone}
            onChange={(e) => handleChange("business_phone", e.target.value)}
          />
          <TextField
            fullWidth
            type="email"
            label="Email"
            value={form.business_email}
            onChange={(e) => handleChange("business_email", e.target.value)}
          />
          <TextField
            fullWidth
            label="Website"
            value={form.business_website}
            onChange={(e) => handleChange("business_website", e.target.value)}
          />
          <TextField
            fullWidth
            label="VAT number"
            value={form.business_vat}
            onChange={(e) => handleChange("business_vat", e.target.value)}
            helperText="Optional. Leave blank if not VAT registered."
          />
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Terms & conditions"
            value={form.business_terms}
            onChange={(e) => handleChange("business_terms", e.target.value)}
            helperText="One per line. These appear at the bottom of every quote."
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
            {saving ? "Saving…" : "Save Business Details"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default function BusinessSettingsPage() {
  return (
    <Suspense
      fallback={
        <Container sx={{ py: 4 }}>
          <CircularProgress />
        </Container>
      }
    >
      <BusinessSettingsContent />
    </Suspense>
  );
}