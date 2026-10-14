"use client";

import Image from "next/image";
import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        mt: 6,
        mb: 2,
        textAlign: "center",
        opacity: 0.75,
      }}
    >
      <Image
        src="/fd-logo.png"
        alt="FD+"
        width={48}
        height={48}
        style={{ borderRadius: 8, marginBottom: 8 }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", fontSize: "0.7rem", letterSpacing: 0.5 }}
      >
        Powered by FD+ Virtual FD Services
      </Typography>
    </Box>
  );
}