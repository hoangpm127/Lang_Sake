"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FloatingBookingButton() {
  const [avoidFooter, setAvoidFooter] = useState(false);

  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setAvoidFooter(entry.isIntersecting),
      { threshold: 0.2 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={cn(
        "fixed right-6 z-50 transition-all duration-300",
        avoidFooter ? "bottom-24" : "bottom-6"
      )}
    >
      <Button
        asChild
        size="lg"
        className="shadow-[0_20px_50px_rgba(201,162,77,0.35)]"
      >
        <Link href="/booking">Đặt bàn ngay</Link>
      </Button>
    </motion.div>
  );
}
