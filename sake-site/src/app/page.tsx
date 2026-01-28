"use client";

import { useEffect, useState } from "react";
import B2BHighlight from "@/components/sections/B2BHighlight";
import Collection from "@/components/sections/Collection";
import DualVibe from "@/components/sections/DualVibe";
import Hero from "@/components/sections/Hero";
import MenuGallery from "@/components/sections/MenuGallery";
import OurStory from "@/components/sections/OurStory";
import SakePass from "@/components/sections/SakePass";
import SakeCulture from "@/components/sections/SakeCulture";
import SocialProof from "@/components/sections/SocialProof";
import VibeGrid from "@/components/sections/VibeGrid";
import Footer from "@/components/layout/Footer";
import FloatingBookingButton from "@/components/layout/FloatingBookingButton";
import Navbar from "@/components/layout/Navbar";
import type { VibeMode } from "@/content/data";

export default function Home() {
  const [mode, setMode] = useState<VibeMode>("night");

  useEffect(() => {
    document.documentElement.dataset.vibe = mode;
  }, [mode]);

  return (
    <main className="relative bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[36rem] w-[36rem] rounded-full bg-ember/10 blur-[140px]" />
        <div className="absolute top-[35%] -left-32 h-[32rem] w-[32rem] rounded-full bg-zen/10 blur-[140px]" />
      </div>
      <div className="relative z-10">
        <Navbar mode={mode} onToggle={setMode} />
        <Hero mode={mode} />
        <OurStory />
        <DualVibe mode={mode} />
        <Collection />
        <SakeCulture />
        <SakePass />
        <MenuGallery />
        <B2BHighlight />
        <SocialProof />
        <VibeGrid />
        <Footer />
      </div>
      <FloatingBookingButton />
    </main>
  );
}
