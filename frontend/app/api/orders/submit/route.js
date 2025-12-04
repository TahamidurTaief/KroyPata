// app/api/orders/submit/route.js
import { NextResponse } from 'next/server';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.chinakroy.com').replace(/\/+$/, '');

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();

    // Make request to Django backend
    const response = await fetch(`${API_BASE_URL}/api/orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        order: data,
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: data.error || 'Failed to submit order',
          details: data
        },
        { status: response.status }
      );
    }

  } catch (error) {
    console.error('Order submission API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
