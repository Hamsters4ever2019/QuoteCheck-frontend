"use client";

import { useEffect, useState } from "react";
import {
  Container, Box, Typography, Button, Card, CardContent,
  Chip, Stack, CircularProgress, Alert, CardActionArea,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";
import { listQuotes, QuoteListItem } from "./lib/api";

export default function HomePage() {
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listQuotes()
      .then(setQuotes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5">⚡ QuoteCheck</Typography>
      </Box>

      <Button
        component={Link}
        href="/quote/new"
        variant="contained"
        fullWidth
        size="large"
        startIcon={<AddIcon />}
        sx={{ py: 2, mb: 3, fontSize: "1.1rem" }}
      >
        New Quote
      </Button>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && quotes.length === 0 && (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No quotes yet. Create your first one to see if it&apos;s profitable.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Stack spacing={1.5}>
        {quotes.map((q) => (
          <Card key={q.id}>
            <CardActionArea component={Link} href={`/quote/${q.id}`}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {q.customer_name ?? "Unnamed"} — {q.job_type_name ?? "Job"}
                  </Typography>
                  <VerdictChip verdict={q.verdict} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  £{q.quote_price.toFixed(2)} · {q.actual_margin.toFixed(1)}% margin
                </Typography>
                {q.shortfall > 0 && (
                  <Typography variant="body2" color="error.main" sx={{ mt: 0.5, fontWeight: 600 }}>
                    Shortfall: £{q.shortfall.toFixed(2)}
                  </Typography>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Container>
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