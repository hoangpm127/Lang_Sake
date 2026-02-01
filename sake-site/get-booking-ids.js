// Lấy booking ID đầy đủ
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getBookingIds() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, customerName: true, createdAt: true }
  });
  
  console.log('\n=== BOOKING IDS ===\n');
  bookings.forEach((b, i) => {
    console.log(`[${i + 1}] ${b.id}`);
    console.log(`    Khách: ${b.customerName}`);
    console.log(`    Created: ${b.createdAt.toLocaleString('vi-VN')}\n`);
  });
  
  await prisma.$disconnect();
}

getBookingIds();
