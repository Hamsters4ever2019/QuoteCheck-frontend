"use client";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1e40af" },
    success: { main: "#16a34a" },
    warning: { main: "#f59e0b" },
    error: { main: "#dc2626" },
    background: { default: "#f8fafc" },
  },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
});

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}