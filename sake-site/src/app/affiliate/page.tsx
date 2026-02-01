"use client";

import { Suspense, useEffect, useState } from "react";
import AffiliateHub from "@/components/sections/AffiliateHub";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import type { VibeMode } from "@/content/data";

function AffiliatePageContent() {
  const [mode, setMode] = useState<VibeMode>("night");

  useEffect(() => {
    document.documentElement.dataset.vibe = mode;
  }, [mode]);

  return (
    <main className="relative bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[28rem] w-[28rem] rounded-full bg-ember/10 blur-[140px]" />
        <div className="absolute top-[35%] -left-32 h-[26rem] w-[26rem] rounded-full bg-zen/10 blur-[140px]" />
      </div>
      <div className="relative z-10">
        <Navbar mode={mode} onToggle={setMode} />
        <AffiliateHub />
        <Footer />
      </div>
    </main>
  );
}

export default function AffiliatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Đang tải...</div>}>
      <AffiliatePageContent />
    </Suspense>
  );
}
