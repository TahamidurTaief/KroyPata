# shops/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShopViewSet

# Create router for ViewSets
router = DefaultRouter()
router.register(r'shops', ShopViewSet, basename='shop')

app_name = 'shops'

urlpatterns = [
    # Shop-related API endpoints
    path('', include(router.urls)),
]
