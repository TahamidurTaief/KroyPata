# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from users.views import RegisterAPIView, CustomTokenObtainPairView

from django.contrib.auth.models import User

from django_otp.admin import OTPAdminSite
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.plugins.otp_totp.admin import TOTPDeviceAdmin


class OTPAdmin(OTPAdminSite):
   pass

admin_site = OTPAdmin(name='OTPAdmin')
admin_site.register(User)
admin_site.register(TOTPDevice, TOTPDeviceAdmin)











# View to handle reload events silently
def reload_events_view(request):
    """Handle /__reload__/events/ requests to prevent 404 errors"""
    return HttpResponse(status=204)  # No Content

urlpatterns = [
    path('kroypata-admin/', admin.site.urls),
    
    # Handle development reload events
    path('__reload__/events/', reload_events_view, name='reload_events'),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API endpoints organized by app
    path('api/products/', include('products.urls')),
    path('api/shops/', include('shops.urls')), 
    path('api/orders/', include('orders.urls')),
    path('api/auth/', include('users.urls')),
    path('api/website/', include('website.urls')),
    path('api/sections/', include('sections.urls')),  # New sections API
    
    # JWT Authentication endpoints (main level for convenience)
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Direct registration endpoint (main level for convenience)
    path('api/register/', RegisterAPIView.as_view(), name='api_register'),
]


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
