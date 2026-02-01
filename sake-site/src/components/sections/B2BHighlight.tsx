"use client";

import { motion } from "framer-motion";
import { siteContent } from "@/content/data";
import { Button } from "@/components/ui/button";

const { b2b } = siteContent;

const icons: Record<string, React.ReactNode> = {
  stage: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
      <path d="M3 7h18M5 7v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" strokeWidth="1.5" />
      <path d="M8 17v2M16 17v2" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  sound: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
      <path d="M5 9v6h4l5 4V5L9 9H5z" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 7a7 7 0 0 1 0 10" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  lighting: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
      <path d="M12 3v10l4 2-4 6-4-6 4-2" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  screen: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
      <rect x="3" y="5" width="18" height="12" rx="2" strokeWidth="1.5" />
      <path d="M8 21h8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export default function B2BHighlight() {
  return (
    <section id="b2b" className="relative py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(230,57,70,0.14),_transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-widest text-ember/80">
              {b2b.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              {b2b.title}
            </h2>
            <p className="mt-4 text-base text-ember">{b2b.highlight}</p>
            <p className="mt-3 text-sm font-sans leading-relaxed text-muted-foreground">
              {b2b.condition}
            </p>
            <div className="brush-divider mt-6" />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <a href={b2b.primaryCta.href}>{b2b.primaryCta.label}</a>
              </Button>
              <Button asChild variant="ghost">
                <a href={b2b.secondaryCta.href}>{b2b.secondaryCta.label}</a>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {b2b.benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="rounded-2xl border border-border-subtle bg-surface p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-muted text-ember">
                  {icons[benefit.icon]}
                </div>
                <p className="mt-4 font-sans text-lg font-semibold text-foreground">
                  {benefit.title}
                </p>
                <p className="mt-2 text-sm font-sans leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
