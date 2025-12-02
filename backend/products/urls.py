# products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (ProductViewSet, CategoryViewSet, SubCategoryViewSet, 
                    ColorViewSet, BrandViewSet, SizeViewSet, LandingPageOrderViewSet)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'subcategories', SubCategoryViewSet, basename='subcategory')
router.register(r'colors', ColorViewSet, basename='color')
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'sizes', SizeViewSet, basename='size')
router.register(r'landing-orders', LandingPageOrderViewSet, basename='landing-order')

app_name = 'products'

urlpatterns = [
    # Product-related API endpoints
    path('', include(router.urls)),
]
