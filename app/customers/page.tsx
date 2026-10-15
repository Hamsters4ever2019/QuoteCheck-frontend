"use client";

import { useEffect, useState } from "react";
import {
  Container, Box, Typography, Button, Card, CardContent,
  Stack, CircularProgress, Alert, CardActionArea, Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";
import { listCustomers, CustomerSummary } from "../lib/api";
import Footer from "../components/Footer";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCustomers()
      .then(setCustomers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 12 }}>
      <Box sx={{ mb: 2, display: "flex", alignItems: "baseline", gap: 0.5 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, letterSpacing: -0.5, color: "#0f3d3e" }}
        >
          FD+
        </Typography>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, letterSpacing: -0.5, color: "text.primary" }}
        >
          Clients
        </Typography>
      </Box>

      <Button
        component={Link}
        href="/customers/new"
        variant="contained"
        fullWidth
        size="large"
        startIcon={<AddIcon />}
        sx={{ py: 2, mb: 3, fontSize: "1.1rem" }}
      >
        New Client
      </Button>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && customers.length === 0 && (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No clients yet. Add your first one so you can track their history.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Stack spacing={1.5}>
        {customers.map((c) => (
          <Card key={c.id}>
            <CardActionArea component={Link} href={`/customers/${c.id}`}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {c.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {c.job_count} {c.job_count === 1 ? "job" : "jobs"}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  £{c.total_revenue.toFixed(2)} revenue
                </Typography>
                {c.job_count > 0 && (
                  <Stack direction="row" spacing={0.5}>
                    {c.good_count > 0 && (
                      <Chip
                        label={`${c.good_count} GOOD`}
                        color="success"
                        size="small"
                      />
                    )}
                    {c.thin_count > 0 && (
                      <Chip
                        label={`${c.thin_count} THIN`}
                        color="warning"
                        size="small"
                      />
                    )}
                    {c.loss_count > 0 && (
                      <Chip
                        label={`${c.loss_count} LOSS`}
                        color="error"
                        size="small"
                      />
                    )}
                  </Stack>
                )}
                {(c.phone || c.email) && (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {[c.phone, c.email].filter(Boolean).join(" · ")}
                  </Typography>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>

      <Footer />
    </Container>
  );
}