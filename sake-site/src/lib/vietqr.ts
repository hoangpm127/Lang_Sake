/**
 * VietQR Generator - Tạo mã QR thanh toán ngân hàng Việt Nam
 * Sử dụng chuẩn VietQR (Ngân hàng Nhà nước Việt Nam)
 */

// Danh sách mã BIN của các ngân hàng Việt Nam
export const BANK_BINS: { [key: string]: string } = {
  'VCB': '970436', // Vietcombank
  'TCB': '970407', // Techcombank
  'VPB': '970432', // VPBank
  'TPB': '970423', // TPBank
  'MB': '970422',  // MB Bank
  'ACB': '970416', // ACB
  'BIDV': '970418', // BIDV
  'VIB': '970441', // VIB
  'SHB': '970443', // SHB
  'Agribank': '970405', // Agribank
  'SCB': '970429', // SCB
  'Sacombank': '970403', // Sacombank
};

export interface VietQRConfig {
  bankBin: string;        // Mã BIN ngân hàng (6 số)
  accountNumber: string;  // Số tài khoản
  accountName: string;    // Tên chủ tài khoản
  amount: number;         // Số tiền (VND)
  description: string;    // Nội dung chuyển khoản
  template?: string;      // Template (mặc định: 'compact')
}

/**
 * Tạo URL QR code sử dụng API VietQR (img.vietqr.io)
 */
export function generateVietQR(config: VietQRConfig): string {
  const {
    bankBin,
    accountNumber,
    accountName,
    amount,
    description,
    template = 'compact'
  } = config;

  // URL API của VietQR
  // Format: https://img.vietqr.io/image/{BANK_BIN}-{ACCOUNT_NO}-{TEMPLATE}.png
  //         ?amount={AMOUNT}&addInfo={DESCRIPTION}&accountName={ACCOUNT_NAME}
  
  const baseUrl = 'https://img.vietqr.io/image';
  const imageUrl = `${baseUrl}/${bankBin}-${accountNumber}-${template}.png`;
  
  const params = new URLSearchParams({
    amount: amount.toString(),
    addInfo: description,
    accountName: accountName,
  });

  return `${imageUrl}?${params.toString()}`;
}

/**
 * Tạo nội dung chuyển khoản để tracking
 * Format: LANGSAKE B{bookingId} {source}
 * VD: LANGSAKE B123 WEB hoặc LANGSAKE B456 F2ABC
 */
export function generateTransferContent(bookingId: string, source?: string): string {
  const sourceCode = source || 'WEB';
  return `LANGSAKE B${bookingId} ${sourceCode}`;
}

/**
 * Parse nội dung chuyển khoản để lấy booking ID
 */
export function parseTransferContent(content: string): { bookingId?: string; source?: string } {
  // Regex: LANGSAKE B{bookingId} {source}
  const regex = /LANGSAKE\s+B(\w+)\s*(\w*)/i;
  const match = content.match(regex);
  
  if (!match) {
    return {};
  }
  
  return {
    bookingId: match[1],
    source: match[2] || 'WEB',
  };
}

/**
 * Tạo QR code cho booking với deposit 10%
 */
export function generateBookingQRCode(
  bookingId: string,
  totalAmount: number,
  source?: string
): string {
  const bankBin = process.env.BANK_BIN || '970436'; // Default: Vietcombank
  const accountNumber = process.env.BANK_ACCOUNT_NUMBER || '';
  const accountName = process.env.BANK_ACCOUNT_NAME || 'LANG SAKE';
  
  const depositAmount = Math.round(totalAmount * 0.1); // 10%
  const transferContent = generateTransferContent(bookingId, source);
  
  return generateVietQR({
    bankBin,
    accountNumber,
    accountName,
    amount: depositAmount,
    description: transferContent,
    template: 'compact',
  });
}
