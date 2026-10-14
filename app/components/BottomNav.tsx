"use client";

import { Suspense } from "react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Insights";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import { useRouter, usePathname } from "next/navigation";

function BottomNavInner() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const value =
    pathname === "/"
      ? "/"
      : pathname.startsWith("/quotes")
      ? "/quotes"
      : pathname.startsWith("/quote/new")
      ? "/quote/new"
      : pathname.startsWith("/settings")
      ? "/settings"
      : "/";

  return (
    <BottomNavigation value={value} onChange={(_, v) => router.push(v)} showLabels>
      <BottomNavigationAction label="Dashboard" value="/" icon={<DashboardIcon />} />
      <BottomNavigationAction label="Quotes" value="/quotes" icon={<HomeIcon />} />
      <BottomNavigationAction label="New" value="/quote/new" icon={<AddCircleIcon />} />
      <BottomNavigationAction label="Settings" value="/settings" icon={<SettingsIcon />} />
    </BottomNavigation>
  );
}

export default function BottomNav() {
  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000 }}
      elevation={3}
    >
      <Suspense fallback={null}>
        <BottomNavInner />
      </Suspense>
    </Paper>
  );
}