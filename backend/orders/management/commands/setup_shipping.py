from django.core.management.base import BaseCommand
from orders.models import ShippingMethod, ShippingCategory, ShippingTier, FreeShippingRule

class Command(BaseCommand):
    help = 'Create default shipping methods and categories'

    def handle(self, *args, **options):
        self.stdout.write('Creating default shipping data...')
        
        # Create shipping categories
        general_category, created = ShippingCategory.objects.get_or_create(
            name='General',
            defaults={'description': 'General merchandise'}
        )
        self.stdout.write(f'{"Created" if created else "Found"} category: {general_category.name}')
        
        electronics_category, created = ShippingCategory.objects.get_or_create(
            name='Electronics',
            defaults={'description': 'Electronic devices and accessories'}
        )
        self.stdout.write(f'{"Created" if created else "Found"} category: {electronics_category.name}')
        
        # Create shipping methods
        standard_method, created = ShippingMethod.objects.get_or_create(
            name='Standard Shipping',
            defaults={
                'description': 'Regular delivery service',
                'price': 50.00,
                'delivery_estimated_time': '3-5 business days',
                'is_active': True
            }
        )
        self.stdout.write(f'{"Created" if created else "Found"} method: {standard_method.name}')
        
        express_method, created = ShippingMethod.objects.get_or_create(
            name='Express Shipping',
            defaults={
                'description': 'Fast delivery service',
                'price': 100.00,
                'delivery_estimated_time': '1-2 business days',
                'is_active': True
            }
        )
        self.stdout.write(f'{"Created" if created else "Found"} method: {express_method.name}')
        
        economy_method, created = ShippingMethod.objects.get_or_create(
            name='Economy Shipping',
            defaults={
                'description': 'Budget-friendly shipping option',
                'price': 30.00,
                'delivery_estimated_time': '5-7 business days',
                'is_active': True
            }
        )
        self.stdout.write(f'{"Created" if created else "Found"} method: {economy_method.name}')
        
        # Associate methods with categories
        general_category.allowed_shipping_methods.add(standard_method, express_method, economy_method)
        electronics_category.allowed_shipping_methods.add(standard_method, express_method)
        
        # Create shipping tiers
        tier1, created = ShippingTier.objects.get_or_create(
            shipping_method=standard_method,
            min_quantity=5,
            defaults={'price': 40.00}
        )
        self.stdout.write(f'{"Created" if created else "Found"} tier: 5+ items = ৳40')
        
        tier2, created = ShippingTier.objects.get_or_create(
            shipping_method=standard_method,
            min_quantity=10,
            defaults={'price': 20.00}
        )
        self.stdout.write(f'{"Created" if created else "Found"} tier: 10+ items = ৳20')
        
        # Create free shipping rule
        free_rule, created = FreeShippingRule.objects.get_or_create(
            threshold_amount=1000.00,
            defaults={'active': True}
        )
        self.stdout.write(f'{"Created" if created else "Found"} free shipping rule: ৳1000+')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nShipping setup complete!\n'
                f'Methods: {ShippingMethod.objects.count()}\n'
                f'Categories: {ShippingCategory.objects.count()}\n'
                f'Tiers: {ShippingTier.objects.count()}\n'
                f'Free Rules: {FreeShippingRule.objects.count()}'
            )
        )
