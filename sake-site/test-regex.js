// Test parse transfer content
function parseTransferContent(content) {
  const regex = /LANGSAKE\s+B(\w+)\s*(\w*)/i;
  const match = content.match(regex);
  
  if (!match) {
    console.log('❌ No match');
    return {};
  }
  
  console.log('✅ Match found:');
  console.log('  Full match:', match[0]);
  console.log('  Booking ID:', match[1]);
  console.log('  Source:', match[2] || 'WEB');
  
  return {
    bookingId: match[1],
    source: match[2] || 'WEB',
  };
}

// Test cases
console.log('\n=== TEST 1: Có khoảng trắng ===');
parseTransferContent('LANGSAKE B cml0zrd12000 WEB');

console.log('\n=== TEST 2: Không có khoảng trắng ===');
parseTransferContent('LANGSAKE Bcml0zrd12000 WEB');

console.log('\n=== TEST 3: Format từ Sepay screenshot ===');
parseTransferContent('LANGSAKE Bcml0ztew WEB');
