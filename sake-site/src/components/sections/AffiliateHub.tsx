"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { siteContent } from "@/content/data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const { affiliate } = siteContent;

type AffiliateFormValues = {
  fullName: string;
  phone: string;
  password: string;
  socialLink: string;
  referralCode?: string;
};

const survivalLevels = [
  {
    title: "CẤP ĐỘ 1 - TRUY CẬP CƠ BẢN",
    perk: "MIỄN PHÍ ĐỒ ĂN",
    description: "Khởi động nhẹ nhàng, trải nghiệm nền tảng.",
    icon: (
      <svg
        viewBox="0 0 80 80"
        className="h-14 w-14 drop-shadow-[0_2px_6px_rgba(212,175,55,0.45)]"
      >
        <defs>
          <linearGradient id="goldIcon-1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6f4a1e" />
            <stop offset="45%" stopColor="#c9a24d" />
            <stop offset="70%" stopColor="#f2d68a" />
            <stop offset="100%" stopColor="#b88634" />
          </linearGradient>
        </defs>
        <path
          d="M16 46c4 14 44 14 48 0v-6H16v6z"
          fill="url(#goldIcon-1)"
        />
        <rect
          x="14"
          y="42"
          width="52"
          height="8"
          rx="4"
          fill="url(#goldIcon-1)"
          opacity="0.9"
        />
        <circle cx="28" cy="24" r="4" fill="url(#goldIcon-1)" opacity="0.7" />
        <circle cx="40" cy="18" r="4" fill="url(#goldIcon-1)" opacity="0.7" />
        <circle cx="52" cy="24" r="4" fill="url(#goldIcon-1)" opacity="0.7" />
      </svg>
    ),
  },
  {
    title: "CẤP ĐỘ 2 - CHUYÊN NGHIỆP",
    perk: "MIỄN PHÍ CHỖ Ở + GIẶT LÀ",
    description: "Nâng cấp quyền lợi và hỗ trợ vận hành.",
    icon: (
      <svg
        viewBox="0 0 80 80"
        className="h-14 w-14 drop-shadow-[0_2px_6px_rgba(212,175,55,0.45)]"
      >
        <defs>
          <linearGradient id="goldIcon-2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6f4a1e" />
            <stop offset="45%" stopColor="#c9a24d" />
            <stop offset="70%" stopColor="#f2d68a" />
            <stop offset="100%" stopColor="#b88634" />
          </linearGradient>
        </defs>
        <rect
          x="12"
          y="38"
          width="56"
          height="16"
          rx="4"
          fill="url(#goldIcon-2)"
        />
        <rect
          x="12"
          y="30"
          width="20"
          height="10"
          rx="3"
          fill="url(#goldIcon-2)"
          opacity="0.85"
        />
        <rect
          x="36"
          y="30"
          width="32"
          height="10"
          rx="3"
          fill="url(#goldIcon-2)"
          opacity="0.75"
        />
        <circle cx="60" cy="24" r="8" fill="url(#goldIcon-2)" opacity="0.9" />
        <circle cx="60" cy="24" r="3" fill="#3f2a11" opacity="0.4" />
      </svg>
    ),
  },
  {
    title: "CẤP ĐỘ 3 - BẬC THẦY",
    perk: "TRƯỞNG NHÓM - THU NHẬP THỤ ĐỘNG",
    description: "Dẫn đội, nhận thu nhập và quyền lực cộng đồng.",
    icon: (
      <svg
        viewBox="0 0 80 80"
        className="h-14 w-14 drop-shadow-[0_2px_6px_rgba(212,175,55,0.45)]"
      >
        <defs>
          <linearGradient id="goldIcon-3" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6f4a1e" />
            <stop offset="45%" stopColor="#c9a24d" />
            <stop offset="70%" stopColor="#f2d68a" />
            <stop offset="100%" stopColor="#b88634" />
          </linearGradient>
        </defs>
        <circle cx="34" cy="34" r="14" fill="url(#goldIcon-3)" />
        <polygon
          points="34,22 37,30 46,31 39,36 41,45 34,40 27,45 29,36 22,31 31,30"
          fill="#3f2a11"
          opacity="0.35"
        />
        <circle cx="58" cy="46" r="9" fill="url(#goldIcon-3)" opacity="0.9" />
        <circle cx="66" cy="38" r="7" fill="url(#goldIcon-3)" opacity="0.75" />
      </svg>
    ),
  },
];

export default function AffiliateHub() {
  const searchParams = useSearchParams();
  const referralParam = searchParams.get("ref")?.trim();
  const [revenue, setRevenue] = useState(affiliate.calculator.defaultValue);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AffiliateFormValues>({
    defaultValues: {
      referralCode: referralParam || "",
    },
  });

  useEffect(() => {
    if (referralParam) {
      setValue("referralCode", referralParam);
    }
  }, [referralParam, setValue]);

  const incomeRange = useMemo(() => {
    return {
      min: revenue * affiliate.calculator.minRate,
      max: revenue * affiliate.calculator.maxRate,
    };
  }, [revenue]);

  const formattedRevenue = useMemo(
    () => new Intl.NumberFormat("vi-VN").format(revenue),
    [revenue]
  );
  const formattedMin = useMemo(
    () => new Intl.NumberFormat("vi-VN").format(incomeRange.min),
    [incomeRange.min]
  );
  const formattedMax = useMemo(
    () => new Intl.NumberFormat("vi-VN").format(incomeRange.max),
    [incomeRange.max]
  );

  return (
    <section id="affiliate" className="relative py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(230,57,70,0.12),_transparent_60%)]" />
      <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-zen/20 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-ember/80">
            {affiliate.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            {affiliate.title}
          </h2>
          <p className="mt-4 text-sm font-sans leading-relaxed text-muted-foreground sm:text-base">
            {affiliate.subtitle}
          </p>
          <div className="brush-divider mt-6" />
          <div className="mt-6 flex flex-wrap gap-3">
            {affiliate.valueProps.map((item) => (
              <span
                key={item}
                className="rounded-full border border-ember/40 bg-ember/10 px-4 py-2 text-xs uppercase tracking-widest text-ember"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl bg-[linear-gradient(135deg,#6f4a1e_0%,#c9a24d_45%,#f2d68a_70%,#b88634_100%)] p-[1px] shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
              <div className="relative rounded-3xl bg-gradient-to-b from-[#1b1b1b] to-[#0d0d0d] p-6">
                <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_40px_rgba(214,178,94,0.08)]" />
                <div className="relative text-center">
                  <h3 className="mt-3 font-serif text-3xl text-transparent bg-clip-text bg-[linear-gradient(120deg,#6f4a1e_0%,#c9a24d_45%,#f2d68a_70%,#b88634_100%)] drop-shadow-[0_2px_10px_rgba(214,178,94,0.4)]">
                    THỬ THÁCH SINH TỒN
                  </h3>
                  <p className="mt-2 text-sm text-[#b9afa2]">
                    Lộ trình lên cấp, nâng quyền lợi và thu nhập.
                  </p>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                  {survivalLevels.map((level) => (
                    <div
                      key={level.title}
                      className="rounded-3xl bg-[linear-gradient(135deg,#6f4a1e_0%,#c9a24d_45%,#f2d68a_70%,#b88634_100%)] p-[1px] shadow-[0_0_35px_rgba(214,178,94,0.25),0_10px_30px_-10px_rgba(234,179,8,0.15)]"
                    >
                      <div className="relative h-full rounded-3xl bg-gradient-to-b from-[#1b1b1b] to-[#0d0d0d] p-6">
                        <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_40px_rgba(214,178,94,0.08)]" />
                        <div className="relative space-y-4">
                          <div className="flex items-center justify-center drop-shadow-[0_0_12px_rgba(214,178,94,0.45)]">
                            {level.icon}
                          </div>
                          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#e4c36f]">
                            {level.title}
                          </p>
                          <p className="text-center font-serif text-xl text-transparent bg-clip-text bg-[linear-gradient(120deg,#c9a24d_0%,#f2d68a_50%,#b88634_100%)] drop-shadow-[0_2px_10px_rgba(214,178,94,0.4)]">
                            {level.perk}
                          </p>
                          <p className="text-center text-sm text-[#a69a8b]">
                            {level.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-center font-serif text-xl font-bold uppercase tracking-[0.07em] [word-spacing:-0.12em] text-transparent bg-clip-text bg-[linear-gradient(120deg,#6f4a1e_0%,#c9a24d_40%,#f2d68a_60%,#b88634_100%)] drop-shadow-[0_2px_10px_rgba(214,178,94,0.35)] sm:text-2xl">
                  {affiliate.calculator.title}
                </CardTitle>
                <div className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3 sm:divide-x sm:divide-border-subtle">
                  <p className="text-center sm:px-4">
                    Hoa hồng 8–12% theo doanh thu
                  </p>
                  <p className="text-center sm:px-4">
                    Nhận mỗi khi đạt hoa hồng 10tr đồng
                  </p>
                  <p className="text-center sm:px-4">
                    Không phụ thuộc vào thời gian
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between text-sm font-sans leading-relaxed text-muted-foreground">
                  <span>{affiliate.calculator.guestsLabel}</span>
                  <span className="font-sans text-2xl font-semibold text-transparent bg-clip-text bg-[linear-gradient(90deg,#8b6a2e_0%,#f2d68a_45%,#c9a24d_100%)] drop-shadow-[0_2px_8px_rgba(214,178,94,0.35)]">
                    {formattedRevenue} đ
                  </span>
                </div>
                <Slider
                  variant="gold"
                  min={affiliate.calculator.min}
                  max={affiliate.calculator.max}
                  step={affiliate.calculator.step}
                  value={[revenue]}
                  onValueChange={(value) => setRevenue(value[0] ?? 0)}
                />
                <div className="rounded-xl border border-border-subtle bg-surface p-4 text-center">
                  <p className="text-xs tracking-[0.08em] text-muted-foreground">
                    {affiliate.calculator.estimatedVndLabel}
                  </p>
                  <p className="mt-3 flex items-baseline justify-center gap-3 font-sans text-2xl font-semibold">
                    <span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#7a0c16_0%,#e63946_45%,#d6b25e_100%)] drop-shadow-[0_2px_8px_rgba(214,178,94,0.25)]">
                      {formattedMin} đ
                    </span>
                    <span className="text-sm text-muted-foreground">-</span>
                    <span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#0f5b3b_0%,#1f9d6b_45%,#7c3aed_100%)] drop-shadow-[0_2px_8px_rgba(124,58,237,0.25)]">
                      {formattedMax} đ
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>TRỞ THÀNH ĐỐI TÁC LÀNG SAKE</CardTitle>
                <CardDescription>
                  Tạo tài khoản, nhận link tiếp thị riêng và bắt đầu kiếm thu
                  nhập thụ động ngay hôm nay.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-5"
                  onSubmit={handleSubmit(async () => {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    setShowSuccess(true);
                  })}
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input
                      id="fullName"
                      placeholder="Nhập họ và tên"
                      {...register("fullName", {
                        required: "Vui lòng nhập họ và tên.",
                      })}
                    />
                    {errors.fullName ? (
                      <p className="text-xs text-ember">
                        {errors.fullName.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      placeholder="Số điện thoại (10 chữ số)"
                      {...register("phone", {
                        required: "Vui lòng nhập số điện thoại.",
                        pattern: {
                          value: /^\d{10}$/,
                          message: "Số điện thoại cần đúng 10 chữ số.",
                        },
                      })}
                    />
                    {errors.phone ? (
                      <p className="text-xs text-ember">
                        {errors.phone.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Tạo mật khẩu"
                      {...register("password", {
                        required: "Vui lòng nhập mật khẩu.",
                        minLength: {
                          value: 6,
                          message: "Mật khẩu tối thiểu 6 ký tự.",
                        },
                      })}
                    />
                    {errors.password ? (
                      <p className="text-xs text-ember">
                        {errors.password.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialLink">Link TikTok/Facebook</Label>
                    <Input
                      id="socialLink"
                      placeholder="Dán link trang cá nhân của bạn..."
                      {...register("socialLink", {
                        required: "Vui lòng dán link trang cá nhân.",
                      })}
                    />
                    {errors.socialLink ? (
                      <p className="text-xs text-ember">
                        {errors.socialLink.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referralCode">Mã người giới thiệu (F1)</Label>
                    <Input
                      id="referralCode"
                      placeholder="Ví dụ: F1-TRAM2026"
                      disabled={Boolean(referralParam)}
                      {...register("referralCode")}
                    />
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-zen via-amber-200 to-amber-400 text-[#1a1a1a] shadow-lg"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang đăng ký..." : "Đăng Ký Ngay"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Đã có tài khoản?{" "}
                    <a href="/login" className="text-ember underline">
                      Đăng nhập tại đây
                    </a>
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {showSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 text-center shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-zen">
              Thành công
            </p>
            <h3 className="mt-3 font-serif text-2xl text-[#1a1a1a]">
              Đăng ký thành công!
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Hãy đăng nhập để lấy link giới thiệu.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="/login"
                className="rounded-full bg-[#1a1a1a] px-6 py-3 text-xs uppercase tracking-[0.3em] text-white"
              >
                Đi đến trang đăng nhập
              </a>
              <button
                type="button"
                onClick={() => setShowSuccess(false)}
                className="rounded-full border border-black/10 px-6 py-3 text-xs uppercase tracking-[0.3em] text-[#6b5f4b]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}


