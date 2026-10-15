"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container, Box, Typography, Paper, Divider, Button,
  CircularProgress, Alert, Stack, Chip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { getQuote, deleteQuote, getCustomer, getBusinessSettings } from "../../lib/api";
import { downloadQuotePDF } from "../../lib/downloadPDF";
import Link from "next/link";

function VerdictContent() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [quote, setQuote] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getQuote(Number(id))
      .then(async (data) => {
        setQuote(data);

        // Fetch customer (if linked) and business settings in parallel
        const tasks: Promise<any>[] = [getBusinessSettings()];
        if (data.customer_id) {
          tasks.push(getCustomer(data.customer_id));
        } else {
          tasks.push(Promise.resolve(null));
        }
        const [biz, cust] = await Promise.all(tasks);
        setBusiness(biz);
        setCustomer(cust);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!quote) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadQuotePDF(quote, customer, business);
    } catch (e: any) {
      setDownloadError(e?.message ?? "Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!quote) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteQuote(quote.id);
      router.push("/quotes");
    } catch (err: any) {
      setDeleteError(
        err?.response?.data?.detail ?? err.message ?? "Delete failed"
      );
      setDeleting(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!quote) return null;

  const isLoss = quote.verdict === "LOSS";
  const isThin = quote.verdict === "THIN";
  const color = isLoss ? "error.main" : isThin ? "warning.main" : "success.main";
  const label = isLoss ? "⚠ LOSS" : isThin ? "⚠ THIN" : "✓ GOOD";

  return (
    <>
      <Paper sx={{ p: 3, mb: 2, borderLeft: 6, borderColor: color }}>
        <Typography variant="h4" sx={{ color, mb: 1 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {quote.message}
        </Typography>
        {quote.shortfall > 0 && (
          <Chip
            label={`Shortfall: £${quote.shortfall.toFixed(2)}`}
            color="error"
            sx={{ fontWeight: 600 }}
          />
        )}
        {quote.headroom > 0 && (
          <Chip
            label={`Headroom: £${quote.headroom.toFixed(2)}`}
            color="success"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Paper>

      {quote.customer_name && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "#f8fafc" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                CLIENT
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {quote.customer_name}
              </Typography>
            </Box>
            {quote.customer_id ? (
              <Button
                component={Link}
                href={`/customers/${quote.customer_id}`}
                size="small"
                variant="outlined"
              >
                View Profile
              </Button>
            ) : (
              <Typography variant="caption" color="text.disabled">
                No profile
              </Typography>
            )}
          </Box>
        </Paper>
      )}

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Breakdown
        </Typography>
        <Stack spacing={1}>
          <Row label="Labour" value={`£${quote.labour_cost.toFixed(2)}`} />
          <Row label="Materials" value={`£${quote.materials_cost.toFixed(2)}`} />
          <Row label="Travel" value={`£${quote.travel_cost.toFixed(2)}`} />
          <Row label="Overhead" value={`£${quote.overhead.toFixed(2)}`} />
          <Divider sx={{ my: 1 }} />
          <Row label="Total cost" value={`£${quote.total_cost.toFixed(2)}`} />
          <Row label="Required quote" value={`£${quote.required_quote.toFixed(2)}`} />
          <Row
            label="Your profit"
            value={`£${quote.profit.toFixed(2)}`}
            negative={quote.profit < 0}
          />
          <Divider sx={{ my: 1 }} />
          <Row
            label="Actual margin"
            value={`${quote.actual_margin.toFixed(2)}%`}
            negative={quote.actual_margin < 0}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Workings
        </Typography>
        <Stack spacing={0.5}>
          {quote.workings.map((w: string, i: number) => (
            <Typography
              key={i}
              variant="body2"
              color="text.secondary"
              sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
            >
              {i + 1}. {w}
            </Typography>
          ))}
        </Stack>
      </Paper>

      {/* ---------- Download PDF ---------- */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        startIcon={<PictureAsPdfIcon />}
        onClick={handleDownloadPDF}
        disabled={downloading}
        sx={{ py: 1.5, mb: 1.5 }}
      >
        {downloading ? "Generating PDF…" : "Download Quote PDF"}
      </Button>
      {downloadError && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {downloadError}
        </Alert>
      )}

      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <Button
          component={Link}
          href={`/quote/${quote.id}/actuals`}
          variant="contained"
          fullWidth
          size="large"
          sx={{ py: 1.5 }}
        >
          Log Actuals
        </Button>
        <Button
          component={Link}
          href="/quotes"
          variant="outlined"
          fullWidth
          size="large"
          sx={{ py: 1.5 }}
        >
          Back
        </Button>
      </Stack>

      <Button
        variant="text"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={() => setConfirmOpen(true)}
        fullWidth
        size="small"
      >
        Delete this quote
      </Button>

      <Dialog open={confirmOpen} onClose={() => !deleting && setConfirmOpen(false)}>
        <DialogTitle>Delete this quote?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This cannot be undone. All workings, actuals, and logged expenses
            associated with this quote will be permanently removed.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function VerdictPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 12 }}>
      <Suspense fallback={<CircularProgress />}>
        <VerdictContent />
      </Suspense>
    </Container>
  );
}

function Row({
  label,
  value,
  negative,
}: {
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, color: negative ? "error.main" : "text.primary" }}
      >
        {value}
      </Typography>
    </Box>
  );
}