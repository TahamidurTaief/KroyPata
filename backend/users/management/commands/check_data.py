from django.core.management.base import BaseCommand
from users.models import User, Address
from shops.models import Shop
from products.models import Product, Review, Color, Size, Category, SubCategory
from orders.models import Order, OrderItem, Coupon, ShippingMethod

class Command(BaseCommand):
    help = 'Check database status and data counts'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('📊 Database Status Check'))
        self.stdout.write('='*50)
        
        # Count all records
        counts = {
            'Users': User.objects.count(),
            'Addresses': Address.objects.count(),
            'Shops': Shop.objects.count(),
            'Categories': Category.objects.count(),
            'Subcategories': SubCategory.objects.count(),
            'Products': Product.objects.count(),
            'Colors': Color.objects.count(),
            'Sizes': Size.objects.count(),
            'Orders': Order.objects.count(),
            'Order Items': OrderItem.objects.count(),
            'Reviews': Review.objects.count(),
            'Coupons': Coupon.objects.count(),
            'Shipping Methods': ShippingMethod.objects.count(),
        }
        
        for model_name, count in counts.items():
            if count > 0:
                self.stdout.write(f'✅ {model_name}: {count}')
            else:
                self.stdout.write(f'⚠️  {model_name}: {count}')
        
        self.stdout.write('\n' + '='*50)
        
        # Test admin user
        try:
            admin = User.objects.get(email='admin@icommerce.com')
            self.stdout.write(f'✅ Admin user exists: {admin.email}')
        except User.DoesNotExist:
            self.stdout.write('❌ Admin user not found')
        
        # Test some data relationships
        active_products = Product.objects.filter(is_active=True).count()
        products_with_stock = Product.objects.filter(stock__gt=0).count()
        
        self.stdout.write(f'✅ Active products: {active_products}')
        self.stdout.write(f'✅ Products in stock: {products_with_stock}')
        
        # Test orders
        paid_orders = Order.objects.filter(payment_status='PAID').count()
        delivered_orders = Order.objects.filter(status='DELIVERED').count()
        
        self.stdout.write(f'✅ Paid orders: {paid_orders}')
        self.stdout.write(f'✅ Delivered orders: {delivered_orders}')
        
        self.stdout.write(self.style.SUCCESS('\n🎉 Database check completed!'))
