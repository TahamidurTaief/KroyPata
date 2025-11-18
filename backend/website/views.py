from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.core.cache import cache
from .models import (
    NavbarSettings, OfferCategory, HeroBanner, OfferBanner, 
    HorizontalPromoBanner, BlogPost, FooterSection, FooterLink, 
    SocialMediaLink, SiteSettings
)
from .serializers import (
    NavbarSettingsSerializer, OfferCategorySerializer, HeroBannerSerializer,
    OfferBannerSerializer, HorizontalPromoBannerSerializer, BlogPostSerializer,
    BlogPostListSerializer, FooterSectionSerializer, SocialMediaLinkSerializer,
    SiteSettingsSerializer, WebsiteDataSerializer
)

# Cache timeout in seconds (15 minutes)
CACHE_TIMEOUT = 900

class BaseWebsiteViewSet(viewsets.ReadOnlyModelViewSet):
    """Base viewset with caching for website content"""
    permission_classes = [AllowAny]
    
    @method_decorator(cache_page(CACHE_TIMEOUT))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @method_decorator(cache_page(CACHE_TIMEOUT))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

class NavbarSettingsViewSet(BaseWebsiteViewSet):
    """API for navbar settings and links"""
    serializer_class = NavbarSettingsSerializer
    
    def get_queryset(self):
        # Optimize with prefetch_related for children to avoid N+1 queries
        return NavbarSettings.objects.filter(
            is_active=True, 
            parent__isnull=True  # Only top-level items
        ).prefetch_related('naverbarsettings_set').order_by('order', 'name')

class OfferCategoryViewSet(BaseWebsiteViewSet):
    """API for offer categories"""
    serializer_class = OfferCategorySerializer
    
    def get_queryset(self):
        # Optimize with select_related for category to avoid N+1 queries
        return OfferCategory.objects.filter(is_active=True).select_related('category').order_by('order', 'name')

class HeroBannerViewSet(BaseWebsiteViewSet):
    """API for hero banners"""
    serializer_class = HeroBannerSerializer
    
    def get_queryset(self):
        return HeroBanner.objects.filter(is_active=True).order_by('order', 'created_at')

class OfferBannerViewSet(viewsets.ModelViewSet):
    """API for offer banners"""
    serializer_class = OfferBannerSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = OfferBanner.objects.filter(is_active=True).order_by('banner_type', 'order', 'created_at')
        
        # Filter by banner type if specified
        banner_type = self.request.query_params.get('banner_type')
        if banner_type:
            queryset = queryset.filter(banner_type=banner_type)
        
        return queryset
    
    @method_decorator(cache_page(CACHE_TIMEOUT))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @method_decorator(cache_page(CACHE_TIMEOUT))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

class HorizontalPromoBannerViewSet(BaseWebsiteViewSet):
    """API for horizontal promotional banners"""
    serializer_class = HorizontalPromoBannerSerializer
    
    def get_queryset(self):
        return HorizontalPromoBanner.objects.filter(is_active=True).order_by('order', 'created_at')

class BlogPostViewSet(BaseWebsiteViewSet):
    """API for blog posts"""
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        return BlogPostSerializer
    
    def get_queryset(self):
        return BlogPost.objects.filter(is_active=True).order_by('-is_featured', 'order', '-publish_date')

class FooterSectionViewSet(BaseWebsiteViewSet):
    """API for footer sections with links"""
    serializer_class = FooterSectionSerializer
    
    def get_queryset(self):
        return FooterSection.objects.filter(is_active=True).prefetch_related(
            'links'
        ).order_by('section_type', 'order')

class SocialMediaLinkViewSet(BaseWebsiteViewSet):
    """API for social media links"""
    serializer_class = SocialMediaLinkSerializer
    
    def get_queryset(self):
        return SocialMediaLink.objects.filter(is_active=True).order_by('order', 'platform')

class SiteSettingsViewSet(BaseWebsiteViewSet):
    """API for site settings"""
    serializer_class = SiteSettingsSerializer
    
    def get_queryset(self):
        return SiteSettings.objects.filter(is_active=True).order_by('group', 'key')

# Consolidated API endpoints
@api_view(['GET'])
@permission_classes([AllowAny])
@cache_page(CACHE_TIMEOUT)
def website_data(request):
    """Get all website data in a single API call"""
    try:
        # Check if data is cached
        cache_key = 'website_data_all'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Gather all data with optimized queries
        data = {
            'navbar_links': NavbarSettingsSerializer(
                NavbarSettings.objects.filter(is_active=True, parent__isnull=True).prefetch_related('naverbarsettings_set').order_by('order', 'name'),
                many=True,
                context={'request': request}
            ).data,
            'offer_categories': OfferCategorySerializer(
                OfferCategory.objects.filter(is_active=True).select_related('category').order_by('order', 'name'),
                many=True
            ).data,
            'hero_banners': HeroBannerSerializer(
                HeroBanner.objects.filter(is_active=True).order_by('order', 'created_at'),
                many=True,
                context={'request': request}
            ).data,
            'offer_banners': OfferBannerSerializer(
                OfferBanner.objects.filter(is_active=True).order_by('banner_type', 'order', 'created_at'),
                many=True,
                context={'request': request}
            ).data,
            'horizontal_banners': HorizontalPromoBannerSerializer(
                HorizontalPromoBanner.objects.filter(is_active=True).order_by('order', 'created_at'),
                many=True,
                context={'request': request}
            ).data,
            'blog_posts': BlogPostListSerializer(
                BlogPost.objects.filter(is_active=True).order_by('-is_featured', 'order', '-publish_date')[:8],
                many=True,
                context={'request': request}
            ).data,
            'footer_sections': FooterSectionSerializer(
                FooterSection.objects.filter(is_active=True).prefetch_related('links').order_by('section_type', 'order'),
                many=True,
                context={'request': request}
            ).data,
            'social_links': SocialMediaLinkSerializer(
                SocialMediaLink.objects.filter(is_active=True).order_by('order', 'platform'),
                many=True
            ).data,
            'site_settings': SiteSettingsSerializer(
                SiteSettings.objects.filter(is_active=True).order_by('group', 'key'),
                many=True
            ).data
        }
        
        # Cache the data
        cache.set(cache_key, data, CACHE_TIMEOUT)
        
        return Response(data)
    
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch website data', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
@cache_page(CACHE_TIMEOUT)
def navbar_data(request):
    """Get navbar-specific data"""
    try:
        data = {
            'navbar_links': NavbarSettingsSerializer(
                NavbarSettings.objects.filter(is_active=True, parent__isnull=True).prefetch_related('naverbarsettings_set').order_by('order', 'name'),
                many=True,
                context={'request': request}
            ).data,
            'offer_categories': OfferCategorySerializer(
                OfferCategory.objects.filter(is_active=True).select_related('category').order_by('order', 'name'),
                many=True
            ).data
        }
        return Response(data)
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch navbar data', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
@cache_page(CACHE_TIMEOUT)
def homepage_data(request):
    """Get homepage-specific data"""
    try:
        data = {
            'hero_banners': HeroBannerSerializer(
                HeroBanner.objects.filter(is_active=True).order_by('order', 'created_at'),
                many=True,
                context={'request': request}
            ).data,
            'offer_banners': OfferBannerSerializer(
                OfferBanner.objects.filter(is_active=True).order_by('banner_type', 'order', 'created_at'),
                many=True,
                context={'request': request}
            ).data,
            'horizontal_banners': HorizontalPromoBannerSerializer(
                HorizontalPromoBanner.objects.filter(is_active=True).order_by('order', 'created_at'),
                many=True,
                context={'request': request}
            ).data,
            'blog_posts': BlogPostListSerializer(
                BlogPost.objects.filter(is_active=True).order_by('-is_featured', 'order', '-publish_date')[:4],
                many=True,
                context={'request': request}
            ).data
        }
        return Response(data)
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch homepage data', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
@cache_page(CACHE_TIMEOUT)
def footer_data(request):
    """Get footer-specific data"""
    try:
        data = {
            'footer_sections': FooterSectionSerializer(
                FooterSection.objects.filter(is_active=True).prefetch_related('links').order_by('section_type', 'order'),
                many=True,
                context={'request': request}
            ).data,
            'social_links': SocialMediaLinkSerializer(
                SocialMediaLink.objects.filter(is_active=True).order_by('order', 'platform'),
                many=True
            ).data,
            'site_settings': SiteSettingsSerializer(
                SiteSettings.objects.filter(is_active=True, group__in=['footer', 'company']).order_by('key'),
                many=True
            ).data
        }
        return Response(data)
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch footer data', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def clear_website_cache(request):
    """Clear website data cache (for admin use)"""
    try:
        cache_keys = [
            'website_data_all',
            'navbar_data',
            'homepage_data', 
            'footer_data'
        ]
        
        for key in cache_keys:
            cache.delete(key)
        
        # Also clear Django's cache_page cache
        cache.clear()
        
        return Response({'message': 'Website cache cleared successfully'})
    except Exception as e:
        return Response(
            {'error': 'Failed to clear cache', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
