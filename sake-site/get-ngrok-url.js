const http = require('http');

http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const httpsTunnel = json.tunnels.find(t => t.proto === 'https');
      
      if (httpsTunnel) {
        const url = httpsTunnel.public_url;
        const webhookUrl = `${url}/api/webhooks/payment`;
        
        console.log('\n✅ NGROK ĐANG CHẠY THÀNH CÔNG!\n');
        console.log('📌 Public URL:', url);
        console.log('📌 Webhook URL:', webhookUrl);
        console.log('\n📝 CẬP NHẬT WEBHOOK TRONG SEPAY:');
        console.log('1. Vào: https://my.sepay.vn/userv2/settings/webhook');
        console.log('2. Chỉnh sửa webhook ID 23252');
        console.log('3. Dán URL:', webhookUrl);
        console.log('4. Lưu lại\n');
      } else {
        console.log('❌ Không tìm thấy HTTPS tunnel');
      }
    } catch (e) {
      console.log('❌ Lỗi:', e.message);
    }
  });
}).on('error', (e) => {
  console.log('❌ Ngrok chưa khởi động hoàn toàn. Đợi vài giây và thử lại.');
});
