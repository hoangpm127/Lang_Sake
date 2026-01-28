"use client";

import Image from "next/image";
import { siteContent } from "@/content/data";

const { socialProof } = siteContent;

export default function SocialProof() {
  const loopItems = [...socialProof.items, ...socialProof.items];

  return (
    <section id="social-proof" className="relative py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(47,191,155,0.12),_transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-zen/80">
            {socialProof.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            {socialProof.title}
          </h2>
          <p className="mt-4 text-sm font-sans leading-relaxed text-muted-foreground sm:text-base">
            {socialProof.description}
          </p>
          <div className="brush-divider mt-6" />
        </div>

        <div className="marquee mt-12">
          <div className="marquee-track">
            {loopItems.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="w-[260px] flex-none overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
                aria-hidden={index >= socialProof.items.length}
              >
                <div className="relative h-44">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="260px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </div>
                <div className="space-y-3 p-4">
                  <p className="font-script text-base text-muted-foreground">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <p className="text-xs uppercase tracking-widest text-ember">
                    {item.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
