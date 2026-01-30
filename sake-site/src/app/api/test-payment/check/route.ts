import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TEST_LOG_FILE = path.join(process.cwd(), 'test-payments.json');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('id');

    if (!testId) {
      return NextResponse.json({ error: 'Missing test ID' }, { status: 400 });
    }

    // Read test payments log
    let payments: any[] = [];
    if (fs.existsSync(TEST_LOG_FILE)) {
      const content = fs.readFileSync(TEST_LOG_FILE, 'utf-8');
      payments = JSON.parse(content);
    }

    // Find payment with this test ID
    const payment = payments.find((p: any) => 
      p.transferContent?.includes(testId.toUpperCase()) || 
      p.transferContent?.includes(testId.toLowerCase()) ||
      p.transferContent?.includes(`B${testId}`)
    );

    if (payment) {
      return NextResponse.json({ 
        found: true, 
        transaction: payment 
      });
    }

    return NextResponse.json({ 
      found: false,
      message: 'Payment not received yet'
    });

  } catch (error) {
    console.error('[Test Payment Check] Error:', error);
    return NextResponse.json({ 
      found: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
