"""
Django management command to create sample shipping methods
"""

from django.core.management.base import BaseCommand
from orders.models import ShippingMethod

class Command(BaseCommand):
    help = 'Create sample shipping methods for testing'

    def handle(self, *args, **options):
        # Sample shipping methods data
        shipping_methods = [
            {
                'name': 'Standard Shipping',
                'description': 'Regular delivery within 5-7 business days. Most economical option.',
                'price': 5.99,
                'is_active': True
            },
            {
                'name': 'Express Shipping',
                'description': 'Fast delivery within 2-3 business days. Perfect for urgent orders.',
                'price': 12.99,
                'is_active': True
            },
            {
                'name': 'Overnight Shipping',
                'description': 'Next day delivery. Order before 2 PM for same-day processing.',
                'price': 24.99,
                'is_active': True
            },
            {
                'name': 'Free Shipping',
                'description': 'Free standard delivery (7-10 business days). Available for orders over ৳5,500.',
                'price': 0.00,
                'is_active': True
            }
        ]

        created_count = 0
        for method_data in shipping_methods:
            shipping_method, created = ShippingMethod.objects.get_or_create(
                name=method_data['name'],
                defaults=method_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created: {shipping_method.name} - ${shipping_method.price}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Already exists: {shipping_method.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\n🎉 Created {created_count} new shipping methods!')
        )
