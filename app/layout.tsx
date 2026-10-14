import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeRegistry from "./components/ThemeRegistry";
import BottomNav from "./components/BottomNav";
import AuthGuard from "./components/AuthGuard";

export const metadata: Metadata = {
  title: "FD+ QuoteCheck",
  description: "Know if a quote will make or lose you money — before you send it.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1e40af",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>
        <ThemeRegistry>
          <AuthGuard>
            {children}
            <BottomNav />
          </AuthGuard>
        </ThemeRegistry>
      </body>
    </html>
  );
}