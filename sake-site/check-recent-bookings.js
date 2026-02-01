const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentBookings() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      id: true,
      customerName: true,
      status: true,
      depositPaid: true,
      depositPaidAt: true,
      depositAmount: true,
      hasDeposit: true,
      paymentBankRef: true,
      createdAt: true
    }
  });
  
  console.log('\n=== 3 BOOKING GẦN NHẤT ===\n');
  bookings.forEach((b, i) => {
    console.log(`[${i + 1}] ID: ${b.id.substring(0, 12)}...`);
    console.log(`    Khách: ${b.customerName}`);
    console.log(`    Status: ${b.status}`);
    console.log(`    Has Deposit: ${b.hasDeposit ? 'YES' : 'NO'}`);
    console.log(`    Deposit Paid: ${b.depositPaid ? '✅ YES' : '❌ NO'}`);
    console.log(`    Deposit Amount: ${b.depositAmount || 0} VND`);
    console.log(`    Bank Ref: ${b.paymentBankRef || 'N/A'}`);
    console.log(`    Created: ${b.createdAt.toLocaleString('vi-VN')}`);
    if (b.depositPaidAt) {
      console.log(`    Paid At: ${b.depositPaidAt.toLocaleString('vi-VN')}`);
    }
    console.log('');
  });
  
  await prisma.$disconnect();
}

checkRecentBookings();
