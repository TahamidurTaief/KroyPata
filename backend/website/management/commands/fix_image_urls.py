from django.core.management.base import BaseCommand
from website.models import OfferBanner, HeroBanner

class Command(BaseCommand):
    help = 'Fix broken Unsplash image URLs in the database'

    def handle(self, *args, **options):
        self.stdout.write('🔧 Fixing broken image URLs...')
        
        # Map of broken URLs to working URLs
        url_replacements = {
            'https://images.unsplash.com/photo-1556906781-2f0520405b71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D': 'https://picsum.photos/2070/800?random=1',
            'https://images.unsplash.com/photo-1608190003443-86a8c7d6d6b4?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D': 'https://picsum.photos/1974/800?random=2',
            'https://images.unsplash.com/photo-1556906781-2f0520405b71?q=80&w=2070&auto=format&fit=crop': 'https://picsum.photos/2070/800?random=3',
            'https://images.unsplash.com/photo-1608190003443-86a8c7d6d6b4?q=80&w=1974&auto=format&fit=crop': 'https://picsum.photos/1974/800?random=4',
        }
        
        # Fix OfferBanner URLs
        offer_banners_fixed = 0
        for banner in OfferBanner.objects.all():
            if banner.image_url in url_replacements:
                old_url = banner.image_url
                banner.image_url = url_replacements[banner.image_url]
                banner.save()
                offer_banners_fixed += 1
                self.stdout.write(f"✅ Fixed OfferBanner '{banner.title}': {old_url[:50]}... → {banner.image_url}")
        
        # Fix HeroBanner URLs  
        hero_banners_fixed = 0
        for banner in HeroBanner.objects.all():
            changed = False
            changes = []
            
            if banner.light_theme_url in url_replacements:
                old_url = banner.light_theme_url
                banner.light_theme_url = url_replacements[banner.light_theme_url]
                changes.append(f"light_theme_url: {old_url[:30]}... → {banner.light_theme_url}")
                changed = True
                
            if banner.dark_theme_url in url_replacements:
                old_url = banner.dark_theme_url
                banner.dark_theme_url = url_replacements[banner.dark_theme_url]
                changes.append(f"dark_theme_url: {old_url[:30]}... → {banner.dark_theme_url}")
                changed = True
                
            if banner.fallback_url in url_replacements:
                old_url = banner.fallback_url
                banner.fallback_url = url_replacements[banner.fallback_url]
                changes.append(f"fallback_url: {old_url[:30]}... → {banner.fallback_url}")
                changed = True
                
            if changed:
                banner.save()
                hero_banners_fixed += 1
                self.stdout.write(f"✅ Fixed HeroBanner '{banner.title}':")
                for change in changes:
                    self.stdout.write(f"   - {change}")
        
        # Check for any remaining Unsplash URLs
        remaining_offer_unsplash = OfferBanner.objects.filter(image_url__contains='unsplash.com').count()
        remaining_hero_unsplash = HeroBanner.objects.filter(
            light_theme_url__contains='unsplash.com'
        ).count() + HeroBanner.objects.filter(
            dark_theme_url__contains='unsplash.com'
        ).count() + HeroBanner.objects.filter(
            fallback_url__contains='unsplash.com'
        ).count()
        
        self.stdout.write(self.style.SUCCESS(f'\n🎉 Image URL fixing complete!'))
        self.stdout.write(f"📊 OfferBanners fixed: {offer_banners_fixed}")
        self.stdout.write(f"📊 HeroBanners fixed: {hero_banners_fixed}")
        self.stdout.write(f"📊 Total fixed: {offer_banners_fixed + hero_banners_fixed}")
        
        if remaining_offer_unsplash > 0 or remaining_hero_unsplash > 0:
            self.stdout.write(self.style.WARNING(f"⚠️  Remaining Unsplash URLs: {remaining_offer_unsplash + remaining_hero_unsplash}"))
        else:
            self.stdout.write(self.style.SUCCESS("✅ No remaining Unsplash URLs found!"))
