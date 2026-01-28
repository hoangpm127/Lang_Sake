const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateBookingSources() {
  try {
    // Update all ADMIN_CREATE to WEB_DIRECT
    const result1 = await prisma.$executeRaw`
      UPDATE Booking 
      SET source = 'WEB_DIRECT' 
      WHERE source = 'ADMIN_CREATE';
    `;

    // Update all F1_CREATE to WEB_DIRECT
    const result2 = await prisma.$executeRaw`
      UPDATE Booking 
      SET source = 'WEB_DIRECT' 
      WHERE source = 'F1_CREATE';
    `;

    console.log(`✅ Updated ${result1} ADMIN_CREATE bookings to WEB_DIRECT`);
    console.log(`✅ Updated ${result2} F1_CREATE bookings to WEB_DIRECT`);
    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Error updating bookings:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBookingSources();
