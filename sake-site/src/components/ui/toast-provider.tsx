"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "#fff",
          color: "#1a1a1a",
          border: "1px solid #e5e5e5",
        },
        className: "font-sans",
      }}
    />
  );
}
