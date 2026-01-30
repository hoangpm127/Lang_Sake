// Test Phase 4: 2-Tier Commission System
// Run: node test-phase4.js

const testF2Booking = async () => {
  console.log('\n🧪 TEST 1: F2 Self-Booking (Should create 2 commissions)\n');
  
  // 1. Login as F2
  console.log('📝 Step 1: Login as F2 (member1@gmail.com)');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'member1@gmail.com',
      password: 'member123',
      portal: 'F2_MEMBER'
    })
  });
  
  const loginData = await loginRes.json();
  console.log('Login:', loginData.ok ? '✅ Success' : '❌ Failed');
  
  if (!loginData.ok) {
    console.log('Error:', loginData.message);
    return;
  }
  
  // Get cookies
  const cookies = loginRes.headers.get('set-cookie') || '';
  
  // 2. Create booking
  console.log('\n📝 Step 2: Create booking');
  const bookingRes = await fetch('http://localhost:3000/api/bookings', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      customerName: 'TEST - Nguyễn Văn A',
      phone: '0909999999',
      email: 'test@test.com',
      dateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      guests: 4,
      comboName: 'Combo Gia Đình',
      comboPrice: 2400000,
      hasDeposit: false,
      referralCode: '',
      notes: 'TEST Phase 4 - F2 Self Booking'
    })
  });
  
  const bookingData = await bookingRes.json();
  console.log('Booking:', bookingData.ok ? '✅ Created' : '❌ Failed');
  
  if (!bookingData.ok) {
    console.log('Error:', bookingData.message);
    return;
  }
  
  const bookingId = bookingData.booking.id;
  console.log('Booking ID:', bookingId);
  console.log('Total:', bookingData.booking.finalTotal, 'VND');
  
  // 3. Wait a bit for commissions to be created
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 4. Check commissions (need to query database directly or use admin API)
  console.log('\n📝 Step 3: Check commissions in database');
  console.log('👉 Open Prisma Studio at http://localhost:5555');
  console.log('👉 Or check Admin Commission Dashboard');
  console.log('\n✅ Expected Results:');
  console.log('   - Commission 1: F2 (member1@gmail.com) - 240,000 VND (10%) - Tier 1');
  console.log('   - Commission 2: F1 (partner1@company.com) - 120,000 VND (5%) - Tier 2');
  console.log('   - TOTAL: 360,000 VND (15%)');
  
  return bookingId;
};

const testF1Booking = async () => {
  console.log('\n\n🧪 TEST 2: F1 Create Booking (Should create 1 commission)\n');
  
  // 1. Login as F1
  console.log('📝 Step 1: Login as F1 (partner1@company.com)');
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'partner1@company.com',
      password: 'partner123',
      portal: 'F1_PARTNER'
    })
  });
  
  const loginData = await loginRes.json();
  console.log('Login:', loginData.ok ? '✅ Success' : '❌ Failed');
  
  if (!loginData.ok) {
    console.log('Error:', loginData.message);
    return;
  }
  
  const cookies = loginRes.headers.get('set-cookie') || '';
  
  // 2. Create booking
  console.log('\n📝 Step 2: Create booking for customer');
  const bookingRes = await fetch('http://localhost:3000/api/bookings', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      customerName: 'TEST - Trần Thị B',
      phone: '0908888888',
      email: 'customer@test.com',
      dateTime: new Date(Date.now() + 172800000).toISOString(), // 2 days later
      guests: 2,
      comboName: 'Combo Cặp Đôi',
      comboPrice: 666000,
      hasDeposit: false,
      referralCode: '',
      notes: 'TEST Phase 4 - F1 Create Booking',
      isF1Creating: true
    })
  });
  
  const bookingData = await bookingRes.json();
  console.log('Booking:', bookingData.ok ? '✅ Created' : '❌ Failed');
  
  if (!bookingData.ok) {
    console.log('Error:', bookingData.message);
    return;
  }
  
  const bookingId = bookingData.booking.id;
  console.log('Booking ID:', bookingId);
  console.log('Total:', bookingData.booking.finalTotal, 'VND');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\n✅ Expected Results:');
  console.log('   - Commission 1: F1 (partner1@company.com) - 66,600 VND (10%) - Tier 1');
  console.log('   - No Tier 2 commission (F1 is top level)');
  
  return bookingId;
};

// Run tests
(async () => {
  console.log('🚀 Starting Phase 4 Tests...\n');
  console.log('Make sure dev server is running at http://localhost:3000');
  console.log('Make sure Prisma Studio is running at http://localhost:5555\n');
  
  try {
    const booking1 = await testF2Booking();
    const booking2 = await testF1Booking();
    
    console.log('\n\n📊 VERIFICATION STEPS:');
    console.log('\n1. Open Prisma Studio: http://localhost:5555');
    console.log('2. Go to Commission table');
    console.log('3. Filter by bookingId:');
    console.log(`   - ${booking1} (should have 2 rows: tier 1 + tier 2)`);
    console.log(`   - ${booking2} (should have 1 row: tier 1 only)`);
    console.log('\n4. Or login as Admin and check: http://localhost:3000/dashboard/admin/commissions');
    console.log('   - Should see commission rows with blue and purple tier badges\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
})();
