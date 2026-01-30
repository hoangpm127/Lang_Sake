import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Xóa dữ liệu cũ
  await prisma.commission.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedPartnerPassword = await bcrypt.hash("partner123", 10);
  const hashedMemberPassword = await bcrypt.hash("member123", 10);
  const hashedCustomerPassword = await bcrypt.hash("customer123", 10);

  // 1. Tạo Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@langsake.vn",
      phone: "0901234567",
      password: hashedAdminPassword,
      name: "Admin Lang Sake",
      role: "ADMIN",
    },
  });
  console.log("✅ Created Admin:", admin.email);

  // 2. Tạo F1 Partners
  const f1Partner1 = await prisma.user.create({
    data: {
      email: "partner1@company.com",
      phone: "0912345678",
      password: hashedPartnerPassword,
      name: "Công ty ABC",
      role: "F1_PARTNER",
      referralCode: "PARTNER001",
      commissionRate: 10, // 10% hoa hồng
      isActive: true,
    },
  });

  const f1Partner2 = await prisma.user.create({
    data: {
      email: "partner2@company.com",
      phone: "0923456789",
      password: hashedPartnerPassword,
      name: "Công ty XYZ",
      role: "F1_PARTNER",
      referralCode: "PARTNER002",
      commissionRate: 15, // 15% hoa hồng
      isActive: true,
    },
  });
  console.log("✅ Created F1 Partners:", f1Partner1.name, f1Partner2.name);

  // 3. Tạo F2 Members
  const f2Member1 = await prisma.user.create({
    data: {
      email: "member1@gmail.com",
      phone: "0934567890",
      password: hashedMemberPassword,
      name: "Nguyễn Văn A",
      role: "F2_MEMBER",
      referralCode: "MEMBER001",
      discountRate: 10, // 10% discount
      membershipLevel: "GOLD",
      referredById: f1Partner1.id, // Được giới thiệu bởi Partner1
      isActive: true,
    },
  });

  const f2Member2 = await prisma.user.create({
    data: {
      email: "member2@gmail.com",
      phone: "0945678901",
      password: hashedMemberPassword,
      name: "Trần Thị B",
      role: "F2_MEMBER",
      referralCode: "MEMBER002",
      discountRate: 15, // 15% discount
      membershipLevel: "VIP",
      referredById: f1Partner2.id,
      isActive: true,
    },
  });
  console.log("✅ Created F2 Members:", f2Member1.name, f2Member2.name);

  // 4. Tạo Customers
  const customer1 = await prisma.user.create({
    data: {
      email: "customer1@gmail.com",
      phone: "0956789012",
      password: hashedCustomerPassword,
      name: "Lê Văn C",
      role: "CUSTOMER",
    },
  });
  console.log("✅ Created Customer:", customer1.name);

  // 5. Tạo Bookings mẫu

  // Booking 1: F1 tạo cho khách của mình
  const booking1 = await prisma.booking.create({
    data: {
      customerName: "Khách hàng của Partner 1",
      phone: "0967890123",
      email: "client@company.com",
      dateTime: new Date("2026-02-01T19:00:00"),
      guests: 6,
      comboName: "Premium Sake Tasting",
      comboPrice: 2000000,
      subtotal: 2000000,
      discount: 0,
      finalTotal: 2000000,
      hasDeposit: true,
      depositAmount: 500000,
      depositPaid: true,
      source: "F1_CREATE",
      status: "CONFIRMED",
      createdById: f1Partner1.id,
      referralCode: f1Partner1.referralCode,
    },
  });

  // Tính hoa hồng cho F1
  await prisma.commission.create({
    data: {
      partnerId: f1Partner1.id,
      bookingId: booking1.id,
      amount: booking1.finalTotal * (f1Partner1.commissionRate! / 100),
      rate: f1Partner1.commissionRate!,
      isPaid: false,
    },
  });

  // Booking 2: F2 tự đặt cho mình
  const booking2 = await prisma.booking.create({
    data: {
      customerId: f2Member1.id,
      customerName: f2Member1.name,
      phone: f2Member1.phone!,
      email: f2Member1.email,
      dateTime: new Date("2026-02-05T20:00:00"),
      guests: 4,
      comboName: "Sake & Sushi Combo",
      comboPrice: 1500000,
      subtotal: 1500000,
      discount: 150000, // 10% discount
      discountReason: "F2_MEMBER",
      finalTotal: 1350000,
      hasDeposit: true,
      depositAmount: 300000,
      source: "F2_SELF",
      status: "PENDING",
      referralCode: f2Member1.referralCode,
    },
  });

  // Booking 3: Khách đặt trực tiếp trên web
  const booking3 = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      customerName: customer1.name,
      phone: customer1.phone!,
      email: customer1.email,
      dateTime: new Date("2026-02-10T18:30:00"),
      guests: 2,
      comboName: "Romantic Dinner",
      comboPrice: 1200000,
      subtotal: 1200000,
      discount: 0,
      finalTotal: 1200000,
      source: "WEB_DIRECT",
      status: "PENDING",
    },
  });

  // Booking 4: Admin tạo cho khách walk-in
  const booking4 = await prisma.booking.create({
    data: {
      customerName: "Khách vãng lai",
      phone: "0978901234",
      dateTime: new Date("2026-02-15T19:30:00"),
      guests: 8,
      comboName: "Group Party",
      comboPrice: 3000000,
      subtotal: 3000000,
      discount: 0,
      finalTotal: 3000000,
      hasDeposit: true,
      depositAmount: 1000000,
      depositPaid: true,
      source: "ADMIN_CREATE",
      status: "CONFIRMED",
      createdById: admin.id,
      internalNotes: "Khách quen, đã đặt nhiều lần",
    },
  });

  console.log("✅ Created Bookings:", booking1.id, booking2.id, booking3.id, booking4.id);

  // Update total commission cho F1
  await prisma.user.update({
    where: { id: f1Partner1.id },
    data: {
      totalCommission: booking1.finalTotal * (f1Partner1.commissionRate! / 100),
    },
  });

  console.log("🎉 Seeding completed!");
  console.log("\n📊 Summary:");
  console.log("- 1 Admin");
  console.log("- 2 F1 Partners (có mã giới thiệu & hoa hồng)");
  console.log("- 2 F2 Members (có discount)");
  console.log("- 1 Customer");
  console.log("- 4 Bookings (từ nhiều nguồn khác nhau)");
  console.log("- 1 Commission record");
  console.log("\n🔐 Login credentials:");
  console.log("Admin: admin@langsake.vn / admin123");
  console.log("F1: partner1@company.com / partner123");
  console.log("F2: member1@gmail.com / member123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
