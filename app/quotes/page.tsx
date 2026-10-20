"use client";

import { Suspense, useEffect, useState } from "react";
import { Container, Typography, Paper, Stack, Box, CircularProgress, Alert, Chip, Button } from "@mui/material";
import Link from "next/link";
import { listQuotes } from "../lib/api";


function QuotesContent() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listQuotes()
      .then((data) => {
        // Safety net: Ensure data is an array
        if (Array.isArray(data)) {
          setQuotes(data);
        } else {
          setQuotes([]);
        }
      })
      .catch((e) => setError(e.message ?? "Failed to load quotes"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Your Quotes
      </Typography>

      <Button component={Link} href="/quote/new" variant="contained" fullWidth sx={{ mb: 3, py: 1.5 }}>
        + New Quote
      </Button>

      <Stack spacing={2}>
        {quotes.map((quote) => {
          // Safely calculate colors and labels
          const isLoss = quote.verdict === "LOSS";
          const isThin = quote.verdict === "THIN";
          const verdictColor = isLoss ? "error" : isThin ? "warning" : "success";
          const verdictLabel = isLoss ? "LOSS" : isThin ? "THIN" : "GOOD";

          return (
            <Paper 
              key={quote.id} 
              component={Link} 
              href={`/quote/${quote.id}`}
              sx={{ 
                p: 2, 
                textDecoration: 'none', 
                display: 'block',
                borderLeft: 4,
                borderColor: isLoss ? 'error.main' : isThin ? 'warning.main' : 'success.main',
                '&:hover': { bgcolor: '#f8fafc' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {quote.customer_name || "Unknown Client"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {quote.job_type_name || "General Job"} — £{quote.quote_price?.toFixed(2) || "0.00"}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  {/* NEW: Status Chip */}
                  {quote.status && quote.status !== "draft" && (
                    <Chip 
                      label={quote.status.toUpperCase()} 
                      color="primary" 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                  <Chip 
                    label={verdictLabel} 
                    color={verdictColor as any} 
                    size="small" 
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </>
  );
}

export default function QuotesPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 12 }}>
      <Suspense fallback={<CircularProgress />}>
        <QuotesContent />
      </Suspense>
    </Container>
  );
}