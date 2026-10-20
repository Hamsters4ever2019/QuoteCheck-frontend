"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // This only runs in the browser

    if (pathname === "/login") return;

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
      }
    } catch {
      router.replace("/login");
    }
  }, [pathname, router]);

  // 1. On the server, and the very first millisecond on the client, render nothing.
  if (!mounted) {
    return null;
  }

  // 2. If we are on the login page, just show it
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // 3. Show the app
  return <>{children}</>;
}