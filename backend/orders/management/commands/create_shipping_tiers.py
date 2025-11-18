"""
Django management command to create sample shipping tiers
"""

from django.core.management.base import BaseCommand
from orders.models import ShippingMethod, ShippingTier
from decimal import Decimal

class Command(BaseCommand):
    help = 'Create sample shipping tiers for existing shipping methods'

    def handle(self, *args, **options):
        # Sample shipping tier configurations
        tier_configs = {
            'Standard Shipping': [
                {'min_quantity': 1, 'price': Decimal('5.99')},
                {'min_quantity': 5, 'price': Decimal('4.99')},
                {'min_quantity': 10, 'price': Decimal('3.99')},
                {'min_quantity': 20, 'price': Decimal('2.99')},
            ],
            'Express Shipping': [
                {'min_quantity': 1, 'price': Decimal('12.99')},
                {'min_quantity': 5, 'price': Decimal('10.99')},
                {'min_quantity': 10, 'price': Decimal('8.99')},
            ],
            'Overnight Shipping': [
                {'min_quantity': 1, 'price': Decimal('24.99')},
                {'min_quantity': 5, 'price': Decimal('19.99')},
            ],
            'Free Shipping': [
                {'min_quantity': 1, 'price': Decimal('0.00')},
            ]
        }

        created_count = 0
        for method_name, tiers in tier_configs.items():
            try:
                shipping_method = ShippingMethod.objects.get(name=method_name)
                self.stdout.write(f"\n📦 Processing {method_name}:")
                
                for tier_data in tiers:
                    tier, created = ShippingTier.objects.get_or_create(
                        shipping_method=shipping_method,
                        min_quantity=tier_data['min_quantity'],
                        defaults={'price': tier_data['price']}
                    )
                    if created:
                        created_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✅ Created tier: {tier_data["min_quantity"]}+ items → ${tier_data["price"]}')
                        )
                    else:
                        self.stdout.write(
                            self.style.WARNING(f'  ⚠️  Tier already exists: {tier_data["min_quantity"]}+ items → ${tier.price}')
                        )
                
            except ShippingMethod.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'❌ Shipping method "{method_name}" not found. Skipping...')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\n🎉 Successfully created {created_count} new shipping tiers!')
        )
        
        # Display summary
        self.stdout.write(
            self.style.SUCCESS(f'\n📊 Shipping Tiers Summary:')
        )
        
        for method in ShippingMethod.objects.filter(is_active=True):
            tier_count = method.shipping_tiers.count()
            self.stdout.write(f'   {method.name}: {tier_count} pricing tiers')
            
            # Show pricing examples
            if tier_count > 0:
                for qty in [1, 5, 10, 20]:
                    price = method.get_price_for_quantity(qty)
                    self.stdout.write(f'     - {qty} items: ${price}')
                self.stdout.write('')
