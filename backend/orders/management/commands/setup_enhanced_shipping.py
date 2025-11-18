from django.core.management.base import BaseCommand
from orders.models import ShippingMethod, ShippingTier
from decimal import Decimal

class Command(BaseCommand):
    help = 'Setup enhanced shipping methods with responsive admin interface testing'
    
    def handle(self, *args, **options):
        self.stdout.write('🚀 Setting up enhanced shipping methods for admin testing...')
        
        # Method 1: Your original weight-based requirements
        method1, created = ShippingMethod.objects.get_or_create(
            name="Dynamic Weight Shipping (Enhanced Admin)",
            defaults={
                'description': 'Weight-based shipping with enhanced admin interface',
                'price': Decimal('50.00'),
                'preferred_pricing_type': 'weight',
                'is_active': True,
                'delivery_estimated_time': '2-3 business days'
            }
        )
        
        if created or method1.shipping_tiers.count() == 0:
            # Clear existing tiers
            method1.shipping_tiers.all().delete()
            
            # Tier 1: 0-0.5kg = 60 BDT
            ShippingTier.objects.create(
                shipping_method=method1,
                pricing_type='weight',
                min_weight=Decimal('0.0'),
                max_weight=Decimal('0.5'),
                base_price=Decimal('60.00'),
                has_incremental_pricing=False,
                priority=10
            )
            
            # Tier 2: 0.5-1kg = 70 BDT
            ShippingTier.objects.create(
                shipping_method=method1,
                pricing_type='weight',
                min_weight=Decimal('0.5'),
                max_weight=Decimal('1.0'),
                base_price=Decimal('70.00'),
                has_incremental_pricing=False,
                priority=10
            )
            
            # Tier 3: >1kg = 70 + 20 per kg
            ShippingTier.objects.create(
                shipping_method=method1,
                pricing_type='weight',
                min_weight=Decimal('1.0'),
                max_weight=None,
                base_price=Decimal('70.00'),
                has_incremental_pricing=True,
                increment_per_unit=Decimal('20.00'),
                increment_unit_size=Decimal('1.0'),
                priority=10
            )
            
            self.stdout.write(f'✅ Created {method1.name} with 3 tiers')
        
        # Method 2: Express shipping with different pricing
        method2, created = ShippingMethod.objects.get_or_create(
            name="Express Shipping (Priority Test)",
            defaults={
                'description': 'Express shipping with priority-based pricing',
                'price': Decimal('100.00'),
                'preferred_pricing_type': 'weight',
                'is_active': True,
                'delivery_estimated_time': '1-2 business days'
            }
        )
        
        if created or method2.shipping_tiers.count() == 0:
            method2.shipping_tiers.all().delete()
            
            # High priority tier for light items
            ShippingTier.objects.create(
                shipping_method=method2,
                pricing_type='weight',
                min_weight=Decimal('0.0'),
                max_weight=Decimal('2.0'),
                base_price=Decimal('100.00'),
                has_incremental_pricing=True,
                increment_per_unit=Decimal('15.00'),
                increment_unit_size=Decimal('0.5'),
                priority=5  # Higher priority than standard
            )
            
            # Lower priority for heavy items
            ShippingTier.objects.create(
                shipping_method=method2,
                pricing_type='weight',
                min_weight=Decimal('2.0'),
                max_weight=None,
                base_price=Decimal('150.00'),
                has_incremental_pricing=True,
                increment_per_unit=Decimal('25.00'),
                increment_unit_size=Decimal('1.0'),
                priority=8
            )
            
            self.stdout.write(f'✅ Created {method2.name} with 2 priority tiers')
        
        # Method 3: Quantity-based shipping for testing
        method3, created = ShippingMethod.objects.get_or_create(
            name="Quantity-Based Shipping (Admin Test)",
            defaults={
                'description': 'Shipping based on item quantity for admin interface testing',
                'price': Decimal('40.00'),
                'preferred_pricing_type': 'quantity',
                'is_active': True,
                'delivery_estimated_time': '3-5 business days'
            }
        )
        
        if created or method3.shipping_tiers.count() == 0:
            method3.shipping_tiers.all().delete()
            
            # 1-3 items
            ShippingTier.objects.create(
                shipping_method=method3,
                pricing_type='quantity',
                min_quantity=1,
                max_quantity=3,
                base_price=Decimal('40.00'),
                has_incremental_pricing=False,
                priority=10
            )
            
            # 4-10 items
            ShippingTier.objects.create(
                shipping_method=method3,
                pricing_type='quantity',
                min_quantity=4,
                max_quantity=10,
                base_price=Decimal('60.00'),
                has_incremental_pricing=True,
                increment_per_unit=Decimal('5.00'),
                increment_unit_size=Decimal('1'),
                priority=10
            )
            
            # 10+ items
            ShippingTier.objects.create(
                shipping_method=method3,
                pricing_type='quantity',
                min_quantity=11,
                max_quantity=None,
                base_price=Decimal('80.00'),
                has_incremental_pricing=True,
                increment_per_unit=Decimal('3.00'),
                increment_unit_size=Decimal('1'),
                priority=10
            )
            
            self.stdout.write(f'✅ Created {method3.name} with 3 quantity tiers')
        
        self.stdout.write('\n' + '='*60)
        self.stdout.write('🎉 Enhanced shipping methods setup completed!')
        self.stdout.write('\nAdmin Interface Features Added:')
        self.stdout.write('✅ Responsive horizontal scrollbar for shipping tiers table')
        self.stdout.write('✅ Conditional field enabling/disabling for incremental pricing')
        self.stdout.write('✅ Comprehensive help text and usage instructions')
        self.stdout.write('✅ Priority system explanation and tooltips')
        self.stdout.write('✅ Real-time field validation with visual feedback')
        self.stdout.write('\nTo test the admin interface:')
        self.stdout.write('1. Go to: http://127.0.0.1:8000/admin/orders/shippingmethod/')
        self.stdout.write('2. Click on any shipping method to edit')
        self.stdout.write('3. Scroll down to "Shipping Tiers" section')
        self.stdout.write('4. Test the responsive scrollbar and conditional fields')
        self.stdout.write('='*60)
