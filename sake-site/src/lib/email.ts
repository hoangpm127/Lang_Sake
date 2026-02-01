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

// ========================================
// PHASE 6: NEW NOTIFICATION FUNCTIONS
// ========================================

/**
 * Send email when deposit payment is received
 */
export async function sendDepositConfirmationEmail(data: {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  depositAmount: number;
  transferContent: string;
  paidAt: Date;
}) {
  const { bookingId, customerName, customerEmail, depositAmount, transferContent, paidAt } = data;

  const bookingCode = bookingId.substring(0, 8).toUpperCase();
  const formattedAmount = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(depositAmount);
  const formattedDate = paidAt.toLocaleString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const lookupUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://langsake.vn"}/booking/lookup?id=${bookingId}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f6f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f6f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">✅ Đã nhận tiền cọc!</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Booking của bạn đã được xác nhận tự động</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #dcfce7; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #166534; font-size: 14px;">Mã đặt bàn</p>
              <div style="background-color: #ffffff; border: 2px solid #16a34a; border-radius: 8px; padding: 15px; display: inline-block;">
                <p style="margin: 0; color: #16a34a; font-size: 32px; font-weight: bold; letter-spacing: 3px; font-family: 'Courier New', monospace;">${bookingCode}</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 18px; border-bottom: 2px solid #f0ebe6; padding-bottom: 10px;">💳 Chi tiết thanh toán</h2>
              <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f8f6f4; border-radius: 8px;">
                <tr>
                  <td style="color: #8b857a; font-size: 14px; padding: 10px;">Số tiền:</td>
                  <td style="color: #16a34a; font-size: 18px; font-weight: bold; text-align: right; padding: 10px;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="color: #8b857a; font-size: 14px; padding: 10px;">Nội dung:</td>
                  <td style="color: #1a1a1a; font-size: 14px; text-align: right; padding: 10px; font-family: monospace;">${transferContent}</td>
                </tr>
                <tr>
                  <td style="color: #8b857a; font-size: 14px; padding: 10px;">Thời gian:</td>
                  <td style="color: #1a1a1a; font-size: 14px; text-align: right; padding: 10px;">${formattedDate}</td>
                </tr>
                <tr style="border-top: 2px solid #16a34a;">
                  <td style="color: #16a34a; font-size: 16px; font-weight: bold; padding: 15px 10px;">Trạng thái:</td>
                  <td style="color: #16a34a; font-size: 16px; font-weight: bold; text-align: right; padding: 15px 10px;">✅ ĐÃ XÁC NHẬN</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #dbeafe; text-align: center;">
              <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                <strong>Cảm ơn bạn!</strong><br>
                Chúng tôi đã nhận được tiền cọc và tự động xác nhận booking.<br>
                Hẹn gặp bạn tại Lang Sake! 🍶
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; text-align: center;">
              <a href="${lookupUrl}" style="display: inline-block; background: linear-gradient(135deg, #c9a24d 0%, #b8914d 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                🔍 Xem chi tiết booking
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #1a1a1a; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #c9a24d; font-size: 20px; font-weight: bold;">LANG SAKE</p>
              <p style="margin: 0; color: #8b857a; font-size: 12px;">Trải nghiệm văn hóa Sake độc đáo</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Lang Sake" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `✅ Đã nhận cọc #${bookingCode} - Lang Sake`,
      html: htmlContent,
    });

    console.log("✅ Deposit confirmation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Deposit email failed:", error);
    return { success: false, error };
  }
}

/**
 * Send email to F1/F2 when they earn commission
 */
export async function sendCommissionEarnedEmail(data: {
  partnerName: string;
  partnerEmail: string;
  partnerRole: "F1_PARTNER" | "F2_MEMBER";
  commissionAmount: number;
  tier: number;
  bookingId: string;
  customerName: string;
  bookingTotal: number;
}) {
  const { partnerName, partnerEmail, partnerRole, commissionAmount, tier, bookingId, customerName, bookingTotal } = data;

  const bookingCode = bookingId.substring(0, 8).toUpperCase();
  const formattedCommission = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(commissionAmount);
  const formattedTotal = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(bookingTotal);
  const commissionRate = tier === 1 ? "10%" : "5%";
  const tierLabel = tier === 1 ? "Tier 1 - Sale trực tiếp" : "Tier 2 - Quản lý";
  const roleLabel = partnerRole === "F1_PARTNER" ? "F1 Partner" : "F2 Member";
  const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://langsake.vn"}/dashboard/${partnerRole === "F1_PARTNER" ? "f1" : "f2"}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f6f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f6f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #c9a24d 0%, #b8914d 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">💰 Bạn có hoa hồng mới!</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Từ đơn hàng #${bookingCode}</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #fff8e8; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #8b857a; font-size: 14px;">Hoa hồng của bạn</p>
              <div style="background-color: #ffffff; border: 2px solid #c9a24d; border-radius: 8px; padding: 20px; display: inline-block;">
                <p style="margin: 0; color: #c9a24d; font-size: 36px; font-weight: bold;">${formattedCommission}</p>
                <p style="margin: 10px 0 0 0; color: #8b857a; font-size: 12px;">
                  <span style="background-color: ${tier === 1 ? "#dbeafe" : "#f3e8ff"}; color: ${tier === 1 ? "#1e40af" : "#6b21a8"}; padding: 4px 12px; border-radius: 12px; font-weight: bold;">
                    ${tierLabel}
                  </span>
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 18px; border-bottom: 2px solid #f0ebe6; padding-bottom: 10px;">📊 Chi tiết</h2>
              <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f8f6f4; border-radius: 8px;">
                <tr>
                  <td style="color: #8b857a; font-size: 14px; padding: 10px;">Vai trò:</td>
                  <td style="color: #1a1a1a; font-size: 14px; font-weight: bold; text-align: right; padding: 10px;">${roleLabel}</td>
                </tr>
                <tr>
                  <td style="color: #8b857a; font-size: 14px; padding: 10px;">Mã booking:</td>
                  <td style="color: #1a1a1a; font-size: 14px; font-weight: bold; text-align: right; padding: 10px; font-family: monospace;">${bookingCode}</td>
                </tr>
                <tr>
                  <td style="color: #8b857a; font-size: 14px; padding: 10px;">Khách hàng:</td>
                  <td style="color: #1a1a1a; font-size: 14px; text-align: right; padding: 10px;">${customerName}</td>
                </tr>
                <tr>
                  <td style="color: #8b857a; font-size: 14px; padding: 10px;">Doanh thu:</td>
                  <td style="color: #1a1a1a; font-size: 14px; font-weight: bold; text-align: right; padding: 10px;">${formattedTotal}</td>
                </tr>
                <tr>
                  <td style="color: #8b857a; font-size: 14px; padding: 10px;">Tỷ lệ:</td>
                  <td style="color: #16a34a; font-size: 14px; font-weight: bold; text-align: right; padding: 10px;">${commissionRate}</td>
                </tr>
                <tr style="border-top: 2px solid #c9a24d;">
                  <td style="color: #c9a24d; font-size: 16px; font-weight: bold; padding: 15px 10px;">Hoa hồng:</td>
                  <td style="color: #c9a24d; font-size: 18px; font-weight: bold; text-align: right; padding: 15px 10px;">${formattedCommission}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #dbeafe; text-align: center;">
              <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                <strong>💡 Lưu ý:</strong><br>
                Hoa hồng sẽ được thanh toán định kỳ theo chính sách công ty.<br>
                Kiểm tra dashboard để xem chi tiết tất cả hoa hồng.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; text-align: center;">
              <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #c9a24d 0%, #b8914d 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                📊 Xem Dashboard
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #1a1a1a; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #c9a24d; font-size: 20px; font-weight: bold;">LANG SAKE</p>
              <p style="margin: 0; color: #8b857a; font-size: 12px;">Affiliate Program</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Lang Sake Affiliate" <${process.env.EMAIL_USER}>`,
      to: partnerEmail,
      subject: `💰 Hoa hồng mới ${formattedCommission} từ #${bookingCode}`,
      html: htmlContent,
    });

    console.log("✅ Commission email sent to", partnerEmail, ":", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Commission email failed:", error);
    return { success: false, error };
  }
}

/**
 * Send alert to admin when payment mismatch occurs
 */
export async function sendAdminPaymentAlertEmail(data: {
  bookingId: string;
  expectedAmount: number;
  receivedAmount: number;
  transferContent: string;
  bankRef?: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  if (!adminEmail) {
    console.warn("⚠️ No admin email configured");
    return { success: false, error: "No admin email" };
  }

  const { bookingId, expectedAmount, receivedAmount, transferContent, bankRef } = data;
  const bookingCode = bookingId.substring(0, 8).toUpperCase();
  const formattedExpected = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(expectedAmount);
  const formattedReceived = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(receivedAmount);
  const difference = Math.abs(receivedAmount - expectedAmount);
  const formattedDiff = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(difference);
  const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://langsake.vn"}/dashboard/admin`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #fef2f2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">⚠️ Cảnh báo thanh toán</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Số tiền không khớp - Cần kiểm tra</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 18px; border-bottom: 2px solid #f0ebe6; padding-bottom: 10px;">📋 Thông tin</h2>
              <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #fef2f2; border-radius: 8px; border: 2px solid #fca5a5;">
                <tr>
                  <td style="color: #8b857a; font-size: 14px; padding: 10px;">Mã booking:</td>
                  <td style="color: #1a1a1a; font-size: 14px; font-weight: bold; text-align: right; padding: 10px; font-family: monospace;">${bookingCode}</td>
                </tr>
                <tr>
                  <td style="color: #8b857a; font-size: 14px; padding: 10px;">Số tiền cần:</td>
                  <td style="color: #1a1a1a; font-size: 14px; font-weight: bold; text-align: right; padding: 10px;">${formattedExpected}</td>
                </tr>
                <tr>
                  <td style="color: #8b857a; font-size: 14px; padding: 10px;">Số tiền nhận:</td>
                  <td style="color: ${receivedAmount < expectedAmount ? "#dc2626" : "#16a34a"}; font-size: 14px; font-weight: bold; text-align: right; padding: 10px;">${formattedReceived}</td>
                </tr>
                <tr style="border-top: 2px solid #dc2626;">
                  <td style="color: #dc2626; font-size: 16px; font-weight: bold; padding: 15px 10px;">Chênh lệch:</td>
                  <td style="color: #dc2626; font-size: 18px; font-weight: bold; text-align: right; padding: 15px 10px;">${receivedAmount < expectedAmount ? "-" : "+"}${formattedDiff}</td>
                </tr>
                <tr>
                  <td style="color: #8b857a; font-size: 14px; padding: 10px;">Nội dung CK:</td>
                  <td style="color: #1a1a1a; font-size: 12px; text-align: right; padding: 10px; font-family: monospace;">${transferContent}</td>
                </tr>
                ${bankRef ? `
                <tr>
                  <td style="color: #8b857a; font-size: 14px; padding: 10px;">Mã giao dịch:</td>
                  <td style="color: #1a1a1a; font-size: 12px; text-align: right; padding: 10px; font-family: monospace;">${bankRef}</td>
                </tr>
                ` : ""}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #fef2f2; text-align: center; border: 2px solid #fca5a5;">
              <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: bold;">
                ⚠️ CẦN XỬ LÝ NGAY<br>
                <span style="font-weight: normal; font-size: 13px;">Vui lòng kiểm tra và xác nhận thủ công</span>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; text-align: center;">
              <a href="${adminUrl}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                🔧 Xem Admin Dashboard
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #1a1a1a; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #c9a24d; font-size: 20px; font-weight: bold;">LANG SAKE</p>
              <p style="margin: 0; color: #8b857a; font-size: 12px;">Admin Alert System</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Lang Sake Alert" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `⚠️ [URGENT] Payment Mismatch #${bookingCode}`,
      html: htmlContent,
    });

    console.log("✅ Admin alert email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Admin alert email failed:", error);
    return { success: false, error };
  }
}
