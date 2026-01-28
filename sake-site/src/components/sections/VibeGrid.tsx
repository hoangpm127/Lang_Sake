"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { siteContent } from "@/content/data";

const { vibe } = siteContent;

function ParallaxTile({
  src,
  alt,
  depth,
}: {
  src: string;
  alt: string;
  depth: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [depth, -depth]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className="mb-6 break-inside-avoid"
    >
      <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border-subtle bg-surface">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>
    </motion.div>
  );
}

export default function VibeGrid() {
  return (
    <section id="vibe" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-zen/80">
            {vibe.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            {vibe.title}
          </h2>
          <p className="mt-4 text-sm font-sans leading-relaxed text-muted-foreground sm:text-base">
            {vibe.description}
          </p>
          <div className="brush-divider mt-6" />
        </div>

        <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {vibe.images.map((image) => (
            <ParallaxTile key={image.src} {...image} />
          ))}
        </div>
      </div>
    </section>
  );
}
