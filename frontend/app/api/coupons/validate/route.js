// app/api/coupons/validate/route.js
import { NextResponse } from 'next/server';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.icommerce.passmcq.com').replace(/\/+$/, '');

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { coupon_code, cart_items, cart_total, user_id } = body;

    // Validate required data
    if (!coupon_code || !cart_items || !Array.isArray(cart_items)) {
      return NextResponse.json(
        { 
          success: false, 
          valid: false,
          message: 'Invalid request. Coupon code and cart items are required.' 
        },
        { status: 400 }
      );
    }

    // Prepare request for Django backend
    const requestData = {
      coupon_code: coupon_code.toUpperCase(),
      cart_items: cart_items.map(item => ({
        product_id: item.product_id || item.id,
        quantity: item.quantity || 1,
        price: item.price || 0
      }))
    };

    if (cart_total !== undefined && cart_total !== null) {
      requestData.cart_total = cart_total;
    }

    if (user_id) {
      requestData.user_id = user_id;
    }

    // Make request to Django backend
    const response = await fetch(`${API_BASE_URL}/api/coupons/validate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (response.ok && data) {
      // Return successful validation response
      return NextResponse.json({
        success: true,
        valid: data.valid || false,
        message: data.message || 'Coupon validation completed',
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        discount_amount: data.discount_amount || 0,
        product_discount: data.product_discount || 0,
        shipping_discount: data.shipping_discount || 0,
        // Validation constraints
        min_cart_total: data.min_cart_total,
        min_quantity_required: data.min_quantity_required,
        user_specific: data.user_specific || false,
        first_time_user_only: data.first_time_user_only || false,
        is_first_time_user: data.is_first_time_user,
        user_eligible: data.user_eligible || true,
        // Additional info
        expires_at: data.expires_at,
        usage_limit: data.usage_limit,
        times_used: data.times_used
      });
    } else {
      // Handle backend validation errors
      return NextResponse.json({
        success: false,
        valid: false,
        message: data?.message || 'Coupon validation failed',
        // Include validation details even for failed validations
        min_cart_total: data?.min_cart_total,
        min_quantity_required: data?.min_quantity_required,
        user_specific: data?.user_specific || false,
        first_time_user_only: data?.first_time_user_only || false,
        is_first_time_user: data?.is_first_time_user,
        user_eligible: data?.user_eligible
      });
    }

  } catch (error) {
    console.error('Coupon validation error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        valid: false,
        message: 'Internal server error during coupon validation',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
