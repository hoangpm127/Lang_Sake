import Image from "next/image";
import Link from "next/link";
import { siteContent } from "@/content/data";

const { footer, navigation } = siteContent;

export default function Footer() {
  return (
    <footer
      id="site-footer"
      className="border-t border-white/10 bg-[#0f0f0f] text-[#f5f5f1]"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Image
                src={navigation.logoUrl}
                alt={navigation.brand}
                width={56}
                height={56}
                sizes="56px"
                className="h-12 w-auto object-contain opacity-90 sm:h-14"
              />
              <div>
                <p className="font-serif text-xl tracking-tight text-[#f5f5f1]">
                  {navigation.brand}
                </p>
                <p className="text-xs text-[#cfcac0]">{footer.address}</p>
              </div>
            </div>
            {footer.note ? (
              <p className="max-w-xs text-xs leading-relaxed text-[#a9a39a]">
                {footer.note}
              </p>
            ) : null}
          </div>

          <div className="space-y-3 text-xs text-[#c8c2b8] md:border-l md:border-white/10 md:pl-8">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#d6cbb8]">
              {footer.contactTitle}
            </p>
            <div className="space-y-2">
              {footer.contactItems.map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="min-w-[70px] text-[#8e857a]">
                    {item.label}
                  </span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 md:border-l md:border-white/10 md:pl-8">
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#d6cbb8]">
              {footer.collabTitle}
            </p>
            <p className="text-xs leading-relaxed text-[#c8c2b8]">
              {footer.collabDescription}
            </p>
            <Link
              href={footer.partnerHref}
              className="text-xs text-[#cdbfa8] underline decoration-[#6f6252] decoration-1 underline-offset-4 transition hover:text-[#f5f5f1]"
            >
              {footer.partnerLabel}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
