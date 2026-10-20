"use client";

import { Suspense, useEffect, useState } from "react";
import {
  Container, Typography, Paper, Stack, Box, CircularProgress, Alert, Chip, Divider, Button,
} from "@mui/material";
import Link from "next/link";
import {
  getDashboard,
  getCashflow,
  DashboardResponse,
  CashflowResponse,
} from "./lib/api";
import Footer from "./components/Footer";

function DashboardContent() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [cashflow, setCashflow] = useState<CashflowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDashboard(), getCashflow()])
      .then(([dashboardData, cashflowData]) => {
        setData(dashboardData);
        setCashflow(cashflowData);
      })
      .catch((e) => setError(e.message ?? "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  const { month, warning, top_clients } = data;
  const hasActuals = month.actual.completed_count > 0;

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          <span style={{ color: "#0f3d3e" }}>FD+</span>{" "}
          <span style={{ fontWeight: 600 }}>QuoteCheck</span>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Your business at a glance
        </Typography>
      </Box>

      {/* ---------- THIS MONTH: QUOTED vs ACTUAL ---------- */}
      <Paper sx={{ p: 2.5, mb: 2 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 1, display: "block" }}
        >
          This Month
        </Typography>
        <Typography
          variant="caption"
          display="block"
          color="text.secondary"
          sx={{ mt: 0.5, mb: 1.5 }}
        >
          {hasActuals
            ? `Based on ${month.actual.completed_count} of ${month.total_quotes} jobs completed`
            : `${month.total_quotes} ${month.total_quotes === 1 ? "quote" : "quotes"} — no actuals logged yet`}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            mb: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{ width: "28%", color: "text.secondary", fontWeight: 700 }}
          >
            &nbsp;
          </Typography>
          <Typography
            variant="caption"
            sx={{
              width: "24%",
              color: "text.secondary",
              fontWeight: 700,
              textAlign: "right",
            }}
          >
            QUOTED
          </Typography>
          <Typography
            variant="caption"
            sx={{
              width: "24%",
              color: "text.secondary",
              fontWeight: 700,
              textAlign: "right",
            }}
          >
            ACTUAL
          </Typography>
          <Typography
            variant="caption"
            sx={{
              width: "24%",
              color: "text.secondary",
              fontWeight: 700,
              textAlign: "right",
            }}
          >
            VARIANCE
          </Typography>
        </Box>

        <Divider sx={{ mb: 1 }} />

        <Stack spacing={0.5}>
          <PLRow
            label="Revenue"
            budgeted={month.budgeted.revenue}
            actual={hasActuals ? month.actual.revenue : null}
            favourable="up"
          />
          <PLRow
            label="Costs"
            budgeted={month.budgeted.costs}
            actual={hasActuals ? month.actual.costs : null}
            favourable="down"
          />
          <Divider sx={{ my: 0.5 }} />
          <PLRow
            label="Profit"
            budgeted={month.budgeted.profit}
            actual={hasActuals ? month.actual.profit : null}
            favourable="up"
            bold
          />
          <PLRow
            label="Avg margin"
            budgeted={month.budgeted.avg_margin}
            actual={hasActuals ? month.actual.avg_margin : null}
            favourable="up"
            bold
            isPercent
          />
        </Stack>
      </Paper>

      {/* ---------- THE £15 ACCOUNTANT QUESTION ---------- */}
      <Paper
        sx={{
          p: 2.5,
          mb: 2,
          border: "2px solid #0f3d3e",
          background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f3d3e" }}>
              💷 Need a quick answer?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Ask a UK-qualified accountant a question for just <strong>£15</strong>.
            </Typography>
          </Box>
          <Button
            component="a"
            href="https://fifteenquidukaccountantquestion.uk"
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            sx={{
              bgcolor: "#0f3d3e",
              "&:hover": { bgcolor: "#082928" },
              whiteSpace: "nowrap",
              fontWeight: 700,
              fontSize: "0.85rem",
              textTransform: "none",
              px: 3,
              py: 1.2,
              boxShadow: "0 4px 14px 0 rgba(15,61,62,0.39)",
            }}
          >
            Ask for £15 →
          </Button>
        </Stack>
      </Paper>

      {/* ---------- CASH FLOW FORECAST ---------- */}
      {cashflow && (
        <Paper sx={{ p: 2.5, mb: 2 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 1, display: "block" }}
          >
            Cash Flow Forecast
          </Typography>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ mt: 0.5, mb: 1.5 }}
          >
            Projected from booked jobs with a scheduled date
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              mb: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{ width: "28%", color: "text.secondary", fontWeight: 700 }}
            >
              &nbsp;
            </Typography>
            <Typography
              variant="caption"
              sx={{
                width: "24%",
                color: "text.secondary",
                fontWeight: 700,
                textAlign: "right",
              }}
            >
              30 DAYS
            </Typography>
            <Typography
              variant="caption"
              sx={{
                width: "24%",
                color: "text.secondary",
                fontWeight: 700,
                textAlign: "right",
              }}
            >
              60 DAYS
            </Typography>
            <Typography
              variant="caption"
              sx={{
                width: "24%",
                color: "text.secondary",
                fontWeight: 700,
                textAlign: "right",
              }}
            >
              90 DAYS
            </Typography>
          </Box>

          <Divider sx={{ mb: 1 }} />

          <Stack spacing={0.5}>
            <ForecastRow
              label="Revenue"
              values={[
                cashflow.forecast["30_days"].revenue,
                cashflow.forecast["60_days"].revenue,
                cashflow.forecast["90_days"].revenue,
              ]}
            />
            <ForecastRow
              label="Costs"
              values={[
                cashflow.forecast["30_days"].costs,
                cashflow.forecast["60_days"].costs,
                cashflow.forecast["90_days"].costs,
              ]}
            />
            <Divider sx={{ my: 0.5 }} />
            <ForecastRow
              label="Profit"
              values={[
                cashflow.forecast["30_days"].profit,
                cashflow.forecast["60_days"].profit,
                cashflow.forecast["90_days"].profit,
              ]}
              bold
            />
          </Stack>

          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: "block", mt: 1.5, fontStyle: "italic" }}
          >
            {cashflow.note}
          </Typography>
        </Paper>
      )}

      {/* ---------- QUOTES THIS MONTH ---------- */}
      <Paper sx={{ p: 2.5, mb: 2 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 1 }}
        >
          Quotes This Month
        </Typography>
        <Box sx={{ mt: 1.5, mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {month.total_quotes} total
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip label={`${month.good} GOOD`} color="success" size="small" />
          <Chip label={`${month.thin} THIN`} color="warning" size="small" />
          <Chip label={`${month.loss} LOSS`} color="error" size="small" />
        </Stack>
      </Paper>

      {/* ---------- MARGIN WARNING ---------- */}
      {warning.loss_count > 0 && (
        <Paper
          sx={{
            p: 2.5,
            mb: 2,
            borderLeft: 6,
            borderColor: "error.main",
            bgcolor: "#fff5f5",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
            ⚠️ Margin Warning
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            <strong>{warning.loss_count}</strong>{" "}
            {warning.loss_count === 1 ? "LOSS quote" : "LOSS quotes"} this month.
            That is <strong>£{warning.loss_shortfall.toFixed(2)}</strong> of your
            profit gone.
          </Typography>
          <Button
            component={Link}
            href="/quotes"
            variant="contained"
            size="small"
            fullWidth
          >
            Review them →
          </Button>
        </Paper>
      )}

      {/* ---------- TOP CLIENTS ---------- */}
      {top_clients.length > 0 && (
        <Paper sx={{ p: 2.5, mb: 2 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 1 }}
          >
            Top Clients
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 1.5 }}>
            {top_clients.map((c) => (
              <Box key={c.name}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {c.name}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    £{c.revenue.toFixed(2)}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
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
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      <Footer />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 12 }}>
      <Suspense fallback={<CircularProgress />}>
        <DashboardContent />
      </Suspense>
    </Container>
  );
}

function PLRow({
  label,
  budgeted,
  actual,
  favourable,
  bold,
  isPercent,
}: {
  label: string;
  budgeted: number;
  actual: number | null;
  favourable: "up" | "down";
  bold?: boolean;
  isPercent?: boolean;
}) {
  const hasActual = actual !== null;
  const rawVariance = hasActual ? actual - budgeted : null;

  // For costs, "less than budgeted" is a win. Flip the sign so that a saving
  // displays as a POSITIVE, green figure — not a negative, green one.
  const variance =
    rawVariance === null
      ? null
      : favourable === "down"
      ? -rawVariance
      : rawVariance;

  let varColor = "text.disabled";
  if (variance !== null && Math.abs(variance) > 0.005) {
    varColor = variance > 0 ? "success.main" : "error.main";
  }

  const fmt = (v: number) =>
    isPercent ? `${v.toFixed(1)}%` : `£${v.toFixed(2)}`;

  // Sign comes BEFORE the currency symbol — "+£3,031.05", not "£+3031.05"
  const formatVariance = (v: number) => {
    const sign = v > 0 ? "+" : v < 0 ? "-" : "";
    const magnitude = Math.abs(v);
    return isPercent
      ? `${sign}${magnitude.toFixed(1)}%`
      : `${sign}£${magnitude.toFixed(2)}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        py: 0.3,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ width: "28%", fontWeight: bold ? 700 : 500 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ width: "24%", textAlign: "right", fontWeight: bold ? 700 : 600 }}
      >
        {fmt(budgeted)}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          width: "24%",
          textAlign: "right",
          fontWeight: bold ? 700 : 600,
          color: hasActual ? "text.primary" : "text.disabled",
        }}
      >
        {hasActual ? fmt(actual) : "—"}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          width: "24%",
          textAlign: "right",
          fontWeight: 700,
          color: varColor,
        }}
      >
        {variance === null ? "—" : formatVariance(variance)}
      </Typography>
    </Box>
  );
}

// ---------- Row: Cash Flow Forecast (3 period columns) ----------

function ForecastRow({
  label,
  values,
  bold,
}: {
  label: string;
  values: [number, number, number];
  bold?: boolean;
}) {
  const fmt = (v: number) => `£${v.toFixed(2)}`;
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        py: 0.3,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ width: "28%", fontWeight: bold ? 700 : 500 }}
      >
        {label}
      </Typography>
      {values.map((v, i) => (
        <Typography
          key={i}
          variant="body2"
          sx={{
            width: "24%",
            textAlign: "right",
            fontWeight: bold ? 700 : 600,
            color: bold && v > 0 ? "success.main" : "text.primary",
          }}
        >
          {fmt(v)}
        </Typography>
      ))}
    </Box>
  );
}