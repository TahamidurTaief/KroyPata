// app/api/checkout/calculation/route.js
import { NextResponse } from 'next/server';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.icommerce.passmcq.com').replace(/\/+$/, '');

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      cart_items, 
      coupon_code, 
      selected_shipping_method_id, 
      user_id,
      user_info 
    } = body;

    // Validate required data
    if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'cart_items is required and must be a non-empty array' 
        },
        { status: 400 }
      );
    }

    // Validate cart items structure
    for (const item of cart_items) {
      if (!item.product_id || !item.quantity) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Each cart item must have product_id and quantity' 
          },
          { status: 400 }
        );
      }
      
      // Validate additional cart item properties if present
      if (item.color && typeof item.color !== 'string') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'color must be a string' 
          },
          { status: 400 }
        );
      }
      
      if (item.size && typeof item.size !== 'string') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'size must be a string' 
          },
          { status: 400 }
        );
      }
    }

    // Prepare request payload for Django backend
    const requestPayload = {
      cart_items,
      ...(coupon_code && { coupon_code }),
      ...(selected_shipping_method_id && { selected_shipping_method_id }),
      ...(user_id && { user_id })
    };

    console.log('🛒 Checkout calculation request:', requestPayload);

    // Make request to Django backend
    const response = await fetch(`${API_BASE_URL}/api/enhanced-checkout-calculation/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Django API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Backend service error: ${response.status}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('✅ Checkout calculation response:', data);

    // Validate shipping method selection
    if (selected_shipping_method_id && data.success) {
      const availableMethods = data.shipping_details?.available_methods || [];
      const selectedMethod = data.shipping_details?.selected_method;
      
      if (!selectedMethod) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Selected shipping method is not available',
            available_methods: availableMethods,
            code: 'INVALID_SHIPPING_METHOD'
          },
          { status: 400 }
        );
      }
    }

    // Check for split shipping requirements
    if (data.shipping_details?.requires_split_shipping && selected_shipping_method_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Items in your cart require different shipping methods. Split shipping is required.',
          requires_split_shipping: true,
          available_methods: data.shipping_details.available_methods,
          code: 'SPLIT_SHIPPING_REQUIRED'
        },
        { status: 400 }
      );
    }

    // Add client-side enhancements to the response
    const enhancedResponse = {
      ...data,
      client_info: {
        timestamp: new Date().toISOString(),
        request_id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...(user_info && { user_info })
      }
    };
    
    return NextResponse.json(enhancedResponse);

  } catch (error) {
    console.error('Checkout calculation API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error.message,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
