// app/api/payment/accounts/route.js
import { NextResponse } from 'next/server';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.chinakroy.com').replace(/\/+$/, '');

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Make request to Django backend
    const response = await fetch(`${API_BASE_URL}/api/payment/accounts/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        accounts: data || [],
      });
    } else {
      const errorText = await response.text();
      console.error('Django API error:', response.status, errorText);
      
      // Return empty accounts if backend is unavailable
      return NextResponse.json({
        success: false,
        accounts: [],
        error: 'Backend service unavailable',
      }, { status: response.status });
    }

  } catch (error) {
    console.error('Payment accounts API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        accounts: [],
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
