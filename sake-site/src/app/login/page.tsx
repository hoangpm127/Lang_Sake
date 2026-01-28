"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { siteContent } from "@/content/data";
import { cn } from "@/lib/utils";

const { navigation } = siteContent;

type Role = "admin" | "f1" | "f2";

type RoleField = {
  id: string;
  label: string;
  type?: string;
};

type RoleConfig = {
  id: Role;
  label: string;
  title: string;
  image: string;
  position?: string;
  quote?: string;
  accentBorder: string;
  accentText: string;
  accentSoft: string;
  note: string;
};

const ROLE_CONFIG: RoleConfig[] = [
  {
    id: "admin",
    label: "QUẢN TRỊ",
    title: "Quản Trị Viên",
    image: "/images/login-admin.jpg",
    accentBorder: "border-[#d6b25e]",
    accentText: "text-[#c9a24d]",
    accentSoft: "bg-[#f2e6c9]",
    note: "Tài khoản quản trị duy nhất do hệ thống nắm giữ.",
  },
  {
    id: "f1",
    label: "ĐỐI TÁC CHIẾN LƯỢC",
    title: "Đối Tác Chiến Lược",
    image: "/images/login-f1.jpg",
    accentBorder: "border-[#e63946]",
    accentText: "text-[#e63946]",
    accentSoft: "bg-[#fde4e7]",
    note: "Tài khoản đối tác chiến lược do Admin cấp.",
    quote: 'Chọn "ĐÚNG" quan trọng hơn nỗ lực.',
  },
  {
    id: "f2",
    label: "THÀNH VIÊN",
    title: "Cộng Tác Viên",
    image: "/images/login-f2.jpg",
    position: "80% center",
    accentBorder: "border-[#5f8f52]",
    accentText: "text-[#5f8f52]",
    accentSoft: "bg-[#e7efe2]",
    note: "Thành viên đăng ký tại trang Affiliate để được cấp tài khoản.",
    quote: "\"TUỔI TRẺ\" của bạn \"ĐÁNG GIÁ\" bao nhiêu?",
  },
];

const ROLE_FIELDS: Record<Role, RoleField[]> = {
  admin: [
    { id: "email", label: "Email" },
    { id: "password", label: "Mật khẩu", type: "password" },
  ],
  f1: [
    { id: "email", label: "Email" },
    { id: "password", label: "Mật khẩu", type: "password" },
  ],
  f2: [
    { id: "email", label: "Email" },
    { id: "password", label: "Mật khẩu", type: "password" },
  ],
};

function FloatingLabelInput({
  id,
  label,
  type = "text",
  value,
  onChange,
}: RoleField & {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="relative block">
      <input
        id={id}
        name={id}
        type={type}
        placeholder=" "
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="peer w-full border-b border-black/15 bg-transparent pb-2 pt-5 text-sm text-[#1a1a1a] outline-none transition focus:border-black/40"
      />
      <span className="pointer-events-none absolute left-0 top-2 text-[10px] uppercase tracking-[0.2em] text-[#8b857a] transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-[#4c463f]">
        {label}
      </span>
    </label>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("f2");
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleConfig = useMemo(
    () => ROLE_CONFIG.find((item) => item.id === role) ?? ROLE_CONFIG[2],
    [role]
  );

  useEffect(() => {
    setFormState({});
    setError(null);
  }, [role]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const email = formState.email ?? "";
    const password = formState.password ?? "";

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      const payload = (text ? JSON.parse(text) : null) as
        | { ok: boolean; message?: string; redirect?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message || "Đăng nhập thất bại.");
      }

      router.push(payload.redirect || `/dashboard/${role}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Đăng nhập thất bại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0d0d0d] text-[#111] lg:flex-row">
      <motion.aside
        key={role}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative hidden w-1/2 overflow-hidden bg-cover bg-center lg:flex"
        style={{
          backgroundImage: `url(${roleConfig.image})`,
          backgroundPosition: roleConfig.position || "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/30 to-black/70" />
        <div className="absolute left-8 top-8 flex items-center gap-3 text-white">
          <Image
            src={navigation.logoUrl}
            alt={navigation.brand}
            width={48}
            height={48}
            sizes="48px"
            className="h-12 w-auto object-contain"
          />
          <p className="text-lg font-[var(--font-playfair)] text-white/90">
            {navigation.brand}
          </p>
        </div>
        {roleConfig.quote ? (
          <div className="absolute bottom-4 left-1/2 w-full max-w-xl -translate-x-1/2 px-10 text-center text-white/85">
            <p className="text-xl font-[var(--font-playfair)] leading-none whitespace-nowrap">
              {roleConfig.quote}
            </p>
          </div>
        ) : null}
      </motion.aside>

      <div className="flex w-full items-center justify-center bg-[#fafafa] px-6 py-16 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8f887c]">
              <span className="h-px flex-1 bg-black/10" />
              Cổng truy cập
              <span className="h-px flex-1 bg-black/10" />
            </div>
            <div className="relative flex rounded-full border border-black/10 bg-white/70 p-1 shadow-sm">
              {ROLE_CONFIG.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className="relative flex-1 px-3 py-2 text-[10px] uppercase tracking-[0.2em]"
                >
                  {role === item.id && (
                    <motion.span
                      layoutId="role-pill"
                      className={cn(
                        "absolute inset-0 rounded-full",
                        item.accentSoft
                      )}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 text-[#6d665b]",
                      role === item.id && "text-[#1f1b16]"
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-[var(--font-playfair)] text-[#1a1a1a]">
              Chào mừng,
              <span className={cn("ml-2", roleConfig.accentText)}>
                {roleConfig.title}
              </span>
            </h1>
            <p className="text-sm text-[#8b857a]">
              Hãy xác thực thông tin để truy cập Trạm Khởi Nghiệp.
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={role}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35 }}
              className={cn(
                "space-y-6 rounded-3xl border border-black/10 bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,15,15,0.08)]",
                roleConfig.accentBorder
              )}
              onSubmit={handleSubmit}
            >
              <div className="space-y-5">
                {ROLE_FIELDS[role].map((field) => (
                  <FloatingLabelInput
                    key={field.id}
                    {...field}
                    value={formState[field.id] ?? ""}
                    onChange={(value) =>
                      setFormState((prev) => ({ ...prev, [field.id]: value }))
                    }
                  />
                ))}
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-center text-xs text-[#8b857a]">
                {roleConfig.note}
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs text-red-700">
                  {error}
                </div>
              ) : null}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-full bg-gradient-to-r from-[#d6b25e] via-[#e3b867] to-[#c98d3f] py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#1a1a1a] shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang xác thực..." : "Truy cập Trạm"}
              </motion.button>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
