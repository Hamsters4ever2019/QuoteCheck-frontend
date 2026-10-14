"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Container, CircularProgress } from "@mui/material";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/login") {
      setChecked(true);
      return;
    }
    const token = localStorage.getItem("qc_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("qc_token");
        router.replace("/login");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [pathname, router]);

  if (!checked) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return <>{children}</>;
}