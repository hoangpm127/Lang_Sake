"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { siteContent } from "@/content/data";
import { cn } from "@/lib/utils";

const { sakePass } = siteContent;

function SakePassCard({
  title,
  subtitle,
  description,
  imageUrl,
}: {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
}) {
  return (
    <div className="flex w-[260px] flex-col gap-4 sm:w-[320px] lg:w-[420px]">
      <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border-subtle bg-surface">
        <Image
          src={imageUrl}
          alt={subtitle}
          fill
          sizes="(min-width: 1024px) 420px, (min-width: 640px) 320px, 260px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/70" />
        <span className="absolute left-4 top-4 rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
          {title}
        </span>
      </div>
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground sm:text-xl">
          {subtitle}
        </h3>
        <p className="mt-2 text-sm font-sans leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function SakePass() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxTranslate, setMaxTranslate] = useState(0);

  useLayoutEffect(() => {
    const update = () => {
      if (!sectionRef.current || !trackRef.current) return;
      const trackWidth = trackRef.current.scrollWidth;
      const containerWidth = sectionRef.current.clientWidth;
      setMaxTranslate(Math.max(0, trackWidth - containerWidth));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxTranslate]);
  const enableHorizontal = maxTranslate > 0;

  return (
    <section
      ref={sectionRef}
      id="sake-pass"
      className={cn(
        "relative bg-background py-20",
        enableHorizontal ? "lg:h-[300vh] lg:py-0" : "lg:py-20"
      )}
    >
      <div
        className={cn(
          "flex flex-col justify-center",
          enableHorizontal
            ? "lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden"
            : "lg:static"
        )}
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-widest text-ember/80">
                {sakePass.eyebrow}
              </p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
                {sakePass.title}
              </h2>
              <p className="mt-4 text-sm font-sans leading-relaxed text-muted-foreground sm:text-base">
                {sakePass.description}
              </p>
              <div className="brush-divider mt-6" />
            </div>
            {enableHorizontal ? (
              <p className="hidden text-sm font-sans leading-relaxed text-muted-foreground lg:block">
                {sakePass.hint}
              </p>
            ) : null}
          </div>
        </div>

        {enableHorizontal ? (
          <div className="mt-10 hidden lg:block">
            <motion.div
              ref={trackRef}
              style={{ x }}
              className="flex gap-6 px-6 pb-12"
            >
              {sakePass.items.map((item) => (
                <SakePassCard key={item.title} {...item} />
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="mt-10 hidden lg:grid lg:grid-cols-3 lg:gap-6 lg:px-6">
            {sakePass.items.map((item) => (
              <SakePassCard key={item.title} {...item} />
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-8 px-6 lg:hidden">
          {sakePass.items.map((item) => (
            <SakePassCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
