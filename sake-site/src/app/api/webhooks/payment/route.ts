/**
 * Webhook Payment Handler
 * Nhận thông báo từ Casso.vn hoặc Sepay.vn khi có giao dịch chuyển khoản
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { parseTransferContent } from '@/lib/vietqr';

const prisma = new PrismaClient();

/**
 * Xác thực chữ ký webhook từ Casso
 */
function verifyCassoSignature(payload: string, signature: string): boolean {
  const secret = process.env.CASSO_WEBHOOK_SECRET || '';
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return hash === signature;
}

/**
 * Xác thực chữ ký webhook từ Sepay
 */
function verifySepaySignature(payload: string, signature: string): boolean {
  const secret = process.env.SEPAY_WEBHOOK_SECRET || '';
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return hash === signature;
}

/**
 * Interface cho Casso webhook data
 */
interface CassoTransaction {
  id: number;
  when: string;           // Timestamp
  amount: number;         // Số tiền
  description: string;    // Nội dung chuyển khoản
  cusum_balance: number;  // Số dư hiện tại
  tid: string;            // Transaction ID
  subAccId: string;       // Sub account ID
}

/**
 * Interface cho Sepay webhook data
 */
interface SepayTransaction {
  id: string;
  gateway: string;        // "VCB", "TPB"...
  transactionDate: string;
  accountNumber: string;
  transferType: string;   // "in" hoặc "out"
  transferAmount: number;
  accumulated: number;    // Số dư
  content: string;        // Nội dung chuyển khoản
  referenceCode: string;  // Mã tham chiếu
  description: string;
  bankBrandName: string;
  bankAccountId: string;
}

/**
 * POST /api/webhooks/payment
 * Nhận webhook từ Casso hoặc Sepay
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature') || '';
    const provider = request.headers.get('x-provider') || 'casso'; // 'casso' hoặc 'sepay'

    console.log('[Webhook] Received payment webhook', {
      provider,
      hasSignature: !!signature,
      bodyLength: body.length,
    });

    // Xác thực chữ ký
    let isValid = false;
    if (provider === 'casso') {
      isValid = verifyCassoSignature(body, signature);
    } else if (provider === 'sepay') {
      isValid = verifySepaySignature(body, signature);
    }

    if (!isValid && process.env.NODE_ENV === 'production') {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);

    // Xử lý Casso webhook
    if (provider === 'casso') {
      const transactions: CassoTransaction[] = data.data || [data];
      
      for (const tx of transactions) {
        // Chỉ xử lý giao dịch tiền vào (amount > 0)
        if (tx.amount <= 0) continue;
        
        await processTransaction({
          amount: tx.amount,
          description: tx.description,
          bankRef: tx.tid,
          provider: 'casso',
          rawData: tx,
        });
      }
    }
    
    // Xử lý Sepay webhook
    else if (provider === 'sepay') {
      const transactions: SepayTransaction[] = data.transactions || [data];
      
      for (const tx of transactions) {
        // Chỉ xử lý giao dịch tiền vào (transferType = "in")
        if (tx.transferType !== 'in') continue;
        
        await processTransaction({
          amount: tx.transferAmount,
          description: tx.content,
          bankRef: tx.referenceCode,
          provider: 'sepay',
          rawData: tx,
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully' 
    });

  } catch (error: any) {
    console.error('[Webhook] Error processing payment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Xử lý giao dịch - tìm booking và cập nhật trạng thái
 */
async function processTransaction(params: {
  amount: number;
  description: string;
  bankRef: string;
  provider: string;
  rawData: any;
}) {
  const { amount, description, bankRef, provider, rawData } = params;

  console.log('[Webhook] Processing transaction', {
    amount,
    description,
    bankRef,
    provider,
  });

  // Parse nội dung chuyển khoản để lấy booking ID
  const parsed = parseTransferContent(description);
  
  if (!parsed.bookingId) {
    console.log('[Webhook] No booking ID found in description:', description);
    return;
  }

  console.log('[Webhook] Found booking ID:', parsed.bookingId);

  // Tìm booking
  const booking = await prisma.booking.findUnique({
    where: { id: parsed.bookingId },
  });

  if (!booking) {
    console.error('[Webhook] Booking not found:', parsed.bookingId);
    return;
  }

  // Kiểm tra số tiền có khớp với deposit amount không (cho phép sai số ±1%)
  const expectedAmount = booking.depositAmount;
  const tolerance = expectedAmount * 0.01;
  const isAmountValid = Math.abs(amount - expectedAmount) <= tolerance;

  if (!isAmountValid) {
    console.warn('[Webhook] Amount mismatch', {
      expected: expectedAmount,
      received: amount,
      bookingId: booking.id,
    });
    // Vẫn cập nhật nhưng ghi log để admin review
  }

  // Kiểm tra xem đã thanh toán chưa
  if (booking.depositPaid) {
    console.log('[Webhook] Booking already paid:', booking.id);
    return;
  }

  // Cập nhật booking
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      depositPaid: true,
      depositPaidAt: new Date(),
      paymentBankRef: bankRef,
      status: 'CONFIRMED', // Auto-confirm khi đã thanh toán
      internalNotes: `[AUTO] Đã nhận thanh toán qua ${provider}. Ref: ${bankRef}. Amount: ${amount} VND`,
    },
  });

  console.log('[Webhook] Booking updated successfully:', booking.id);

  // TODO: Gửi email/Zalo thông báo cho khách hàng
  // TODO: Gửi thông báo cho F1/F2 nếu có referral code
  // TODO: Tạo commission nếu có referral code
}

/**
 * GET /api/webhooks/payment
 * Test endpoint để kiểm tra webhook có hoạt động không
 */
export async function GET() {
  return NextResponse.json({
    message: 'Payment webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
