'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function TestPaymentPage() {
  const [amount, setAmount] = useState(10000);
  const [testId, setTestId] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [transferContent, setTransferContent] = useState('');
  const [status, setStatus] = useState<'waiting' | 'checking' | 'success' | 'failed'>('waiting');
  const [logs, setLogs] = useState<string[]>([]);

  // Generate test ID
  const generateTestId = () => {
    const id = Math.random().toString(36).substring(2, 10).toLowerCase();
    setTestId(id);
    const content = `LANGSAKE B${id} TEST`;
    setTransferContent(content);
    
    // Generate VietQR
    const bankId = '970423'; // TPBank
    const accountNo = '34522229999';
    const template = 'compact2';
    const qr = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=MAI%20VIET%20HOANG`;
    setQrUrl(qr);
    setStatus('checking');
    setLogs([`[${new Date().toLocaleTimeString()}] QR code generated with ID: ${id}`]);
  };

  // Check payment status
  useEffect(() => {
    if (status !== 'checking' || !testId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/test-payment/check?id=${testId}`);
        const data = await response.json();
        
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Checking... ${data.found ? 'FOUND!' : 'Not yet'}`]);
        
        if (data.found) {
          setStatus('success');
          setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Payment received!`, JSON.stringify(data.transaction, null, 2)]);
          clearInterval(interval);
        }
      } catch (error) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${error}`]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status, testId]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Test Payment Webhook</h1>
        
        {/* Configuration */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Cấu hình test</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Số tiền (VNĐ)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded"
                disabled={status === 'checking'}
              />
            </div>
            
            <button
              onClick={generateTestId}
              disabled={status === 'checking'}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {status === 'checking' ? 'Đang chờ thanh toán...' : 'Tạo QR Code Test'}
            </button>
          </div>
        </div>

        {/* QR Code */}
        {qrUrl && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">QR Code thanh toán</h2>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-64 h-64">
                <Image
                  src={qrUrl}
                  alt="Payment QR"
                  fill
                  className="object-contain"
                />
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Nội dung chuyển khoản:</p>
                <div className="bg-gray-100 px-4 py-2 rounded font-mono text-sm">
                  {transferContent}
                </div>
                <p className="text-xs text-gray-500 mt-2">Test ID: {testId}</p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(transferContent);
                  setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Copied to clipboard`]);
                }}
                className="text-blue-600 hover:underline text-sm"
              >
                📋 Copy nội dung CK
              </button>
            </div>
          </div>
        )}

        {/* Status */}
        {status !== 'waiting' && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Trạng thái</h2>
            
            <div className={`text-center py-4 rounded-lg ${
              status === 'checking' ? 'bg-yellow-50 text-yellow-800' :
              status === 'success' ? 'bg-green-50 text-green-800' :
              'bg-red-50 text-red-800'
            }`}>
              {status === 'checking' && '🔄 Đang chờ webhook...'}
              {status === 'success' && '✅ Nhận được thanh toán!'}
              {status === 'failed' && '❌ Timeout'}
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg shadow font-mono text-sm">
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">Chưa có log...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-6 rounded-lg shadow mt-6">
          <h3 className="font-semibold mb-2">📋 Hướng dẫn:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Nhập số tiền (mặc định 10,000 VNĐ)</li>
            <li>Click "Tạo QR Code Test"</li>
            <li>Quét QR hoặc chuyển khoản thủ công với nội dung chính xác</li>
            <li>Đợi webhook từ Sepay (10-30 giây)</li>
            <li>Trang sẽ tự động cập nhật khi nhận được thanh toán</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
