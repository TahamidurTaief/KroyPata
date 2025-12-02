"""Test script to verify landing page order creation"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Product, LandingPageOrder

# Get a product with landing page enabled
product = Product.objects.filter(enable_landing_page=True).first()

if not product:
    print("No products with landing page enabled!")
    exit(1)

print(f"Testing with product: {product.name} (ID: {product.id})")
print(f"Product price: {product.price}")
print(f"Product discount_price: {product.discount_price}")
print(f"Product stock: {product.stock}")

# Create a test order
try:
    order = LandingPageOrder.objects.create(
        product=product,
        quantity=1,
        unit_price=product.discount_price or product.price,
        full_name="Test Customer",
        email="test@example.com",
        phone="01234567890",
        detailed_address="Test Address, Dhaka, Bangladesh",
        customer_notes="This is a test order"
    )
    
    print(f"\n✓ Order created successfully!")
    print(f"  Order Number: {order.order_number}")
    print(f"  Unit Price: {order.unit_price}")
    print(f"  Total Price: {order.total_price}")
    print(f"  Status: {order.status}")
    
    # Verify in database
    order_check = LandingPageOrder.objects.filter(order_number=order.order_number).first()
    if order_check:
        print(f"\n✓ Order verified in database!")
    
except Exception as e:
    print(f"\n✗ Error creating order: {e}")
    import traceback
    traceback.print_exc()
