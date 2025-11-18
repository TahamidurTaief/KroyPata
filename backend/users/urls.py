# users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    RegisterView,  # Add the new RegisterView
    RegisterAPIView,  # Add the new RegisterAPIView
    WholesalerRegistrationAPIView,  # Add the new WholesalerRegistrationAPIView
    UserProfileView,
    AdminUserListView,
    login_view,
    register_view,
    user_profile_view,
    admin_dashboard,
    seller_dashboard,
    customer_dashboard,
    seller_or_admin_view,
    marketplace_view
)

urlpatterns = [
    # JWT Authentication endpoints
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Custom authentication endpoints
    path('login/', login_view, name='login'),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('register-simple/', RegisterView.as_view(), name='register_simple'),  # New simplified registration
    path('register/wholesaler/', WholesalerRegistrationAPIView.as_view(), name='wholesaler-register'),  # Wholesaler registration
    path('signup/', register_view, name='signup'),  # Alternative endpoint
    path('signup/', register_view, name='signup'),  # Alternative endpoint
    
    # User profile endpoints
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('profile/<int:pk>/', UserProfileView.as_view(), name='user_profile_by_id'),  # For admin access
    path('me/', user_profile_view, name='current_user'),
    
    # Permission-based dashboard endpoints
    path('dashboard/admin/', admin_dashboard, name='admin_dashboard'),
    path('dashboard/seller/', seller_dashboard, name='seller_dashboard'),
    path('dashboard/customer/', customer_dashboard, name='customer_dashboard'),
    
    # Multi-role endpoints
    path('dashboard/seller-admin/', seller_or_admin_view, name='seller_admin_view'),
    path('marketplace/', marketplace_view, name='marketplace_view'),
    
    # Admin management endpoints
    path('admin/users/', AdminUserListView.as_view(), name='admin_user_list'),
]
