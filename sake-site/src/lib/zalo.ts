import axios from "axios";

// Zalo OA Configuration
const ZALO_OA_API = "https://openapi.zalo.me/v3.0/oa";
const ZALO_ACCESS_TOKEN = process.env.ZALO_ACCESS_TOKEN; // Get from Zalo OA dashboard

type ZaloMessageData = {
  bookingId: string;
  customerName: string;
  phone: string;
  dateTime: string;
  guests: number;
  comboName: string;
  finalTotal: number;
  depositAmount: number;
};

/**
 * Send booking confirmation via Zalo OA
 * 
 * Setup requirements:
 * 1. Tạo Zalo OA tại: https://oa.zalo.me/
 * 2. Lấy Access Token từ Zalo Developer Console
 * 3. Add phone numbers vào contact list của OA
 * 4. Set ZALO_ACCESS_TOKEN trong .env
 */
export async function sendZaloOABookingConfirmation(data: ZaloMessageData) {
  if (!ZALO_ACCESS_TOKEN) {
    console.warn("⚠️ ZALO_ACCESS_TOKEN not configured");
    return { success: false, error: "Zalo OA not configured" };
  }

  const {
    bookingId,
    customerName,
    phone,
    dateTime,
    guests,
    comboName,
    finalTotal,
    depositAmount,
  } = data;

  const bookingCode = bookingId.substring(0, 8).toUpperCase();
  const formattedDateTime = new Date(dateTime).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedTotal = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(finalTotal);
  const lookupUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://langsake.vn"}/booking/lookup?id=${bookingId}`;

  // Zalo OA Text Message
  const message = `🎉 ĐẶT BÀN THÀNH CÔNG - LANG SAKE

📋 MÃ ĐẶT BÀN: ${bookingCode}
(Vui lòng lưu mã này)

👤 Khách hàng: ${customerName}
📞 SĐT: ${phone}

🍶 Chi tiết:
⏰ Thời gian: ${formattedDateTime}
🎯 Combo: ${comboName}
👥 Số khách: ${guests} người
💰 Tổng tiền: ${formattedTotal}${depositAmount > 0 ? `\n💳 Đã cọc: ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(depositAmount)}` : ''}

📌 LƯU Ý:
✓ Mang mã ${bookingCode} khi đến
✓ Chúng tôi sẽ gọi xác nhận trong 24h
${depositAmount > 0 ? '✓ Vui lòng thanh toán cọc để giữ chỗ' : '✓ Thanh toán tại quán'}

🔍 Tra cứu: ${lookupUrl}

Cảm ơn quý khách! 🙏`;

  try {
    // Method 1: Send text message
    const response = await axios.post(
      `${ZALO_OA_API}/message`,
      {
        recipient: {
          phone_number: phone, // hoặc user_id nếu đã có
        },
        message: {
          text: message,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          access_token: ZALO_ACCESS_TOKEN,
        },
      }
    );

    if (response.data.error === 0) {
      console.log("✅ Zalo OA message sent successfully");
      return { success: true, data: response.data };
    } else {
      console.error("❌ Zalo OA send failed:", response.data);
      return { success: false, error: response.data };
    }
  } catch (error: any) {
    console.error("❌ Zalo OA request failed:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Send Zalo OA Template Message (requires template approval)
 * Template must be pre-approved in Zalo OA dashboard
 */
export async function sendZaloOATemplateMessage(
  phone: string,
  templateId: string,
  templateData: Record<string, string>
) {
  if (!ZALO_ACCESS_TOKEN) {
    return { success: false, error: "Zalo OA not configured" };
  }

  try {
    const response = await axios.post(
      `${ZALO_OA_API}/message/template`,
      {
        recipient: {
          phone_number: phone,
        },
        template_id: templateId,
        template_data: templateData,
      },
      {
        headers: {
          "Content-Type": "application/json",
          access_token: ZALO_ACCESS_TOKEN,
        },
      }
    );

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("❌ Zalo template send failed:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

/**
 * Get Zalo OA follower info
 */
export async function getZaloFollowerInfo(userId: string) {
  if (!ZALO_ACCESS_TOKEN) {
    return null;
  }

  try {
    const response = await axios.get(`${ZALO_OA_API}/getprofile`, {
      params: { data: JSON.stringify({ user_id: userId }) },
      headers: { access_token: ZALO_ACCESS_TOKEN },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to get Zalo follower info:", error);
    return null;
  }
}
