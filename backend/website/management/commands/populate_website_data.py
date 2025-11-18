from django.core.management.base import BaseCommand
from website.models import (
    NavbarSettings, OfferCategory, HeroBanner, OfferBanner, 
    HorizontalPromoBanner, BlogPost, FooterSection, FooterLink, 
    SocialMediaLink, SiteSettings
)

class Command(BaseCommand):
    help = 'Populate website with initial data based on current static content'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to populate website data...'))
        
        # Create Navbar Links
        self.create_navbar_links()
        
        # Create Offer Categories
        self.create_offer_categories()
        
        # Create Hero Banners
        self.create_hero_banners()
        
        # Create Offer Banners
        self.create_offer_banners()
        
        # Create Horizontal Banners
        self.create_horizontal_banners()
        
        # Create Blog Posts
        self.create_blog_posts()
        
        # Create Footer Sections
        self.create_footer_sections()
        
        # Create Social Media Links
        self.create_social_links()
        
        # Create Site Settings
        self.create_site_settings()
        
        self.stdout.write(self.style.SUCCESS('Successfully populated website data!'))
    
    def create_navbar_links(self):
        """Create navbar links based on current static navLinks"""
        navbar_links = [
            {"name": "Home", "url": "/"},
            {"name": "Products", "url": "/products"},
            {"name": "Categories", "url": "/categories"},
            {"name": "Orders", "url": "/orders"},
            {"name": "Cart", "url": "/cart"},
            {"name": "Checkout", "url": "/checkout"},
        ]
        
        for i, link in enumerate(navbar_links):
            NavbarSettings.objects.get_or_create(
                name=link["name"],
                defaults={
                    "url": link["url"],
                    "link_type": "internal",
                    "order": i,
                    "show_in_mobile": True,
                    "show_in_desktop": True,
                    "is_active": True
                }
            )
        
        self.stdout.write(f'Created {len(navbar_links)} navbar links')
    
    def create_offer_categories(self):
        """Create offer categories for navbar dropdown"""
        offer_categories = [
            {
                "name": "Bundle Deals",
                "title": "Bundle Deals - Save More",
                "slug": "bundle-deals",
                "description": "Get amazing discounts when you buy multiple items together",
                "link": "/offers/bundle-deals",
                "is_featured": True,
                "badge_text": "HOT",
                "order": 0
            },
            {
                "name": "Choice",
                "title": "Editor's Choice",
                "slug": "choice",
                "description": "Handpicked items by our experts for the best value",
                "link": "/offers/choice",
                "is_featured": True,
                "badge_text": "NEW",
                "order": 1
            },
            {
                "name": "Super Deals",
                "title": "Super Deals - Up to 70% Off",
                "slug": "super-deals",
                "description": "Unbeatable prices on selected premium products",
                "link": "/offers/super-deals",
                "is_featured": True,
                "badge_text": "SALE",
                "order": 2
            },
            {
                "name": "Flash Sell",
                "title": "Flash Sale - Limited Time",
                "slug": "flash-sell",
                "description": "Quick deals that won't last long - grab them now!",
                "link": "/offers/flash-sell",
                "is_featured": False,
                "badge_text": "FLASH",
                "order": 3
            },
            {
                "name": "Top Rated",
                "title": "Top Rated Products",
                "slug": "top-rated",
                "description": "Highest rated products by our customers",
                "link": "/offers/top-rated",
                "is_featured": False,
                "order": 4
            },
            {
                "name": "Winter Sale",
                "title": "Winter Sale - Stay Warm",
                "slug": "winter-sale",
                "description": "Cozy up with our winter collection at special prices",
                "link": "/offers/winter-sale",
                "is_featured": False,
                "order": 5
            },
            {
                "name": "Summer Sale",
                "title": "Summer Sale - Cool Down",
                "slug": "summer-sale",
                "description": "Beat the heat with our summer essentials on sale",
                "link": "/offers/summer-sale",
                "is_featured": False,
                "order": 6
            }
        ]
        
        for category_data in offer_categories:
            OfferCategory.objects.get_or_create(
                name=category_data["name"],
                defaults=category_data
            )
        
        self.stdout.write(f'Created {len(offer_categories)} offer categories')
    
    def create_hero_banners(self):
        """Create hero banners"""
        hero_banners = [
            {
                "title": "Summer Collection",
                "subtitle": "Discover the latest trends",
                "description": "Refresh your wardrobe with our exclusive summer styles",
                "button_text": "Shop Now",
                "button_url": "/products",
                "order": 0,
                "light_theme_url": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
                "dark_theme_url": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
                "fallback_url": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop"
            },
            {
                "title": "New Arrivals",
                "subtitle": "Fresh Collection",
                "description": "Discover the latest trends in fashion",
                "button_text": "Explore Now",
                "button_url": "/products?sort=newest",
                "order": 1,
                "light_theme_url": "https://picsum.photos/2070/800?random=10",
                "dark_theme_url": "https://picsum.photos/2070/800?random=11",
                "fallback_url": "https://picsum.photos/2070/800?random=12"
            },
            {
                "title": "Flash Sale",
                "subtitle": "Limited Time",
                "description": "Ending soon - don't miss out!",
                "button_text": "Shop Now",
                "button_url": "/products?sort=discount",
                "order": 2,
                "light_theme_url": "https://picsum.photos/1974/800?random=20",
                "dark_theme_url": "https://picsum.photos/1974/800?random=21",
                "fallback_url": "https://picsum.photos/1974/800?random=22"
            }
        ]
        
        for banner in hero_banners:
            HeroBanner.objects.get_or_create(
                title=banner["title"],
                defaults=banner
            )
        
        self.stdout.write(f'Created {len(hero_banners)} hero banners')
    
    def create_offer_banners(self):
        """Create offer banners"""
        offer_banners = [
            {
                "title": "Summer Collection",
                "description": "Refresh your wardrobe with our exclusive summer styles",
                "banner_type": "main",
                "image_url": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
                "alt_text": "Summer Sale",
                "discount_text": "UP TO 40% OFF",
                "coupon_code": "SUMMER25",
                "button_text": "Shop Now",
                "button_url": "/products",
                "gradient_colors": "from-amber-500 to-orange-600",
                "order": 0
            },
            {
                "title": "New Arrivals",
                "description": "Discover the latest trends in fashion",
                "banner_type": "main",
                "image_url": "https://picsum.photos/2070/800?random=30",
                "alt_text": "New Collection",
                "discount_text": "NEW CUSTOMER OFFER",
                "coupon_code": "WELCOME15",
                "button_text": "Explore Now",
                "button_url": "/products?sort=newest",
                "gradient_colors": "from-pink-500 to-rose-600",
                "order": 1
            },
            {
                "title": "Flash Sale",
                "description": "Ending soon - don't miss out!",
                "banner_type": "main",
                "image_url": "https://picsum.photos/1974/800?random=40",
                "alt_text": "Limited Time Offer",
                "discount_text": "LIMITED TIME",
                "coupon_code": "FLASH20",
                "button_text": "Shop Now",
                "button_url": "/products?sort=discount",
                "gradient_colors": "from-emerald-500 to-teal-600",
                "order": 2
            },
            {
                "title": "Exclusive Deal",
                "description": "Special offer just for you",
                "banner_type": "vertical",
                "image_url": "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=2070&auto=format&fit=crop",
                "alt_text": "Exclusive Offer",
                "discount_text": "EXCLUSIVE",
                "coupon_code": "VIP25",
                "button_text": "Claim Offer",
                "button_url": "/products?special=exclusive",
                "gradient_colors": "from-purple-500 to-fuchsia-600",
                "order": 0
            }
        ]
        
        for banner in offer_banners:
            OfferBanner.objects.get_or_create(
                title=banner["title"],
                banner_type=banner["banner_type"],
                defaults=banner
            )
        
        self.stdout.write(f'Created {len(offer_banners)} offer banners')
    
    def create_horizontal_banners(self):
        """Create horizontal promotional banners"""
        horizontal_banners = [
            {
                "title": "Limited Time Offer",
                "subtitle": "Flash Sale - Don't Miss Out!",
                "button_text": "Shop Sale",
                "button_url": "/products?sort=discount",
                "overlay_colors": "from-purple-900/70 via-blue-900/50 to-transparent",
                "order": 0
            }
        ]
        
        for banner in horizontal_banners:
            HorizontalPromoBanner.objects.get_or_create(
                title=banner["title"],
                defaults=banner
            )
        
        self.stdout.write(f'Created {len(horizontal_banners)} horizontal banners')
    
    def create_blog_posts(self):
        """Create blog posts"""
        blog_posts = [
            {
                "title": "Tech Innovations in 2023",
                "description": "Exploring the latest advancements in technology this year.",
                "slug": "tech-innovations-2023",
                "featured_image_url": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=2070&auto=format&fit=crop",
                "order": 0,
                "is_featured": True
            },
            {
                "title": "Sustainable Fashion Trends",
                "description": "A look at eco-friendly fashion trends for the modern consumer.",
                "slug": "sustainable-fashion-trends",
                "featured_image_url": "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
                "order": 1,
                "is_featured": True
            },
            {
                "title": "Home Automation Essentials",
                "description": "Must-have gadgets for a smarter home in 2023.",
                "slug": "home-automation-essentials",
                "featured_image_url": "https://images.unsplash.com/photo-1558618666-f87c447ace85?q=80&w=2070&auto=format&fit=crop",
                "order": 2,
                "is_featured": False
            },
            {
                "title": "Fashion Forward",
                "description": "The latest trends in fashion and style.",
                "slug": "fashion-forward",
                "featured_image_url": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
                "order": 3,
                "is_featured": False
            }
        ]
        
        for post in blog_posts:
            BlogPost.objects.get_or_create(
                slug=post["slug"],
                defaults=post
            )
        
        self.stdout.write(f'Created {len(blog_posts)} blog posts')
    
    def create_footer_sections(self):
        """Create footer sections and links"""
        footer_data = [
            {
                "section": {"section_type": "services", "title": "Services", "order": 0},
                "links": [
                    {"text": "Web Development", "url": "/services/web-development"},
                    {"text": "Pricing", "url": "/pricing"},
                    {"text": "Support", "url": "/support"},
                    {"text": "Resources", "url": "/resources"}
                ]
            },
            {
                "section": {"section_type": "platforms", "title": "Platforms", "order": 1},
                "links": [
                    {"text": "Hubspot", "url": "/platforms/hubspot"},
                    {"text": "Integrations", "url": "/platforms/integration"},
                    {"text": "Glossary", "url": "/platforms/glossary"}
                ]
            },
            {
                "section": {"section_type": "company", "title": "Company", "order": 2},
                "links": [
                    {"text": "About Us", "url": "/about"},
                    {"text": "Careers", "url": "/careers"},
                    {"text": "Blog", "url": "/blog"},
                    {"text": "Contact", "url": "/contact"}
                ]
            },
            {
                "section": {"section_type": "legal", "title": "Legal", "order": 3},
                "links": [
                    {"text": "Terms of Service", "url": "/terms-of-service"},
                    {"text": "Privacy Policy", "url": "/privacy-policy"},
                    {"text": "Security", "url": "/security"}
                ]
            }
        ]
        
        total_links = 0
        for data in footer_data:
            section, created = FooterSection.objects.get_or_create(
                section_type=data["section"]["section_type"],
                defaults=data["section"]
            )
            
            for i, link_data in enumerate(data["links"]):
                FooterLink.objects.get_or_create(
                    section=section,
                    text=link_data["text"],
                    defaults={
                        "url": link_data["url"],
                        "order": i,
                        "is_active": True
                    }
                )
                total_links += 1
        
        self.stdout.write(f'Created {len(footer_data)} footer sections with {total_links} links')
    
    def create_social_links(self):
        """Create social media links"""
        social_links = [
            {"platform": "facebook", "url": "https://facebook.com", "order": 0},
            {"platform": "twitter", "url": "https://x.com", "order": 1},
            {"platform": "instagram", "url": "https://instagram.com", "order": 2},
            {"platform": "linkedin", "url": "https://linkedin.com", "order": 3}
        ]
        
        for link in social_links:
            SocialMediaLink.objects.get_or_create(
                platform=link["platform"],
                defaults=link
            )
        
        self.stdout.write(f'Created {len(social_links)} social media links')
    
    def create_site_settings(self):
        """Create site settings"""
        settings_data = [
            {
                "key": "company_name",
                "value": "iCommerce",
                "setting_type": "text",
                "group": "company",
                "description": "Company name displayed in footer and other places"
            },
            {
                "key": "company_description",
                "value": "iCommerce is your one-stop destination for all your shopping needs, offering a wide range of products with the best deals and fastest delivery.",
                "setting_type": "textarea",
                "group": "company",
                "description": "Company description for footer"
            },
            {
                "key": "copyright_text",
                "value": "ReadymadeUI. All rights reserved.",
                "setting_type": "text",
                "group": "footer",
                "description": "Copyright text in footer"
            },
            {
                "key": "hero_autoplay_duration",
                "value": "3000",
                "setting_type": "number",
                "group": "hero",
                "description": "Hero banner autoplay duration in milliseconds"
            },
            {
                "key": "blog_posts_per_page",
                "value": "4",
                "setting_type": "number",
                "group": "blog",
                "description": "Number of blog posts to show on homepage"
            }
        ]
        
        for setting in settings_data:
            SiteSettings.objects.get_or_create(
                key=setting["key"],
                defaults=setting
            )
        
        self.stdout.write(f'Created {len(settings_data)} site settings')
