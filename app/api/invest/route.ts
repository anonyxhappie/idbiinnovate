import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, fundId, fundName } = body;

    // Simulate an API call to IDBI Sandbox to execute the investment
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return a success response
    return NextResponse.json({
      success: true,
      message: `Successfully invested ₹${amount} in ${fundName}.`,
      transactionId: `INV${Math.floor(Math.random() * 1000000)}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to process investment' }, { status: 500 });
  }
}
