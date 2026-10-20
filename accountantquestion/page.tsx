"use client";

import { Container, Typography, Paper, Box, Button, Stack, Divider } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AskAccountantLandingPage() {
  // 🚨 PASTE YOUR STRIPE PAYMENT LINK HERE 🚨
  const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/YOUR_STRIPE_LINK"; 

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc", // Very light slate background
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        py: 8,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* Header / Logo area */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: "#0f3d3e", letterSpacing: -1 }}>
            Ask a UK Accountant
          </Typography>
          <Typography variant="h6" sx={{ color: "text.secondary", mt: 1, fontWeight: 400 }}>
            Clear, professional answers for tradespeople. No retainers. No jargon.
          </Typography>
        </Box>

        {/* Main Pricing Card */}
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            borderTop: "8px solid #0f3d3e",
            textAlign: "center",
            position: "relative",
          }}
        >
          <Typography variant="overline" sx={{ color: "#0f3d3e", fontWeight: 700, letterSpacing: 2 }}>
            15-Minute Consultation
          </Typography>
          
          <Box sx={{ my: 3 }}>
            <Typography variant="h2" sx={{ fontWeight: 800, color: "#1e293b" }}>
              £15
            </Typography>
            <Typography variant="body1" color="text.secondary">
              One-off payment. No subscription.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* What's included */}
          <Stack spacing={2} sx={{ mb: 4, textAlign: "left" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CheckCircleIcon color="success" />
              <Typography variant="body1">Speak directly to a UK-qualified accountant.</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CheckCircleIcon color="success" />
              <Typography variant="body1">Get clarity on tax, CIS, or business expenses.</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CheckCircleIcon color="success" />
              <Typography variant="body1">Book a time that suits your schedule immediately.</Typography>
            </Box>
          </Stack>

          {/* The Stripe Button */}
          <Button
            component="a"
            href={STRIPE_PAYMENT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            size="large"
            fullWidth
            sx={{
              bgcolor: "#0f3d3e",
              "&:hover": { bgcolor: "#082928" },
              py: 2,
              fontSize: "1.1rem",
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: "0 4px 14px 0 rgba(15,61,62,0.39)",
            }}
          >
            Pay £15 & Book Now →
          </Button>
          
          <Typography variant="caption" display="block" sx={{ mt: 2, color: "text.secondary" }}>
            Secure payment via Stripe. You will be redirected to choose your appointment time.
          </Typography>
        </Paper>

        {/* Footer Trust Signals */}
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Powered by FD+ Virtual FD Services.
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.5 }}>
            Your payment details are processed securely. We do not store your card information.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}