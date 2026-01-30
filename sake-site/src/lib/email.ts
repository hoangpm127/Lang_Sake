import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail", // hoặc "smtp.gmail.com"
  auth: {
    user: process.env.EMAIL_USER, // Email của Lang Sake
    pass: process.env.EMAIL_PASSWORD, // App password (không phải password thường)
  },
});

type BookingEmailData = {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  dateTime: string;
  guests: number;
  comboName: string;
  finalTotal: number;
  depositAmount: number;
  discount: number;
  notes?: string;
};

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  const {
    bookingId,
    customerName,
    customerEmail,
    phone,
    dateTime,
    guests,
    comboName,
    finalTotal,
    depositAmount,
    discount,
    notes,
  } = data;

  const bookingCode = bookingId.substring(0, 8).toUpperCase();
  const formattedDateTime = new Date(dateTime).toLocaleString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
  });
  const formattedTotal = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(finalTotal);
  const formattedDeposit = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(depositAmount);
  const formattedDiscount = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(discount);

  const lookupUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://langsake.vn"}/booking/lookup?id=${bookingId}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đặt bàn - Lang Sake</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f6f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f6f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #c9a24d 0%, #b8914d 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 Đặt bàn thành công!</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Cảm ơn bạn đã tin tưởng Lang Sake</p>
            </td>
          </tr>

          <!-- Booking Code -->
          <tr>
            <td style="padding: 30px; background-color: #fff8e8; text-align: center; border-bottom: 2px dashed #c9a24d;">
              <p style="margin: 0 0 10px 0; color: #8b857a; font-size: 14px;">Mã đặt bàn của bạn</p>
              <div style="background-color: #ffffff; border: 2px solid #c9a24d; border-radius: 8px; padding: 15px; display: inline-block;">
                <p style="margin: 0; color: #c9a24d; font-size: 32px; font-weight: bold; letter-spacing: 3px; font-family: 'Courier New', monospace;">${bookingCode}</p>
              </div>
              <p style="margin: 15px 0 0 0; color: #8b857a; font-size: 12px;">💾 Vui lòng lưu mã này để tra cứu và check-in</p>
            </td>
          </tr>

          <!-- Customer Info -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 18px; border-bottom: 2px solid #f0ebe6; padding-bottom: 10px;">📋 Thông tin khách hàng</h2>
              <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                  <td style="color: #8b857a; font-size: 14px; width: 40%;">Họ tên:</td>
                  <td style="color: #1a1a1a; font-size: 14px; font-weight: bold;">${customerName}</td>
                </tr>
                <tr>
                  <td style="color: #8b857a; font-size: 14px;">Số điện thoại:</td>
                  <td style="color: #1a1a1a; font-size: 14px; font-weight: bold;">${phone}</td>
                </tr>
                <tr>
                  <td style="color: #8b857a; font-size: 14px;">Email:</td>
                  <td style="color: #1a1a1a; font-size: 14px; font-weight: bold;">${customerEmail}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 18px; border-bottom: 2px solid #f0ebe6; padding-bottom: 10px;">🍶 Chi tiết đặt bàn</h2>
              <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                  <td style="color: #8b857a; font-size: 14px; width: 40%;">Thời gian:</td>
                  <td style="color: #1a1a1a; font-size: 14px; font-weight: bold;">${formattedDateTime}</td>
                </tr>
                <tr>
                  <td style="color: #8b857a; font-size: 14px;">Combo:</td>
                  <td style="color: #1a1a1a; font-size: 14px; font-weight: bold;">${comboName}</td>
                </tr>
                <tr>
                  <td style="color: #8b857a; font-size: 14px;">Số khách:</td>
                  <td style="color: #1a1a1a; font-size: 14px; font-weight: bold;">${guests} người</td>
                </tr>
                ${notes ? `
                <tr>
                  <td style="color: #8b857a; font-size: 14px; vertical-align: top;">Ghi chú:</td>
                  <td style="color: #1a1a1a; font-size: 14px;">${notes}</td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- Payment Info -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 18px; border-bottom: 2px solid #f0ebe6; padding-bottom: 10px;">💰 Thanh toán</h2>
              <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f8f6f4; border-radius: 8px;">
                ${discount > 0 ? `
                <tr>
                  <td style="color: #16a34a; font-size: 14px; padding: 10px;">Giảm giá:</td>
                  <td style="color: #16a34a; font-size: 14px; font-weight: bold; text-align: right; padding: 10px;">-${formattedDiscount}</td>
                </tr>
                ` : ''}
                ${depositAmount > 0 ? `
                <tr>
                  <td style="color: #2563eb; font-size: 14px; padding: 10px;">Đã đặt cọc:</td>
                  <td style="color: #2563eb; font-size: 14px; font-weight: bold; text-align: right; padding: 10px;">${formattedDeposit}</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #c9a24d;">
                  <td style="color: #1a1a1a; font-size: 16px; font-weight: bold; padding: 15px 10px;">Tổng cộng:</td>
                  <td style="color: #c9a24d; font-size: 20px; font-weight: bold; text-align: right; padding: 15px 10px;">${formattedTotal}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Important Notes -->
          <tr>
            <td style="padding: 30px; background-color: #e0f2fe; border-top: 2px solid #0ea5e9;">
              <h3 style="margin: 0 0 15px 0; color: #0c4a6e; font-size: 16px;">📌 Lưu ý quan trọng</h3>
              <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px; line-height: 1.8;">
                <li>Vui lòng mang theo <strong>mã đặt bàn ${bookingCode}</strong> khi check-in</li>
                <li>Chúng tôi sẽ gọi điện xác nhận trong vòng 24 giờ</li>
                <li>${depositAmount > 0 ? 'Vui lòng thanh toán đặt cọc để giữ chỗ' : 'Thanh toán trực tiếp tại quán'}</li>
                <li>Nếu cần thay đổi, vui lòng liên hệ trước ít nhất 24h</li>
              </ul>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <a href="${lookupUrl}" style="display: inline-block; background: linear-gradient(135deg, #c9a24d 0%, #b8914d 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                🔍 Tra cứu đơn hàng
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #1a1a1a; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #c9a24d; font-size: 20px; font-weight: bold;">LANG SAKE</p>
              <p style="margin: 0 0 15px 0; color: #8b857a; font-size: 14px;">Trải nghiệm văn hóa Sake độc đáo</p>
              <div style="margin: 15px 0;">
                <p style="margin: 0; color: #8b857a; font-size: 13px;">📍 Địa chỉ: [Địa chỉ Lang Sake]</p>
                <p style="margin: 5px 0 0 0; color: #8b857a; font-size: 13px;">📞 Hotline: [Số điện thoại]</p>
              </div>
              <p style="margin: 15px 0 0 0; color: #666; font-size: 12px;">
                Email này được gửi tự động, vui lòng không trả lời trực tiếp.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
LANG SAKE - XÁC NHẬN ĐẶT BÀN

Xin chào ${customerName},

Cảm ơn bạn đã đặt bàn tại Lang Sake!

MÃ ĐẶT BÀN: ${bookingCode}
(Vui lòng lưu mã này để tra cứu và check-in)

THÔNG TIN KHÁCH HÀNG:
- Họ tên: ${customerName}
- Số điện thoại: ${phone}
- Email: ${customerEmail}

CHI TIẾT ĐẶT BÀN:
- Thời gian: ${formattedDateTime}
- Combo: ${comboName}
- Số khách: ${guests} người
${notes ? `- Ghi chú: ${notes}` : ''}

THANH TOÁN:
${discount > 0 ? `- Giảm giá: -${formattedDiscount}\n` : ''}${depositAmount > 0 ? `- Đã đặt cọc: ${formattedDeposit}\n` : ''}- Tổng cộng: ${formattedTotal}

LƯU Ý QUAN TRỌNG:
✓ Mang theo mã đặt bàn ${bookingCode} khi check-in
✓ Chúng tôi sẽ gọi điện xác nhận trong vòng 24 giờ
✓ ${depositAmount > 0 ? 'Vui lòng thanh toán đặt cọc để giữ chỗ' : 'Thanh toán trực tiếp tại quán'}
✓ Nếu cần thay đổi, vui lòng liên hệ trước ít nhất 24h

Tra cứu đơn hàng: ${lookupUrl}

---
LANG SAKE
Trải nghiệm văn hóa Sake độc đáo
📍 [Địa chỉ]
📞 [Hotline]
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Lang Sake" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `✅ Xác nhận đặt bàn #${bookingCode} - Lang Sake`,
      text: textContent,
      html: htmlContent,
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send failed:", error);
    return { success: false, error: error };
  }
}

// Test email configuration
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log("✅ Email server connection successful");
    return true;
  } catch (error) {
    console.error("❌ Email server connection failed:", error);
    return false;
  }
}
