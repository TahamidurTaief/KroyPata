from django.core.management.base import BaseCommand
from website.models import OfferBanner


class Command(BaseCommand):
    help = 'Update broken offer banner URLs with working placeholder images'

    def handle(self, *args, **options):
        self.stdout.write("Fixing broken Offer Banner URLs...")
        
        # Working Picsum URLs that provide placeholder images
        updates = [
            ('New Arrivals', 'https://picsum.photos/800/600?random=201'),
            ('Flash Sale', 'https://picsum.photos/800/600?random=202'),
            ('Clearance Sale', 'https://picsum.photos/800/600?random=203'),
            ('Exclusive VIP Deal', 'https://picsum.photos/800/600?random=204')
        ]
        
        for title, new_url in updates:
            try:
                banner = OfferBanner.objects.get(title=title)
                old_url = banner.image_url
                banner.image_url = new_url
                banner.save()
                self.stdout.write(
                    self.style.SUCCESS(f"✓ Updated '{title}'")
                )
                self.stdout.write(f"  Old: {old_url}")
                self.stdout.write(f"  New: {new_url}")
            except OfferBanner.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f"! Banner '{title}' not found")
                )
        
        # Show final status
        self.stdout.write("\n" + "="*50)
        self.stdout.write("FINAL STATUS - Offer Banner Images:")
        self.stdout.write("="*50)
        
        for banner in OfferBanner.objects.filter(is_active=True).order_by('order'):
            has_uploaded = bool(banner.image)
            image_type = "📁 UPLOADED" if has_uploaded else "🔗 URL"
            
            self.stdout.write(f"{image_type} - {banner.title}")
            if has_uploaded:
                self.stdout.write(f"    File: {banner.image}")
            else:
                self.stdout.write(f"    URL: {banner.image_url}")
            self.stdout.write("")
        
        self.stdout.write(self.style.SUCCESS("✅ All updates completed!"))
        self.stdout.write("\nImage Priority System:")
        self.stdout.write("1. 📁 Uploaded images (highest priority)")
        self.stdout.write("2. 🔗 URL images (fallback)")
        self.stdout.write("3. 🎨 Gradient background (if no image)")
