"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { siteContent } from "@/content/data";

const { story } = siteContent;

export default function OurStory() {
  return (
    <section id="story" className="relative py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(199,165,106,0.12),_transparent_60%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-widest text-ember/80">
            {story.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            {story.title}
          </h2>
          <p className="mt-4 text-sm font-sans leading-relaxed text-muted-foreground sm:text-base">
            {story.description}
          </p>
          <div className="brush-divider mt-6" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
        >
          <div className="relative aspect-[4/5]">
            <Image
              src={story.imageUrl}
              alt={story.title}
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
