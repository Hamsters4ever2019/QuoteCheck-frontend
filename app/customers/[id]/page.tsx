"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container, Box, Typography, Paper, Divider, Button, Chip,
  CircularProgress, Alert, Stack, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Link from "next/link";
import {
  getCustomer, deleteCustomer, updateCustomer, CustomerDetail,
} from "../../lib/api";

function CustomerDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPostcode, setEditPostcode] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const load = async () => {
    if (!id) return;
    try {
      const data = await getCustomer(Number(id));
      setCustomer(data);
      setEditName(data.name ?? "");
      setEditPhone(data.phone ?? "");
      setEditEmail(data.email ?? "");
      setEditPostcode(data.postcode ?? "");
      setEditAddress(data.address ?? "");
      setEditNotes(data.notes ?? "");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleEdit = async () => {
    if (!customer) return;
    setBusy(true);
    setActionError(null);
    try {
      await updateCustomer(customer.id, {
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        email: editEmail.trim() || undefined,
        postcode: editPostcode.trim() || undefined,
        address: editAddress.trim() || undefined,
        notes: editNotes.trim() || undefined,
      });
      await load();
      setEditOpen(false);
    } catch (err: any) {
      setActionError(err?.response?.data?.detail ?? err.message ?? "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!customer) return;
    setBusy(true);
    setActionError(null);
    try {
      await deleteCustomer(customer.id);
      router.push("/customers");
    } catch (err: any) {
      setActionError(err?.response?.data?.detail ?? err.message ?? "Delete failed");
      setBusy(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!customer) return null;

  return (
    <>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {customer.name}
        </Typography>
        <Stack spacing={0.5}>
          {customer.phone && (
            <Typography variant="body2" color="text.secondary">
              📞 {customer.phone}
            </Typography>
          )}
          {customer.email && (
            <Typography variant="body2" color="text.secondary">
              ✉️ {customer.email}
            </Typography>
          )}
          {customer.address && (
            <Typography variant="body2" color="text.secondary">
              📍 {customer.address}
            </Typography>
          )}
          {customer.postcode && (
            <Typography variant="body2" color="text.secondary">
              {customer.postcode}
            </Typography>
          )}
        </Stack>
        {customer.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              NOTES
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {customer.notes}
            </Typography>
          </>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>Summary</Typography>
        <Stack spacing={1}>
          <Row label="Total jobs" value={String(customer.summary.job_count)} />
          <Row label="Total revenue" value={`£${customer.summary.total_revenue.toFixed(2)}`} />
          <Row
            label="Avg margin"
            value={`${customer.summary.avg_margin.toFixed(1)}%`}
            negative={customer.summary.avg_margin < 0}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>Quote History</Typography>
        {customer.quotes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No quotes yet for this client.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {customer.quotes.map((q) => (
              <Box
                key={q.id}
                component={Link}
                href={`/quote/${q.id}`}
                sx={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {q.job_type_name ?? "Job"} — £{q.quote_price.toFixed(2)}
                  </Typography>
                  <VerdictChip verdict={q.verdict} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {new Date(q.created_at).toLocaleDateString("en-GB")} ·{" "}
                  {q.actual_margin.toFixed(1)}% margin
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          size="large"
          startIcon={<EditIcon />}
          onClick={() => setEditOpen(true)}
          sx={{ py: 1.5 }}
        >
          Edit
        </Button>
        <Button
          variant="text"
          color="error"
          fullWidth
          size="large"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteOpen(true)}
          sx={{ py: 1.5 }}
        >
          Delete
        </Button>
      </Stack>

      {/* ---------- Edit dialog ---------- */}
      <Dialog open={editOpen} onClose={() => !busy && setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit client</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth required label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <TextField fullWidth type="tel" label="Phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            <TextField fullWidth type="email" label="Email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            <TextField fullWidth label="Postcode" value={editPostcode} onChange={(e) => setEditPostcode(e.target.value)} />
            <TextField fullWidth multiline minRows={2} label="Address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
            <TextField fullWidth multiline minRows={2} label="Notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            {actionError && <Alert severity="error">{actionError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={busy}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained" disabled={busy || !editName.trim()}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- Delete dialog ---------- */}
      <Dialog open={deleteOpen} onClose={() => !busy && setDeleteOpen(false)}>
        <DialogTitle>Delete this client?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This cannot be undone. If this client has any quotes, you'll need to
            delete those first (or re-assign them).
          </DialogContentText>
          {actionError && <Alert severity="error" sx={{ mt: 2 }}>{actionError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={busy}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={busy}>
            {busy ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function CustomerDetailPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 12 }}>
      <Suspense fallback={<CircularProgress />}>
        <CustomerDetailContent />
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

function VerdictChip({ verdict }: { verdict: string }) {
  const map: Record<string, { label: string; color: "success" | "warning" | "error" }> = {
    GOOD: { label: "Good", color: "success" },
    THIN: { label: "Thin", color: "warning" },
    LOSS: { label: "Loss", color: "error" },
  };
  const v = map[verdict] ?? { label: verdict, color: "warning" as const };
  return <Chip label={v.label} color={v.color} size="small" />;
}