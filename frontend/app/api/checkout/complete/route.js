// app/api/checkout/complete/route.js
import { NextResponse } from 'next/server';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.icommerce.passmcq.com').replace(/\/+$/, '');

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      cart_items,
      user_info,
      shipping_method_id,
      coupon_code,
      payment_method,
      user_id
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

    if (!user_info) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'user_info is required' 
        },
        { status: 400 }
      );
    }

    // Validate user info structure
    const requiredUserFields = ['first_name', 'last_name', 'email', 'phone', 'address'];
    const requiredAddressFields = ['street', 'city', 'state', 'zip_code'];

    for (const field of requiredUserFields) {
      if (!user_info[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `user_info.${field} is required` 
          },
          { status: 400 }
        );
      }
    }

    if (typeof user_info.address === 'object') {
      for (const field of requiredAddressFields) {
        if (!user_info.address[field]) {
          return NextResponse.json(
            { 
              success: false, 
              error: `user_info.address.${field} is required` 
            },
            { status: 400 }
          );
        }
      }
    }

    // Validate cart items structure with color and size
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
    }

    if (!shipping_method_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'shipping_method_id is required' 
        },
        { status: 400 }
      );
    }

    // First, validate the checkout calculation
    const calculationPayload = {
      cart_items,
      selected_shipping_method_id: shipping_method_id,
      ...(coupon_code && { coupon_code }),
      ...(user_id && { user_id })
    };

    console.log('🧮 Pre-checkout calculation validation...');
    
    const calculationResponse = await fetch(`${API_BASE_URL}/api/enhanced-checkout-calculation/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calculationPayload),
    });

    if (!calculationResponse.ok) {
      const errorText = await calculationResponse.text();
      console.error('Pre-checkout validation failed:', calculationResponse.status, errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Checkout validation failed',
          details: errorText,
          code: 'VALIDATION_FAILED'
        },
        { status: calculationResponse.status }
      );
    }

    const calculationData = await calculationResponse.json();

    if (!calculationData.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Checkout calculation failed',
          details: calculationData.error,
          code: 'CALCULATION_FAILED'
        },
        { status: 400 }
      );
    }

    // Check for split shipping requirement
    if (calculationData.shipping_details?.requires_split_shipping) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Items require split shipping. Please contact support.',
          requires_split_shipping: true,
          code: 'SPLIT_SHIPPING_REQUIRED'
        },
        { status: 400 }
      );
    }

    // Prepare order creation payload
    const orderPayload = {
      items: cart_items.map(item => ({
        product: item.product_id,
        quantity: parseInt(item.quantity),
        ...(item.color && { color: item.color }),
        ...(item.size && { size: item.size })
      })),
      customer_info: {
        first_name: user_info.first_name,
        last_name: user_info.last_name,
        email: user_info.email,
        phone: user_info.phone
      },
      shipping_address: typeof user_info.address === 'object' ? {
        street_address: user_info.address.street,
        city: user_info.address.city,
        state: user_info.address.state,
        zip_code: user_info.address.zip_code
      } : {
        street_address: user_info.address,
        city: user_info.city || '',
        state: user_info.state || '',
        zip_code: user_info.zip_code || ''
      },
      shipping_method: shipping_method_id,
      ...(coupon_code && { coupon_code }),
      payment_method: payment_method || 'pending',
      notes: `Order created via Next.js API at ${new Date().toISOString()}`
    };

    console.log('📦 Creating order with payload:', orderPayload);

    // Create order through Django API
    const orderResponse = await fetch(`${API_BASE_URL}/api/orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth headers if user_id is provided
        ...(user_id && { 'X-User-ID': user_id.toString() })
      },
      body: JSON.stringify(orderPayload),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('Order creation failed:', orderResponse.status, errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to create order',
            details: errorData,
            code: 'ORDER_CREATION_FAILED'
          },
          { status: orderResponse.status }
        );
      } catch (parseError) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to create order',
            details: errorText,
            code: 'ORDER_CREATION_FAILED'
          },
          { status: orderResponse.status }
        );
      }
    }

    const orderData = await orderResponse.json();
    
    console.log('✅ Order created successfully:', orderData);

    // Return comprehensive response
    return NextResponse.json({
      success: true,
      order: orderData,
      calculation_summary: calculationData.calculation_summary,
      shipping_details: calculationData.shipping_details,
      coupon_details: calculationData.coupon_details,
      client_info: {
        timestamp: new Date().toISOString(),
        order_id: orderData.id || orderData.order_number,
        request_id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    });

  } catch (error) {
    console.error('Checkout completion API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during checkout',
        message: error.message,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
