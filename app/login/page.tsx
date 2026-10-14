"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, Paper, TextField, Button, Typography, Alert, Stack, Box,
  Collapse, Divider,
} from "@mui/material";
import { login } from "../lib/api";

// 👇 Replace this with your Formspree form ID from formspree.io
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdealqee";

export default function LoginPage() {
  const router = useRouter();

  // --- Login state ---
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // --- Request access state ---
  const [showRequest, setShowRequest] = useState(false);
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqTrade, setReqTrade] = useState("");
  const [reqNote, setReqNote] = useState("");
  const [reqSending, setReqSending] = useState(false);
  const [reqSent, setReqSent] = useState(false);
  const [reqError, setReqError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await login(password);
      localStorage.setItem("qc_token", res.token);
      router.push("/");
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ?? err.message ?? "Login failed";
      setLoginError(detail);
      setLoginLoading(false);
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setReqSending(true);
    setReqError(null);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: reqName,
          email: reqEmail,
          trade: reqTrade,
          note: reqNote || "(none)",
          source: "QuoteCheck login page",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Formspree request failed");
      }
      setReqSent(true);
      setReqSending(false);
    } catch (err: any) {
      setReqError(err?.message ?? "Could not send request. Try again.");
      setReqSending(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
            <span style={{ color: "#0f3d3e" }}>FD+</span> QuoteCheck
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            24-hour trial access. Enter your password to continue.
          </Typography>
        </Box>

        {/* --- LOGIN FORM --- */}
        <form onSubmit={handleLogin}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              type="password"
              label="Access password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {loginError && <Alert severity="error">{loginError}</Alert>}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loginLoading}
            >
              {loginLoading ? "Checking…" : "Enter trial"}
            </Button>
          </Stack>
        </form>

        {/* --- DIVIDER + TOGGLE --- */}
        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary">
            OR
          </Typography>
        </Divider>

        {!reqSent && !showRequest && (
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={() => setShowRequest(true)}
          >
            Request access
          </Button>
        )}

        {/* --- REQUEST ACCESS FORM --- */}
        <Collapse in={showRequest && !reqSent}>
          <Box component="form" onSubmit={handleRequest} sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                size="small"
                required
                label="Your name"
                value={reqName}
                onChange={(e) => setReqName(e.target.value)}
              />
              <TextField
                fullWidth
                size="small"
                required
                type="email"
                label="Your email"
                value={reqEmail}
                onChange={(e) => setReqEmail(e.target.value)}
              />
              <TextField
                fullWidth
                size="small"
                required
                label="Your trade"
                placeholder="e.g. Electrician, Plumber, Carpenter"
                value={reqTrade}
                onChange={(e) => setReqTrade(e.target.value)}
              />
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Anything else? (optional)"
                value={reqNote}
                onChange={(e) => setReqNote(e.target.value)}
              />
              {reqError && <Alert severity="error">{reqError}</Alert>}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={reqSending}
              >
                {reqSending ? "Sending…" : "Send request"}
              </Button>
            </Stack>
          </Box>
        </Collapse>

        {reqSent && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Thanks — your request is in. I will reply within 24 hours.
          </Alert>
        )}
      </Paper>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", textAlign: "center", mt: 3, opacity: 0.6 }}
      >
        Powered by FD+ Virtual FD Services
      </Typography>
    </Container>
  );
}