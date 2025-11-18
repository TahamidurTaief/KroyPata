// app/api/checkout/shipping-analysis/route.js
import { NextResponse } from 'next/server';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.icommerce.passmcq.com').replace(/\/+$/, '');

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Check if request has content
    const contentLength = request.headers.get('content-length');
    if (!contentLength || contentLength === '0') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Empty request body' 
        },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body',
          details: jsonError.message 
        },
        { status: 400 }
      );
    }

    const { cart_items } = body;

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
            error: 'Each cart item must have product_id and quantity',
            invalid_item: item 
          },
          { status: 400 }
        );
      }
      
      // Validate that quantity is a positive number
      if (item.quantity <= 0 || !Number.isInteger(Number(item.quantity))) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Quantity must be a positive integer',
            invalid_item: item 
          },
          { status: 400 }
        );
      }
    }

    // Make request to Django backend
    const response = await fetch(`${API_BASE_URL}/api/orders/analyze-cart-shipping/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cart_items }),
    });

  if (!response.ok) {
      let errorText = '';
      let errorData = {};
      
      try {
        errorText = await response.text();
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText || 'Unknown error' };
      }
      
      console.error('Django API error:', response.status, errorData);
      
      // Handle specific error types
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Product not found',
            details: errorData.error || 'One or more products in your cart were not found. Please refresh your cart.',
            cart_items: cart_items // Return the cart items that caused the issue
          },
          { status: 400 } // Return 400 to frontend instead of 404
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Backend service error: ${response.status}`,
          details: errorData.error || errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Normalize backend response fields to legacy naming expected by some components
    const shippingAnalysis = data.shipping_analysis || {};
    const normalized = {
      success: data.success !== false,
      timestamp: new Date().toISOString(),
      cart_analysis: data.cart_analysis,
      shipping_analysis: shippingAnalysis,
      // Legacy flattening
      available_shipping_methods: shippingAnalysis.available_methods || [],
      free_shipping_rule: shippingAnalysis.qualifying_free_rule || null,
      requires_split_shipping: shippingAnalysis.requires_split_shipping || false,
      free_shipping_eligible: shippingAnalysis.free_shipping_eligible || false,
      missing_products: data.missing_products || [],
      partial: data.partial || false,
      message: data.message || null,
      recommendations: data.recommendations || {}
    };

    return NextResponse.json(normalized);

  } catch (error) {
    console.error('Shipping analysis API error:', error);
    
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
