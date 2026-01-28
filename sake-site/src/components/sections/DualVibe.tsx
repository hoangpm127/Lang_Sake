"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { siteContent, type VibeMode } from "@/content/data";

type DualVibeProps = {
  mode: VibeMode;
};

const { dualVibe } = siteContent;

export default function DualVibe({ mode }: DualVibeProps) {
  const content = dualVibe[mode];
  const isDay = mode === "day";

  return (
    <section id="dual-vibe" className="relative py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(47,191,155,0.12),_transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center"
        >
          <div>
            <p
              className={`text-xs uppercase tracking-widest ${
                isDay ? "text-zen/80" : "text-ember/80"
              }`}
            >
              {dualVibe.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              {dualVibe.title}
            </h2>
            <p className="mt-4 text-sm font-sans leading-relaxed text-muted-foreground sm:text-base">
              {content.description}
            </p>
            <div className="brush-divider mt-6" />
            <div className="mt-6 flex items-center gap-3">
              <span
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest ${
                  isDay
                    ? "border-zen/40 bg-zen/10 text-zen"
                    : "border-ember/40 bg-ember/10 text-ember"
                }`}
              >
                {content.label}
              </span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {content.ambient}
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {content.highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border-subtle bg-surface p-4"
                >
                  <p className="font-sans text-base font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm font-sans leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
            <div className="relative aspect-[4/5]">
              {content.mediaType === "video" ? (
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={content.posterUrl}
                >
                  <source src={content.mediaUrl} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src={content.mediaUrl}
                  alt={content.headline}
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-xs uppercase tracking-widest text-white/70">
                  {content.label}
                </p>
                <p className="mt-2 font-serif text-2xl tracking-tight text-white">
                  {content.headline}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
