/**
 * Test script để gửi fake webhook từ Sepay
 * Dùng để test webhook handler
 */

const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/payment';

// Fake Sepay transaction data
const testTransaction = {
  id: "12345678",
  gateway: "TPB", // TPBank
  transactionDate: new Date().toISOString(),
  accountNumber: "34522229999",
  transferType: "in",
  transferAmount: 150000, // 150,000 VND (10% của 1,500,000)
  accumulated: 5000000,
  content: "LANGSAKE B123 WEB", // Booking ID 123, source WEB
  referenceCode: "FT123456789",
  description: "LANGSAKE B123 WEB",
  bankBrandName: "TPBank",
  bankAccountId: "TPB123"
};

async function testWebhook() {
  console.log('🧪 Testing Sepay webhook...\n');
  console.log('📦 Sending transaction:');
  console.log(JSON.stringify(testTransaction, null, 2));
  console.log('\n');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-provider': 'sepay', // QUAN TRỌNG: phải có header này
      },
      body: JSON.stringify(testTransaction),
    });

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    console.log('📄 Response body:');
    console.log(JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ Webhook test SUCCESSFUL!');
    } else {
      console.log('\n❌ Webhook test FAILED!');
    }
  } catch (error) {
    console.error('\n❌ Error testing webhook:', error.message);
  }
}

testWebhook();
