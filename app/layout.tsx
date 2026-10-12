import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeRegistry from "./components/ThemeRegistry";
import BottomNav from "./components/BottomNav";



export const metadata: Metadata = {
  title: "QuoteCheck",
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
          {children}
          <BottomNav />
        </ThemeRegistry>
      </body>
    </html>
  );
}