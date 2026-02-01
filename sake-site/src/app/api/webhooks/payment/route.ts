/**
 * Webhook Payment Handler
 * Nhận thông báo từ Casso.vn hoặc Sepay.vn khi có giao dịch chuyển khoản
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { parseTransferContent } from '@/lib/vietqr';
import { sendDepositConfirmationEmail, sendAdminPaymentAlertEmail } from '@/lib/email';

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
    
    console.log('[Webhook] ========== NEW WEBHOOK RECEIVED ==========');
    console.log('[Webhook] Headers:', {
      signature: signature ? 'present' : 'none',
      contentType: request.headers.get('content-type'),
      userAgent: request.headers.get('user-agent'),
    });
    console.log('[Webhook] Body:', body.substring(0, 500));

    const data = JSON.parse(body);
    
    // Auto-detect provider dựa trên payload structure
    let provider = request.headers.get('x-provider') || '';
    if (!provider) {
      if (data.gateway || data.transferAmount !== undefined || data.transactionDate) {
        provider = 'sepay';
      } else if (data.data || data.when) {
        provider = 'casso';
      } else {
        provider = 'unknown';
      }
    }
    
    console.log('[Webhook] Detected provider:', provider);

    // Xác thực chữ ký (nếu có secret)
    let isValid = false;
    const hasSecret = provider === 'casso' 
      ? process.env.CASSO_WEBHOOK_SECRET && process.env.CASSO_WEBHOOK_SECRET.trim() !== ''
      : process.env.SEPAY_WEBHOOK_SECRET && process.env.SEPAY_WEBHOOK_SECRET.trim() !== '';

    if (hasSecret && signature) {
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
      console.log('[Webhook] Signature verified:', isValid);
    } else {
      // Không có secret - bỏ qua verification (dùng cho No_Authen mode)
      console.log('[Webhook] ⚠️ No secret or signature - skipping verification (No_Authen mode)');
      isValid = true;
    }

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
      // Sepay có thể gửi single object hoặc array
      let transactions: SepayTransaction[];
      if (Array.isArray(data)) {
        transactions = data;
      } else if (data.transactions && Array.isArray(data.transactions)) {
        transactions = data.transactions;
      } else if (data.gateway || data.transferAmount !== undefined) {
        // Single transaction object
        transactions = [data];
      } else {
        console.error('[Webhook] Unknown Sepay format:', data);
        transactions = [];
      }
      
      console.log('[Webhook] Processing', transactions.length, 'Sepay transaction(s)');
      
      for (const tx of transactions) {
        console.log('[Webhook] Transaction:', {
          gateway: tx.gateway,
          amount: tx.transferAmount,
          type: tx.transferType,
          content: tx.content,
          code: tx.referenceCode,
        });
        
        // Chỉ xử lý giao dịch tiền vào (transferType = "in")
        if (tx.transferType !== 'in') {
          console.log('[Webhook] Skipping non-incoming transaction');
          continue;
        }
        
        await processTransaction({
          amount: tx.transferAmount,
          description: tx.content,
          bankRef: tx.referenceCode || "",
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

  // LOG TEST PAYMENTS (cho test-payment page)
  if (description.includes('TEST')) {
    const fs = require('fs');
    const path = require('path');
    const logFile = path.join(process.cwd(), 'test-payments.json');
    
    let logs: any[] = [];
    if (fs.existsSync(logFile)) {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
    }
    
    logs.push({
      timestamp: new Date().toISOString(),
      amount,
      transferContent: description,
      bankRef,
      provider,
      rawData,
    });
    
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    console.log('[Webhook] ✅ Test payment logged to test-payments.json');
  }

  // Parse nội dung chuyển khoản để lấy booking ID
  const parsed = parseTransferContent(description);
  
  if (!parsed.bookingId) {
    console.log('[Webhook] No booking ID found in description:', description);
    return;
  }

  console.log('[Webhook] Found booking ID:', parsed.bookingId);

  // Tìm booking - hỗ trợ cả full ID và partial ID (8 ký tự đầu)
  let booking = await prisma.booking.findUnique({
    where: { id: parsed.bookingId },
  });

  // Nếu không tìm thấy bằng full ID, thử tìm bằng partial ID
  if (!booking && parsed.bookingId.length >= 8) {
    const bookings = await prisma.booking.findMany({
      where: {
        id: {
          startsWith: parsed.bookingId.substring(0, 12), // Lấy 12 ký tự đầu
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    
    if (bookings.length > 0) {
      booking = bookings[0];
      console.log('[Webhook] Found booking by partial ID:', booking.id);
    }
  }

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
    
    // Send alert email to admin about mismatch
    if (booking.email) {
      await sendAdminPaymentAlertEmail({
        bookingId: booking.id,
        expectedAmount: expectedAmount,
        receivedAmount: amount,
        transferContent: description,
        bankRef: bankRef,
      }).catch(err => console.error('[Webhook] Failed to send admin alert:', err));
    }
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

  // 🎉 PHASE 6: Send email notification to customer
  if (booking.email) {
    await sendDepositConfirmationEmail({
      bookingId: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.email,
      depositAmount: amount,
      transferContent: description,
      paidAt: new Date(),
    }).catch(err => console.error('[Webhook] Failed to send customer email:', err));
  }

  // TODO: Send Zalo notification
  // TODO: If there's referral code, notify F1/F2 about commission
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
