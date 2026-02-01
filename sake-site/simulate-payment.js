// Test manual để cập nhật booking như webhook đã nhận
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulateWebhookPayment() {
  // Lấy booking PENDING mới nhất có deposit
  const booking = await prisma.booking.findFirst({
    where: {
      status: 'PENDING',
      hasDeposit: true,
      depositPaid: false
    },
    orderBy: { createdAt: 'desc' }
  });
  
  if (!booking) {
    console.log('❌ Không tìm thấy booking nào cần thanh toán');
    return;
  }
  
  console.log(`\n📝 Tìm thấy booking: ${booking.id.substring(0, 12)}...`);
  console.log(`   Khách hàng: ${booking.customerName}`);
  console.log(`   Số tiền cọc: ${booking.depositAmount} VND`);
  
  // Giả lập webhook đã nhận và cập nhật
  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      depositPaid: true,
      depositPaidAt: new Date(),
      paymentBankRef: 'MANUAL_TEST_' + Date.now(),
      status: 'CONFIRMED' // Tự động confirm luôn
    }
  });
  
  console.log('\n✅ ĐÃ CẬP NHẬT THANH TOÁN THÀNH CÔNG!');
  console.log(`   Booking ID: ${updated.id}`);
  console.log(`   Status: ${updated.status}`);
  console.log(`   Deposit Paid: ${updated.depositPaid ? 'YES' : 'NO'}`);
  console.log(`   Paid At: ${updated.depositPaidAt?.toLocaleString('vi-VN')}`);
  console.log(`   Bank Ref: ${updated.paymentBankRef}`);
  console.log('\n💡 Bây giờ refresh lại trang booking để thấy thay đổi!\n');
  
  await prisma.$disconnect();
}

simulateWebhookPayment();
