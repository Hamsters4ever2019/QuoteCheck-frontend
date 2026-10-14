"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircularProgress, Container } from "@mui/material";

export default function DashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return (
    <Container sx={{ py: 8, textAlign: "center" }}>
      <CircularProgress />
    </Container>
  );
}