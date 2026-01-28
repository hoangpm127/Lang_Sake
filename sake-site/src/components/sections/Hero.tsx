"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { siteContent, type VibeMode } from "@/content/data";
type HeroProps = {
  mode: VibeMode;
};

export default function Hero({ mode }: HeroProps) {
  const hero = siteContent.hero[mode];
  const isDay = mode === "day";
  const headlineParts = hero.headline.split(" - ");
  const primaryTitle = headlineParts[0] ?? hero.headline;
  const secondaryTitle = headlineParts[1];

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      {hero.mediaType === "video" ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={hero.posterUrl}
        >
          <source src={hero.mediaUrl} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={hero.mediaUrl}
          alt={hero.headline}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div
        className={`absolute inset-0 ${
          isDay
            ? "bg-gradient-to-b from-white/70 via-white/40 to-black/30"
            : "bg-gradient-to-b from-black/85 via-black/40 to-black/90"
        }`}
      />
      <div
        className={`absolute inset-0 ${
          isDay
            ? "bg-[radial-gradient(circle_at_top,_rgba(199,165,106,0.2),_transparent_60%)]"
            : "bg-[radial-gradient(circle_at_top,_rgba(230,57,70,0.18),_transparent_55%)]"
        }`}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24">
        {hero.eyebrow ? (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-[10px] font-sans uppercase tracking-widest ${
              isDay ? "text-zen" : "text-ember"
            }`}
          >
            {hero.eyebrow}
          </motion.span>
        ) : null}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="mt-4 font-serif italic leading-[0.95] tracking-tight text-foreground"
        >
          <span className="block text-[clamp(3rem,7vw,7rem)]">
            {primaryTitle}
          </span>
          {secondaryTitle ? (
            <span className="mt-2 block text-[clamp(1.9rem,4.5vw,4rem)] text-zen/90">
              {secondaryTitle}
            </span>
          ) : null}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease: "easeOut" }}
          className="mt-4 font-script text-xl text-zen sm:text-2xl"
        >
          {hero.signature}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="mt-5 max-w-2xl font-sans text-lg leading-relaxed text-foreground/90 sm:text-2xl"
        >
          {hero.subheadline}
        </motion.p>
        <p className="mt-4 text-xs font-sans uppercase tracking-widest text-muted-foreground">
          {hero.ambient}
        </p>
        <div className="mt-10" />
      </div>
    </section>
  );
}
