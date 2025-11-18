"""
Django management command to create sample coupons
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from orders.models import Coupon

class Command(BaseCommand):
    help = 'Create sample coupons for testing'

    def handle(self, *args, **options):
        # Sample coupon data
        coupons_data = [
            {
                'code': 'SAVE10',
                'type': Coupon.CouponType.PRODUCT_DISCOUNT,
                'discount_percent': 10.00,
                'min_quantity_required': 1,
                'active': True,
                'valid_from': timezone.now(),
                'expires_at': timezone.now() + timedelta(days=30)
            },
            {
                'code': 'BULK20',
                'type': Coupon.CouponType.MIN_PRODUCT_QUANTITY,
                'discount_percent': 20.00,
                'min_quantity_required': 5,
                'active': True,
                'valid_from': timezone.now(),
                'expires_at': timezone.now() + timedelta(days=60)
            },
            {
                'code': 'FREESHIP',
                'type': Coupon.CouponType.SHIPPING_DISCOUNT,
                'discount_percent': 100.00,
                'min_quantity_required': 3,
                'active': True,
                'valid_from': timezone.now(),
                'expires_at': timezone.now() + timedelta(days=45)
            },
            {
                'code': 'HALFSHIP',
                'type': Coupon.CouponType.SHIPPING_DISCOUNT,
                'discount_percent': 50.00,
                'min_quantity_required': 2,
                'active': True,
                'valid_from': timezone.now(),
                'expires_at': timezone.now() + timedelta(days=15)
            },
            {
                'code': 'MEGA25',
                'type': Coupon.CouponType.MIN_PRODUCT_QUANTITY,
                'discount_percent': 25.00,
                'min_quantity_required': 10,
                'active': True,
                'valid_from': timezone.now(),
                'expires_at': timezone.now() + timedelta(days=90)
            },
            {
                'code': 'EXPIRED',
                'type': Coupon.CouponType.PRODUCT_DISCOUNT,
                'discount_percent': 15.00,
                'min_quantity_required': 1,
                'active': True,
                'valid_from': timezone.now() - timedelta(days=2),
                'expires_at': timezone.now() - timedelta(days=1)  # Expired
            },
            {
                'code': 'FUTURE10',
                'type': Coupon.CouponType.PRODUCT_DISCOUNT,
                'discount_percent': 10.00,
                'min_quantity_required': 1,
                'active': True,
                'valid_from': timezone.now() + timedelta(days=7),  # Valid from next week
                'expires_at': timezone.now() + timedelta(days=37)
            }
        ]

        created_count = 0
        for coupon_data in coupons_data:
            coupon, created = Coupon.objects.get_or_create(
                code=coupon_data['code'],
                defaults=coupon_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created coupon: {coupon.code} - {coupon.get_type_display()} ({coupon.discount_percent}%)')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Coupon already exists: {coupon.code}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\n🎉 Successfully created {created_count} new coupons!')
        )
        
        # Display summary
        total_coupons = Coupon.objects.count()
        active_coupons = Coupon.objects.filter(active=True).count()
        expired_coupons = Coupon.objects.filter(expires_at__lt=timezone.now()).count()
        
        self.stdout.write(
            self.style.SUCCESS(f'\n📊 Coupon Summary:')
        )
        self.stdout.write(f'   Total coupons: {total_coupons}')
        self.stdout.write(f'   Active coupons: {active_coupons}')
        self.stdout.write(f'   Expired coupons: {expired_coupons}')
