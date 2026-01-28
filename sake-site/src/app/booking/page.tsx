import BookingForm from "@/components/booking/BookingForm";
import Link from "next/link";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-[#f8f6f4] py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#8b857a] hover:text-[#c9a24d] transition"
          >
            ← Quay về trang chủ
          </Link>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-serif text-[#1a1a1a] mb-3">
            Đặt bàn tại Lang Sake
          </h1>
          <p className="text-[#8b857a]">
            Vui lòng điền thông tin để đặt bàn. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.
          </p>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
          <BookingForm />
        </div>
      </div>
    </div>
  );
}
