from django.core.management.base import BaseCommand
from website.models import OfferBanner


class Command(BaseCommand):
    help = 'Fix broken offer banner URLs'

    def handle(self, *args, **options):
        self.stdout.write("Fixing Offer Banner URLs...")
        
        # Working Picsum URLs (placeholder service that always works)
        banners_to_update = [
            {
                'title': 'New Arrivals',
                'new_url': 'https://picsum.photos/800/600?random=101'
            },
            {
                'title': 'Flash Sale', 
                'new_url': 'https://picsum.photos/800/600?random=102'
            },
            {
                'title': 'Clearance Sale',
                'new_url': 'https://picsum.photos/800/600?random=103'
            },
            {
                'title': 'Exclusive VIP Deal',
                'new_url': 'https://picsum.photos/800/600?random=104'
            }
        ]
        
        for banner_info in banners_to_update:
            try:
                banner = OfferBanner.objects.get(title=banner_info['title'])
                old_url = banner.image_url
                banner.image_url = banner_info['new_url'] 
                banner.save()
                self.stdout.write(
                    self.style.SUCCESS(f"✓ Updated '{banner.title}'")
                )
                self.stdout.write(f"  Old: {old_url}")
                self.stdout.write(f"  New: {banner_info['new_url']}")
                self.stdout.write("")
            except OfferBanner.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f"✗ Banner '{banner_info['title']}' not found")
                )
        
        self.stdout.write(self.style.SUCCESS("Update completed!"))
        
        # Show current state
        self.stdout.write("\nCurrent Offer Banners:")
        for banner in OfferBanner.objects.filter(is_active=True):
            has_uploaded_image = bool(banner.image)
            image_source = "Uploaded Image" if has_uploaded_image else "URL Image"
            self.stdout.write(f"- {banner.title}: {image_source}")
            if has_uploaded_image:
                self.stdout.write(f"  File: {banner.image}")
            else:
                self.stdout.write(f"  URL: {banner.image_url}")
