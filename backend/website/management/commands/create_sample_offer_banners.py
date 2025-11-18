from django.core.management.base import BaseCommand
from website.models import OfferBanner

class Command(BaseCommand):
    help = 'Create sample offer banners'

    def handle(self, *args, **options):
        # Delete existing offer banners
        OfferBanner.objects.all().delete()
        
        # Sample offer banners data
        banners_data = [
            {
                'title': 'Summer Collection',
                'subtitle': 'Refresh your wardrobe with our exclusive summer styles',
                'description': 'Discover the latest trends in summer fashion with unbeatable prices',
                'banner_type': 'horizontal',
                'image_url': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'alt_text': 'Summer Collection - Fashion Sale',
                'discount_text': 'UP TO 40% OFF',
                'coupon_code': 'SUMMER40',
                'button_text': 'Shop Now',
                'button_url': '/products?category=summer',
                'gradient_colors': 'from-amber-500 to-orange-600',
                'order': 1,
                'meta_title': 'Summer Fashion Sale - Up to 40% Off',
                'meta_description': 'Refresh your wardrobe with our exclusive summer styles. Save up to 40% on the latest fashion trends.',
            },
            {
                'title': 'New Arrivals',
                'subtitle': 'Discover the latest trends in fashion',
                'description': 'Be the first to wear the newest styles from top brands',
                'banner_type': 'horizontal',
                'image_url': 'https://picsum.photos/2070/800?random=1',
                'alt_text': 'New Arrivals - Latest Fashion Trends',
                'discount_text': 'NEW CUSTOMER OFFER',
                'coupon_code': 'WELCOME15',
                'button_text': 'Explore Now',
                'button_url': '/products?sort=created_at',
                'gradient_colors': 'from-pink-500 to-rose-600',
                'order': 2,
                'meta_title': 'New Arrivals - Latest Fashion Trends',
                'meta_description': 'Discover the latest fashion trends and new arrivals. Get 15% off on your first purchase.',
            },
            {
                'title': 'Flash Sale',
                'subtitle': 'Limited time offer - don\'t miss out!',
                'description': 'Incredible deals ending soon. Shop now before it\'s too late!',
                'banner_type': 'horizontal',
                'image_url': 'https://picsum.photos/1974/800?random=2',
                'alt_text': 'Flash Sale - Limited Time Offer',
                'discount_text': 'LIMITED TIME',
                'coupon_code': 'FLASH20',
                'button_text': 'Shop Now',
                'button_url': '/products?sale=true',
                'gradient_colors': 'from-emerald-500 to-teal-600',
                'order': 3,
                'meta_title': 'Flash Sale - Limited Time Offers',
                'meta_description': 'Limited time flash sale with incredible deals. Shop now before it\'s too late!',
            },
            {
                'title': 'Clearance Sale',
                'subtitle': 'Up to 60% off on selected items',
                'description': 'Limited stock at unbelievable prices - while supplies last',
                'banner_type': 'horizontal',
                'image_url': 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'alt_text': 'Clearance Sale - Up to 60% Off',
                'discount_text': 'UP TO 60% OFF',
                'coupon_code': 'CLEARANCE30',
                'button_text': 'Grab Deals',
                'button_url': '/products?category=clearance',
                'gradient_colors': 'from-blue-500 to-indigo-600',
                'order': 4,
                'meta_title': 'Clearance Sale - Up to 60% Off',
                'meta_description': 'Limited stock clearance sale with up to 60% off on selected items. While supplies last!',
            },
            {
                'title': 'Exclusive VIP Deal',
                'subtitle': 'Special offer just for you',
                'description': 'VIP members get exclusive access to premium deals and early access to sales',
                'banner_type': 'vertical',
                'image_url': 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'alt_text': 'Exclusive VIP Deal - Premium Access',
                'discount_text': 'EXCLUSIVE',
                'coupon_code': 'VIP25',
                'button_text': 'Claim Offer',
                'button_url': '/vip-deals',
                'gradient_colors': 'from-purple-500 to-fuchsia-600',
                'order': 5,
                'meta_title': 'Exclusive VIP Deals - Premium Access',
                'meta_description': 'Get exclusive VIP access to premium deals and early access to sales. Join our VIP program today.',
            },
        ]
        
        created_count = 0
        for banner_data in banners_data:
            banner = OfferBanner.objects.create(**banner_data)
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(f'Created offer banner: {banner.title}')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} offer banners')
        )
