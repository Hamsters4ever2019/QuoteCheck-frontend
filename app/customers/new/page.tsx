"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, Typography, Paper, TextField, Button, Stack, Alert, CircularProgress,
} from "@mui/material";
import { createCustomer } from "../../lib/api";

function NewCustomerContent() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [postcode, setPostcode] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await createCustomer({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        postcode: postcode.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      router.push(`/customers/${res.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 12 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        New Client
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth required label="Name"
              value={name} onChange={(e) => setName(e.target.value)}
            />
            <TextField
              fullWidth type="tel" label="Phone"
              value={phone} onChange={(e) => setPhone(e.target.value)}
            />
            <TextField
              fullWidth type="email" label="Email"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth label="Postcode"
              value={postcode} onChange={(e) => setPostcode(e.target.value)}
            />
            <TextField
              fullWidth multiline minRows={2} label="Address"
              value={address} onChange={(e) => setAddress(e.target.value)}
            />
            <TextField
              fullWidth multiline minRows={2} label="Notes"
              value={notes} onChange={(e) => setNotes(e.target.value)}
              helperText="Anything useful — access codes, preferences, history."
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={submitting || !name.trim()}
            >
              {submitting ? "Saving…" : "Save Client"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default function NewCustomerPage() {
  return (
    <Suspense fallback={<Container sx={{ py: 4 }}><CircularProgress /></Container>}>
      <NewCustomerContent />
    </Suspense>
  );
}