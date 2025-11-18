from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NavbarSettingsViewSet, OfferCategoryViewSet, HeroBannerViewSet,
    OfferBannerViewSet, HorizontalPromoBannerViewSet, BlogPostViewSet,
    FooterSectionViewSet, SocialMediaLinkViewSet, SiteSettingsViewSet,
    website_data, navbar_data, homepage_data, footer_data, clear_website_cache
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'navbar-settings', NavbarSettingsViewSet, basename='navbar-settings')
router.register(r'offer-categories', OfferCategoryViewSet, basename='offer-categories')
router.register(r'hero-banners', HeroBannerViewSet, basename='hero-banners')
router.register(r'offer-banners', OfferBannerViewSet, basename='offer-banners')
router.register(r'horizontal-banners', HorizontalPromoBannerViewSet, basename='horizontal-banners')
router.register(r'blog-posts', BlogPostViewSet, basename='blog-posts')
router.register(r'footer-sections', FooterSectionViewSet, basename='footer-sections')
router.register(r'social-links', SocialMediaLinkViewSet, basename='social-links')
router.register(r'site-settings', SiteSettingsViewSet, basename='site-settings')

app_name = 'website'

urlpatterns = [
    # Individual API endpoints - Remove extra 'api/' prefix since it's already in main urls.py
    path('', include(router.urls)),
    
    # Consolidated endpoints for better performance
    path('data/all/', website_data, name='website-data-all'),
    path('data/navbar/', navbar_data, name='navbar-data'),
    path('data/homepage/', homepage_data, name='homepage-data'),
    path('data/footer/', footer_data, name='footer-data'),
    
    # Cache management
    path('cache/clear/', clear_website_cache, name='clear-cache'),
]
