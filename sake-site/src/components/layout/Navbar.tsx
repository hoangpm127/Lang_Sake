"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Fuse from "fuse.js";
import { useDebouncedCallback } from "use-debounce";
import { siteContent, type VibeMode } from "@/content/data";
import { SEARCH_INDEX, type SearchItem } from "@/content/search";
import { cn } from "@/lib/utils";

type NavbarProps = {
  mode: VibeMode;
  onToggle: (mode: VibeMode) => void;
};

const { navigation } = siteContent;

const overlayVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
  exit: { opacity: 0 },
};

const overlayItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function MagneticLink({
  href,
  label,
  onClick,
  className,
}: {
  href: string;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 250, damping: 18 });
  const springY = useSpring(y, { stiffness: 250, damping: 18 });

  const handleMove = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - rect.left - rect.width / 2;
    const dy = event.clientY - rect.top - rect.height / 2;
    x.set(dx * 0.18);
    y.set(dy * 0.18);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative px-2 py-1"
    >
      <motion.span
        style={{ x: springX, y: springY }}
        className={cn(
        "font-sans text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground",
          className
        )}
      >
        {label}
      </motion.span>
    </Link>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} fill="none">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M4.8 4.8l1.6 1.6M17.6 17.6l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.8 19.2l1.6-1.6M17.6 6.4l1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} fill="none">
      <path
        d="M21 14.5a8.5 8.5 0 0 1-10.6-10A9 9 0 1 0 21 14.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M16.2 16.2l4.3 4.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Navbar({ mode, onToggle }: NavbarProps) {
  const isDay = mode === "day";
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const searchWidth = 260;
  const rollerSize = 48;
  const navRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const spotlightOpacity = useMotionValue(0);

  const spotlight = useMotionTemplate`radial-gradient(180px circle at ${spotlightX}px ${spotlightY}px, rgba(230, 57, 70, 0.25), rgba(199, 165, 106, 0.18), transparent 70%)`;

  const { scrollY } = useScroll();
  const scale = useSpring(useTransform(scrollY, [0, 160], [1, 0.95]), {
    stiffness: 200,
    damping: 30,
  });
  const opacity = useSpring(useTransform(scrollY, [0, 160], [1, 0.85]), {
    stiffness: 200,
    damping: 30,
  });
  const logoScale = useSpring(useTransform(scrollY, [0, 160], [1, 0.9]), {
    stiffness: 200,
    damping: 30,
  });

  const fuse = useMemo(
    () =>
      new Fuse(SEARCH_INDEX, {
        keys: ["title", "keywords", "category", "unaccentedTitle"],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    []
  );

  const debouncedSearch = useDebouncedCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }
    const matches = fuse.search(trimmed).map((result) => result.item);
    setSearchResults(matches);
  }, 300);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (menuOpen) {
      setIsSearchOpen(false);
    }
  }, [menuOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      setSearchValue("");
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    if (!value.trim()) {
      setSearchResults([]);
    }
    debouncedSearch(value);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    spotlightX.set(event.clientX - rect.left);
    spotlightY.set(event.clientY - rect.top);
    spotlightOpacity.set(1);
  };

  const handleMouseLeave = () => {
    spotlightOpacity.set(0);
  };

  const hasQuery = searchValue.trim().length > 0;
  const showResults = isSearchOpen && hasQuery;

  return (
    <>
      <motion.header className="fixed left-1/2 top-5 z-50 w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 relative">
        <motion.div
          ref={navRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ scale, opacity }}
          className={cn(
            "relative overflow-hidden rounded-full border backdrop-blur-md",
            isDay
              ? "border-white/40 bg-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
              : "border-white/10 bg-black/60 shadow-[0_20px_60px_rgba(199,165,106,0.22)]"
          )}
        >
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ background: spotlight, opacity: spotlightOpacity }}
          />
          <div className="relative z-10 flex items-center justify-between px-4 py-3 lg:px-6">
            <motion.div style={{ scale: logoScale }}>
              <Link href="/" className="flex items-center">
                <motion.div
                  whileHover={{ rotate: 6 }}
                  className="flex items-center"
                >
                  <Image
                    src={navigation.logoUrl}
                    alt={navigation.brand}
                    width={56}
                    height={56}
                    sizes="56px"
                    className="h-12 w-auto object-contain sm:h-14"
                  />
                </motion.div>
                <span className="sr-only">{navigation.brand}</span>
              </Link>
            </motion.div>

            <motion.div
              layout
              className="hidden flex-1 items-center justify-center gap-4 lg:flex"
            >
              <motion.div layout className="flex items-center gap-4">
                {navigation.primaryLinks.map((link) => (
                  <MagneticLink key={link.href} {...link} />
                ))}
              </motion.div>
            </motion.div>

            <div className="hidden items-center lg:flex">
              <motion.div
                ref={searchRef}
                layout
                initial={false}
                animate={{
                  width: isSearchOpen ? searchWidth + rollerSize : rollerSize,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="relative h-12 items-center lg:flex"
              >
                <motion.div
                  initial={false}
                  animate={{
                    width: isSearchOpen ? searchWidth : 0,
                    opacity: isSearchOpen ? 1 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  onClick={() => searchInputRef.current?.focus()}
                  className="absolute bottom-1 right-0 flex h-8 items-end border-b border-border-subtle"
                >
                  <AnimatePresence>
                    {isSearchOpen ? (
                      <motion.input
                        ref={searchInputRef}
                        type="text"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{
                          type: "spring",
                          stiffness: 100,
                          damping: 20,
                        }}
                        className={cn(
                          "w-full bg-transparent px-1 pb-1 text-sm font-serif outline-none",
                          isDay
                            ? "text-black/80 placeholder:text-black/40"
                            : "text-white placeholder:text-white/40"
                        )}
                        placeholder="Tìm kiếm..."
                        aria-label="Tìm kiếm"
                        autoFocus
                        value={searchValue}
                        onChange={handleSearchChange}
                      />
                    ) : null}
                  </AnimatePresence>
                </motion.div>

                <motion.button
                  type="button"
                  onClick={() => setIsSearchOpen((prev) => !prev)}
                  animate={{
                    x: isSearchOpen ? -searchWidth : 0,
                    rotate: isSearchOpen ? -360 : 0,
                    scale: isSearchOpen ? 0.85 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="absolute right-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-transparent"
                  title="Mở cuộn giấy"
                  aria-label="Mở cuộn giấy"
                >
                  <span className="pointer-events-none absolute left-1/2 top-1 h-1 w-1 -translate-x-1/2 rounded-full bg-white/70" />
                  <motion.div
                    className="z-10"
                    animate={{ rotate: isSearchOpen ? 360 : 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <SearchIcon
                      className={
                        isDay ? "h-5 w-5 text-black/70" : "h-5 w-5 text-white/80"
                      }
                    />
                  </motion.div>
                </motion.button>
              </motion.div>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border lg:hidden",
                isDay
                  ? "border-black/10 bg-white/60 text-black/70"
                  : "border-white/20 bg-white/10 text-white/80"
              )}
              aria-label="Open menu"
            >
              <div className="space-y-1">
                <span className="block h-0.5 w-5 bg-current" />
                <span className="block h-0.5 w-5 bg-current" />
              </div>
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showResults ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ type: "spring", stiffness: 160, damping: 20 }}
              className="absolute right-6 top-full z-50 mt-3 hidden rounded-2xl border border-stone-200 bg-[#F5F5F1] shadow-xl lg:block"
              style={{ width: searchWidth + rollerSize }}
            >
              {searchResults.length > 0 ? (
                <div className="max-h-72 overflow-auto py-2">
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchValue("");
                        setSearchResults([]);
                      }}
                      className="flex items-center gap-3 px-3 py-2 transition hover:bg-black/5"
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded-md border border-stone-200">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-serif text-sm font-semibold text-stone-900">
                          {item.title}
                        </p>
                        <p className="text-[10px] font-sans uppercase tracking-widest text-stone-500">
                          {item.category}
                        </p>
                      </div>
                      {item.price ? (
                        <span className="text-xs font-sans font-semibold text-ember">
                          {item.price}
                        </span>
                      ) : null}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-5 text-center font-serif text-sm text-stone-500">
                  Không tìm thấy kết quả...
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12">
          <motion.button
            type="button"
            aria-label="Toggle day and night vibe"
            onClick={() => onToggle(isDay ? "night" : "day")}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md",
              isDay
                ? "border-black/20 bg-white/70 text-black/70"
                : "border-white/30 bg-black/60 text-white/80"
            )}
          >
            {isDay ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </motion.button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial="hidden"
            animate="show"
            exit="exit"
            variants={overlayVariants}
            className="fixed inset-0 z-[60] flex flex-col justify-between px-6 py-10"
          >
            <div className="absolute inset-0 washi-overlay opacity-95" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(230,57,70,0.12),_transparent_55%)]" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="font-serif text-lg tracking-tight text-foreground">
                {navigation.brand}
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-xs uppercase tracking-widest text-foreground"
              >
                Close
              </button>
            </div>

            <motion.div
              className="relative z-10 flex flex-col gap-6"
              variants={overlayVariants}
            >
              {navigation.overlayLinks.map((link) => (
                <motion.div key={link.href} variants={overlayItem}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block font-serif text-3xl italic tracking-tight text-foreground sm:text-4xl"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={overlayItem}>
                <Link
                  href={navigation.partnerLink.href}
                  onClick={() => setMenuOpen(false)}
                  className="block font-serif text-3xl italic tracking-tight text-ember sm:text-4xl"
                >
                  {navigation.partnerLink.label}
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative z-10 flex items-center justify-between"
              variants={overlayItem}
            >
              <button
                type="button"
                aria-label="Toggle day and night vibe"
                onClick={() => onToggle(isDay ? "night" : "day")}
                className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-xs uppercase tracking-widest text-foreground"
              >
                {isDay ? "Night Mode" : "Day Mode"}
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
