/**
 * Test Sepay API
 * Kiểm tra kết nối và lấy danh sách tài khoản ngân hàng
 */

const SEPAY_API_KEY = 'VPXRNYIGPRKBUJ9G0QPAW8CTQ4FOX4OV1S8SBTKTMKQV7XW5CW3UM2YL6AKNPHLI';
const SEPAY_BASE_URL = 'https://my.sepay.vn/userapi';

async function testSepayAPI() {
  console.log('🔍 Testing Sepay API...\n');

  try {
    // Test với nhiều endpoint khác nhau
    const endpoints = [
      { name: 'Banks (v1)', url: `${SEPAY_BASE_URL}/banks` },
      { name: 'Banks (v2)', url: `https://my.sepay.vn/userapi/v2/banks` },
      { name: 'User Info', url: `${SEPAY_BASE_URL}/user` },
      { name: 'Balance', url: `${SEPAY_BASE_URL}/balance` },
      { name: 'Account', url: `https://my.sepay.vn/userapi/account` },
    ];

    for (const endpoint of endpoints) {
      console.log(`\n📡 Testing: ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);
      
      try {
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SEPAY_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('   ✅ Response:', JSON.stringify(data, null, 2));
          
          // Nếu tìm thấy endpoint hoạt động, dừng lại
          if (data && (data.status === 200 || data.status === 'success' || data.data)) {
            console.log('\n🎉 Tìm thấy endpoint hoạt động!');
            return data;
          }
        } else {
          const errorText = await response.text();
          console.log(`   ❌ Error: ${errorText.substring(0, 200)}`);
        }
      } catch (err) {
        console.log(`   ❌ Failed: ${err.message}`);
      }
    }

    console.log('\n\n💡 Thử test với cURL trực tiếp:');
    console.log(`\ncurl -X GET "https://my.sepay.vn/userapi/banks" \\`);
    console.log(`  -H "Authorization: Bearer ${SEPAY_API_KEY}" \\`);
    console.log(`  -H "Content-Type: application/json"`);

  } catch (error) {
    console.error('\n❌ Lỗi khi test API:');
    console.error(error.message);
  }
}

// Chạy test
console.log('═══════════════════════════════════════════');
console.log('   🧪 SEPAY API TEST');
console.log('═══════════════════════════════════════════\n');

testSepayAPI().then(() => {
  console.log('\n═══════════════════════════════════════════');
  console.log('   ✨ Test hoàn tất!');
  console.log('═══════════════════════════════════════════\n');
});
