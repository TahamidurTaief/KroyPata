// app/api/coupons/route.js
import { NextResponse } from 'next/server';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.icommerce.passmcq.com').replace(/\/+$/, '');

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false'; // Default to true
    
    // Make request to Django backend
    const response = await fetch(`${API_BASE_URL}/api/coupons/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      // Backend should return active coupons by default, but filter if needed
      let coupons = Array.isArray(data) ? data : data?.results || [];
      
      if (activeOnly) {
        const now = new Date();
        coupons = coupons.filter(coupon => {
          // Filter active coupons
          return coupon.is_active && 
                 (!coupon.valid_from || new Date(coupon.valid_from) <= now) &&
                 (!coupon.valid_until || new Date(coupon.valid_until) >= now);
        });
      }

      return NextResponse.json({
        success: true,
        coupons: coupons.map(coupon => ({
          id: coupon.id,
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          minimum_amount: coupon.minimum_amount || 0,
          min_quantity_required: coupon.min_quantity_required || 0,
          user_specific: coupon.user_specific || false,
          first_time_user_only: coupon.first_time_user_only || false,
          description: coupon.description,
          valid_from: coupon.valid_from,
          valid_until: coupon.valid_until,
          usage_limit: coupon.usage_limit,
          times_used: coupon.times_used || 0,
          is_active: coupon.is_active
        })),
        count: coupons.length
      });
    } else {
      const errorText = await response.text();
      console.error('Django API error:', response.status, errorText);
      
      // Return fallback coupons if backend is unavailable
      return NextResponse.json({
        success: false,
        fallback: true,
        coupons: [
          {
            id: 'fallback-1',
            code: 'SAVE10',
            discount_type: 'percentage',
            discount_value: 10,
            minimum_amount: 0,
            description: 'Save 10% on your order',
            user_specific: false,
            first_time_user_only: false
          },
          {
            id: 'fallback-2',
            code: 'WELCOME15',
            discount_type: 'percentage',
            discount_value: 15,
            minimum_amount: 50,
            description: 'Save 15% on orders over $50',
            user_specific: false,
            first_time_user_only: true
          }
        ],
        count: 2,
        error: 'Backend service unavailable, showing fallback coupons'
      });
    }

  } catch (error) {
    console.error('Coupons API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        coupons: [],
        count: 0,
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
