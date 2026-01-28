"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { siteContent } from "@/content/data";

const { menu } = siteContent;

export default function MenuGallery() {
  return (
    <section id="menu" className="relative py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(230,57,70,0.12),_transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-ember/80">
            {menu.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            {menu.title}
          </h2>
          <p className="mt-4 text-sm font-sans leading-relaxed text-muted-foreground sm:text-base">
            {menu.description}
          </p>
          <div className="brush-divider mt-6" />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {menu.items.map((item, index) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs uppercase tracking-widest text-white/70">
                  {item.tag}
                </span>
              </div>
              <div className="space-y-3 p-6">
                <h3 className="font-serif text-2xl font-semibold text-foreground">
                  {item.name}
                </h3>
                <p className="font-sans text-3xl font-semibold text-ember">
                  {item.price}
                </p>
                <p className="text-sm font-sans leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
