// Test webhook endpoint trực tiếp với payload giả
const testPayload = {
  "gateway": "Vietinbank",
  "transactionDate": "2026-01-30 21:43:33",
  "accountNumber": "34522229999",
  "subAccount": null,
  "transferType": "in",
  "transferAmount": 133200,
  "accumulated": 610596,
  "code": "068V602260302462",
  "content": "LANGSAKE Bcml0ztew WEB",
  "description": "Pay > Hook 1 > 068V602260302462"
};

fetch('http://localhost:3000/api/webhooks/payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload)
})
.then(res => res.json())
.then(data => {
  console.log('\n✅ Webhook Response:', data);
})
.catch(err => {
  console.error('\n❌ Error:', err.message);
});
