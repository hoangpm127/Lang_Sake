const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBooking() {
  const bookingId = 'cml0z4qfo0005ufkw4ft5w9dq';
  const booking = await prisma.booking.findUnique({ 
    where: { id: bookingId } 
  });
  
  console.log('\n=== BOOKING INFO ===');
  console.log('ID:', booking.id);
  console.log('Customer:', booking.customerName);
  console.log('Status:', booking.status);
  console.log('Payment Status:', booking.paymentStatus);
  console.log('Deposit Amount:', booking.depositAmount);
  console.log('Payment Date:', booking.paymentDate);
  console.log('Created:', booking.createdAt);
  
  await prisma.$disconnect();
}

checkBooking();
